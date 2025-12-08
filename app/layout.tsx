import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import { ErrorBoundaryProvider } from "@/components/providers/error-boundary-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "쇼핑몰 MVP",
    template: "%s | 쇼핑몰 MVP",
  },
  description: "Next.js + Clerk + Supabase 기반 쇼핑몰 MVP",
  keywords: ["쇼핑몰", "온라인 쇼핑", "의류", "패션"],
  authors: [{ name: "Shopping Mall MVP" }],
  creator: "Shopping Mall MVP",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.vercel.app",
    siteName: "쇼핑몰 MVP",
    title: "쇼핑몰 MVP",
    description: "Next.js + Clerk + Supabase 기반 쇼핑몰 MVP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "쇼핑몰 MVP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "쇼핑몰 MVP",
    description: "Next.js + Clerk + Supabase 기반 쇼핑몰 MVP",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
};

/**
 * Root Layout with Clerk Korean Localization
 *
 * Clerk 컴포넌트를 한국어로 표시하기 위해 `koKR` 로컬라이제이션을 적용합니다.
 *
 * @see https://clerk.com/docs/guides/customizing-clerk/localization
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        cssLayerName: "clerk", // Tailwind CSS v4 호환성
      }}
    >
      <html lang="ko" className="bg-white">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
        >
          <ErrorBoundaryProvider>
            <SyncUserProvider>
              <Navbar />
              {children}
            </SyncUserProvider>
          </ErrorBoundaryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
