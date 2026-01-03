import React, { useMemo } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import QRCode from "react-qr-code";
import { Phone, Mail, MapPin, Globe } from 'lucide-react';

export type CardLayout = 'classic' | 'minimal' | 'modern';
export type CardColor = 'slate' | 'blue' | 'emerald' | 'indigo' | 'amber';

const CARD_COLORS: Record<CardColor, {
    frontBg: string;
    frontText: string;
    frontSidebarBg: string; // The left column (for classic layout)
    frontSidebarText: string;
    backBg: string;
    backText: string;
    accentColor: string;
    iconColor: string;
}> = {
    slate: {
        frontBg: 'bg-white',
        frontText: 'text-slate-900',
        frontSidebarBg: 'bg-slate-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-slate-900',
        backText: 'text-white',
        accentColor: 'text-slate-500',
        iconColor: 'text-slate-400'
    },
    blue: {
        frontBg: 'bg-white',
        frontText: 'text-gray-900',
        frontSidebarBg: 'bg-blue-600',
        frontSidebarText: 'text-white',
        backBg: 'bg-blue-600',
        backText: 'text-white',
        accentColor: 'text-blue-500',
        iconColor: 'text-blue-500'
    },
    amber: {
        frontBg: 'bg-stone-50',
        frontText: 'text-stone-900',
        frontSidebarBg: 'bg-stone-900',
        frontSidebarText: 'text-amber-50',
        backBg: 'bg-stone-900',
        backText: 'text-amber-50',
        accentColor: 'text-amber-600/80',
        iconColor: 'text-amber-600/70'
    },
    emerald: {
        frontBg: 'bg-emerald-50/50',
        frontText: 'text-emerald-950',
        frontSidebarBg: 'bg-emerald-800',
        frontSidebarText: 'text-emerald-50',
        backBg: 'bg-emerald-800',
        backText: 'text-emerald-50',
        accentColor: 'text-emerald-700',
        iconColor: 'text-emerald-600'
    },
    indigo: {
        frontBg: 'bg-white',
        frontText: 'text-indigo-950',
        frontSidebarBg: 'bg-indigo-900',
        frontSidebarText: 'text-white',
        backBg: 'bg-indigo-900',
        backText: 'text-white',
        accentColor: 'text-indigo-500',
        iconColor: 'text-indigo-500'
    }
};

interface BusinessCardProps {
    profile: LawyerProfile;
    publicUrl: string;
    layout?: CardLayout;
    colorTheme?: CardColor;
}

export const BusinessCard = React.forwardRef<HTMLDivElement, BusinessCardProps>(({ profile, publicUrl, layout = 'classic', colorTheme = 'slate' }, ref) => {
    const { basicInformation, contactInformation, onlinePresence, practiceDetails } = profile;
    const colors = CARD_COLORS[colorTheme];

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
        <div ref={ref} className="flex flex-col md:flex-row items-center justify-center gap-8 print:block print:gap-4 bg-slate-100 p-8 print:bg-white print:p-0">
            {/* FRONT CARD */}
            <div className={`w-[3.5in] h-[2in] ${colors.frontBg} ${colors.frontText} border border-slate-200 shadow-sm relative overflow-hidden flex print:shadow-none print:border print:border-slate-100 mx-auto break-inside-avoid page-break-after-always`}>

                {/* CLASSIC LAYOUT */}
                {layout === 'classic' && (
                    <>
                        <div className={`w-1/3 ${colors.frontSidebarBg} h-full p-4 flex flex-col items-center justify-center ${colors.frontSidebarText} relative`}>
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>

                            <div className="z-10 relative">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">Scan QR</span>
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
                                    <div className={`flex items-center gap-2 ${colors.frontText} opacity-80`}>
                                        <Phone className={`w-3 h-3 ${colors.iconColor} shrink-0`} />
                                        <span className="font-medium">{contactInformation.phoneNumber}</span>
                                    </div>
                                )}
                                {contactInformation.email && (
                                    <div className={`flex items-center gap-2 ${colors.frontText} opacity-80`}>
                                        <Mail className={`w-3 h-3 ${colors.iconColor} shrink-0`} />
                                        <span className="font-medium truncate">{contactInformation.email}</span>
                                    </div>
                                )}
                                {publicUrl && (
                                    <div className={`flex items-center gap-2 ${colors.frontText} opacity-80`}>
                                        <Globe className={`w-3 h-3 ${colors.iconColor} shrink-0`} />
                                        <span className="font-medium truncate">{publicUrl.replace(/^https?:\/\//, '')}</span>
                                    </div>
                                )}
                                {contactInformation.officeAddress && (
                                    <div className={`flex items-start gap-2 ${colors.frontText} opacity-80`}>
                                        <MapPin className={`w-3 h-3 ${colors.iconColor} shrink-0 mt-0.5`} />
                                        <span className="font-medium leading-tight">{contactInformation.officeAddress}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* MINIMAL LAYOUT */}
                {layout === 'minimal' && (
                    <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.frontSidebarBg}`}></div>
                        <div className="mb-4">
                            <h2 className={`text-xl font-bold tracking-tight mb-0.5`}>{basicInformation.fullName}</h2>
                            <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">{basicInformation.professionalTitle}</p>
                            {basicInformation.lawFirmName && (
                                <p className={`text-[10px] font-semibold opacity-50 mt-1`}>{basicInformation.lawFirmName}</p>
                            )}
                        </div>

                        <div className="w-full flex items-center justify-between gap-4 mt-2">
                            <div className="text-left space-y-1.5 text-[9px] opacity-80 flex-1">
                                {contactInformation.phoneNumber && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                        <span>{contactInformation.phoneNumber}</span>
                                    </div>
                                )}
                                {contactInformation.email && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                        <span className="truncate">{contactInformation.email}</span>
                                    </div>
                                )}
                                {publicUrl && (
                                    <div className="flex items-center gap-1.5">
                                        <Globe className={`w-2.5 h-2.5 ${colors.iconColor}`} />
                                        <span className="truncate">{publicUrl.replace(/^https?:\/\//, '')}</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-1 bg-white border border-slate-100 rounded shadow-sm">
                                <QRCode
                                    value={vCardData}
                                    size={256}
                                    style={{ height: "auto", width: "56px" }}
                                    viewBox={`0 0 256 256`}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* MODERN LAYOUT */}
                {layout === 'modern' && (
                    <div className="w-full h-full flex flex-col relative">
                        {/* Top Band */}
                        <div className={`h-16 w-full ${colors.frontSidebarBg} flex items-center justify-between px-6 ${colors.frontSidebarText}`}>
                            <div>
                                <h2 className="text-lg font-bold leading-none">{basicInformation.fullName}</h2>
                                <p className="text-[9px] opacity-80 font-medium uppercase tracking-wide mt-1">{basicInformation.professionalTitle}</p>
                            </div>
                            {basicInformation.lawFirmName && (
                                <div className="text-[10px] font-bold opacity-60 bg-white/10 px-2 py-0.5 rounded">
                                    {basicInformation.lawFirmName}
                                </div>
                            )}
                        </div>

                        {/* Bottom Content */}
                        <div className="flex-1 p-6 flex items-start justify-between">
                            <div className="space-y-2 text-[10px] opacity-80">
                                {contactInformation.phoneNumber && (
                                    <div className={`flex items-center gap-2 ${colors.frontText}`}>
                                        <Phone className={`w-3 h-3 ${colors.iconColor}`} />
                                        <span className="font-semibold">{contactInformation.phoneNumber}</span>
                                    </div>
                                )}
                                {contactInformation.email && (
                                    <div className={`flex items-center gap-2 ${colors.frontText}`}>
                                        <Mail className={`w-3 h-3 ${colors.iconColor}`} />
                                        <span className="font-semibold">{contactInformation.email}</span>
                                    </div>
                                )}
                                {contactInformation.officeAddress && (
                                    <div className={`flex items-center gap-2 ${colors.frontText}`}>
                                        <MapPin className={`w-3 h-3 ${colors.iconColor}`} />
                                        <span className="font-semibold leading-tight max-w-[180px]">{contactInformation.officeAddress}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <div className="p-1 border border-slate-100 rounded">
                                    <QRCode
                                        value={vCardData}
                                        size={256}
                                        style={{ height: "auto", width: "64px" }}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>
                                <span className="text-[7px] font-bold uppercase tracking-wider opacity-50">Contact</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* BACK CARD */}
            <div className={`w-[3.5in] h-[2in] ${colors.backBg} ${colors.backText} border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center print:shadow-none print:border print:border-slate-100 mx-auto break-inside-avoid`}>
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
