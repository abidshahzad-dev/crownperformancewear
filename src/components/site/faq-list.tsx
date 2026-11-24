import { Plus } from "lucide-react";
import type { Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

export function FaqList({
  faqs,
  dark = true,
  openFirst = true,
  reveal = false,
}: {
  faqs: Faq[];
  dark?: boolean;
  openFirst?: boolean;
  reveal?: boolean;
}) {
  return (
    <div data-reveal={reveal ? "stagger" : undefined}>
      {faqs.map((faq, i) => (
        <details
          key={faq.id}
          open={openFirst && i === 0}
          className={cn(
            "group relative border-b",
            dark ? "border-white/15" : "border-line-dark",
            "before:bg-signal before:absolute before:top-0 before:left-0 before:h-0.5 before:w-12 before:opacity-0 before:transition-opacity open:before:opacity-100",
          )}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-start justify-between gap-6 pt-6 pb-1 text-[15px] leading-[1.45] font-bold [&::-webkit-details-marker]:hidden",
              dark ? "text-white-soft" : "text-paper-ink",
            )}
          >
            {faq.question}
            <Plus className="mt-0.5 size-4 shrink-0 transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <p className={cn("pt-2 pr-10 pb-6 text-[14px] leading-[1.65]", dark ? "text-muted" : "text-paper-muted")}>
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
