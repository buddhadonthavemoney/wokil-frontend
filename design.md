# Wokil — Design Reference

Source of truth for the current implementation, pulled directly from the codebase (`wokil-frontend`, `wokil-go`) and the product's Jira backlog (`SCRUM` project, `wokil.atlassian.net`). Written for feeding into Stitch (Google) to generate new designs — every value, label, and structure below is real, not illustrative.

## 1. What Wokil is

From `src/app/layout.tsx` metadata and the actual homepage (`src/app/HomeClient.tsx`):

> **Wokil** — "A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals."
>
> Homepage hero: *"Your Professional Digital Identity Built in Minutes."* / *"Wokil empowers lawyers to create stunning, professional profiles that attract clients and build trust. No coding required."*

A lawyer signs in with Google, fills out a profile through a 6-step wizard, picks a visual theme, and publishes a real, live website at a subdomain (`<name>.<root-domain>`) or their own custom domain. Today every account is a single lawyer; there is no firm/organization concept yet (see §3).

## 2. Current implementation

### 2.1 Data model

`src/types/lawyer.ts` — `LawyerProfile`, the single object the entire builder and every theme render from:

```ts
interface LawyerProfile {
  id: string;
  basicInformation: {
    fullName: string;
    professionalTitle: string;
    lawFirmName?: string;       // free text today — no firm entity exists (see §3)
    yearsOfExperience: number;
  };
  practiceDetails: {
    areasOfPractice: string[];  // from a fixed PRACTICE_AREAS list (Corporate Law, Criminal Defense, Family Law, Immigration Law, Intellectual Property, Labor & Employment, Personal Injury, Real Estate, Tax Law, Estate Planning, Bankruptcy, Civil Litigation, Environmental Law, Healthcare Law, Mergers & Acquisitions)
    jurisdictions: string[];
  };
  contactInformation: {
    phoneNumber: string;
    email: string;
    officeAddress: string;
  };
  professionalProfile: {
    bio: string;
    profilePhoto?: string;
    officeHours: string;
    deploymentURL?: string;
  };
  onlinePresence: {
    website?: string;
    linkedIn?: string;
  };
  themeSelection: {
    theme: 'classic' | 'executive' | 'legal-craft';
  };
  subdomainSelection: { subdomain: string };
  isPublished: boolean;
  publishedAt?: string;
  slug: string;
  siteUrl?: string;
  googleAnalyticsId?: string;
  isPublic?: boolean;
  showPicture?: boolean;
}
```

This is **flat and thin**: one bio field, one photo, no repeatable sections (no list of past cases, no separate education/experience/awards entries, no testimonials, no FAQ content). Every "extra" section a theme shows today (Why Work With Me, How It Works, FAQ) is generic placeholder copy in the theme component itself, not data the lawyer entered — see §2.3.

### 2.2 Profile-builder wizard

`src/app/(auth)/profile-builder/page.tsx`, six linear steps in order:

1. **Basic Info** (`BasicInfoStep.tsx`) — name, title (from `PROFESSIONAL_TITLES`: Advocate, Attorney at Law, Legal Consultant, Senior Counsel, Partner, Associate, Of Counsel, Legal Advisor), firm name, years of experience, profile photo
2. **Practice** (`PracticeDetailsStep.tsx`) — practice areas, jurisdictions
3. **Contact** (`ContactInfoStep.tsx`) — phone, email, office address
4. **Profile** (`ProfessionalProfileStep.tsx`) — bio, office hours
5. **Online** (`OnlinePresenceStep.tsx`) — website, LinkedIn
6. **Subdomain** (`SubdomainSelectionStep.tsx`) — pick and lock the subdomain

A live phone-mockup preview sits alongside the form the whole time (`ProfilePreview.tsx`), rendering the actual production theme component, not a mockup image. A separate `/preview` route shows the same thing full-page. Theme switching is a popover (`ThemeSelector.tsx`) driven by the backend's `themes` table (`GET /api/themes`), not hardcoded.

### 2.3 The three live themes

All three themes live at `src/components/preview/themes/{Classic,Executive,LegalCraft}Theme.tsx` and are the **actual deploy output** — `renderToStaticMarkup`'d server-side into the static HTML that ships to the live domain (`src/pages/api/internal/render.ts`). There is no separate "preview" vs "production" template; the dashboard preview and the live site render the identical component.

Each theme is a **single-page site** with an anchor-linked nav (no real routing — see §2.5 for why) and the same section shape:

| Section | Anchor | Notes |
|---|---|---|
| Sticky nav | `#top` | Firm/lawyer name + links + a consultation CTA button |
| Hero | `#top` | Name, title, firm, years of experience, phone/email CTAs, photo |
| About / Professional Profile | `#about` | The bio field, verbatim |
| Practice Areas | `#practice-areas` | One card per `areasOfPractice` entry |
| Why Work With Me | `#why` | **Fixed, generic** value props (Direct Access, Clear Communication, Transparent Fees) — not lawyer-specific data, placeholder until the data model grows fields for it |
| How It Works | *(no anchor)* | Fixed 3-step process copy (Initial Consultation → Case Strategy → Representation) |
| FAQ | `#faq` | 4 fixed questions; answers are templated from real profile data (jurisdictions, office hours) where possible, native `<details>/<summary>` |
| Contact | `#contact` | Phone/email/address/hours card |
| Footer | — | Firm name + attorney-advertising disclaimer, quick links, contact, "Site by Wokil" |

**Theme-specific palettes** (each theme is a genuinely different visual identity, not a recolor):

- **Classic** (`ClassicTheme.tsx`) — navy `#1B2B44` / gold `#C5A059` / cream `#FDFCFB`. Traditional, formal. Rounded cards, soft shadows.
- **Executive** (`ExecutiveTheme.tsx`) — `slate-900` / `blue-700` / `slate-50`. Institutional, high-contrast, corporate.
- **Legal Craft** (`LegalCraftTheme.tsx`) — near-black `#1A120B` / warm gold `#D4A373` / cream `#FDFBF7`. Editorial, artisan, serif-leaning headings, numbered index cards.

All three read `font-heading` (Outfit) for headings and `font-body` (Inter) for text — the same type family as the dashboard chrome (§2.4), just recolored per theme.

A **Modern** (dark, `slate-950`) theme existed earlier this cycle and was deliberately removed (not migrated) — it read as a generic dark-mode SaaS template, not a lawyer's site, and the product decision was to drop it rather than keep iterating on it. The `themes` DB table still has the row, flagged `is_active = false`, purely for history.

### 2.4 The dashboard's own visual identity

Distinct from the lawyer-site themes above — this is Wokil's own brand, used for the dashboard chrome, the marketing homepage, and business cards (`src/app/globals.css`):

```css
--font-heading: "Outfit", sans-serif;
--font-body: "Inter", sans-serif;

--primary:   222 47% 11%   /* near-navy, hsl */
--accent:    38 45% 55%    /* gold, hsl */
--secondary: 35 30% 96%    /* warm off-white */
--radius:    0.75rem
```

Notice the dashboard's own primary/accent pairing (navy + gold) is the same relationship as the **Classic** theme's palette — that's the product's native identity; Executive and Legal Craft are deliberate departures from it, not derivatives.

### 2.5 Deploy architecture (hard technical constraints for any new design)

This matters directly for what Stitch can generate as "real," not just visually similar:

- **The deployed site is static HTML with zero client-side JavaScript framework.** `render.ts` calls `renderToStaticMarkup` — there is no hydration, no React runtime shipped to visitors. Any interactivity has to be plain HTML/CSS (`<details>/<summary>` for the FAQ accordion) or a small hand-written vanilla `<script>` block in `src/lib/site-shell.ts` (currently: a QR-code/vCard contact widget, and an `IntersectionObserver`-driven scroll-reveal on elements marked `data-reveal`).
- **Responsive layout uses CSS container queries (`@container`, `@md:`, `@lg:`), not viewport media queries** — because the same theme component renders inside three different boxes: a ~272px phone mockup in the builder, the full `/preview` page, and the real deployed page. The deployed page's `<body>` carries the `@container` class specifically so these classes resolve against real viewport width in production.
- **One page, one file.** `internal/site/service.go`'s `Deploy()` uploads a single `index.html` per domain to R2. There is no routing layer — "pages" today are anchor scrolls within one document, not real URLs.
- Deploys are cached at Cloudflare's edge (`Cache-Control: public, max-age=60, stale-while-revalidate=604800`) and explicitly purged (`purgeCache`) after every publish so changes are visible immediately rather than up to a week later.

### 2.6 Business cards (adjacent feature, separate visual system)

`src/components/BusinessCard.tsx` — a digital business-card generator, separate from the site themes: `CardLayout = 'classic' | 'minimal' | 'modern'`, `CardColor = 'slate' | 'blue' | 'emerald' | 'indigo' | 'amber'`. Worth noting for Stitch because it's a second, smaller "product surface" with its own layout/color axis that a firm-wide design system would eventually need to cover too.

## 3. Where the product is going (from the Jira backlog, `SCRUM` project)

Eight epics define the roadmap. The two most relevant to a design refresh:

### SCRUM-11 — Epic 3: Firms and Associations (individual vs. firm sites)

> "Today the product is single-lawyer-per-account; `lawFirmName` is a free-text field... no firm entity exists... This epic makes firms and associations a real multi-user entity so a firm can have one site with multiple lawyer profiles under it."

Concretely, once built:

- **Firms become a real, searchable entity** (`firms` + `firm_members` tables, `SCRUM-31`), not free text — modeled on a directory-style "select your firm, or create one" combobox (`SCRUM-35`), replacing today's plain text field.
- **Roles**: owner / admin / member, with an invite-and-accept flow (`SCRUM-32`, `SCRUM-34`) — a firm dashboard at `firm/[firmId]/dashboard` distinct from the individual profile-builder.
- **A `sites` row belongs to either a user or a firm, never both** (`SCRUM-33`) — the deploy pipeline branches: **individual sites** keep rendering today's single-lawyer template; **firm sites** render a **firm home + member roster**, each member linking out to their own profile page.
- **Design implication**: two distinct site archetypes need designing, not one — an individual lawyer's personal site (what exists today, to be enriched) and a firm's site (a new landing/roster page type, plus a per-member profile page template that nests inside it).

### SCRUM-13 — Epic 5: GrapesJS Visual Site Builder (multi-page, drag-and-drop)

> Reference model: "an ordered list of sections per page, each with a right-hand Section Editor panel... drag-handle reordering, add/duplicate/delete per section, a Templates gallery... device preview toggle, and autosave."

- **Real multi-page sites** (`SCRUM-48`): `site_pages` table, one row per page (home = empty slug, `about`, `contact`, etc.), each deploying to `domain/{slug}/index.html` — replacing today's single-page-with-anchors model entirely.
- **A block library** (`SCRUM-46`) explicitly named for lawyer/firm sites: **Hero, Practice Areas grid, About/Bio, Education & Experience timeline, Testimonials, Contact form, Office hours/location map, Awards & Associations badges**. Several of these (testimonials, education/experience, awards) don't exist as data or UI anywhere in the product today.
- **A page template gallery** (`SCRUM-47`): 3–5 starter layouts to clone from when creating a page (named in the ticket: "Content Rich," "Minimal," "Firm Roster").
- Ties directly to the section-based decomposition already done in this codebase (Nav/Hero/About/PracticeAreas/etc. as separable pieces per theme) — that's deliberate groundwork for this block library, not incidental.

### SCRUM-14 — Epic 6: Extended Profile Builder (richer data)

The data model in §2.1 is intentionally thin today. This epic adds the repeatable, always-editable sections a real legal-directory competitor (referenced in the ticket as "NepalLawyer") already has: **Education, Experience, Associations, Awards, Legal Service Packages, FAQs** — each its own CRUD surface outside the linear onboarding wizard, feeding both the site templates and the future GrapesJS blocks.

## 4. What we want the design to become

Synthesizing §2 (what exists) and §3 (what's planned), for Stitch to design against:

1. **Two site archetypes, not one.**
   - *Individual*: today's flow, refined — richer profile content (education, experience, awards, testimonials) once Epic 6 lands, still single-lawyer, single-domain.
   - *Firm*: new — a firm landing/home page (firm identity, practice areas, member grid) plus a per-member profile page in the same visual system, reachable from the roster.
2. **Real multi-page navigation**, replacing today's single-page anchor scroll — a nav bar whose links go to actual pages (`/`, `/about`, `/contact`, `/team/[member]`), not `#section`.
3. **A shared block library**, not three hand-built monolithic theme files — Hero, Practice Areas, Bio, Education/Experience timeline, Testimonials, Contact form, Office hours/map, Awards/Associations, each themeable (Classic/Executive/Legal Craft palettes, or whatever themes exist by then) rather than re-implemented per theme.
4. **Content stays real, never fabricated.** This was a deliberate, hard-won fix this cycle: earlier theme drafts had a canned marketing sentence repeated verbatim under every practice area regardless of what it was, and overwrought copy ("Architects of Justice," "Preserving the Integrity of the Bar") that read as an auto-generated template, not a real law office. The fix was to either (a) drive copy from real profile data, (b) use honest, generic-but-not-fabricated boilerplate (value props, process steps — clearly not claims about the specific attorney), or (c) show a real, standard attorney-advertising disclaimer instead of marketing fluff. Any new block Stitch designs (testimonials, awards, case results) must be **designed with an explicit empty/placeholder state** — never a design that only looks right when filled with invented sample content, since a shipped block with no real data behind it is exactly the failure mode already fixed once.
5. **Trustworthy, not "startup."** The one theme that read as a generic SaaS landing page (dark mode, glowing gradient blurs, bouncy hover-scale everything) was removed outright rather than kept as an option — the product's visual identity should skew toward what a real, established law office's site looks like: restrained, credential-forward, conservative use of color, not flashy.
6. **Respect the static-HTML constraint (§2.5) or plan around it.** If Stitch designs assume client-side interactivity (dynamic filtering, live search, animated counters, modals), that's a scope decision for the GrapesJS/multi-page epic to solve for real (React SSR + hydration is already the direction per Epic 4/`SCRUM-38`), not something to assume works today. Anything meant for the *current* system needs to survive being either a `<details>` element, a CSS-only interaction, or a small vanilla-JS snippet.
7. **Design tokens to reuse, not reinvent**: `Outfit` for headings, `Inter` for body, the per-theme palettes in §2.3, `0.75rem` base radius, the dashboard's navy/gold pairing as the product's native identity. New themes or a redesigned single theme should either extend this token set or replace it deliberately — not drift from it accidentally.
