import type { BadgeTone } from "@/components/admin/ui";
import type { InquiryStatus } from "@/lib/types";

const LABELS: Record<InquiryStatus, string> = {
  new: "New",
  in_review: "In review",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  closed: "Closed",
};

const TONES: Record<InquiryStatus, BadgeTone> = {
  new: "lime",
  in_review: "blue",
  quoted: "amber",
  won: "green",
  lost: "red",
  closed: "gray",
};

export function statusLabel(status: InquiryStatus): string {
  return LABELS[status] ?? status;
}

export function statusTone(status: InquiryStatus): BadgeTone {
  return TONES[status] ?? "gray";
}
