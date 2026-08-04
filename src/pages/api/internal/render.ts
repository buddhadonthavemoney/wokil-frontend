import type { NextApiRequest, NextApiResponse } from 'next';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LawyerProfile } from '@/types/lawyer';
import { buildShell } from '@/lib/site-shell';
import { ClassicTheme } from '@/components/preview/themes/ClassicTheme';
import { ExecutiveTheme } from '@/components/preview/themes/ExecutiveTheme';
import { LegalCraftTheme } from '@/components/preview/themes/LegalCraftTheme';

const THEME_COMPONENTS: Record<string, (props: { profile: LawyerProfile }) => React.ReactElement> = {
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
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

  const body = req.body as { profile?: Partial<LawyerProfile>; theme?: string };
  const theme = body.theme ?? 'classic';
  const Component = THEME_COMPONENTS[theme];
  if (!Component) {
    return res.status(400).json({ error: `unknown or unmigrated theme: ${theme}` });
  }
  if (!body.profile) {
    return res.status(400).json({ error: 'missing profile' });
  }

  const profile = normalizeProfile(body.profile);

  let bodyHtml: string;
  try {
    bodyHtml = renderToStaticMarkup(Component({ profile }));
  } catch (err) {
    console.error('[render] render failed', err);
    return res.status(500).json({ error: 'render failed' });
  }

  const html = buildShell({ bodyHtml, profile, css: THEME_CSS });

  return res.status(200).json({ files: { 'index.html': html } });
}
