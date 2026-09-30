# Agent platform setup

Healio keeps Convex as its operational store. The agent routes use the signed-in Clerk identity for all wellness reads and writes, and the audit mutation also requires a server-only shared secret.

## Environment

Keep these values in the deployment secret manager. Do not add them to source control.

| Variable | Required | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Gemini generation and embeddings |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex deployment URL |
| `AUDIT_WRITE_SECRET` | Yes for audit writes | Same high-entropy value in the Next.js runtime and Convex deployment environment |
| `QDRANT_URL`, `QDRANT_API_KEY` | For retrieval | Qdrant corpus access |
| `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` | Optional | Enables Langfuse OTLP trace export and feedback scores |
| `LANGFUSE_HOST` | Optional | Langfuse region or self-hosted base URL; defaults to `https://cloud.langfuse.com` |
| `RULES_ENGINE_URL` | Optional | Go rules service base URL, for example `http://rules-engine:8081` in Compose |
| `GEMINI_MODEL` | Optional | Model name; defaults to `gemini-2.5-flash` |
| `GEMINI_INPUT_PRICE_PER_MILLION`, `GEMINI_OUTPUT_PRICE_PER_MILLION` | Optional | Per-million token prices used for estimated generation cost |

Clerk's existing server and public keys are also required by the app. Configure a Clerk JWT template named `convex` for the Convex provider.

The app sends PII-redacted chat input and answer text to Langfuse when tracing is enabled. Before enabling it for real users, select the approved data region or self-hosted deployment and confirm that the organization's data-processing terms cover the wellness data being collected. Langfuse's current trace exporter uses OTLP/HTTP and sends the `x-langfuse-ingestion-version: 4` header.

The fixed crisis contacts in the deterministic fallback are India Tele-MANAS 14416 and the United States 988 call/text service. The response also directs users elsewhere to their local crisis or emergency service. [India Ministry of Health](https://dghs.mohfw.gov.in/national-mental-health-programme.php), [988 Lifeline](https://988lifeline.org/get-help/).

## Local development and CI

- `npm run eval` grades checked-in deterministic fixtures and prints a Markdown scorecard.
- `npm run eval:safety` runs only the deterministic safety boundary suite.
- `npm run eval:regression` runs only the regression fixture set and exits non-zero on any failure.
- Set `EVAL_REPORT_PATH=artifacts/eval-report.md` to also write the scorecard as a Markdown file; CI uploads the full-suite report as a workflow artifact.
- `npm run eval:capture -- --trace-id=<id> --expected=<behavior> --expected-response=<safe response> [--must-include=<phrase,phrase>]` fetches observations from Langfuse and appends a reviewed case to `evals/datasets/regression.jsonl`.
- `npm run analyze:traces -- --days=7` reports p95 latency traces, retrieval scores below 0.60, and tool validation or execution failures.
- The eval runner is offline and deterministic. It validates stored golden tool outputs, retrieval fixtures, safety cases, and regression expectations; it does not call Gemini or live Convex data.
- Chat requests receive a server-generated `x-request-id`; structured JSON request logs include the correlation ID and safe metadata, not raw prompts or answers. See `docs/determinism.md` for reliability boundaries and limitations.
- The Go rules client uses TypeScript rules if the service is unavailable. After three failed service calls it opens a 30-second process-local circuit. Chat also has a process-local limit of 30 requests per user per minute; use a shared rate-limit store before horizontally scaling the Next.js deployment.

`docker compose up --build` runs the standalone Next.js image and the Go rules service. Configure the normal app secrets in `.env.local` for local use; Compose does not supply production secrets.
