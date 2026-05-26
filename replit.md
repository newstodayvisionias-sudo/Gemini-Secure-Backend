# Gemini API Backend

A secure Node.js Express backend server with Gemini AI integration — supports multi-turn chat conversations and AI image generation via the Gemini API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `GEMINI_API_KEY` — Your Google Gemini API key (from aistudio.google.com/apikey)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: Google Gemini via `@google/genai` SDK
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle ORM schema (conversations, messages tables)
- `lib/integrations-gemini-ai/` — Gemini AI client + image + batch utilities
- `artifacts/api-server/src/routes/gemini/` — Gemini route handlers
- `lib/api-zod/src/generated/` — Generated Zod validation schemas

## Architecture decisions

- All Gemini routes are prefixed under `/api/gemini/` matching the OpenAPI spec
- The `@google/genai` package is externalized by esbuild (per the `@google/*` rule) so it must be a direct dependency of `api-server` to be resolvable at runtime
- SSE streaming is used for chat responses — Orval cannot generate a typed hook for SSE, so client must consume it with `fetch` + `ReadableStream`
- Messages stored with `role: "assistant"` in DB, mapped to `"model"` for Gemini SDK (which requires `"model"` role, not `"assistant"`)
- Image generation uses `gemini-2.5-flash-image` (fast, cost-effective default)

## Product

- **Conversations** — Create, list, and delete multi-turn chat sessions
- **Messages** — Send user messages and receive streaming AI responses (SSE)
- **Image Generation** — Generate images from text prompts using Gemini's native image model

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/gemini/conversations` | List all conversations |
| POST | `/api/gemini/conversations` | Create a new conversation |
| GET | `/api/gemini/conversations/:id` | Get conversation with messages |
| DELETE | `/api/gemini/conversations/:id` | Delete a conversation |
| GET | `/api/gemini/conversations/:id/messages` | List messages |
| POST | `/api/gemini/conversations/:id/messages` | Send message (SSE stream) |
| POST | `/api/gemini/generate-image` | Generate image from prompt |

## User preferences

- User provides their own Gemini API key (not Replit AI Integrations)

## Gotchas

- After any OpenAPI spec change, always run codegen before using updated types
- `@google/genai` must remain in `api-server`'s direct dependencies (not just the lib) because esbuild externalizes `@google/*` packages
- The `lib/integrations-gemini-ai` client files must use `GEMINI_API_KEY`, not `AI_INTEGRATIONS_GEMINI_BASE_URL`/`AI_INTEGRATIONS_GEMINI_API_KEY`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
