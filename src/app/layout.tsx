import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: {
    default: "Wokil - Legal Professional Profiles and Business Cards",
    template: "%s | Wokil",
  },
  description: "Wokil - A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals.",
  keywords: ["legal professionals", "lawyer profiles", "business cards", "legal websites", "attorney profiles", "law firm"],
  authors: [{ name: "Wokil" }],
  creator: "Wokil",
  publisher: "Wokil",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://wokil.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Wokil",
    title: "Wokil - Legal Professional Profiles and Business Cards",
    description: "Wokil - A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals.",
    images: [
      {
        url: "/placeholder.svg",
        width: 1200,
        height: 630,
        alt: "Wokil - Legal Professional Profiles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wokil - Legal Professional Profiles and Business Cards",
    description: "Wokil - A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals.",
    images: ["/placeholder.svg"],
    creator: "@Wokil",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <TooltipProvider>
              {children}
              <Toaster />
              <Sonner />
              <Analytics />
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
