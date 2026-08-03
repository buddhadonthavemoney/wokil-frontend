import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ModernTheme } from './themes/ModernTheme';
import { ExecutiveTheme } from './themes/ExecutiveTheme';
import { LegalCraftTheme } from './themes/LegalCraftTheme';
import { useState, useEffect } from 'react';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  html?: string;
  zoom?: number;
}

export function ProfilePreview({ profile, html, zoom = 1 }: ProfilePreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!html) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    try {
      // Parse the HTML string into a DOM document
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const origin = window.location.origin;

      // 1. Rewrite relative ASSETS (CSS, JS, Images) to use absolute URLs pointing to the main app/backend
      // This ensures styles and scripts load correctly without a <base> tag
      const assetSelectors = [
        'link[href^="/"]',
        'script[src^="/"]',
        'img[src^="/"]'
      ];
      
      assetSelectors.forEach(selector => {
        doc.querySelectorAll(selector).forEach(el => {
          if (el.tagName === 'LINK') {
            const href = el.getAttribute('href');
            if (href) el.setAttribute('href', `${origin}${href}`);
          } else {
            const src = el.getAttribute('src');
            if (src) el.setAttribute('src', `${origin}${src}`);
          }
        });
      });

      // 2. Kill all Navigation Links and Hide Scrollbars
      // We inject a style tag to hide scrollbars for a cleaner mobile look
      const style = doc.createElement('style');
      style.textContent = `
        /* Hide scrollbar for Chrome, Safari and Opera */
        ::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        html {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `;
      doc.head.appendChild(style);

      // Instead of relying on script interception (which can be flaky), we modify the HMTL directly
      doc.querySelectorAll('a').forEach(anchor => {
        const href = anchor.getAttribute('href');
        // Allow pure hash links (scrolling)
        if (!href || href.startsWith('#')) return;
        
        // Disable the link
        anchor.setAttribute('href', 'javascript:void(0)');
        anchor.setAttribute('onclick', 'return false;');
        anchor.style.cursor = 'default';
        anchor.style.pointerEvents = 'none'; // Optional: makes it unclickable visually too
      });

      // 3. Serialize back to HTML string
      const processedHtml = `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;

      // 4. Create Blob from the clean, safe HTML
      const blob = new Blob([processedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);

      // Cleanup previous blob URL if it exists
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    } catch (e) {
      console.error("Error processing preview HTML:", e);
      // Fallback if parsing fails (unlikely)
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      return () => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      };
    }
  }, [html]);

  if (!html || !blobUrl) return null;

  return (
    <div className="w-full h-full animate-fade-in relative overflow-hidden bg-white">
      <div 
        className="absolute top-0 left-0 origin-top-left"
        style={{ 
          width: `${(1 / zoom) * 100}%`,
          height: `${(1 / zoom) * 100}%`,
          transform: `scale(${zoom})`,
        }}
      >
        <iframe 
          key={blobUrl} 
          src={blobUrl}
          title="Profile Preview"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
