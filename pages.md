# Wokil — Page-by-Page Catalog

Companion to `design.md`. Every page in Part A is real and shipping today — route, purpose, layout, states, and exact copy pulled from the actual component code. Part B is the deployed lawyer-site output (already detailed in `design.md` §2.3, summarized here for completeness as it's a page too). Part C is every page the roadmap (Jira `SCRUM` epics) implies but doesn't exist yet — described concretely enough to prototype, flagged as **not built**.

Existing shadcn primitives already in use across these pages — reuse them rather than inventing new components for anything in Part C: `Button`, `Card`/`CardContent`, `Dialog`, `AlertDialog`, `Badge`, `Switch`, `RadioGroup`, `Input`, `Label`, `Slider`, `HoverCard`, `Alert`. Base radius `0.75rem`, headings in `Outfit`, body in `Inter`, primary navy / accent gold (see `design.md` §2.4).

---

## Part A — Existing pages

### A1. `/` — Marketing homepage
**File**: `src/app/HomeClient.tsx` (public, unauthenticated; redirects to `/dashboard` if a token already exists in `localStorage`)

- **Nav**: fixed, translucent-blur — Wokil logo/wordmark, "Sign In" button (hidden on mobile)
- **Hero**: eyebrow pill *"The Future of Lawyer Presence"* → H1 *"Your Professional **Digital Identity** Built in Minutes."* → subhead *"Wokil empowers lawyers to create stunning, professional profiles that attract clients and build trust. No coding required."* → two CTAs: **"Get Started with Google"** (primary, triggers Google OAuth) and **"Our Clients"** (outline, → `/professionals`) → social proof row: stacked avatar circles of real professionals (from the public directory API) + *"Joined by N+ professionals"*
- **Hero mockup**: a static illustrative card (skeleton-style photo/name/bio blocks, two placeholder buttons) with two floating badges: a green "Digital Profile Live" pill and a "Growth — 12,402 / +24% this month" analytics card
- **Features grid** (4 cards): *Live Directories*, *Custom Domain Mapping*, *Multiple Premium Themes*, *Smart Analytics* — icon + title + one-line description each
- **Footer**: logo, Privacy/Terms/Contact links (currently `#`, unwired), copyright
- **States**: none beyond auth-redirect — this page has no loading/empty state of its own; the professionals data it uses for avatars comes pre-fetched server-side

### A2. `/professionals` — Public directory
**Files**: `src/app/professionals/page.tsx` (server component, fetches the list) + `ProfessionalsClient.tsx`

- **Nav**: same fixed style as home, "Back to Home" instead of "Sign In"
- **Hero**: eyebrow *"Live Directories"* → H1 *"Meet Our **N Live Professionals**"* → subhead *"Discover the legal professionals who have built their digital identity with Wokil."*
- **Search**: single input, client-side filter by name or professional title, no debounce needed (filters an already-fetched list)
- **Grid** (1–4 cols responsive): one card per public professional — photo (or initials-on-pattern fallback), name, title, one pill-button per deployed domain (first domain styled solid-dark, additional ones outline) → opens the live site in a new tab. A profile with zero deployed domains shows a dashed "No Site Deployed" placeholder instead of a button.
- **"+N More Hidden Profiles" card**: appears when the API reports hidden (non-public) profiles exist — dark card, big count, explains visibility controls exist, CTA **"Login to View"** (Google OAuth) + **"Explore Features"** (→ `/`)
- **Empty search state**: icon + *"No results found"* + *`We couldn't find any professionals matching "{query}".`* + **"Clear search"** button
- **Footer**: logo, one-line tagline *"The ultimate digital identity platform for modern legal professionals."*, Privacy/Terms/Contact, copyright

### A3. `/auth/google/callback` — OAuth landing
**File**: `src/app/auth/google/callback/page.tsx`

- No visible UI decisions to make beyond a single centered state: spinner (`Loader2`) + *"Completing authentication..."* (wrapped in a `Suspense` boundary showing *"Loading..."* first). Reads `?code=` from the URL, exchanges it, stores the token, then either routes to `/dashboard` (success toast *"Successfully logged in with Google."*) or `/login`-equivalent with a destructive toast *"Could not complete Google login."* on failure. This is a transient, non-interactive page — design it as a single branded loading state, nothing more.

### A4. Sidebar — persistent authenticated shell
**File**: `src/components/layout/Sidebar.tsx`, wraps every page under `(auth)/`

- **Desktop**: fixed 256px-wide left rail, white, border-right. Logo/wordmark at top (→ `/dashboard`). Five nav items with icon + label: **Dashboard**, **Profile** (→ `/profile-builder`), **Sites**, **Business Cards**, **Settings**. Active item: tinted primary background + primary text/icon. **Log Out** pinned at the bottom.
- **Mobile**: collapses to a fixed top bar (logo + hamburger); the same rail slides in as an overlay with a dimmed backdrop.
- This is the one piece of chrome every authenticated page shares — any new authenticated page (firm dashboard, page builder, etc. in Part C) should slot into this same shell and nav list rather than inventing a new frame.

### A5. `/dashboard` — Profile hub
**File**: `src/app/(auth)/dashboard/page.tsx`

- **Header** (`PageHeader` — icon, title, description, right-aligned actions pattern reused across every authenticated page): *"Your Profile"* / *"Manage your professional presence and public details."* → actions: **"Edit Profile"** (outline, → `/profile-builder`) and **"View Site"** (primary, opens the live site; disabled until published; hover reveals a QR code card *"Scan to Visit"* or *"No live site yet"*). A one-time animated arrow + glow-pulse ring points at "View Site" right after a first successful publish.
- **Profile card**: photo (or initials-on-tint fallback) + name + title + firm name, and — only when a site is actually live — a copyable URL chip.
- **Insights section**: header *"Insights"* + *"Live Activity"* badge.
  - **No analytics connected**: centered empty state, icon, *"Enable Site Analytics"*, *"Get detailed insights about your visitors, page views, and traffic sources by enabling Google Analytics integration in Settings."*, → **"Go to Settings"**.
  - **Connected**: 4 stat tiles (Total Views, Unique Visitors, and two explicitly-labeled **"Coming Soon"** tiles at 60% opacity — QR Scans, Avg. Time) + a line chart ("Traffic History") + a donut chart ("Traffic Sources") using `recharts`, auto-refreshing every 30s.
- **Footer** (only once a site has ever been published): *"Established {date}"* + *"Verified Professional"*, small caps, muted.
- **Overlays**: `InfoModal` (generic info/success/error dialog, triggered by query params — used for post-redirect messages) and `DeployProgressModal` (see A9) when a publish is in flight.
- **States**: full-page spinner while loading; a dedicated empty state (icon, *"No Profile Yet"*, *"Create your professional lawyer profile to start attracting clients."*, **"Create Your Profile"** →`/profile-builder`) if no profile exists yet.

### A6. `/profile-builder` — the wizard
**File**: `src/app/(auth)/profile-builder/page.tsx`

- **Header**: *"Profile Architect"* / *"Craft your professional presence. Changes update in real-time."*
- **Two-column layout** (desktop): form on the left (7/12), live preview on the right (5/12, sticky).
- **Left column**: a step progress indicator (6 steps: **Basic Info → Practice → Contact → Profile → Online → Subdomain**, clickable to jump), a card containing the current step's form with two utility actions above it (**"Fill Sample Data"** — populates a full realistic demo profile in one click; **"Clear"** — resets the current step), then Back/Next navigation. Enter key advances to the next step from anywhere except a textarea. Footer caption: *"Step N of 6 • Your progress is saved automatically."*
- **Right column** (hidden below `lg`): a **theme selector popover** (palette icon, current theme name, dropdown of the backend's active themes) + a **"Desktop View"** button (→ `/preview`) + a **zoom slider** (50%–150%) sitting above a **phone-mockup frame** (notch, side buttons, ~272px screen) that renders the live `ProfilePreview` — the actual production theme component, not a static image. Before basic info is filled in, the mockup shows its own empty state (sparkle icon, *"Ready to build your profile?"*, *"Fill up the basic information to see a real-time preview of your professional site."*).
- The six step forms themselves (`BasicInfoStep`, `PracticeDetailsStep`, `ContactInfoStep`, `ProfessionalProfileStep`, `OnlinePresenceStep`, `SubdomainSelectionStep`) map 1:1 to the `LawyerProfile` fields in `design.md` §2.1 — standard form fields (text inputs, a multi-select for practice areas/jurisdictions from fixed lists, a photo upload, a subdomain input with live availability check and a lock-after-deploy notice).

### A7. `/preview` — full-page live preview + publish
**File**: `src/app/(auth)/preview/page.tsx`

- A fixed, full-viewport overlay (not the sidebar shell) — this is the "step outside the builder and look at the real thing" surface.
- **Top bar**: **"← Back to Editor"**, a centered **"Live Preview"** pill (eye icon), and **"Publish Now"** (shows a spinner + *"Publishing…"* while in flight, then routes to `/dashboard?deploying=true` so the dashboard picks up the deploy stream).
- **Body**: the same `ProfilePreview` component full-page, no zoom/mockup chrome — this is literally what the live site will look like at real width.
- **Floating theme switcher**: a pill bar fixed to the bottom center, one button per active theme (from the same backend `themes` list as the builder), switching is instant client-side and persists to the backend in the background.

### A8. `/sites` — site/domain management
**File**: `src/app/(auth)/sites/page.tsx`

- **Header**: *"Sites Management"* / *"Manage and monitor your professional published websites."*
- **Empty state**: dashed-border card, globe icon, *"No sites found"*, *"You haven't published any professional profile sites yet. Complete your profile to get started."*, → **"Finish Your Profile"**.
- **Site grid** (2-up): one card per domain — a QR-code preview tile with a status badge overlaid (**Live** / **Requested** / **Link Pending**, each with its own icon+color), domain name + type ("Subdomain" / "External Domain"), a copyable domain chip with open/delete icon buttons, and two action buttons: **"Verify Domain"** (for pending sites) or **"Edit Page"** (for live ones), plus **"Business Card"** (→ `/business-cards`) on every card.
- **"Add New Site" card**: dashed border, plus icon, *"Request a new domain or connect your own personal domain to your professional site."* — opens a dialog with a domain input and a radio choice: **"Request a new domain"** vs. **"Onboard your own domain."**
- **Verify & link dialog**: shown when onboarding a custom domain — lists the exact DNS records to add (TXT + CNAME, each with a copy button), a note that propagation can take up to 24h, and a **"Verify & Link Site"** button that's rate-limited server-side (client mirrors the cooldown: *"Try again in Ns"*).
- **Delete confirmation**: standard alert dialog, *"Are you absolutely sure? This action cannot be undone."* — subdomain deletions get an extra amber warning that the subdomain field must be refilled in the builder to create a new one.
- **Overlay**: the same `DeployProgressModal` as the dashboard fires here too when verifying a domain (verification success kicks off an async deploy).

### A9. Deploy progress — shared modal, not its own route
**File**: `src/components/deploy/DeployProgressModal.tsx`, used by both A5 and A8

A blocking modal (ignores outside-click/Escape while running) showing a live checklist streamed over SSE: each step (e.g. *"Preparing deployment"*, *"Uploading your site"*, connecting the domain, finalizing) ticks off in order as it completes. Terminal states: **"Deployment complete"** (green check icon, *"Successfully deployed the changes"*, a **"View Site"** button) or **"Deployment failed"** (rose X icon, an error message with a support reference code).

### A10. `/business-cards` — digital business card
**File**: `src/app/(auth)/business-cards/page.tsx`

- **Header**: *"Professional Business Card"* / *"Customize and print your physical business card."*
- **Incomplete-profile gate**: if name/title/years-of-experience aren't filled in yet, shows a dedicated card — amber alert icon, *"Profile Incomplete"*, *"We need a bit more information before we can generate your professional business card."*, a checklist of the three required fields (green dot = done, gray = missing), **"Complete Profile"** CTA + a quieter "Back to Dashboard" link.
- **Customizer**: a **Layout Style** switcher (Classic / Minimal / Modern — *note: this is a separate concept from the lawyer-site themes in `design.md` §2.3, its own `CardLayout` type*) and a **Color Theme** swatch row (slate / blue / emerald / indigo / amber), both live-updating the card preview below.
- **Preview**: the actual `BusinessCard` component rendered at real size on a dashed "print area" background.
- **Print**: **"Print Business Card"** button uses `react-to-print` on the rendered card.

### A11. `/settings` — account & site preferences
**File**: `src/app/(auth)/settings/page.tsx`

- **Header**: *"Settings"* / *"Manage your account preferences and site configuration."* + a "Back to Dashboard" action.
- **Profile Visibility card**: two toggles — **"Public Profile"** (*"Allow your profile to be indexed and shown in our directories."*) and **"Show Profile Picture"** (*"Display your profile photo on your public website and cards."*, disabled unless the profile is public; turning off "Public" force-disables this too).
- **Analytics card**: same empty/connected split pattern as the dashboard's Insights section — not-connected state offers **"Enable Analytics"**; connected state shows a green check, *"Analytics Active"*, *"Google Analytics is actively tracking your site traffic. You can view detailed insights on your Dashboard."*, → **"Go to Dashboard"**.

---

## Part B — The deployed lawyer site (the actual product output)

Fully detailed in `design.md` §2.3–2.5 — summarized here as the page a client of the lawyer actually sees: a single static page (Classic, Executive, or Legal Craft theme) with a sticky anchor nav, Hero, About, Practice Areas, Why Work With Me, How It Works, FAQ, Contact, and a real multi-column footer with an attorney-advertising disclaimer. No hydration, no client framework — scroll-reveal and the QR/vCard contact widget are the only JavaScript on the page.

---

## Part C — Future pages (roadmap, not built yet)

Every item below is inferred directly from Jira tickets in the `SCRUM` project (cited), not invented. Treat these as prototype targets, not finished specs — several explicitly call out UI acceptance criteria worth designing against.

### C1. Firm vs. individual choice (onboarding)
*`SCRUM-11`, `SCRUM-34`*: "Given a new user chooses 'I'm part of a firm' during onboarding..." — a fork point, likely right after Google sign-in or as an early profile-builder step, splitting the flow into today's individual wizard (A6) vs. a new firm-creation flow (C2). Needs: two clear, equally-weighted choices (not one path buried as an afterthought), each with a one-line explanation of what it means.

### C2. Firm dashboard
*`SCRUM-34`*, route `firm/[firmId]/dashboard`. Acceptance criteria from the ticket:
- Shows firm name, a member list, and an **"Invite member"** action.
- An invited member appears in the list tagged **"Pending"** until they accept.
- **Role-gated UI**: owner/admin see member-management and firm-settings controls; a plain **member** sees only their own profile-edit access — the same page, different visible actions depending on role. Design both states explicitly, not just the owner view.
- Reuse the existing `Button`/`Card`/`Dialog`/`Badge` primitives and `cva`/`cn()` convention already established (A5–A11 all follow this).

### C3. Firm member invite & accept
*`SCRUM-32`*: invite by email (`role`: owner/admin/member), pending-invite state, accept flow for the invited user. Removing the last owner must be blocked — surface that as a disabled state or explicit error, not a silent no-op.

### C4. Firm-affiliated "Law Firm Name" field (replaces free text)
*`SCRUM-35`*: inside the existing Basic Info step (A6, step 1) — replace today's plain text `lawFirmName` input with a searchable combobox against real firms (debounced typeahead, ~300ms), with a "can't find your firm? Create one" fallback. Selecting a firm is an *affiliation* display, not membership — membership still requires the invite/accept flow in C3, so the UI needs to make clear these are two different things (e.g. an unaffiliated "Smith & Associates" label vs. an actual joined-member badge).

### C5. Firm public site — home + roster
*`SCRUM-33`, `SCRUM-48`*: when a `sites` row belongs to a firm instead of a user, the deploy pipeline renders a **firm home page** (firm identity + practice areas) with a **member roster** — a grid/list of every joined member, each linking to their own profile page (C6). Must degrade gracefully before any member has completed their profile ("graceful placeholder, not an error" — the ticket's own words). Visually, this is the same theme system as Part B (Classic/Executive/Legal Craft), just with a new top-level page type instead of a single-lawyer hero.

### C6. Per-member profile page (nested under a firm site)
*`SCRUM-33`, `SCRUM-48`*: each roster entry (C5) resolves to its own page at `domain/{member-slug}/` — effectively today's individual site (Part B) rendered as one page within a firm's multi-page site rather than standalone.

### C7. Multi-page site navigation (individual or firm)
*`SCRUM-48`*: replaces today's single-page anchor-scroll nav (Part B, `#about`, `#practice-areas`, etc.) with a nav bar linking to real pages/routes once `site_pages` exists. Same visual nav bar, different link targets — worth prototyping both the anchor version (current) and the multi-page version side by side to see the transition.

### C8. GrapesJS visual page builder (editor screen)
*`SCRUM-13`, `SCRUM-44`*, reference model cited directly in the epic: "an ordered list of sections per page, each with a right-hand Section Editor panel exposing per-field controls (text editors, CTA buttons, repeatable spec tags with add-more, image slots), drag-handle reordering, add/duplicate/delete per section... device preview toggle, and autosave." This is the biggest net-new screen in the roadmap — a real drag-and-drop editor, distinct from the current guided-wizard-plus-live-preview pattern in A6. Needs: a canvas (center), a section list with reorder handles (left or right rail), a contextual field-editor panel for the selected section, a device-size toggle (desktop/tablet/mobile), and a visible autosave indicator.

### C9. Block library (the sections GrapesJS drags in)
*`SCRUM-46`*, explicitly named: **Hero**, **Practice Areas grid**, **About/Bio**, **Education & Experience timeline**, **Testimonials**, **Contact form**, **Office hours/location map**, **Awards & Associations badges row**. Of these, only Hero/Bio/Practice-Areas/Contact exist in any form today (Part B); Education/Experience/Testimonials/Awards are entirely new content types with no backing data yet (`SCRUM-14`, see C10) — **design their empty/placeholder states as a first-class requirement**, not an afterthought, per the explicit lesson in `design.md` §4.4 (canned, fabricated-sounding content was already a real problem once this cycle).

### C10. Extended Profile Builder (repeatable data sections)
*`SCRUM-14`*: a *separate, always-editable* surface (distinct from the linear 6-step wizard in A6) for repeatable records — **Education, Experience, Awards, Associations, Legal Service Packages, FAQs** — each addable/editable/reorderable/deletable independently, outside onboarding. This is the data-entry counterpart to the C9 blocks that display it. Likely pattern: a settings-like page (cf. A11) with one expandable section per record type, each holding a list + "Add" action, closer in spirit to a CRM record editor than the current step-by-step wizard.

### C11. Page template gallery
*`SCRUM-47`*: shown when creating a new page (within C8's builder) — 3–5 starter layouts to clone from, named in the ticket as **"Content Rich," "Minimal," "Firm Roster."** A picker grid of thumbnail + name + one-line description, selecting one pre-populates the new page instead of starting from a blank canvas.
