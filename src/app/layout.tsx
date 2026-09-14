import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChessVerse — Play. Watch. Connect.",
  description:
    "A social multiplayer chess platform for playing with friends, watching live matches, and competing together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
