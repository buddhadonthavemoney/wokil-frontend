import { LawyerProfile } from '@/types/lawyer';
import { ChevronUp, QrCode } from 'lucide-react';

// Shared by the dashboard preview and the published page's shell, so it must
// stay stateless — the deployed page ships zero React and never hydrates.

function buildVCard(profile: LawyerProfile): string {
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
    // data-qr is the hook the published shell's GA snippet binds to; it does
    // nothing in the dashboard preview, which never loads gtag.
    <div
      data-qr
      className={`${className} group bottom-6 right-6 z-50 flex flex-col items-end @sm:bottom-10 @sm:right-10 pointer-events-none`}
    >
      <div className="pointer-events-auto mb-4 bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-2xl transform origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0 scale-90 invisible translate-y-4 group-hover:opacity-100 group-hover:scale-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:scale-100 group-focus-within:visible group-focus-within:translate-y-0">
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100/50">
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
        <QrCode className="w-5 h-5" />
        <span className="font-medium text-sm tracking-wide hidden @md:block">Contact</span>
        <ChevronUp className="w-4 h-4 text-slate-400 transition-transform duration-300 hidden @md:block group-hover:rotate-180 group-focus-within:rotate-180" />
      </button>
    </div>
  );
}
