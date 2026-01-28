import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "The Lokals - Instant Home Services",
  description: "Book trusted professionals instantly in Mumbai, Delhi, and Bangalore.",
};

import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BottomNav } from "../components/layout/BottomNav";
import { AppProviders } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased bg-bg-primary text-text-primary min-h-screen flex flex-col">
        <AppProviders>
          <Header />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <BottomNav />
          <div className="hidden md:block">
            <Footer />
          </div>
          <Toaster position="bottom-center" toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            }
          }} />
        </AppProviders>
      </body>
    </html>
  );
}
