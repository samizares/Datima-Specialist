import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteFrame } from "@/components/layout/site-frame";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000");

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Datima Specialist Clinics",
    template: "%s | Datima Specialist Clinics",
  },
  icons: {
    icon: [
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
    shortcut: "/assets/favicon.ico",
  },
  description:
    "Premium specialist clinics delivering coordinated care, modern diagnostics, and proactive follow-ups for families and professionals.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Datima Specialist Clinics",
    description:
      "Premium specialist clinics delivering coordinated care, modern diagnostics, and proactive follow-ups for families and professionals.",
    url: "/",
    siteName: "Datima Specialist Clinics",
    images: [
      {
        url: "/assets/hero-fuse.png",
        alt: "Datima Specialist Clinics hero",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Datima Specialist Clinics",
    description:
      "Premium specialist clinics delivering coordinated care, modern diagnostics, and proactive follow-ups for families and professionals.",
    images: ["/assets/hero-fuse.png"],
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <SiteFrame>{children}</SiteFrame>
      </body>
    </html>
  );
}
