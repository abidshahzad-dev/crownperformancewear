"use client";

import { UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { createAdminUser, setUserRole } from "@/app/admin/actions/users";
import { FormField, inputClass } from "@/components/admin/form-controls";
import { toastResult } from "@/components/admin/toaster";

export function RoleButton({ userId, role, isSelf }: { userId: string; role: "admin" | "user"; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const next = role === "admin" ? "user" : "admin";
  if (isSelf) return <span className="text-paper-muted text-[12px]">You</span>;
  return (
    <button
      type="button"
      disabled={pending}
      className={
        role === "admin"
          ? "rounded-md px-2 py-1.5 text-[12px] font-semibold text-red-700 hover:bg-red-50"
          : "text-paper-ink rounded-md px-2 py-1.5 text-[12px] font-semibold hover:bg-slate-100"
      }
      onClick={() => {
        const msg = role === "admin" ? "Remove admin access for this user?" : "Give this user full admin access?";
        if (!window.confirm(msg)) return;
        startTransition(async () => toastResult(await setUserRole(userId, next)));
      }}
    >
      {role === "admin" ? "Remove admin" : "Make admin"}
    </button>
  );
}

export function CreateAdminForm({ enabled }: { enabled: boolean }) {
  const [value, setValue] = useState({ email: "", password: "", full_name: "" });
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await createAdminUser(value);
          toastResult(result);
          if (result.ok) setValue({ email: "", password: "", full_name: "" });
        });
      }}
    >
      <FormField label="Full name" htmlFor="new-name">
        <input
          id="new-name"
          className={inputClass}
          value={value.full_name}
          onChange={(e) => setValue({ ...value, full_name: e.target.value })}
          disabled={!enabled}
        />
      </FormField>
      <FormField label="Email" htmlFor="new-email">
        <input
          id="new-email"
          type="email"
          required
          className={inputClass}
          value={value.email}
          onChange={(e) => setValue({ ...value, email: e.target.value })}
          disabled={!enabled}
        />
      </FormField>
      <FormField
        label="Temporary password"
        help="At least 10 characters. Share it securely and ask them to change it."
        htmlFor="new-password"
      >
        <input
          id="new-password"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className={inputClass}
          value={value.password}
          onChange={(e) => setValue({ ...value, password: e.target.value })}
          disabled={!enabled}
        />
      </FormField>
      <button
        type="submit"
        disabled={!enabled || pending}
        className="bg-ink hover:bg-ink-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        <UserPlus className="size-4" /> {pending ? "Creating…" : "Create admin"}
      </button>
    </form>
  );
}
