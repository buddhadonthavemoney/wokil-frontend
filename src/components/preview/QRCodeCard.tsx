import { useEffect, useState } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeCardProps {
  profile: LawyerProfile;
}

export function QRCodeCard({ profile }: QRCodeCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Generate vCard data
    const vCard = generateVCard(profile);
    // Encode for QR code
    const encoded = encodeURIComponent(vCard);
    // Use QR code API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
    setQrCodeUrl(qrUrl);
  }, [profile]);

  const generateVCard = (p: LawyerProfile): string => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${p.fullName}`,
      `TITLE:${p.professionalTitle}`,
      p.lawFirmName ? `ORG:${p.lawFirmName}` : '',
      `TEL;TYPE=WORK:${p.phoneNumber}`,
      `EMAIL:${p.email}`,
      `ADR;TYPE=WORK:;;${p.officeAddress.replace(/\n/g, ', ')};;;;`,
      p.website ? `URL:${p.website}` : '',
      p.linkedIn ? `X-SOCIALPROFILE;TYPE=linkedin:${p.linkedIn}` : '',
      `NOTE:${p.areasOfPractice.join(', ')}`,
      'END:VCARD',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const downloadVCard = () => {
    const vCard = generateVCard(profile);
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.fullName.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="group bg-card border border-border rounded-xl p-4 text-center cursor-pointer transition-all duration-300 ease-out overflow-hidden shadow-sm hover:shadow-md">
      <div className="flex items-center justify-center gap-2">
        <QrCode className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        <h3 className="font-heading font-semibold text-lg text-foreground">Contact QR</h3>
      </div>

      <div className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-0 w-0 group-hover:max-h-[240px] group-hover:w-full">
        <div className="w-full">
          {qrCodeUrl && (
            <div className="mt-4 mb-2 flex justify-center transform opacity-0 translate-y-2 scale-95 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-400 ease-out delay-100">
              <img
                src={qrCodeUrl}
                alt="Contact QR Code"
                className="w-48 h-48 rounded-lg border border-border shadow-sm"
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out delay-200">
            Scan to save contact details
          </p>
        </div>
      </div>
    </div>
  );
}
