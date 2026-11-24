"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useActionState, useState } from "react";
import { signIn, type SignInState } from "@/app/admin/actions/auth";
import { cn } from "@/lib/utils";

const initial: SignInState = { error: null };

const fieldClass =
  "w-full rounded-xl border border-black/[0.14] bg-white py-3 pr-3 pl-10 text-[14px] text-paper-ink shadow-[0_1px_1px_rgba(7,19,27,0.03)] outline-none transition placeholder:text-paper-muted/60 hover:border-black/25 focus:border-ink focus:ring-[3px] focus:ring-signal/50";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  const [showPassword, setShowPassword] = useState(false);
  const error = state.error ?? notice;

  return (
    <form action={action} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {error ? (
        <div
          className="admin-pop flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-semibold text-red-800"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : null}
      <div>
        <label htmlFor="email" className="text-paper-ink mb-1.5 block text-[12px] font-bold">
          Email
        </label>
        <div className="relative">
          <Mail className="text-paper-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            autoFocus
            className={cn(fieldClass, error && "border-red-300")}
            placeholder="admin@company.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="text-paper-ink mb-1.5 block text-[12px] font-bold">
          Password
        </label>
        <div className="relative">
          <Lock className="text-paper-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={cn(fieldClass, "pr-11", error && "border-red-300")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-paper-muted hover:text-paper-ink absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg hover:bg-black/5"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-signal text-ink group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-[13px] font-extrabold tracking-[0.04em] uppercase shadow-[0_10px_24px_-14px_rgba(120,180,0,0.9)] transition hover:bg-[#d4ff6e] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Signing in…" : "Sign in"}
        {!pending ? <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /> : null}
      </button>
    </form>
  );
}
