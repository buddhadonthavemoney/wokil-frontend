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
    <div className="bg-card border border-border rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">Save Contact</h3>
      </div>
      
      {qrCodeUrl && (
        <div className="mb-4 flex justify-center">
          <img
            src={qrCodeUrl}
            alt="Contact QR Code"
            className="w-48 h-48 rounded-lg border border-border"
          />
        </div>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        Scan to save contact details
      </p>
      
      <Button variant="outline" size="sm" onClick={downloadVCard} className="gap-2">
        <Download className="w-4 h-4" />
        Download vCard
      </Button>
    </div>
  );
}
