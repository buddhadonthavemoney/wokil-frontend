# wokil-frontend

Dashboard for Wokil (website builder for lawyers/professionals). Next.js 16 App Router (`src/app/`), React 19, TypeScript, Tailwind v4, shadcn-style UI (`src/components/ui/`), axios + TanStack React Query, sonner, lucide. Package manager: **pnpm**.

## Hard rules

- All backend calls go through the shared axios instance and `ApiEndpoints` enum in `src/lib/api.ts` (server-side: `src/lib/api-server.ts`). Never hardcode URLs in components.
- The API contract is owned by `../wokil-backend/wokil-go` — delegate to the `api-contract` agent for exact shapes; never guess field names.
- Auth: JWT in `localStorage.token`, attached by the axios interceptor; 401 clears it.
- Reuse `src/components/ui/` primitives via cva variants + `cn()`; theme-token classes only (`bg-background`, …), no hardcoded colors.

## Commands

- `task dev` (:3000; needs `NEXT_PUBLIC_API_BASE_URL=http://localhost:8090/api` in `.env.local`)
- Before finishing: `task verify` (lint + build; build needs the backend stack up — the home page fetches `/public/people` at build time)

## PR title convention

PR titles **must** match the format enforced by `pr-title-check.yml`:

```
[TYPE | SCRUM-<num> | SCRUM-<num> ...] Description
```

TYPE is one of: `FEAT`, `FIX`, `CHORE`, `REFACTOR`, `DOCS`. Each ticket key is pipe-separated.
Example: `[FEAT | SCRUM-43 | SCRUM-44] Add deploy rollback compensation`.

CI also extracts keys and auto-transitions them on Jira (opened → "In Review", merged → "Ready for testing"). A range like `SCRUM-124–133` won't match — list every key.

Procedures live in skills (`/run-app`, `/api-integration`, `/ui-component`, `/feature-spec`).
