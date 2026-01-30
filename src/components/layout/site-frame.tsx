"use client";

import { usePathname } from "next/navigation";

import { Header } from "@/components/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";

type SiteFrameProps = {
  children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/password-forgot";

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        {children}
        <SiteFooter
          className={
            isAuthRoute
              ? "fixed bottom-0 left-0 right-0 z-40"
              : undefined
          }
        />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}
