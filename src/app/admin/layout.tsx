import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { navItems } from "@/components/nav-items";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Datima Specialist Clinics",
  icons: {
    icon: [
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
    shortcut: "/aseets/favicon.ico",
  },
  description:
    "Premium specialist clinics with coordinated care, modern diagnostics, and proactive follow-ups.",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sans.variable} ${display.variable} antialiased bg-background text-foreground`}>
        <Header/>
        {children}
        <footer className="border-t bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative h-9 w-24">
                  <Image
                    src="/assets/Datima-enhance-logo.png"
                    alt="Datima Specialist Clinics logo"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <span className="font-[family-name:var(--font-display)] text-lg font-black text-foreground">
                  Datima Specialist Clinics
                </span>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Patient-centered care, modern diagnostics, and trusted specialists focused on your long-term health.
              </p>
            </div>
            
            
          </div>
        </footer>
      </body>
    </html>
  );
}
