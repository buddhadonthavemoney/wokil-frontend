---
name: ui-component
description: UI conventions — shadcn primitives, cva variants, Tailwind v4 tokens, component placement. Use when building or modifying UI.
paths:
  - src/components/**
  - src/app/**
---

# UI conventions

- `src/components/ui/` is a library of shadcn-style primitives (Radix + cva + `cn()`): extend via cva **variants**, never fork or restyle inline. Check it before adding anything — most primitives already exist.
- Feature components → `src/components/{form,auth,layout,preview,SEO}` by domain; page one-offs next to their route; providers in `src/components/providers/`.
- Tailwind **v4**: CSS-based config in `src/app/globals.css`, no `tailwind.config.js`; theme tokens are CSS variables — use token classes (`bg-background`, `text-muted-foreground`), support dark mode (next-themes).
- Merge caller overrides via a `className` prop with `cn()`. `"use client"` only on interactive leaves. No new UI libraries without asking.
- Verify: `pnpm lint && pnpm build`, eyeball light + dark via `/run-app`.
