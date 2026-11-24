"use server";

import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";

export type InquiryState = { status: "idle" | "success" | "error"; message: string; fieldErrors?: Record<string, string> };

const itemSchema = z.object({
  product_id: z.string().max(64).optional(),
  sku: z.string().max(64).optional(),
  name: z.string().min(1).max(200),
  quantity: z.coerce.number().int().min(1).max(1_000_000).optional(),
});

const inquirySchema = z.object({
  type: z.enum(["quote", "catalogue", "contact", "sample"]),
  email: z.email("Enter a valid work email.").max(254),
  name: z.string().trim().max(120).optional(),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  country: z.string().trim().max(80).optional(),
  category: z.string().trim().max(120).optional(),
  quantity: z.string().trim().max(80).optional(),
  message: z.string().trim().max(5000).optional(),
  source_page: z.string().trim().max(300).optional(),
  items: z.array(itemSchema).max(100).default([]),
});

function optional(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  // Honeypot: real visitors never see or fill this field.
  if (optional(formData, "website")) return { status: "success", message: "Thank you. We'll be in touch shortly." };

  let items: unknown = [];
  const rawItems = optional(formData, "items");
  if (rawItems) {
    try {
      items = JSON.parse(rawItems);
    } catch {
      items = [];
    }
  }

  const parsed = inquirySchema.safeParse({
    type: optional(formData, "type") ?? "quote",
    email: optional(formData, "email") ?? "",
    name: optional(formData, "name"),
    company: optional(formData, "company"),
    phone: optional(formData, "phone"),
    country: optional(formData, "country"),
    category: optional(formData, "category"),
    quantity: optional(formData, "quantity"),
    message: optional(formData, "message"),
    source_page: optional(formData, "source_page"),
    items,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Demo mode: connect Supabase (see README) to start receiving enquiries in the dashboard.",
    };
  }

  const { error } = await createPublicClient().from("inquiries").insert(parsed.data);
  if (error) {
    console.error("Inquiry insert failed:", error.message);
    return { status: "error", message: "We couldn't send your request. Please try again or email us directly." };
  }

  return {
    status: "success",
    message: "Thank you. Your request is with our wholesale team and we'll reply to your email within one business day.",
  };
}
