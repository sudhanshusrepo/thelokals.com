import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import React from "react";
import "./globals.css";
// import { AuthProvider } from "@/contexts/AuthContext";
import AuthLayoutWrapper from "./AuthLayoutWrapper";
import { Toaster } from "react-hot-toast";

// export const runtime = 'edge';
// export const runtime = 'edge';
export const runtime = 'edge';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
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
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
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
