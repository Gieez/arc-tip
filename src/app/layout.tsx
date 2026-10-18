import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arc-tip-phi.vercel.app"),
  title: "ArcTip — Multi-Chain Native Tipping & Micro-Payments",
  description:
    "Non-custodial micro-payments and on-chain tipping protocol across Circle Arc L1 (5042) and BOT Chain Mainnet (677). Zero approvals, sub-cent fees, permanent memos.",
  keywords: [
    "Arc",
    "Circle",
    "BOT Chain",
    "USDC",
    "BOT",
    "Tipping",
    "PayFi",
    "Micro-payments",
    "Web3",
  ],
  openGraph: {
    title: "ArcTip — Multi-Chain Native Tipping Protocol",
    description:
      "Non-custodial micro-payments with permanent on-chain memos across Circle Arc L1 and BOT Chain Mainnet.",
    url: "https://arc-tip-phi.vercel.app",
    siteName: "ArcTip",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ArcTip Protocol",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArcTip — Multi-Chain Native Tipping Protocol",
    description:
      "Non-custodial micro-payments with permanent on-chain memos across Circle Arc L1 and BOT Chain Mainnet.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0E14] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
