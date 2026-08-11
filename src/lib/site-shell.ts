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
  // Pre-rendered ContactQrWidget markup. It lives in a React component
  // (components/preview/ContactQrWidget.tsx) rather than here so the dashboard
  // preview renders the exact same widget instead of a drifting copy.
  qrHtml: string;
}

// buildShell reproduces what wokil-go's templates/layouts/base.html does beyond
// the theme content itself: page title, GA snippet, and the QR/vCard widget.
export function buildShell({ bodyHtml, profile, css, qrHtml }: ShellOptions): string {
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

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>${css}</style>${gaSnippet}
  </head>
  <body class="@container min-h-screen selection:bg-blue-600/10">
    ${bodyHtml}

    ${qrHtml}

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
