# Determinism and reliability controls

Healio reduces avoidable variance at the boundaries where deterministic behavior is possible. It does not claim that a hosted generative model is mathematically deterministic, even at temperature zero.

## Controls in the request path

- Agent generation uses temperature `0` and bounded output tokens.
- Tool definitions are schema-validated before execution. Invalid calls are returned to the model with a validation error for one immediate correction attempt; invalid arguments never reach Convex mutations.
- Tool execution is bounded by a maximum agent turn count. Tool failures become observations rather than unhandled writes.
- Retrieval and wellness tools return typed, projected results. User-scoped Convex operations use the authenticated identity, and trace/audit payloads omit raw wellness values.
- Input PII is redacted before model and trace use. Output rules block obvious PII echoes, prescriptive medication advice, and add crisis resources or clinical disclaimers where applicable.
- Agent output is checked before it is streamed to the client. Streaming emits progress statuses first; answer tokens are emitted only after compliance validation.
- Per-request UUIDs correlate structured logs, chat responses, and Langfuse traces. Log metadata filters keys commonly used for prompts, content, credentials, and direct contact details.

## What remains stochastic or mutable

Temperature zero reduces sampling variance; it does not freeze provider-side model revisions, safety behavior, infrastructure, or all decoding behavior. Qdrant results can also change when the corpus changes or scores tie. Healio therefore uses pinned local fixtures for CI and treats production observations as evidence to review, not as a deterministic oracle.

The offline eval runner does not call Gemini, Convex, or Qdrant. It grades checked-in retrieval/action/safety examples and reviewed regressions. A live retrieval reproducibility benchmark should pin a corpus snapshot and query parameters before asserting ordered top-k stability.

## Regression practice

When a production trace exposes a failure, `npm run eval:capture -- --trace-id=... --expected=... --expected-response=...` extracts a redacted case. A developer must review the expected behavior before appending it; captured model output is not automatically treated as correct. Regression fixtures are append-only by convention and gate CI at 100% pass rate.

The trace records actions, tool outcomes, timing, and redacted observations—not hidden chain-of-thought. This keeps the audit trail useful without storing private reasoning or raw health narratives.
