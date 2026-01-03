import React, { useMemo } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import QRCode from "react-qr-code";
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export type CardTheme = 'classic' | 'modern' | 'executive' | 'nature' | 'cobalt';

const CARD_THEMES: Record<CardTheme, {
    frontBg: string;
    frontText: string;
    frontSidebarBg: string; // The left column
    frontSidebarText: string;
    backBg: string;
    backText: string;
    accentColor: string;
    iconColor: string;
}> = {
    classic: {
        frontBg: 'bg-white',
        frontText: 'text-slate-900',
        frontSidebarBg: 'bg-slate-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-slate-900',
        backText: 'text-white',
        accentColor: 'text-slate-500',
        iconColor: 'text-slate-400'
    },
    modern: {
        frontBg: 'bg-white',
        frontText: 'text-gray-900',
        frontSidebarBg: 'bg-blue-600',
        frontSidebarText: 'text-white',
        backBg: 'bg-blue-600',
        backText: 'text-white',
        accentColor: 'text-blue-500',
        iconColor: 'text-blue-400'
    },
    executive: {
        frontBg: 'bg-stone-50',
        frontText: 'text-stone-900',
        frontSidebarBg: 'bg-stone-900',
        frontSidebarText: 'text-amber-50',
        backBg: 'bg-stone-900',
        backText: 'text-amber-50',
        accentColor: 'text-amber-600/80',
        iconColor: 'text-amber-600/70'
    },
    nature: {
        frontBg: 'bg-emerald-50/50',
        frontText: 'text-emerald-950',
        frontSidebarBg: 'bg-emerald-800',
        frontSidebarText: 'text-emerald-50',
        backBg: 'bg-emerald-800',
        backText: 'text-emerald-50',
        accentColor: 'text-emerald-700',
        iconColor: 'text-emerald-600'
    },
    cobalt: {
        frontBg: 'bg-white',
        frontText: 'text-indigo-950',
        frontSidebarBg: 'bg-indigo-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-indigo-900',
        backText: 'text-white',
        accentColor: 'text-indigo-500',
        iconColor: 'text-indigo-400'
    }
};

interface BusinessCardProps {
    profile: LawyerProfile;
    publicUrl: string;
    theme?: CardTheme;
}

export const BusinessCard = React.forwardRef<HTMLDivElement, BusinessCardProps>(({ profile, publicUrl, theme = 'classic' }, ref) => {
    const { basicInformation, contactInformation, onlinePresence, practiceDetails } = profile;
    const currentTheme = CARD_THEMES[theme];

    const vCardData = useMemo(() => {
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
    }, [profile]);

    return (
        <div ref={ref} className="flex flex-col items-center gap-8 print:block print:gap-4 bg-slate-100 p-8 print:bg-white print:p-0">

            {/* FRONT CARD */}
            <div className={`w-[3.5in] h-[2in] ${currentTheme.frontBg} ${currentTheme.frontText} border border-slate-200 shadow-sm relative overflow-hidden flex print:shadow-none print:border print:border-slate-100 mx-auto break-inside-avoid page-break-after-always`}>
                <div className={`w-1/3 ${currentTheme.frontSidebarBg} h-full p-4 flex flex-col items-center justify-center ${currentTheme.frontSidebarText} relative`}>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>

                    <div className="z-10 relative">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Scan Me</span>
                            {/* vCard QR Code */}
                            <div className="p-1.5 bg-white rounded-lg inline-block w-full max-w-[80px] shadow-lg">
                                <QRCode
                                    value={vCardData}
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-2/3 p-5 flex flex-col justify-center gap-4">
                    <div>
                        <h2 className={`text-lg font-bold leading-tight mb-1`}>{basicInformation.fullName}</h2>

                        {basicInformation.lawFirmName && (
                            <p className={`text-xs font-semibold uppercase tracking-wide opacity-70`}>{basicInformation.lawFirmName}</p>
                        )}
                        <p className={`text-[10px] font-medium mt-0.5 opacity-60`}>{basicInformation.professionalTitle}</p>
                    </div>

                    <div className="space-y-2 text-[10px]">
                        {contactInformation.phoneNumber && (
                            <div className={`flex items-center gap-2 ${currentTheme.frontText} opacity-80`}>
                                <Phone className={`w-3 h-3 ${currentTheme.iconColor} shrink-0`} />
                                <span className="font-medium">{contactInformation.phoneNumber}</span>
                            </div>
                        )}
                        {contactInformation.email && (
                            <div className={`flex items-center gap-2 ${currentTheme.frontText} opacity-80`}>
                                <Mail className={`w-3 h-3 ${currentTheme.iconColor} shrink-0`} />
                                <span className="font-medium truncate">{contactInformation.email}</span>
                            </div>
                        )}
                        {publicUrl && (
                            <div className={`flex items-center gap-2 ${currentTheme.frontText} opacity-80`}>
                                <Globe className={`w-3 h-3 ${currentTheme.iconColor} shrink-0`} />
                                <span className="font-medium truncate">{publicUrl.replace(/^https?:\/\//, '')}</span>
                            </div>
                        )}
                        {contactInformation.officeAddress && (
                            <div className={`flex items-start gap-2 ${currentTheme.frontText} opacity-80`}>
                                <MapPin className={`w-3 h-3 ${currentTheme.iconColor} shrink-0 mt-0.5`} />
                                <span className="font-medium leading-tight">{contactInformation.officeAddress}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BACK CARD */}
            <div className={`w-[3.5in] h-[2in] ${currentTheme.backBg} ${currentTheme.backText} border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center print:shadow-none print:border print:border-slate-100 mx-auto break-inside-avoid`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full"></div>

                <div className="z-10 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Globe className={`w-4 h-4 opacity-70`} />
                        <span className={`text-sm font-semibold tracking-widest uppercase opacity-80`}>Online Presence</span>
                    </div>

                    <div className="p-2 bg-white rounded-xl shadow-lg">
                        <QRCode
                            value={publicUrl}
                            size={80}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

BusinessCard.displayName = 'BusinessCard';
