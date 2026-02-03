"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarClock,
  ChevronDown,
  GripVertical,
  LayoutDashboard,
  ListTodo,
  Megaphone,
  Menu,
  MessagesSquare,
  Settings,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AdminSearch } from "./admin-search";
import { AdminThemeSwitcher } from "./admin-theme-switcher";
import { signOut } from "@/features/auth/actions/sign-out";
import { SubmitButton } from "@/components/form/submit-button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { adminBlogAllPath, adminBlogCreatePath, adminUserDetailPath, homePath } from "@/paths";
import { saveSidebarOrder } from "@/features/users/actions/sidebar-order";

type AdminShellProps = {
  children: React.ReactNode;
};

const navItems = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "appointments", label: "Appointments", href: "/admin/appointments", icon: CalendarClock },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "clients", label: "Clients", href: "/admin/clients", icon: Users },
  { id: "messages", label: "Messages", href: "/admin/messages", icon: MessagesSquare },
  { id: "clinics", label: "Clinics", href: "/admin/clinics", icon: Building2 },
  { id: "doctors", label: "Doctors", href: "/admin/doctors", icon: Stethoscope },
  { id: "doctor-schedule", label: "Doctor Schedule", href: "/admin/doctor-schedules", icon: ListTodo },
  { id: "testimonials", label: "Testimonials", href: "/admin/testimonials", icon: Sparkles },
  { id: "campaigns", label: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
  { id: "site-settings", label: "Site Settings", href: "/admin/site-settings", icon: Settings },
  { id: "blog", label: "Blog", icon: BookOpen, type: "blog" as const },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [blogOpen, setBlogOpen] = useState(false);
  const [navOrder, setNavOrder] = useState(navItems.map((item) => item.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [isHydrated, setIsHydrated] = useState(false);

  const activePath = useMemo(() => pathname ?? "/admin", [pathname]);
  const isExpanded = !sidebarCollapsed || sidebarHover;
  const isBlogRoute = activePath.startsWith("/admin/blog");
  const orderedNavItems = useMemo(() => {
    const map = new Map(navItems.map((item) => [item.id, item]));
    const ordered = navOrder.map((id) => map.get(id)).filter(Boolean);
    const missing = navItems.filter((item) => !navOrder.includes(item.id));
    return [...ordered, ...missing] as typeof navItems;
  }, [navOrder]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!user?.sidebarOrder) return;
    try {
      const parsed = JSON.parse(user.sidebarOrder);
      if (Array.isArray(parsed) && parsed.length) {
        const valid = parsed.filter((id) => navItems.some((item) => item.id === id));
        const missing = navItems
          .map((item) => item.id)
          .filter((id) => !valid.includes(id));
        if (valid.length || missing.length) {
          setNavOrder([...valid, ...missing]);
        }
      }
    } catch {
      // Ignore invalid preference payloads.
    }
  }, [user?.sidebarOrder]);

  useEffect(() => {
    if (isBlogRoute) {
      setBlogOpen(true);
    }
  }, [isBlogRoute]);

  const handleDrop = (targetId: string) => (event: React.DragEvent) => {
    event.preventDefault();
    const sourceId =
      event.dataTransfer.getData("text/plain") ||
      event.dataTransfer.getData("text/id");
    if (!sourceId || sourceId === targetId) return;

    const from = navOrder.indexOf(sourceId);
    const to = navOrder.indexOf(targetId);
    if (from === -1 || to === -1) return;

    const next = [...navOrder];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setNavOrder(next);
    setDraggingId(null);
    startTransition(async () => {
      await saveSidebarOrder(next);
    });
  };

  const handleDragStart = (id: string) => (event: React.DragEvent) => {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setData("text/id", id);
    event.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {sidebarOpen && !isDesktop ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      ) : null}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200/80 bg-white pb-6 pt-6 shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0",
          sidebarOpen || isDesktop ? "translate-x-0" : "-translate-x-full",
          isExpanded ? "lg:w-64 lg:px-4" : "lg:w-20 lg:px-2"
        )}
        onMouseEnter={() => {
          if (isDesktop && sidebarCollapsed) setSidebarHover(true);
        }}
        onMouseLeave={() => setSidebarHover(false)}
      >
        <Link
          href={homePath()}
          className={cn(
            "flex items-center gap-3 px-2",
            isExpanded ? "justify-start" : "justify-center"
          )}
        >
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-100 p-1 shadow-sm dark:bg-slate-800">
            <Image
              src="/assets/Datima-enhance-logo.png"
              alt="Datima Specialist Clinics"
              fill
              sizes="40px"
              className="object-contain"
            />
          </div>
          {isExpanded ? (
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Datima
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                Admin
              </p>
            </div>
          ) : null}
        </Link>

        {isExpanded ? (
          <div className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Menu
          </div>
        ) : null}

        <nav className={cn("mt-4 flex flex-1 flex-col gap-1")}>
          {orderedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              "href" in item &&
              typeof item.href === "string" &&
              (activePath === item.href ||
                (item.href !== "/admin" && activePath.startsWith(item.href)));
            const isDragging = draggingId === item.id;
            const isBlogItem = item.id === "blog";

            const dragClasses = cn(
              "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive || (isBlogItem && isBlogRoute)
                ? "bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70",
              isExpanded ? "gap-3" : "justify-center",
              isDragging && "opacity-70"
            );

            if (isBlogItem) {
              return (
                <div
                  key={item.id}
                  className="space-y-1"
                  draggable
                  onDragStart={handleDragStart(item.id)}
                  onDragStartCapture={handleDragStart(item.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={handleDrop(item.id)}
                >
                  <button
                    type="button"
                    onClick={() => setBlogOpen((open) => !open)}
                    className={dragClasses}
                    title={!isExpanded ? item.label : undefined}
                    draggable={false}
                  >
                    {isExpanded ? (
                      <GripVertical className="h-4 w-4 text-slate-300" aria-hidden />
                    ) : null}
                    <Icon className="h-4 w-4" aria-hidden />
                    {isExpanded ? (
                      <>
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "ml-auto h-4 w-4 text-slate-400 transition-transform",
                            blogOpen && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </>
                    ) : null}
                  </button>
                  {blogOpen && isExpanded ? (
                    <div className="mt-1 space-y-1 pl-9">
                      <Link
                        href={adminBlogAllPath()}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                          activePath === adminBlogAllPath()
                            ? "bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                        )}
                      >
                        All Post
                      </Link>
                      <Link
                        href={adminBlogCreatePath()}
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition",
                          activePath === adminBlogCreatePath()
                            ? "bg-blue-600/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/70"
                        )}
                      >
                        Create Post
                      </Link>
                    </div>
                  ) : null}
                </div>
              );
            }

            if (!("href" in item) || !item.href) {
              return null;
            }

            return (
              <div
                key={item.id}
                draggable
                onDragStart={handleDragStart(item.id)}
                onDragStartCapture={handleDragStart(item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={handleDrop(item.id)}
              >
                <Link
                  href={item.href}
                  className={dragClasses}
                  title={!isExpanded ? item.label : undefined}
                  draggable={false}
                >
                  {isExpanded ? (
                    <GripVertical className="h-4 w-4 text-slate-300" aria-hidden />
                  ) : null}
                  <Icon className="h-4 w-4" aria-hidden />
                  {isExpanded ? item.label : null}
                </Link>
              </div>
            );
          })}
          {isSaving ? (
            <span className="px-3 text-xs text-slate-400">Saving order…</span>
          ) : null}
        </nav>
        {isExpanded ? (
          <div className="mt-3 px-3 text-[11px] text-slate-400">
            Drag the grip to reorder
          </div>
        ) : null}

        {isExpanded ? (
          <div className="mt-4 rounded-2xl bg-slate-100 px-3 py-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">
              Need assistance?
            </p>
            <p className="mt-1">
              Reach out to support for any urgent updates.
            </p>
            <Button className="mt-3 w-full rounded-full bg-blue-600 text-white hover:bg-blue-700">
              Contact support
            </Button>
          </div>
        ) : null}
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-200",
          sidebarCollapsed && !sidebarHover ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (isDesktop) {
                    setSidebarCollapsed((prev) => !prev);
                    setSidebarHover(false);
                  } else {
                    setSidebarOpen((open) => !open);
                  }
                }}
                className="border-slate-200 bg-white shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              >
                <Menu className="h-4 w-4" aria-hidden />
                <span className="sr-only">Toggle sidebar</span>
              </Button>
              <div className="hidden max-w-[520px] flex-1 md:block">
                <AdminSearch />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <AdminThemeSwitcher />
              <Button
                variant="outline"
                size="icon"
                className="relative border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
              >
                <Bell className="h-4 w-4" aria-hidden />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
                <span className="sr-only">Notifications</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="relative h-9 w-9 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                      <Image
                        src="/assets/profile-placeholder.svg"
                        alt="Admin profile"
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                    <div className="hidden text-sm font-semibold text-slate-900 dark:text-white sm:block">
                      {user?.username ?? "Admin"}
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-2xl border-slate-200 bg-white/95 p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.username ?? "Admin"}
                    <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.email ?? "admin@datimaspecialistclinics.com"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  {isHydrated && user ? (
                    <DropdownMenuItem asChild className="gap-2">
                      <Link href={adminUserDetailPath(user.id)}>
                        <Users className="h-4 w-4" aria-hidden />
                        Edit profile
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="gap-2" disabled>
                      <Users className="h-4 w-4" aria-hidden />
                      Edit profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2">
                    <Settings className="h-4 w-4" aria-hidden />
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2">
                    <MessagesSquare className="h-4 w-4" aria-hidden />
                    Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                  <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                    <form action={signOut}>                       
                    <SubmitButton label="Sign Out" icon={<LogOutIcon />}  />
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="mt-3 md:hidden">
            <AdminSearch />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

const LogOutIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M21 12a9 9 0 1 1-9-9" />
  </svg>
);
