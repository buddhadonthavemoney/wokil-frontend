import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LawyerProfile } from '@/types/lawyer';
import { FirmProfile, toFirmProfile } from '@/types/firm';
import { buildShell } from '@/lib/site-shell';
import { ContactQrWidget, buildVCard, buildFirmVCard } from '@/components/preview/ContactQrWidget';
import { FirmTeamPage } from '@/components/preview/themes/FirmTeamPage';
import { resolveTheme } from '@/components/preview/themes/registry';
import { fromFirmProfile, fromLawyerProfile } from '@/types/site-model';
import { TEAM_PAGE_PATH } from '@/lib/firm-roster';

// Compiled once at frontend build time (pnpm run build:theme-css), read once at
// module load and cached in memory for the life of the server process.
const THEME_CSS = readFileSync(join(process.cwd(), 'src/generated/theme-styles.css'), 'utf-8');

// The mappers in site-model.ts (and the unmigrated themes) assume every
// top-level group is present, not just individual leaf fields.
// The Go side marshals LawyerProfile with `omitempty` pointer sub-structs, so an
// incomplete profile can arrive with groups entirely missing — normalize before
// rendering rather than trusting the incoming shape.
function normalizeProfile(input: Partial<LawyerProfile>): LawyerProfile {
  return {
    id: input.id ?? '',
    basicInformation: {
      fullName: '',
      professionalTitle: '',
      yearsOfExperience: 0,
      ...input.basicInformation,
    },
    practiceDetails: {
      areasOfPractice: [],
      jurisdictions: [],
      ...input.practiceDetails,
    },
    contactInformation: {
      phoneNumber: '',
      email: '',
      officeAddress: '',
      ...input.contactInformation,
    },
    professionalProfile: {
      bio: '',
      officeHours: '',
      ...input.professionalProfile,
    },
    onlinePresence: {
      ...input.onlinePresence,
    },
    timeline: {
      education: input.timeline?.education ?? [],
      experience: input.timeline?.experience ?? [],
    },
    // Left undefined when absent so the themes fall back to their defaults.
    siteContent: input.siteContent,
    themeSelection: {
      theme: input.themeSelection?.theme ?? 'classic',
    },
    subdomainSelection: {
      subdomain: '',
      ...input.subdomainSelection,
    },
    isPublished: input.isPublished ?? false,
    slug: input.slug ?? '',
    googleAnalyticsId: input.googleAnalyticsId,
    isPublic: input.isPublic,
    showPicture: input.showPicture,
  };
}

// normalizeProfile's sibling, for exactly the same reason: Go's `omitempty`
// pointers drop whole groups, and fromFirmProfile reads
// `firmDetails.name` / `practiceDetails.areasOfPractice` directly. Without
// this a firm that never filled in a step nil-derefs at deploy time.
function normalizeFirm(input: Partial<FirmProfile>): FirmProfile {
  return toFirmProfile(input);
}

type RenderBody = {
  kind?: 'individual' | 'firm';
  profile?: Partial<LawyerProfile>;
  firm?: Partial<FirmProfile>;
  theme?: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const expectedToken = process.env.RENDERER_INTERNAL_TOKEN;
  if (!expectedToken) {
    console.error('[render] RENDERER_INTERNAL_TOKEN is not configured');
    return res.status(500).json({ error: 'renderer not configured' });
  }
  if (req.headers['x-internal-token'] !== expectedToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = req.body as RenderBody;
  // `kind` is explicit on the wire so the payload shape is never inferred from
  // which field happens to be present. Older callers omit it and are always
  // individual.
  const kind = body.kind ?? 'individual';

  let bodyHtml: string;
  let qrHtml: string;
  let title: string;
  let googleAnalyticsId: string | undefined;
  // Extra pages beyond index.html, as relative path -> full HTML document. The
  // deploy pipeline walks the workspace recursively, so nested paths upload
  // as-is.
  const extraPages: Record<string, string> = {};

  if (kind === 'firm') {
    const themeId = body.theme ?? 'firm-classic';
    const theme = resolveTheme(themeId);
    // A firm can only be rendered by a SiteModel theme. The old LawyerProfile
    // themes have no notion of a roster, so routing a firm through one would
    // quietly publish a site with its people missing.
    if (!theme || theme.kind !== 'site') {
      return res.status(400).json({ error: `unknown or unmigrated firm theme: ${themeId}` });
    }
    if (!body.firm) {
      return res.status(400).json({ error: 'missing firm' });
    }

    const firm = normalizeFirm(body.firm);
    const site = fromFirmProfile(firm);
    try {
      bodyHtml = renderToStaticMarkup(theme.Component({ site }));
    } catch (err) {
      console.error('[render] firm render failed', err);
      return res.status(500).json({ error: 'render failed' });
    }
    qrHtml = renderToStaticMarkup(ContactQrWidget({ vcard: buildFirmVCard(firm) }));
    title = firm.firmDetails.name;

    // The People page: every lawyer in full, on one page. Rendered even for an
    // empty roster, so the nav link never lands on a 404 — it carries the same
    // "team is being introduced" state the home page shows.
    try {
      extraPages[TEAM_PAGE_PATH] = buildShell({
        bodyHtml: renderToStaticMarkup(FirmTeamPage({ site })),
        title: `Our Team — ${firm.firmDetails.name}`,
        googleAnalyticsId: undefined,
        css: THEME_CSS,
        qrHtml,
      });
    } catch (err) {
      console.error('[render] firm team page render failed', err);
      return res.status(500).json({ error: 'render failed' });
    }
  } else {
    const themeId = body.theme ?? 'classic';
    const theme = resolveTheme(themeId);
    if (!theme) {
      return res.status(400).json({ error: `unknown or unmigrated theme: ${themeId}` });
    }
    if (!body.profile) {
      return res.status(400).json({ error: 'missing profile' });
    }

    const profile = normalizeProfile(body.profile);
    try {
      // Migrated themes take the normalized model; the rest still take the
      // profile directly. Both produce the same markup for the same profile —
      // the model is a re-shaping, not a re-design.
      bodyHtml =
        theme.kind === 'site'
          ? renderToStaticMarkup(theme.Component({ site: fromLawyerProfile(profile) }))
          : renderToStaticMarkup(theme.Component({ profile }));
    } catch (err) {
      console.error('[render] render failed', err);
      return res.status(500).json({ error: 'render failed' });
    }
    qrHtml = renderToStaticMarkup(ContactQrWidget({ vcard: buildVCard(profile) }));
    title = profile.basicInformation.fullName;
    googleAnalyticsId = profile.googleAnalyticsId;
  }

  const html = buildShell({ bodyHtml, title, googleAnalyticsId, css: THEME_CSS, qrHtml });

  return res.status(200).json({ files: { 'index.html': html, ...extraPages } });
}
