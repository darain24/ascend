import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ascend-hunter-system.openai.site"),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable}`}>
        {children}
      </body>
    </html>
  );
}
