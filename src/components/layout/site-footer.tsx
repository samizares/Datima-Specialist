import Image from "next/image";
import Link from "next/link";

import { navItems } from "@/components/nav-items";
import { signInPath } from "@/paths";
import { cn } from "@/lib/utils";

type SiteFooterProps = {
  className?: string;
};

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "border-t border-slate-200/80 bg-background dark:border-slate-800/80",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[1425px] flex-col gap-8 px-6 py-10 lg:flex-row lg:items-center lg:justify-between">
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
            Patient-centered care, modern diagnostics, and trusted specialists
            focused on your long-term health.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-foreground">
          {navItems
            .filter((item) => item.label !== "Blog")
            .slice(0, 4)
            .map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
            >
              {item.label}
            </Link>
            ))}
          <Link
            href={signInPath()}
            className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
          >
            Admin(Staff Only)
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p>1, Fola Agoro Street, Off Bajulaye Road, Somulu, Lagos.</p>
          <p>+234 9157360689 · care@datimaspecialistclinics.com</p>
        </div>
      </div>
    </footer>
  );
}
