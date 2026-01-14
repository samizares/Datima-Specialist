import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Button } from "@/components/ui/button";
import { AboutUs, Blog, ContactUs, OurServices, homePath } from "@/paths";

import "./globals.css";

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

const navItems = [
  { label: "Home", href: homePath() },
  { label: "About Us", href: AboutUs() },
  { label: "Our Services", href: OurServices() },
  { label: "Blog", href: Blog() },
  { label: "Contact Us", href: ContactUs() },
  { label: "Book An Appointment", href: `${homePath()}#booking`, isCTA: true },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sans.variable} ${display.variable} antialiased bg-background text-foreground`}>
        <header className="fixed left-0 right-0 top-0 z-50 w-full bg-white/80 px-6 shadow-sm backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 py-4 lg:py-5">
            <Link href={homePath()} className="flex items-center gap-0 sm:gap-0.5">
              <div className="relative h-10 w-28 sm:w-32">
                <Image
                  src="/assets/Datima-enhance-logo.png"
                  alt="Datima Specialist Clinics logo"
                  fill
                  sizes="144px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-xl font-black leading-none tracking-tight text-foreground sm:text-2xl">
                Datima Specialist Clinics
              </span>
            </Link>
            <nav className="flex flex-1 items-center justify-end gap-4 text-sm font-semibold text-foreground">
              {navItems.map((item) => {
                if (item.isCTA) {
                  return (
                    <Button key={item.label} asChild size="sm" className="gap-2">
                      <Link href={item.href}>
                        {item.label}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
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
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-foreground">
              {navItems.slice(0, 5).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              <p>1, Fola Agoro Street, Off Bajulaye Road, Somulu, Lagos.</p>
              <p>+234 9157360689 · care@datimaspecialistclinics.com</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
