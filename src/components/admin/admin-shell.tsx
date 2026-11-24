"use client";

import {
  Briefcase,
  ExternalLink,
  FileText,
  Folder,
  HelpCircle,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Menu,
  Newspaper,
  Search,
  Settings,
  Shirt,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CrownMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, ADMIN_NAV_GROUPS, navItemFor } from "./nav-items";

const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  search: Search,
  shirt: Shirt,
  folder: Folder,
  briefcase: Briefcase,
  newspaper: Newspaper,
  help: HelpCircle,
  file: FileText,
  image: ImageIcon,
  settings: Settings,
  users: Users,
};

type Badges = Partial<Record<string, ReactNode>>;

function NavList({ active, onNavigate, badges }: { active: string | null; onNavigate?: () => void; badges?: Badges }) {
  return (
    <nav aria-label="Admin" className="space-y-7">
      {ADMIN_NAV_GROUPS.map((group) => {
        const items = ADMIN_NAV.filter((i) => i.group === group);
        if (!items.length) return null;
        return (
          <div key={group}>
            <p className="mb-2 px-3 text-[10px] font-extrabold tracking-[0.18em] text-white/35 uppercase">{group}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon] ?? FileText;
                const isActive = active === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                        isActive
                          ? "bg-white/[0.09] text-white"
                          : "text-white/65 hover:bg-white/[0.05] hover:text-white",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "bg-signal absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity",
                          isActive ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <Icon
                        className={cn(
                          "size-[17px] shrink-0 transition-colors",
                          isActive ? "text-signal" : "text-white/45 group-hover:text-white/80",
                        )}
                        strokeWidth={1.8}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badges?.[item.href] ?? null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function ActiveNav({ onNavigate, badges }: { onNavigate?: () => void; badges?: Badges }) {
  const pathname = usePathname();
  return <NavList active={navItemFor(pathname)?.href ?? null} onNavigate={onNavigate} badges={badges} />;
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 text-white">
      <CrownMark className="size-9" />
      <span className="leading-tight">
        <span className="block text-[14px] font-extrabold tracking-[0.06em]">Crown</span>
        <span className="text-signal block text-[10px] font-bold tracking-[0.2em] uppercase">Admin</span>
      </span>
    </Link>
  );
}

function SidebarBody({ user, badges, onNavigate }: { user: ReactNode; badges?: Badges; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(120%_60%_at_0%_0%,rgba(185,255,33,0.07),transparent_60%)]">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Brand />
      </div>
      <div className="admin-scroll flex-1 overflow-y-auto px-3 pt-3 pb-6">
        <Suspense fallback={<NavList active={null} badges={badges} />}>
          <ActiveNav onNavigate={onNavigate} badges={badges} />
        </Suspense>
      </div>
      <div className="shrink-0 space-y-3 border-t border-white/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-[12px] font-semibold text-white/75 transition-colors hover:border-white/25 hover:text-white"
        >
          View website <ExternalLink className="size-3.5" />
        </a>
        {user}
      </div>
    </div>
  );
}

/** Admin chrome: fixed sidebar on large screens, top bar + slide-in drawer below. */
export function AdminShell({ children, user, badges }: { children: ReactNode; user: ReactNode; badges?: Badges }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const current = navItemFor(pathname);

  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className="lg:pl-[260px]">
      <aside className="admin-dark fixed inset-y-0 left-0 z-30 hidden w-[260px] bg-[var(--admin-sidebar)] lg:block">
        <SidebarBody user={user} badges={badges} />
      </aside>

      <div className="admin-dark sticky top-0 z-40 flex h-14 items-center justify-between gap-3 bg-[var(--admin-sidebar)] px-4 lg:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          {current ? <span className="truncate text-[12px] font-semibold text-white/60">{current.label}</span> : null}
          <button
            ref={trigger}
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-white hover:bg-white/10"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="admin-drawer"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="admin-overlay absolute inset-0 bg-black/55 backdrop-blur-[2px]" onClick={close} />
          <div
            id="admin-drawer"
            className="admin-drawer admin-dark absolute inset-y-0 left-0 w-[min(290px,86vw)] bg-[var(--admin-sidebar)] shadow-2xl"
          >
            <button
              ref={closeButton}
              type="button"
              onClick={close}
              className="absolute top-3.5 right-3 z-10 grid size-9 place-items-center rounded-lg text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
            <SidebarBody user={user} badges={badges} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="min-h-screen px-4 pb-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1320px]">{children}</div>
      </main>
    </div>
  );
}
