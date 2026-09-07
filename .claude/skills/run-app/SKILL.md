---
name: run-app
description: Run the Wokil dashboard locally and verify changes in the browser. Use when starting the app or checking a change works.
---

# Run the dashboard

`pnpm install && pnpm dev` → http://localhost:3000. Needs `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.

**With backend:** `cd ../wokil-backend && docker compose up -d`, set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8081`. OAuth login needs backend credentials — for UI-only work use public routes (`/professionals`, landing page).

**Verify:** `pnpm lint && pnpm build` — build catches type errors and server/client component violations that dev mode tolerates.
