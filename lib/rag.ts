import { embedQuery } from "./embeddings"
import type { LangfuseTrace } from "./observability/langfuse"
import {
  search,
  RESOURCES_COLLECTION,
  USER_DATA_COLLECTION,
  type SearchResult,
} from "./qdrant"

/** Combined search result with source attribution */
export interface RetrievedChunk {
  id: string
  text: string
  source: "resource" | "user_data"
  score: number
  category?: string
  title?: string
  dataType?: string
}

/**
 * Core RAG retrieval function.
 * Embeds the query, searches both Qdrant collections, and returns
 * merged + ranked context chunks ready for prompt injection.
 */
export async function retrieveContext(
  query: string,
  userId?: string,
  trace?: LangfuseTrace,
): Promise<RetrievedChunk[]> {
  // 1. Embed the user's query
  const queryVector = await (trace
    ? trace.span("embed_query", { query }, () => embedQuery(query), { taskType: "RETRIEVAL_QUERY" }, (vector) => ({ dimensions: vector.length, vectorHash: hashVector(vector) }))
    : embedQuery(query))

  // 2. Search both collections in parallel
  const searchResults = async () => Promise.all([
      searchSafe(RESOURCES_COLLECTION, queryVector, 3),
      userId ? searchSafe(USER_DATA_COLLECTION, queryVector, 5, userId) : Promise.resolve([]),
    ])
  const [resourceResults, userDataResults] = await (trace
    ? trace.span("vector_retrieval", { vectorHash: hashVector(queryVector), dimensions: queryVector.length, filters: { userId: userId ? "authenticated-user" : "none" } }, searchResults, undefined, (results) => ({
        ids: [...results[0], ...results[1]].map((item) => String(item.id)),
        scores: [...results[0], ...results[1]].map((item) => item.score),
      }))
    : searchResults())

  // 3. Convert to RetrievedChunks with source attribution
  const resourceChunks: RetrievedChunk[] = resourceResults.map((r) => ({
    id: String(r.id),
    text: r.payload.content as string,
    source: "resource" as const,
    score: r.score,
    category: r.payload.category as string,
    title: r.payload.title as string,
  }))

  const userChunks: RetrievedChunk[] = userDataResults.map((r) => ({
    id: String(r.id),
    text: r.payload.text as string,
    source: "user_data" as const,
    score: r.score,
    dataType: r.payload.dataType as string,
  }))

  // 4. Merge and sort by relevance score (descending)
  const allChunks = [...userChunks, ...resourceChunks].sort(
    (a, b) => b.score - a.score
  )

  return allChunks
}

function hashVector(vector: number[]): string {
  let hash = 2166136261
  for (const value of vector) {
    hash ^= Math.round(value * 1_000_000)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

/**
 * Format retrieved chunks into a structured context block for the LLM prompt.
 */
export function formatRetrievedContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return ""
  }

  const userDataChunks = chunks.filter((c) => c.source === "user_data")
  const resourceChunks = chunks.filter((c) => c.source === "resource")

  const sections: string[] = []

  if (userDataChunks.length > 0) {
    sections.push(
      `=== RETRIEVED USER WELLNESS DATA (from semantic search) ===\n${userDataChunks
        .map(
          (c, i) =>
            `[${i + 1}] (relevance: ${(c.score * 100).toFixed(0)}%) ${c.text}`
        )
        .join("\n\n")}`
    )
  }

  if (resourceChunks.length > 0) {
    sections.push(
      `=== RETRIEVED MENTAL HEALTH RESOURCES (from knowledge base) ===\n${resourceChunks
        .map(
          (c, i) =>
            `[${i + 1}] "${c.title}" (${c.category}, relevance: ${(c.score * 100).toFixed(0)}%)\n${c.text}`
        )
        .join("\n\n")}`
    )
  }

  return sections.join("\n\n")
}

/**
 * Safe search wrapper that catches errors and returns empty results.
 * Prevents collection-not-found or connectivity issues from breaking the chat.
 */
async function searchSafe(
  collection: string,
  queryVector: number[],
  limit: number,
  userId?: string
): Promise<SearchResult[]> {
  try {
    return await search(collection, queryVector, limit, userId)
  } catch (error) {
    console.error(`Qdrant search failed for collection "${collection}":`, error)
    return []
  }
}
