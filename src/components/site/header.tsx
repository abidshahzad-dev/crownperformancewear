"use client";

import { ArrowRight, Menu, MessageCircle, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import { cn, whatsappHref } from "@/lib/utils";
import { useEnquiry } from "./enquiry-list";
import { Logo } from "./logo";

type HeaderProps = Pick<
  SiteSettings,
  "brand_short" | "logo_url" | "nav" | "header_cta" | "whatsapp" | "popular_searches" | "announcement"
>;

const iconButton =
  "relative grid size-10 place-items-center border border-white/15 bg-white/[0.03] text-white transition-colors hover:border-white/40 hover:bg-white/10 xl:size-[44px]";

export function SiteHeader(props: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useEnquiry();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close overlays on navigation.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const runSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
        {props.announcement && !scrolled ? (
          <div className="bg-signal text-ink px-4 py-2 text-center text-[12px] font-bold">{props.announcement}</div>
        ) : null}
        <header
          className={cn(
            "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
            scrolled || menuOpen
              ? "bg-ink/90 border-white/10 backdrop-blur-xl"
              : "border-white/15 bg-gradient-to-b from-black/45 to-transparent",
          )}
        >
          <div className="mx-auto flex h-[76px] w-[min(1400px,calc(100vw-40px))] items-center justify-between gap-6 xl:h-[96px]">
            <Logo name={props.brand_short} logoUrl={props.logo_url || undefined} className="min-w-0 xl:w-[220px]" />

            <nav aria-label="Main" className="hidden flex-1 justify-center xl:flex">
              <ul className="flex items-center gap-7">
                {props.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-muted-2 relative block py-3.5 text-[13px] transition-colors hover:text-white",
                        isActive(item.href) &&
                          "after:bg-signal text-white after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2 xl:gap-2.5">
              <button
                type="button"
                className={cn(iconButton, "xl:hidden")}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
              <Link href="/quote" className={iconButton} aria-label={`Enquiry list (${count} items)`}>
                <ShoppingBag className="size-[18px]" strokeWidth={1.7} />
                {count > 0 ? (
                  <span className="bg-signal text-ink absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full px-1 text-[10px] font-extrabold">
                    {count}
                  </span>
                ) : null}
              </Link>
              {props.whatsapp ? (
                <a
                  href={whatsappHref(props.whatsapp, "Hello, I would like to ask about a wholesale order.")}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(iconButton, "hidden sm:grid")}
                  aria-label="Chat with sales on WhatsApp"
                >
                  <MessageCircle className="size-[18px]" strokeWidth={1.7} />
                </a>
              ) : null}
              <button type="button" className={iconButton} aria-label="Search" onClick={() => setSearchOpen(true)}>
                <Search className="size-[18px]" strokeWidth={1.7} />
              </button>
              <Link
                href={props.header_cta.href}
                className="btn btn-signal ml-1 hidden min-h-[52px] gap-5 md:inline-flex"
              >
                {props.header_cta.label}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {menuOpen ? (
            <div className="bg-ink h-[calc(100dvh-76px)] overflow-y-auto border-t border-white/10 xl:hidden">
              <nav aria-label="Mobile" className="mx-auto w-[calc(100vw-40px)] py-6">
                <ul>
                  {props.nav.map((item, i) => (
                    <li key={item.href} className="border-b border-white/10">
                      <Link
                        href={item.href}
                        className="flex items-center justify-between py-4 text-[22px] font-bold tracking-tight"
                      >
                        <span>
                          <span className="text-signal mr-4 text-[11px] font-extrabold">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {item.label}
                        </span>
                        <ArrowRight className="text-muted size-5" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={props.header_cta.href} className="btn btn-signal mt-8 w-full">
                  {props.header_cta.label}
                  <ArrowRight className="size-4" />
                </Link>
              </nav>
            </div>
          ) : null}
        </header>
      </div>

      {searchOpen ? (
        <div
          className="bg-night/80 fixed inset-0 z-[60] backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          onClick={() => setSearchOpen(false)}
        >
          <div className="bg-ink border-b border-white/10" onClick={(e) => e.stopPropagation()}>
            <div className="shell py-8 md:py-12">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-signal">Search the catalogue</p>
                <button
                  type="button"
                  className={iconButton}
                  aria-label="Close search"
                  onClick={() => setSearchOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <form
                className="mt-5 flex items-center gap-3 border-b border-white/30 pb-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(query);
                }}
              >
                <Search className="text-muted size-6 shrink-0" />
                <input
                  ref={searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by style, SKU or fabric…"
                  className="w-full bg-transparent text-[22px] font-semibold tracking-tight text-white outline-none placeholder:text-white/35 md:text-[32px]"
                  aria-label="Search terms"
                />
                <button type="submit" className="btn btn-signal hidden sm:inline-flex">
                  Search
                  <ArrowRight className="size-4" />
                </button>
              </form>
              {props.popular_searches.length ? (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-muted mr-2 text-[12px] font-bold tracking-[0.12em] uppercase">Popular</span>
                  {props.popular_searches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => runSearch(term)}
                      className="text-muted-2 hover:border-signal border border-white/15 px-3.5 py-2 text-[13px] transition-colors hover:text-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
