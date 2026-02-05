"use client";

import { usePathname } from "next/navigation";

import { Header } from "@/components/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type SiteFrameProps = {
  children: React.ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname === "/sign-up" ||
    pathname === "/password-forgot" ||
    pathname?.startsWith("/password-reset") ||
    pathname === "/email-verification";

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <div
        className={cn(
          "min-h-screen bg-background text-foreground",
          isAuthRoute && "pb-72"
        )}
      >
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
