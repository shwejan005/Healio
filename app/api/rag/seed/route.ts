import { NextResponse } from "next/server"
import { embedDocumentBatch } from "@/lib/embeddings"
import { ensureCollections, upsertPoints, RESOURCES_COLLECTION } from "@/lib/qdrant"
import { MENTAL_HEALTH_RESOURCES } from "@/lib/mental-health-resources"

/**
 * POST /api/rag/seed
 * Seeds the curated mental health resources into Qdrant.
 * Idempotent — uses deterministic IDs so re-running updates rather than duplicates.
 */
export async function POST() {
  try {
    // Ensure collections exist
    await ensureCollections()

    // Prepare texts for batch embedding
    const texts = MENTAL_HEALTH_RESOURCES.map(
      (r) => `${r.title}\n\n${r.content}`
    )

    // Batch embed all resources
    console.log(`Embedding ${texts.length} mental health resources...`)
    const embeddings = await embedDocumentBatch(texts)

    // Build Qdrant points with deterministic IDs
    const points = MENTAL_HEALTH_RESOURCES.map((resource, i) => ({
      id: resource.id,
      vector: embeddings[i],
      payload: {
        title: resource.title,
        category: resource.category,
        content: resource.content,
      },
    }))

    // Upsert into Qdrant
    await upsertPoints(RESOURCES_COLLECTION, points)
    console.log(`Seeded ${points.length} resources into Qdrant`)

    return NextResponse.json({
      success: true,
      count: points.length,
      message: `Seeded ${points.length} mental health resources into Qdrant`,
    })
  } catch (error) {
    console.error("Error seeding resources:", error)
    return NextResponse.json(
      { error: "Failed to seed resources", details: String(error) },
      { status: 500 }
    )
  }
}
