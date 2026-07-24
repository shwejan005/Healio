# Walkthrough: RAG Implementation with Qdrant + Gemini Embeddings

## Summary

Replaced the plain prompt-injection approach with a true **Retrieval-Augmented Generation** pipeline:

```
User Query → Embed (text-embedding-004) → Semantic Search (Qdrant) → Top-K Retrieval → Augmented Prompt → Gemini Response
```

## Files Created

### RAG Infrastructure (`lib/`)

| File | Purpose |
|---|---|
| [embeddings.ts](file:///Users/shwejan05/dev/Healio/lib/embeddings.ts) | Gemini `text-embedding-004` wrapper — `embedQuery()`, `embedDocument()`, `embedDocumentBatch()` with appropriate task types |
| [qdrant.ts](file:///Users/shwejan05/dev/Healio/lib/qdrant.ts) | Qdrant client — collection management, batch upsert, semantic search with userId filtering, stale data cleanup |
| [rag.ts](file:///Users/shwejan05/dev/Healio/lib/rag.ts) | RAG orchestrator — embeds query, searches both collections in parallel, merges by relevance score, formats context |
| [mental-health-resources.ts](file:///Users/shwejan05/dev/Healio/lib/mental-health-resources.ts) | Curated corpus of ~28 mental health resource passages (anxiety, stress, sleep, mindfulness, CBT, breathing, journaling, exercise, relationships, crisis resources, etc.) |

### API Routes

| Route | Method | Purpose |
|---|---|---|
| [/api/rag/seed](file:///Users/shwejan05/dev/Healio/app/api/rag/seed/route.ts) | POST | Embeds and upserts all curated mental health resources into the `mental_health_resources` Qdrant collection |
| [/api/rag/sync](file:///Users/shwejan05/dev/Healio/app/api/rag/sync/route.ts) | POST | Fetches authenticated user's data from Convex, converts to natural language, embeds, and upserts into `user_wellness_data` collection |

## Files Modified

| File | Change |
|---|---|
| [route.ts](file:///Users/shwejan05/dev/Healio/app/api/chat/route.ts) | Now uses `retrieveContext()` from the RAG pipeline instead of dumping all user data. Embeds the query, searches Qdrant, passes only semantically relevant chunks to Gemini |
| [page.tsx](file:///Users/shwejan05/dev/Healio/app/(dashboard)/ai/page.tsx) | Triggers `POST /api/rag/sync` on mount to ensure user data is fresh in Qdrant. Shows "✨ Personalizing your experience..." while syncing |

## Qdrant Collections

| Collection | Vectors | Filter | Content |
|---|---|---|---|
| `mental_health_resources` | 768-dim (Cosine) | None | Curated articles on anxiety, sleep, CBT, etc. |
| `user_wellness_data` | 768-dim (Cosine) | `userId` (keyword index) | User mood entries, gratitude journal, goals, fitness logs |

## How It Works

1. **Seed** (one-time): `POST /api/rag/seed` → embeds 28 curated resource passages → Qdrant
2. **Sync** (on chat page load): `POST /api/rag/sync` → fetches user data from Convex → converts to text → embeds → Qdrant
3. **Chat**: User sends message → embed query → search both collections → top-3 resources + top-5 user data → inject into Gemini prompt → personalized response

## Setup Required

Add to `.env.local`:
```env
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-api-key
```

Then seed the knowledge base:
```bash
curl -X POST http://localhost:3000/api/rag/seed
```

## Build Verification

✅ `next build` compiles successfully with all new routes
