import { BarChart3, Inbox, LayoutTemplate, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SupabaseSetupPanel } from "@/components/admin/setup-panel";
import { CrownMark } from "@/components/site/logo";
import { getAdminContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

async function LoginContent({ searchParams }: { searchParams: PageProps<"/admin/login">["searchParams"] }) {
  if (!isSupabaseConfigured()) return <SupabaseSetupPanel />;
  if (await getAdminContext()) redirect("/admin");
  const params = await searchParams;
  const next = typeof params.next === "string" && params.next.startsWith("/admin") ? params.next : undefined;
  return <LoginForm next={next} />;
}

const FEATURES = [
  { icon: LayoutTemplate, text: "Edit every page, section and image" },
  { icon: Inbox, text: "Track quote requests from first message to won" },
  { icon: BarChart3, text: "See what buyers search for" },
];

export default function LoginPage(props: PageProps<"/admin/login">) {
  return (
    <div className="grid min-h-screen bg-[var(--admin-bg)] lg:grid-cols-[1.1fr_1fr]">
      <div className="bg-ink relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_75%)] [background-size:56px_56px] opacity-[0.07]"
        />
        <div aria-hidden className="bg-signal/15 absolute -top-32 -right-32 size-[520px] rounded-full blur-3xl" />
        <div aria-hidden className="absolute -bottom-40 -left-24 size-[420px] rounded-full bg-sky-400/10 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-3 text-[18px] font-extrabold tracking-[0.08em]">
          <CrownMark /> Crown
        </Link>
        <div className="relative">
          <p className="eyebrow text-signal">Admin dashboard</p>
          <h1 className="display mt-5 text-[clamp(48px,4.6vw,68px)] text-white">
            Manage your
            <br />
            wholesale
            <br />
            catalogue.
          </h1>
          <ul className="mt-10 space-y-3.5">
            {FEATURES.map((f) => (
              <li key={f.text} className="flex items-center gap-3 text-[14px] text-white/75">
                <span className="text-signal grid size-8 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
                  <f.icon className="size-4" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative flex items-center gap-2 text-[12px] text-white/40">
          <ShieldCheck className="size-3.5" /> Crown Performance Wear · Authorised staff only
        </p>
      </div>
      <div className="flex items-center justify-center px-5 py-12">
        <div className="admin-fade-up w-full max-w-[400px]">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <CrownMark />
            <span className="text-[16px] font-extrabold tracking-[0.08em]">Crown</span>
          </div>
          <h2 className="text-paper-ink text-[30px] font-bold tracking-[-0.035em]">Welcome back</h2>
          <p className="text-paper-muted mt-1 mb-8 text-[14px]">Sign in with your administrator account.</p>
          <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-6 shadow-[0_24px_60px_-36px_rgba(7,19,27,0.45)]">
            <Suspense fallback={<div className="admin-skeleton h-[236px] rounded-xl" />}>
              <LoginContent searchParams={props.searchParams} />
            </Suspense>
          </div>
          <p className="text-paper-muted mt-6 text-center text-[12px]">
            <Link href="/" className="hover:text-paper-ink underline-offset-4 hover:underline">
              ← Back to the website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
