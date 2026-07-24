import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" })

/**
 * Embed a single text string for retrieval queries.
 * Uses RETRIEVAL_QUERY task type optimized for search queries.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: "RETRIEVAL_QUERY" as never,
    outputDimensionality: EMBEDDING_DIMENSION,
  } as never)
  return result.embedding.values
}

/**
 * Embed a single text string for document storage.
 * Uses RETRIEVAL_DOCUMENT task type optimized for indexing.
 */
export async function embedDocument(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: "RETRIEVAL_DOCUMENT" as never,
    outputDimensionality: EMBEDDING_DIMENSION,
  } as never)
  return result.embedding.values
}

/**
 * Batch embed multiple texts for document storage.
 * Processes sequentially to respect rate limits.
 * Returns array of embeddings in the same order as input texts.
 */
export async function embedDocumentBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = []

  // Process in chunks of 5 to avoid rate limits
  const BATCH_SIZE = 5
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map((text) =>
        embeddingModel.embedContent({
          content: { role: "user", parts: [{ text }] },
          taskType: "RETRIEVAL_DOCUMENT" as never,
          outputDimensionality: EMBEDDING_DIMENSION,
        } as never)
      )
    )
    embeddings.push(...results.map((r) => r.embedding.values))
  }

  return embeddings
}

/** Vector dimension for gemini-embedding-001 */
export const EMBEDDING_DIMENSION = 768


