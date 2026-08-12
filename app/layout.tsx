import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Ascend — Hunter System",
    template: "%s · Ascend",
  },
  description:
    "A real-life gamified self-improvement system. Complete quests, gain XP, raise your stats, and ascend.",
  applicationName: "Ascend",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Ascend — Become the hunter you were meant to be",
    description:
      "Your habits are quests. Your consistency is power. Track your real-life ascent.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ascend — Turn discipline into power." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ascend — Hunter System",
    description: "Turn discipline into power.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
