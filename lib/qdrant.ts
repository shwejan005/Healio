import { QdrantClient } from "@qdrant/js-client-rest"
import { EMBEDDING_DIMENSION } from "./embeddings"

// Initialize Qdrant client from environment variables
const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY,
})

// Collection names
export const RESOURCES_COLLECTION = "mental_health_resources"
export const USER_DATA_COLLECTION = "user_wellness_data"

/**
 * Ensure both Qdrant collections exist with the correct configuration.
 * Safe to call multiple times — skips creation if collection already exists.
 * Handles 409 Conflict errors from concurrent creation attempts.
 */
export async function ensureCollections(): Promise<void> {
  const collections = await qdrantClient.getCollections()
  const existingNames = collections.collections.map((c) => c.name)

  if (!existingNames.includes(RESOURCES_COLLECTION)) {
    try {
      await qdrantClient.createCollection(RESOURCES_COLLECTION, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: "Cosine",
        },
      })
      console.log(`Created collection: ${RESOURCES_COLLECTION}`)
    } catch (error: unknown) {
      // 409 Conflict means another request already created it — safe to ignore
      if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 409) {
        console.log(`Collection ${RESOURCES_COLLECTION} already exists (concurrent creation)`)
      } else {
        throw error
      }
    }
  }

  if (!existingNames.includes(USER_DATA_COLLECTION)) {
    try {
      await qdrantClient.createCollection(USER_DATA_COLLECTION, {
        vectors: {
          size: EMBEDDING_DIMENSION,
          distance: "Cosine",
        },
      })
      // Create payload index on userId for efficient filtered search
      await qdrantClient.createPayloadIndex(USER_DATA_COLLECTION, {
        field_name: "userId",
        field_schema: "keyword",
      })
      console.log(`Created collection: ${USER_DATA_COLLECTION}`)
    } catch (error: unknown) {
      if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 409) {
        console.log(`Collection ${USER_DATA_COLLECTION} already exists (concurrent creation)`)
      } else {
        throw error
      }
    }
  }
}

/** Point structure for Qdrant upsert */
export interface QdrantPoint {
  id: string
  vector: number[]
  payload: Record<string, unknown>
}

/**
 * Batch upsert points into a Qdrant collection.
 * Processes in chunks of 100 for optimal performance.
 */
export async function upsertPoints(
  collection: string,
  points: QdrantPoint[]
): Promise<void> {
  const BATCH_SIZE = 100
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE)
    await qdrantClient.upsert(collection, {
      wait: true,
      points: batch,
    })
  }
}

/** Search result from Qdrant */
export interface SearchResult {
  id: string | number
  score: number
  payload: Record<string, unknown>
}

/**
 * Perform semantic search on a Qdrant collection.
 * Optionally filter by userId for user-specific data.
 */
export async function search(
  collection: string,
  queryVector: number[],
  limit: number = 5,
  userId?: string
): Promise<SearchResult[]> {
  const searchParams: Parameters<typeof qdrantClient.search>[1] = {
    vector: queryVector,
    limit,
    with_payload: true,
  }

  // Add userId filter for user-specific collections
  if (userId) {
    searchParams.filter = {
      must: [
        {
          key: "userId",
          match: { value: userId },
        },
      ],
    }
  }

  const results = await qdrantClient.search(collection, searchParams)

  return results.map((r) => ({
    id: r.id,
    score: r.score,
    payload: (r.payload as Record<string, unknown>) || {},
  }))
}

/**
 * Delete all points matching a userId filter from a collection.
 * Used to clear stale user data before re-syncing.
 */
export async function deleteByUserId(
  collection: string,
  userId: string
): Promise<void> {
  await qdrantClient.delete(collection, {
    wait: true,
    filter: {
      must: [
        {
          key: "userId",
          match: { value: userId },
        },
      ],
    },
  })
}
