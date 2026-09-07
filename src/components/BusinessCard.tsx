import React, { useRef, useState, useEffect } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import QRCode from "react-qr-code";
import { Phone, Mail, MapPin, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CardLayout = 'classic' | 'minimal' | 'modern';
export type CardColor = 'slate' | 'blue' | 'emerald' | 'indigo' | 'amber';

// Standard Business Card Size (3.5in x 2in)
// Using a smaller multiplier for better screen display
const BASE_WIDTH = 420;  // Reduced from 672
const BASE_HEIGHT = 240; // Reduced from 384

const CARD_COLORS: Record<CardColor, {
    frontBg: string;
    frontText: string;
    frontSidebarBg: string;
    frontSidebarText: string;
    backBg: string;
    backText: string;
    accentColor: string;
    iconColor: string;
    // Secondary "prestige" accent used on dark surfaces (classic front, sidebar
    // stripes, header bands, card back) — a gold tone reads well on every base
    // color except amber, where gold-on-gold loses contrast, so amber gets a
    // lighter cream accent instead.
    accent2Text: string;
    accent2Bg: string;
    accent2Border: string;
}> = {
    slate: {
        frontBg: 'bg-white',
        frontText: 'text-slate-900',
        frontSidebarBg: 'bg-slate-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-slate-900',
        backText: 'text-white',
        accentColor: 'text-slate-500',
        iconColor: 'text-slate-400',
        accent2Text: 'text-amber-300',
        accent2Bg: 'bg-amber-300',
        accent2Border: 'border-amber-300/30'
    },
    blue: {
        frontBg: 'bg-white',
        frontText: 'text-gray-900',
        frontSidebarBg: 'bg-blue-600',
        frontSidebarText: 'text-white',
        backBg: 'bg-blue-600',
        backText: 'text-white',
        accentColor: 'text-blue-500',
        iconColor: 'text-blue-500',
        accent2Text: 'text-amber-300',
        accent2Bg: 'bg-amber-300',
        accent2Border: 'border-amber-300/30'
    },
    amber: {
        frontBg: 'bg-stone-50',
        frontText: 'text-stone-900',
        frontSidebarBg: 'bg-stone-900',
        frontSidebarText: 'text-amber-50',
        backBg: 'bg-stone-900',
        backText: 'text-amber-50',
        accentColor: 'text-amber-600/80',
        iconColor: 'text-amber-600/70',
        accent2Text: 'text-amber-100',
        accent2Bg: 'bg-amber-100',
        accent2Border: 'border-amber-100/30'
    },
    emerald: {
        frontBg: 'bg-emerald-50/50',
        frontText: 'text-emerald-950',
        frontSidebarBg: 'bg-emerald-800',
        frontSidebarText: 'text-emerald-50',
        backBg: 'bg-emerald-800',
        backText: 'text-emerald-50',
        accentColor: 'text-emerald-700',
        iconColor: 'text-emerald-600',
        accent2Text: 'text-amber-300',
        accent2Bg: 'bg-amber-300',
        accent2Border: 'border-amber-300/30'
    },
    indigo: {
        frontBg: 'bg-white',
        frontText: 'text-indigo-950',
        frontSidebarBg: 'bg-indigo-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-indigo-900',
        backText: 'text-white',
        accentColor: 'text-indigo-500',
        iconColor: 'text-indigo-500',
        accent2Text: 'text-amber-300',
        accent2Bg: 'bg-amber-300',
        accent2Border: 'border-amber-300/30'
    }
};

interface BusinessCardProps {
    profile: LawyerProfile;
    publicUrl: string;
    layout?: CardLayout;
    colorTheme?: CardColor;
}

// publicUrl is derived from the sites table, so a user with no live site gets
// an empty string. react-qr-code will happily encode that into a QR that scans
// to nothing — on a card that gets printed. Render a placeholder instead.
const SiteQRCode = ({ value, style }: { value: string; style?: React.CSSProperties }) => {
    if (!value) {
        return (
            <div className="w-full h-full flex items-center justify-center text-center text-[6px] font-bold uppercase tracking-widest text-slate-400 leading-tight px-0.5">
                No live site
            </div>
        );
    }
    return <QRCode value={value} size={256} style={style} viewBox={`0 0 256 256`} />;
};

// Subtle decorative monogram used as a corner flourish in place of literal
// NFC iconography (this card has no NFC functionality).
const Monogram = ({ name, className, borderClassName }: { name: string; className?: string; borderClassName?: string }) => {
    const initials = name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    if (!initials) return null;
    return (
        <div className={cn("w-7 h-7 rounded-full border flex items-center justify-center text-[9px] font-bold tracking-wide opacity-70 shrink-0", borderClassName, className)}>
            {initials}
        </div>
    );
};

const ScalableCardContainer = ({ children }: { children: React.ReactNode }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const updateScale = () => {
            if (containerRef.current) {
                const parentWidth = containerRef.current.offsetWidth;
                const newScale = parentWidth / BASE_WIDTH;
                setScale(Math.min(newScale, 1)); // Cap at 1 to prevent upscaling
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return (
        <div ref={containerRef} className="w-full relative" style={{ paddingBottom: `${(BASE_HEIGHT / BASE_WIDTH) * 100}%` }}>
            <div
                className="absolute top-0 left-0 origin-top-left print:static print:transform-none"
                style={{
                    width: `${BASE_WIDTH}px`,
                    height: `${BASE_HEIGHT}px`,
                    transform: `scale(${scale})`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

// Shared premium surface treatment: rounded corners, ambient shadow, and a
// soft light gradient for depth. The gradient overlay is screen-only — it's
// a cosmetic sheen with no dependency on hover/JS state, and mix-blend-mode
// can render unpredictably on some print pipelines, so it's dropped for print.
const CARD_SURFACE = "relative rounded-xl border border-black/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.35)] overflow-hidden print:shadow-none print:border-slate-200 print:rounded-lg";

const SurfaceSheen = ({ direction = 'br' }: { direction?: 'br' | 'tl' }) => (
    <div
        className={cn(
            "absolute inset-0 pointer-events-none mix-blend-overlay print:hidden",
            direction === 'br' ? "bg-gradient-to-br from-white/10 to-transparent" : "bg-gradient-to-tl from-white/5 to-transparent"
        )}
    />
);

export const BusinessCard = React.forwardRef<HTMLDivElement, BusinessCardProps>(({ profile, publicUrl, layout = 'classic', colorTheme = 'slate' }, ref) => {
    const { basicInformation, contactInformation, onlinePresence, practiceDetails } = profile;
    const colors = CARD_COLORS[colorTheme];

    const vCardData = (() => {
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${basicInformation.fullName}`,
            `TITLE:${basicInformation.professionalTitle}`,
            basicInformation.lawFirmName ? `ORG:${basicInformation.lawFirmName}` : '',
            `TEL;TYPE=WORK:${contactInformation.phoneNumber}`,
            `EMAIL:${contactInformation.email}`,
            `ADR;TYPE=WORK:;;${contactInformation.officeAddress.replace(/\n/g, ', ')};;;;`,
            onlinePresence.website ? `URL:${onlinePresence.website}` : '',
            onlinePresence.linkedIn ? `X-SOCIALPROFILE;TYPE=linkedin:${onlinePresence.linkedIn}` : '',
            `NOTE:${practiceDetails.areasOfPractice.join(', ')}`,
            'END:VCARD',
        ].filter(Boolean);
        return lines.join('\n');
    })();

    return (
        <div ref={ref} className="flex flex-col md:flex-row gap-4 md:gap-6 print:flex-row print:gap-4 bg-transparent p-0 w-full">

            {/* FRONT CARD */}
            <div className="w-full md:flex-1 print:w-[3.5in] print:h-[2in]">
                <ScalableCardContainer>
                    <div className={cn(
                        CARD_SURFACE,
                        "w-full h-full flex",
                        "print:w-[3.5in] print:h-[2in]",
                        colors.frontBg,
                        colors.frontText
                    )}>
                        <SurfaceSheen direction="br" />

                        {/* CLASSIC LAYOUT */}
                        {layout === 'classic' && (
                            <div className={cn("w-full h-full p-7 flex flex-col justify-between relative z-10", colors.frontSidebarBg, colors.frontSidebarText)}>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight font-heading leading-tight mb-1.5">
                                        {basicInformation.fullName}
                                        <span className={cn("text-[11px] align-top ml-1.5 font-normal", colors.accent2Text)}>Esq.</span>
                                    </h2>
                                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] opacity-70 mb-3">{basicInformation.professionalTitle}</p>
                                    <div className={cn("w-8 h-[2px] mb-3", colors.accent2Bg)} />
                                    {basicInformation.lawFirmName && (
                                        <p className="text-[10px] font-medium opacity-70 tracking-wide">{basicInformation.lawFirmName}</p>
                                    )}
                                </div>
                                <div className="flex items-end justify-between gap-3">
                                    <div className="space-y-1.5 min-w-0">
                                        {contactInformation.phoneNumber && (
                                            <p className="text-[9px] font-medium tracking-wide opacity-80 flex items-center gap-1.5">
                                                <Phone className={cn("w-2.5 h-2.5 shrink-0", colors.accent2Text)} />
                                                {contactInformation.phoneNumber}
                                            </p>
                                        )}
                                        {contactInformation.officeAddress && (
                                            <p className="text-[9px] font-medium tracking-wide opacity-80 flex items-center gap-1.5 truncate">
                                                <MapPin className={cn("w-2.5 h-2.5 shrink-0", colors.accent2Text)} />
                                                <span className="truncate">{contactInformation.officeAddress.split('\n')[0]}</span>
                                            </p>
                                        )}
                                    </div>
                                    <Monogram name={basicInformation.fullName} borderClassName={colors.accent2Border} />
                                </div>
                            </div>
                        )}

                        {/* MINIMAL LAYOUT */}
                        {layout === 'minimal' && (
                            <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative z-10">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${colors.frontSidebarBg}`}></div>
                                <div className="mb-4 w-full">
                                    <h2 className="text-xl font-bold tracking-tight mb-1 font-heading">
                                        {basicInformation.fullName}
                                        <span className={cn("text-[10px] align-top ml-1 font-normal", colors.accentColor)}>Esq.</span>
                                    </h2>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{basicInformation.professionalTitle}</p>
                                    <div className={cn("w-6 h-[2px] mx-auto my-2", colors.accentColor.replace('text-', 'bg-'))} />
                                    {basicInformation.lawFirmName && (
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">{basicInformation.lawFirmName}</p>
                                    )}
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 mt-2 border-t border-current/10 pt-4">
                                    <div className="text-left space-y-2">
                                        {contactInformation.phoneNumber && (
                                            <div className="flex items-center gap-2 opacity-80">
                                                <div className="w-5 h-5 rounded-md bg-current/5 flex items-center justify-center shrink-0">
                                                    <Phone className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                                </div>
                                                <span className="text-[9px] font-medium tracking-wide">{contactInformation.phoneNumber}</span>
                                            </div>
                                        )}
                                        {contactInformation.email && (
                                            <div className="flex items-center gap-2 opacity-80">
                                                <div className="w-5 h-5 rounded-md bg-current/5 flex items-center justify-center shrink-0">
                                                    <Mail className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                                </div>
                                                <span className="text-[9px] font-medium tracking-wide truncate">{contactInformation.email}</span>
                                            </div>
                                        )}
                                        {publicUrl && (
                                            <div className="flex items-center gap-2 opacity-80">
                                                <div className="w-5 h-5 rounded-md bg-current/5 flex items-center justify-center shrink-0">
                                                    <Globe className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                                </div>
                                                <span className="text-[9px] font-medium tracking-wide truncate">{publicUrl.replace(/^https?:\/\//, '')}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end items-center flex-col gap-1.5">
                                        <div className="p-1.5 bg-white rounded-lg shadow-inner">
                                            <SiteQRCode
                                                value={publicUrl}
                                                style={{ height: "auto", width: "48px" }}
                                            />
                                        </div>
                                        <span className={cn("text-[7px] font-bold uppercase tracking-widest opacity-60", colors.accentColor)}>Website</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODERN LAYOUT */}
                        {layout === 'modern' && (
                            <div className="w-full h-full flex flex-col relative z-10">
                                <div className={`h-16 w-full ${colors.frontSidebarBg} flex items-center justify-between px-6 ${colors.frontSidebarText}`}>
                                    <div>
                                        <h2 className="text-xl font-bold tracking-tight font-heading leading-tight">
                                            {basicInformation.fullName}
                                            <span className={cn("text-[10px] align-top ml-1 font-normal", colors.accent2Text)}>Esq.</span>
                                        </h2>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-90 mt-1">{basicInformation.professionalTitle}</p>
                                    </div>
                                    {basicInformation.lawFirmName && (
                                        <div className={cn("text-[9px] font-bold uppercase tracking-widest opacity-90 bg-white/10 px-2 py-1 rounded-full border", colors.accent2Border)}>
                                            {basicInformation.lawFirmName}
                                        </div>
                                    )}
                                </div>

                                <div className={cn("flex-1 p-6 flex items-start justify-between", colors.frontBg, colors.frontText)}>
                                    <div className="space-y-3">
                                        {contactInformation.phoneNumber && (
                                            <div className="flex items-center gap-3 opacity-90">
                                                <div className={`w-6 h-6 rounded-lg ${colors.frontSidebarBg} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                                    <Phone className={`w-3 h-3 ${colors.iconColor}`} />
                                                </div>
                                                <span className="text-[10px] font-semibold tracking-wide">{contactInformation.phoneNumber}</span>
                                            </div>
                                        )}
                                        {contactInformation.email && (
                                            <div className="flex items-center gap-3 opacity-90">
                                                <div className={`w-6 h-6 rounded-lg ${colors.frontSidebarBg} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                                    <Mail className={`w-3 h-3 ${colors.iconColor} shrink-0`} />
                                                </div>
                                                <span className="text-[10px] font-semibold tracking-wide">{contactInformation.email}</span>
                                            </div>
                                        )}
                                        {contactInformation.officeAddress && (
                                            <div className="flex items-center gap-3 opacity-90">
                                                <div className={`w-6 h-6 rounded-lg ${colors.frontSidebarBg} bg-opacity-10 flex items-center justify-center shrink-0`}>
                                                    <MapPin className={`w-3 h-3 ${colors.iconColor} shrink-0`} />
                                                </div>
                                                <span className="text-[9px] font-medium leading-tight opacity-80 max-w-[150px]">{contactInformation.officeAddress}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="p-1.5 bg-white rounded-lg shadow-inner">
                                            <SiteQRCode
                                                value={publicUrl}
                                                style={{ height: "auto", width: "52px" }}
                                            />
                                        </div>
                                        <span className={cn("text-[7px] font-bold uppercase tracking-widest opacity-60", colors.accentColor)}>Website</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScalableCardContainer>
            </div>

            {/* BACK CARD */}
            <div className="w-full md:flex-1 print:w-[3.5in] print:h-[2in]">
                <ScalableCardContainer>
                    <div className={cn(
                        CARD_SURFACE,
                        "w-full h-full flex flex-col items-center justify-center",
                        "print:w-[3.5in] print:h-[2in]",
                        colors.backBg,
                        colors.backText
                    )}>
                        <SurfaceSheen direction="tl" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-tr-full"></div>

                        <div className="z-10 flex flex-col items-center gap-3 px-6 text-center">
                            <span className={cn("text-[10px] font-bold tracking-[0.2em] uppercase font-heading", colors.accent2Text)}>
                                Save Contact
                            </span>

                            <div className="p-2 bg-white rounded-lg shadow-inner">
                                <QRCode
                                    value={vCardData}
                                    style={{ height: "auto", width: "100px" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>

                            <p className="text-[8px] font-medium opacity-60 max-w-[220px] leading-tight">
                                {publicUrl
                                    ? `Scan to save contact or visit ${publicUrl.replace(/^https?:\/\//, '')}`
                                    : 'Scan to save contact details'}
                            </p>
                        </div>
                    </div>
                </ScalableCardContainer>
            </div>
        </div>
    );
});

BusinessCard.displayName = 'BusinessCard';
