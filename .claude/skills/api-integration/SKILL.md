---
name: api-integration
description: Add or change a backend API call — ApiEndpoints enum, typed wrapper, React Query. Use for any new backend interaction.
paths:
  - src/lib/api*.ts
  - src/types/**
  - src/hooks/**
---

# Integrate an API call

1. **Contract first:** delegate to the `api-contract` agent for the exact method/path/auth/shapes. Never guess field names. Endpoint missing on the backend → report the needed backend change; don't stub fake URLs.
2. Types in `src/types/` → path in the `ApiEndpoints` enum → typed wrapper beside the existing ones in `src/lib/api.ts` (shared instance handles JWT + 401). SSR/route handlers use `api-server.ts`.
3. Consume via React Query: `useQuery` for reads, `useMutation` for writes (patterns in `src/hooks/`); surface errors with a sonner toast.
