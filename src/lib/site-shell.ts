import { LawyerProfile } from '@/types/lawyer';

// Raw string templates aren't auto-escaped the way Go's html/template is —
// every interpolated value here must be escaped explicitly.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Escapes a value for embedding inside a double-quoted JS string literal in an
// inline <script> block, and neutralizes "</script" so profile data can't break
// out of the script tag.
function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/<\/script/gi, '<\\/script');
}

interface ShellOptions {
  bodyHtml: string;
  profile: LawyerProfile;
  css: string;
}

// buildShell reproduces what wokil-go's templates/layouts/base.html does beyond
// the theme content itself: page title, GA snippet, and the QR/vCard widget.
export function buildShell({ bodyHtml, profile, css }: ShellOptions): string {
  const fullName = profile.basicInformation?.fullName ?? '';
  const title = fullName ? escapeHtml(fullName) : 'Lawyer Profile';
  const gaId = profile.googleAnalyticsId;

  const gaSnippet = gaId
    ? `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(gaId)}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag("js", new Date());
      gtag("config", "${escapeJsString(gaId)}");
    </script>`
    : '';

  const professionalTitle = profile.basicInformation?.professionalTitle ?? '';
  const lawFirmName = profile.basicInformation?.lawFirmName ?? '';
  const phone = profile.contactInformation?.phoneNumber ?? '';
  const email = profile.contactInformation?.email ?? '';
  const addr = (profile.contactInformation?.officeAddress ?? '').replace(/\n/g, ', ');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>${css}</style>
    <style>
      .qr-active #qr-content {
        opacity: 1 !important;
        visibility: visible !important;
        transform: scale(1) translateY(0) !important;
      }
      .qr-active #chevron-icon {
        transform: rotate(180deg);
      }
      [data-reveal] {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      [data-reveal].is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      @media (prefers-reduced-motion: reduce) {
        [data-reveal] {
          opacity: 1;
          transform: none;
          transition: none;
        }
      }
    </style>${gaSnippet}
  </head>
  <body class="@container min-h-screen selection:bg-blue-600/10">
    ${bodyHtml}

    <div id="qr-widget" class="fixed bottom-6 right-6 z-50 flex flex-col items-end sm:bottom-10 sm:right-10 pointer-events-none">
      <div id="qr-content" class="pointer-events-auto mb-4 bg-white/80 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-2xl transform origin-bottom-right transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-0 scale-90 invisible translate-y-4">
        <div class="flex flex-col items-center gap-3">
          <div class="bg-white p-4 rounded-2xl shadow-inner border border-gray-100/50">
            <img id="qr-image" src="" alt="Contact QR Code" class="w-36 h-36 object-contain mix-blend-multiply opacity-90">
          </div>
          <p class="text-[0.625rem] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Scan to Save</p>
        </div>
      </div>
      <button id="qr-trigger" class="pointer-events-auto group flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-white/10 text-white p-3 md:pl-5 md:pr-4 md:py-3.5 rounded-full shadow-lg hover:shadow-slate-900/30 transition-all duration-300 hover:-translate-y-1 active:scale-95 active:translate-y-0">
        <div class="relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        </div>
        <span class="font-medium text-sm tracking-wide hidden md:block">Contact</span>
        <svg id="chevron-icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400 transition-transform duration-300 hidden md:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </button>
    </div>

    <script>
      (function () {
        const fullName = "${escapeJsString(fullName)}";
        const title = "${escapeJsString(professionalTitle)}";
        const firm = "${escapeJsString(lawFirmName)}";
        const phone = "${escapeJsString(phone)}";
        const email = "${escapeJsString(email)}";
        const addr = "${escapeJsString(addr)}";

        const vCard = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          \`FN:\${fullName}\`,
          \`TITLE:\${title}\`,
          firm ? \`ORG:\${firm}\` : "",
          \`TEL;TYPE=WORK:\${phone}\`,
          \`EMAIL:\${email}\`,
          \`ADR;TYPE=WORK:;;\${addr};;;;\`,
          "END:VCARD",
        ]
          .filter((line) => line.length > 10 || line.includes(":"))
          .join("\\n");

        const qrImg = document.getElementById("qr-image");
        if (qrImg) {
          qrImg.src = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(vCard)}\`;
        }

        const qrWidget = document.getElementById("qr-widget");
        const qrTrigger = document.getElementById("qr-trigger");

        function toggleQR(e) {
          e.stopPropagation();
          qrWidget.classList.toggle("qr-active");
        }

        qrTrigger.addEventListener("click", toggleQR);
        qrTrigger.addEventListener("mouseenter", () => {
          if (window.matchMedia("(min-width: 768px)").matches) {
            qrWidget.classList.add("qr-active");
          }
        });
        qrWidget.addEventListener("mouseleave", () => {
          if (window.matchMedia("(min-width: 768px)").matches) {
            qrWidget.classList.remove("qr-active");
          }
        });

        document.addEventListener("click", (e) => {
          if (!qrWidget.contains(e.target)) {
            qrWidget.classList.remove("qr-active");
          }
        });
      })();
    </script>

    <script>
      (function () {
        // Collapse a [data-nav] bar to its hamburger the moment its row stops
        // fitting, rather than at a guessed breakpoint: drop the flag, measure,
        // re-apply. Long firm names are what actually blow the layout, and they
        // vary per profile, so a fixed width can't get this right.
        const navs = document.querySelectorAll("[data-nav]");
        if (!navs.length) return;

        const fit = (nav) => {
          nav.removeAttribute("data-collapsed");
          const row = nav.firstElementChild || nav;
          if (row.scrollWidth > row.clientWidth + 1) nav.setAttribute("data-collapsed", "");
        };
        const fitAll = () => navs.forEach(fit);

        fitAll();
        if ("ResizeObserver" in window) {
          const ro = new ResizeObserver(fitAll);
          navs.forEach((nav) => ro.observe(nav));
        } else {
          window.addEventListener("resize", fitAll);
        }
        // Web fonts land after first paint and change the measured width.
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
      })();
    </script>

    <script>
      (function () {
        const revealEls = document.querySelectorAll("[data-reveal]");
        if (!revealEls.length) return;

        if (!("IntersectionObserver" in window)) {
          revealEls.forEach((el) => el.classList.add("is-visible"));
          return;
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
        );

        revealEls.forEach((el) => observer.observe(el));
      })();
    </script>
  </body>
</html>
`;
}
