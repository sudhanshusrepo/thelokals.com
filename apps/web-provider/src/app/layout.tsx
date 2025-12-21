import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import React from "react";
import "./globals.css";
// import { AuthProvider } from "@/contexts/AuthContext";
import AuthLayoutWrapper from "./AuthLayoutWrapper";
import { Toaster } from "react-hot-toast";

// export const runtime = 'edge';
// export const runtime = 'edge';
export const runtime = 'edge';




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "lokals - Provider Portal",
  description: "Join the network of top local service providers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <React.Suspense fallback={null}>
          <AuthLayoutWrapper>
            <Toaster position="top-right" />
            {children}
          </AuthLayoutWrapper>
        </React.Suspense>
      </body>
    </html>
  );
}
