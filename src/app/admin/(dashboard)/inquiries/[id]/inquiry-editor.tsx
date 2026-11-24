"use client";

import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteInquiry, updateInquiry } from "@/app/admin/actions/inquiries";
import { FormField, inputClass } from "@/components/admin/form-controls";
import { toastResult } from "@/components/admin/toaster";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/types";
import { statusLabel } from "../status";

export function InquiryEditor({ id, status, notes }: { id: string; status: InquiryStatus; notes: string }) {
  const router = useRouter();
  const [value, setValue] = useState({ status, admin_notes: notes });
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <FormField label="Status" htmlFor="inq-status">
        <select
          id="inq-status"
          className={inputClass}
          value={value.status}
          onChange={(e) => setValue({ ...value, status: e.target.value as InquiryStatus })}
        >
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Internal notes" help="Only visible to admins." htmlFor="inq-notes">
        <textarea
          id="inq-notes"
          rows={6}
          className={inputClass}
          value={value.admin_notes}
          onChange={(e) => setValue({ ...value, admin_notes: e.target.value })}
        />
      </FormField>
      <div className="flex flex-wrap justify-between gap-2">
        <button
          type="button"
          disabled={pending}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (!window.confirm("Delete this inquiry permanently?")) return;
            startTransition(async () => {
              const result = await deleteInquiry(id);
              toastResult(result);
              if (result.ok) router.push("/admin/inquiries");
            });
          }}
        >
          <Trash2 className="size-4" /> Delete
        </button>
        <button
          type="button"
          disabled={pending}
          className="bg-ink hover:bg-ink-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => startTransition(async () => toastResult(await updateInquiry(id, value)))}
        >
          <Save className="size-4" /> {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
