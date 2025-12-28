import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { BookingProvider } from "../contexts/BookingContext";
import { BottomNav } from "../components/navigation/BottomNav";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Font optimization
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "lokals - Trusted Local Services",
    template: "%s | lokals"
  },
  description: "Find trusted local professionals for cleaning, repairs, beauty, and more. Instant booking, verified providers, and transparent pricing.",
  applicationName: "lokals",
  authors: [{ name: "The Lokals Team" }],
  keywords: ["local services", "home cleaning", "handyman", "beauty services", "plumber", "electrician"],
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thelokals.com",
    siteName: "lokals",
    title: "lokals - Trusted Local Services",
    description: "Find trusted local professionals for cleaning, repairs, beauty, and more.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "lokals - Trusted Local Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "lokals - Trusted Local Services",
    description: "Find trusted local professionals for cleaning, repairs, beauty, and more.",
    images: ["/og-image.jpg"],
    creator: "@thelokals",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseDomain = supabaseUrl ? new URL(supabaseUrl).hostname : '';

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="lokals" />
        <meta name="theme-color" content="#6366f1" />

        {/* Resource hints for performance */}
        {supabaseDomain && (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseDomain}`} />
            <link rel="preconnect" href={`https://${supabaseDomain}`} crossOrigin="anonymous" />
          </>
        )}
        <link rel="dns-prefetch" href="https://api.gemini.google.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          <AuthProvider>
            <BookingProvider>
              <main id="main-content">
                {children}
              </main>
              <BottomNav />
              <Toaster position="top-center" />
            </BookingProvider>
          </AuthProvider>
        </ErrorBoundary>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "lokals",
              "url": "https://thelokals.com",
              "logo": "https://thelokals.com/icons/icon-512x512.png",
              "sameAs": [
                "https://facebook.com/thelokals",
                "https://twitter.com/thelokals",
                "https://instagram.com/thelokals"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9876543210",
                "contactType": "customer service"
              }
            })
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered:', registration);
                    })
                    .catch((error) => {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
