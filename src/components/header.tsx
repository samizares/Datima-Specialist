"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ArrowRight, Menu, X } from "lucide-react";
import { AboutUs, Blog, ContactUs, OurServices, homePath } from "@/paths";

const navItems = [
  { label: "Home", href: homePath() },
  { label: "About Us", href: AboutUs() },
  { label: "Our Services", href: OurServices() },
  { label: "Blog", href: Blog() },
  { label: "Contact Us", href: ContactUs() },
  { label: "Book An Appointment", href: `${homePath()}#booking`, isCTA: true },
];
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const enableScrollAnimation = true;

  useEffect(() => {
    if (!mobileOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!enableScrollAnimation) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enableScrollAnimation]);

  return (
    <header
      className={[
        "fixed left-0 right-0 top-0 z-50 w-full border-b border-slate-200/70 bg-white px-2 text-black shadow-sm backdrop-blur-0 transition-transform duration-500 ease-in-out dark:border-slate-800/70 dark:bg-white lg:bg-white/85 lg:px-6 lg:text-foreground lg:backdrop-blur",
        enableScrollAnimation && !isScrolled ? "-translate-y-6" : "translate-y-0",
      ].join(" ")}
    >
      <div className="mx-auto flex w-full max-w-[1425px] items-center justify-between gap-4 py-4 lg:py-5">
        <Link href={homePath()} className="flex min-w-0 items-center gap-0 sm:gap-0.5">
          <div className="relative h-10 w-24 sm:w-32">
            <Image
              src="/assets/Datima-enhance-logo.png"
              alt="Datima Specialist Clinics logo"
              fill
              sizes="144px"
              className="object-contain"
              priority
            />
          </div>
          <span className="block max-w-[45vw] truncate whitespace-nowrap font-[family-name:var(--font-display)] text-sm font-black leading-none tracking-tight text-black sm:max-w-none sm:text-2xl lg:text-foreground">
            Datima Specialist Clinics
          </span>
        </Link>
        <nav className="hidden flex-1 items-center justify-end gap-4 text-sm font-semibold text-foreground lg:flex">
          {navItems.map((item) => {
            if (item.isCTA) {
              return (
                <Button
                  key={item.label}
                  asChild
                  size="sm"
                  className="gap-2 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500"
                >
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
        <div className="hidden lg:block">
          <ThemeSwitcher />
        </div>
        <div className="flex items-center gap-2 shrink-0 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white dark:bg-white dark:text-black"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-[10000] bg-white transition-opacity duration-300 ease-in-out lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />
      <aside
        className={[
          "fixed right-0 top-0 z-[10001] h-full w-[78vw] max-w-[360px] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100"
            aria-label="Close navigation menu"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <nav className="flex flex-col bg-white divide-y divide-slate-100 px-0 py-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center justify-between px-5 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.label}</span>
              <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden />
            </Link>
          ))}
        </nav>
      </aside>
    </header>
  );
};

export { Header };
