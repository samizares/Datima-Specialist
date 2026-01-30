import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { ArrowRight } from "lucide-react";
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
  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 px-6 shadow-sm backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/80">
      <div className="mx-auto flex w-full max-w-[1425px] items-center justify-between gap-6 py-4 lg:py-5">
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
        <ThemeSwitcher />
      </div>
    </header>
  );
};

export { Header };
