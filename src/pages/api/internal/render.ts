import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LawyerProfile } from '@/types/lawyer';
import { FirmProfile, toFirmProfile } from '@/types/firm';
import { buildShell } from '@/lib/site-shell';
import { ContactQrWidget, buildVCard, buildFirmVCard } from '@/components/preview/ContactQrWidget';
import { ClassicTheme } from '@/components/preview/themes/ClassicTheme';
import { ExecutiveTheme } from '@/components/preview/themes/ExecutiveTheme';
import { LegalCraftTheme } from '@/components/preview/themes/LegalCraftTheme';
import { CorporateEliteTheme } from '@/components/preview/themes/CorporateEliteTheme';
import { SwissInstitutionalTheme } from '@/components/preview/themes/SwissInstitutionalTheme';
import { FirmClassicTheme } from '@/components/preview/themes/FirmClassicTheme';

const THEME_COMPONENTS: Record<string, (props: { profile: LawyerProfile }) => React.ReactElement> = {
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
  'corporate-elite': CorporateEliteTheme,
  'swiss-institutional': SwissInstitutionalTheme,
};

// Kept separate from THEME_COMPONENTS rather than merged into one map: the two
// take different props, and a shared registry would make it possible to render
// a firm through a lawyer theme (or vice versa) with a type assertion papering
// over the mismatch.
const FIRM_THEME_COMPONENTS: Record<string, (props: { firm: FirmProfile }) => React.ReactElement> = {
  'firm-classic': FirmClassicTheme,
};

// Compiled once at frontend build time (pnpm run build:theme-css), read once at
// module load and cached in memory for the life of the server process.
const THEME_CSS = readFileSync(join(process.cwd(), 'src/generated/theme-styles.css'), 'utf-8');

// The theme components (e.g. ClassicTheme.tsx:17, `basicInformation.fullName`)
// assume every top-level group is present, not just individual leaf fields.
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
// pointers drop whole groups, and FirmClassicTheme reads
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

  if (kind === 'firm') {
    const theme = body.theme ?? 'firm-classic';
    const Component = FIRM_THEME_COMPONENTS[theme];
    if (!Component) {
      return res.status(400).json({ error: `unknown or unmigrated firm theme: ${theme}` });
    }
    if (!body.firm) {
      return res.status(400).json({ error: 'missing firm' });
    }

    const firm = normalizeFirm(body.firm);
    try {
      bodyHtml = renderToStaticMarkup(Component({ firm }));
    } catch (err) {
      console.error('[render] firm render failed', err);
      return res.status(500).json({ error: 'render failed' });
    }
    qrHtml = renderToStaticMarkup(ContactQrWidget({ vcard: buildFirmVCard(firm) }));
    title = firm.firmDetails.name;
  } else {
    const theme = body.theme ?? 'classic';
    const Component = THEME_COMPONENTS[theme];
    if (!Component) {
      return res.status(400).json({ error: `unknown or unmigrated theme: ${theme}` });
    }
    if (!body.profile) {
      return res.status(400).json({ error: 'missing profile' });
    }

    const profile = normalizeProfile(body.profile);
    try {
      bodyHtml = renderToStaticMarkup(Component({ profile }));
    } catch (err) {
      console.error('[render] render failed', err);
      return res.status(500).json({ error: 'render failed' });
    }
    qrHtml = renderToStaticMarkup(ContactQrWidget({ vcard: buildVCard(profile) }));
    title = profile.basicInformation.fullName;
    googleAnalyticsId = profile.googleAnalyticsId;
  }

  const html = buildShell({ bodyHtml, title, googleAnalyticsId, css: THEME_CSS, qrHtml });

  return res.status(200).json({ files: { 'index.html': html } });
}
