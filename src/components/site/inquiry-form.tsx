"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { submitInquiry, type InquiryState } from "@/app/actions/inquiry";
import type { InquiryType } from "@/lib/types";
import { cn } from "@/lib/utils";

const initial: InquiryState = { status: "idle", message: "" };

export type InquiryFormItem = { product_id?: string; sku?: string; name: string; quantity?: number };

type Props = {
  type: InquiryType;
  categories: string[];
  submitLabel: string;
  variant?: "compact" | "full";
  items?: InquiryFormItem[];
  defaultMessage?: string;
  defaultCategory?: string;
  onSuccess?: () => void;
  className?: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-[12px] font-semibold text-red-700">{message}</p> : null;
}

/** Inquiry form on a light card. Submits through a Server Action into the `inquiries` table. */
export function InquiryForm({
  type,
  categories,
  submitLabel,
  variant = "compact",
  items,
  defaultMessage,
  defaultCategory,
  onSuccess,
  className,
}: Props) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  if (state.status === "success") {
    return (
      <div className={cn("bg-paper text-paper-ink rounded-md p-7", className)} role="status">
        <CheckCircle2 className="size-8 text-[#3d8b00]" />
        <p className="mt-4 text-[22px] font-bold tracking-tight">Request received</p>
        <p className="text-paper-muted mt-2 text-[14px] leading-[1.6]">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={action}
      className={cn("bg-paper text-paper-ink relative rounded-md p-6 sm:p-7", className)}
      noValidate
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="source_page" value={pathname} />
      {items?.length ? <input type="hidden" name="items" value={JSON.stringify(items)} /> : null}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={cn("grid gap-4", variant === "full" ? "sm:grid-cols-2" : "sm:grid-cols-[1.1fr_1fr]")}>
        {variant === "full" ? (
          <>
            <div>
              <label className="label" htmlFor={`${type}-name`}>
                Full name
              </label>
              <input id={`${type}-name`} name="name" className="field" autoComplete="name" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="label" htmlFor={`${type}-company`}>
                Company <span className="text-paper-muted font-medium tracking-normal normal-case">(optional)</span>
              </label>
              <input
                id={`${type}-company`}
                name="company"
                className="field"
                autoComplete="organization"
                placeholder="Your brand or club"
              />
            </div>
          </>
        ) : null}
        <div>
          <label className="label" htmlFor={`${type}-email`}>
            Work email
          </label>
          <input
            id={`${type}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="name@company.com"
            className={cn("field", errors.email && "border-red-600")}
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label className="label" htmlFor={`${type}-category`}>
            Product category{" "}
            <span className="text-paper-muted font-medium tracking-normal normal-case">(optional)</span>
          </label>
          <select id={`${type}-category`} name="category" className="field" defaultValue={defaultCategory ?? ""}>
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {variant === "full" ? (
          <>
            <div>
              <label className="label" htmlFor={`${type}-phone`}>
                Phone / WhatsApp{" "}
                <span className="text-paper-muted font-medium tracking-normal normal-case">(optional)</span>
              </label>
              <input
                id={`${type}-phone`}
                name="phone"
                className="field"
                autoComplete="tel"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div>
              <label className="label" htmlFor={`${type}-quantity`}>
                Estimated quantity{" "}
                <span className="text-paper-muted font-medium tracking-normal normal-case">(optional)</span>
              </label>
              <input id={`${type}-quantity`} name="quantity" className="field" placeholder="e.g. 300 pieces" />
            </div>
          </>
        ) : null}
        <div className="sm:col-span-2">
          <label className="label" htmlFor={`${type}-message`}>
            Project details <span className="text-paper-muted font-medium tracking-normal normal-case">(optional)</span>
          </label>
          <textarea
            id={`${type}-message`}
            name="message"
            rows={variant === "full" ? 5 : 3}
            defaultValue={defaultMessage}
            placeholder="Tell us what you want to order, estimated quantity, branding and target delivery date."
            className="field resize-y"
          />
        </div>
      </div>

      <p className="text-paper-muted mt-4 text-[12px] leading-[1.55]">
        We use your details only to respond to your request. See our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
      {state.status === "error" ? (
        <p className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-800" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-signal mt-5 w-full">
        {pending ? "Sending…" : submitLabel}
        <ArrowRight className="size-4" />
      </button>
    </form>
  );
}
