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
  title: "ArcTip — Native USDC Tipping & Micro-Payments on Arc Layer 1",
  description:
    "Non-custodial USDC tip jar and payment links on Circle's Arc Layer 1 (Chain ID 5042). Native USDC gas, zero approvals, sub-second settlement.",
  keywords: [
    "Arc",
    "Circle",
    "USDC",
    "Layer 1",
    "Tipping",
    "Web3",
    "DoraHacks",
    "Microgrants",
  ],
  openGraph: {
    title: "ArcTip — Native USDC Tipping on Arc",
    description:
      "Zero token approvals. Gas paid in USDC. Fast non-custodial tipping on Circle's Arc Layer 1.",
    type: "website",
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
