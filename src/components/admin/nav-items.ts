export type AdminNavItem = { href: string; label: string; icon: string; group: string };

export const ADMIN_NAV_GROUPS = ["Overview", "Catalogue", "Content", "Leads & insights", "System"] as const;

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", group: "Overview" },
  { href: "/admin/products", label: "Products", icon: "shirt", group: "Catalogue" },
  { href: "/admin/categories", label: "Categories", icon: "folder", group: "Catalogue" },
  { href: "/admin/pages", label: "Pages", icon: "file", group: "Content" },
  { href: "/admin/services", label: "Services", icon: "briefcase", group: "Content" },
  { href: "/admin/insights", label: "Insights", icon: "newspaper", group: "Content" },
  { href: "/admin/faqs", label: "FAQs", icon: "help", group: "Content" },
  { href: "/admin/media", label: "Media library", icon: "image", group: "Content" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inbox", group: "Leads & insights" },
  { href: "/admin/searches", label: "Searches", icon: "search", group: "Leads & insights" },
  { href: "/admin/settings", label: "Site settings", icon: "settings", group: "System" },
  { href: "/admin/users", label: "Admin users", icon: "users", group: "System" },
];

/** The deepest nav item matching a path (used for the active state and breadcrumbs). */
export function navItemFor(pathname: string): AdminNavItem | undefined {
  return ADMIN_NAV.filter((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href))).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}
