import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signOut } from "@/app/admin/actions/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { SupabaseSetupPanel } from "@/components/admin/setup-panel";
import { PageSkeleton } from "@/components/admin/ui";
import { getAdminContext } from "@/lib/auth";
import { dashboardCounts } from "@/lib/data/admin";
import { isSupabaseConfigured } from "@/lib/env";

/** Verifies the admin role before rendering any dashboard page. Reads the session, so it streams. */
async function AdminGate({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) return <SupabaseSetupPanel />;
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  return <>{children}</>;
}

function initials(value: string): string {
  const parts = value
    .replace(/@.*/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
}

async function SignedInUser() {
  const ctx = await getAdminContext();
  if (!ctx) return null;
  const name = ctx.profile.full_name || ctx.profile.email.split("@")[0];
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-2.5">
      <span
        className="bg-signal text-ink grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-extrabold"
        aria-hidden
      >
        {initials(ctx.profile.full_name || ctx.profile.email)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-semibold text-white">{name}</p>
        <p className="truncate text-[11px] text-white/45" title={ctx.profile.email}>
          {ctx.profile.email}
        </p>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="grid size-8 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

function UserFallback() {
  return <div className="h-[56px] rounded-xl bg-white/[0.04]" aria-hidden />;
}

/** Count of new inquiries shown next to "Inquiries" in the sidebar. */
async function NewInquiriesBadge() {
  if (!isSupabaseConfigured() || !(await getAdminContext())) return null;
  const { newInquiries } = await dashboardCounts();
  if (!newInquiries) return null;
  return (
    <span className="bg-signal text-ink rounded-full px-1.5 py-px text-[10px] font-extrabold tabular-nums">
      {newInquiries}
    </span>
  );
}

/** Shown while the shell streams in (it reads the current path to highlight the active nav item). */
function ShellFallback() {
  return (
    <div className="flex min-h-screen bg-[#f6f5f1]">
      <div className="bg-ink hidden w-[264px] shrink-0 lg:block" aria-hidden />
      <div className="flex-1 p-6 lg:p-10">
        <PageSkeleton />
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell
      user={
        <Suspense fallback={<UserFallback />}>
          <SignedInUser />
        </Suspense>
      }
      badges={{
        "/admin/inquiries": (
          <Suspense fallback={null}>
            <NewInquiriesBadge />
          </Suspense>
        ),
      }}
    >
      <Suspense fallback={<PageSkeleton />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </AdminShell>
  );
}
