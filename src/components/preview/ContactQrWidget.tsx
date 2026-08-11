import { LawyerProfile } from '@/types/lawyer';

// Single source of truth for the contact QR widget. Rendered two ways from the
// same markup: as React in the dashboard preview (ProfilePreview.tsx), and via
// renderToStaticMarkup into the published page's shell (site-shell.ts). It must
// therefore stay stateless — the deployed page ships zero React, so nothing
// here hydrates and no hook would ever run.

export function buildVCard(profile: LawyerProfile): string {
  const basic = profile.basicInformation;
  const contact = profile.contactInformation;
  const online = profile.onlinePresence;
  const areas = profile.practiceDetails?.areasOfPractice ?? [];

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${basic?.fullName ?? ''}`,
    `TITLE:${basic?.professionalTitle ?? ''}`,
    basic?.lawFirmName ? `ORG:${basic.lawFirmName}` : '',
    `TEL;TYPE=WORK:${contact?.phoneNumber ?? ''}`,
    `EMAIL:${contact?.email ?? ''}`,
    `ADR;TYPE=WORK:;;${(contact?.officeAddress ?? '').replace(/\n/g, ', ')};;;;`,
    online?.website ? `URL:${online.website}` : '',
    online?.linkedIn ? `X-SOCIALPROFILE;TYPE=linkedin:${online.linkedIn}` : '',
    areas.length ? `NOTE:${areas.join(', ')}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
}

interface ContactQrWidgetProps {
  profile: LawyerProfile;
  // `fixed` pins to the viewport on the published page; the preview passes
  // `absolute` so the widget stays inside the phone mockup instead of escaping
  // to the dashboard's viewport.
  className?: string;
}

export function ContactQrWidget({ profile, className = 'fixed' }: ContactQrWidgetProps) {
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    buildVCard(profile)
  )}`;

  return (
    // Open/close is pure CSS — hover on desktop, :focus-within on touch — so
    // the identical markup behaves the same in the preview and on the published
    // page without either side shipping a toggle script.
    // ponytail: macOS Safari doesn't focus buttons on click, so touch-open leans
    // on iOS Safari (which does). Swap in a real toggle if that proves too thin.
    <div
      className={`${className} group bottom-6 right-6 z-50 flex flex-col items-end @sm:bottom-10 @sm:right-10 pointer-events-none`}
    >
      <div className="pointer-events-auto mb-4 bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-2xl transform origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0 scale-90 invisible translate-y-4 group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:visible group-focus-within:translate-y-0">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrSrc}
              alt="Contact QR Code"
              className="w-36 h-36 object-contain mix-blend-multiply opacity-90"
            />
          </div>
          <p className="text-[0.625rem] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
            Scan to Save
          </p>
        </div>
      </div>
      <button
        type="button"
        className="pointer-events-auto flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white p-3 @md:pl-5 @md:pr-4 @md:py-3.5 rounded-full shadow-lg hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 active:translate-y-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
          <path d="M21 21v.01" />
          <path d="M12 7v3a2 2 0 0 1-2 2H7" />
          <path d="M3 12h.01" />
          <path d="M12 3h.01" />
          <path d="M12 16v.01" />
          <path d="M16 12h1" />
          <path d="M21 12v.01" />
          <path d="M12 21v.01" />
        </svg>
        <span className="font-medium text-sm tracking-wide hidden @md:block">Contact</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-slate-400 transition-transform duration-300 hidden @md:block group-hover:rotate-180 group-focus-within:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}
