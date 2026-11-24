"use client";

import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEnquiry, type EnquiryItem } from "./enquiry-list";

type Props = {
  item: Omit<EnquiryItem, "quantity">;
  variant?: "inline" | "button";
  className?: string;
};

export function AddToEnquiry({ item, variant = "inline", className }: Props) {
  const { has, add, ready } = useEnquiry();
  const added = ready && has(item.product_id);

  if (variant === "button") {
    return added ? (
      <Link href="/quote" className={cn("btn btn-ghost", className)}>
        In your enquiry list
        <Check className="text-signal size-4" />
      </Link>
    ) : (
      <button type="button" onClick={() => add(item)} className={cn("btn btn-ghost", className)}>
        Add to enquiry list
        <Plus className="size-4" />
      </button>
    );
  }

  return added ? (
    <Link href="/quote" className={cn("text-signal inline-flex items-center gap-1.5 text-[12px] font-bold", className)}>
      <Check className="size-3.5" /> Added
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => add(item)}
      className={cn("text-signal inline-flex items-center gap-1.5 text-[12px] font-bold hover:underline", className)}
    >
      <Plus className="size-3.5" /> Add to enquiry
    </button>
  );
}
