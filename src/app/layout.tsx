import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/providers/ClientProviders";
import GlobalChallengeHandler from "@/components/social/GlobalChallengeHandler";
import ConnectionBanner from "@/components/ui/ConnectionBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#13201B" },
    { media: "(prefers-color-scheme: light)", color: "#EDE9DE" },
  ],
};

export const metadata: Metadata = {
  title: "ChessVerse — Play. Watch. Improve.",
  description:
    "ChessVerse is a real-time multiplayer chess platform built for playing with friends, watching live games, and improving through intelligent chess analysis.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { ActiveAnnouncementBanner } from "@/components/announcements/ActiveAnnouncementBanner";
import PremiumChessAtmosphere from "@/components/background/PremiumChessAtmosphere";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased selection:bg-[#B58A3A]/25 selection:text-[#18221E] overflow-x-hidden max-w-full w-full relative`}>
        <PremiumChessAtmosphere />
        <ErrorBoundary>
          <ClientProviders>
            <ActiveAnnouncementBanner />
            {children}
            <ConnectionBanner />
            <GlobalChallengeHandler />
          </ClientProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
