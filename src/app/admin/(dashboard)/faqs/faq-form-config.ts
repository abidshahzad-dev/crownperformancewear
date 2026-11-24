import type { FieldGroup } from "@/components/admin/entity-form";
import type { Faq } from "@/lib/types";

export const faqGroups: { main: FieldGroup[]; side: FieldGroup[] } = {
  main: [
    {
      title: "Question",
      fields: [
        { type: "text", name: "question", label: "Question" },
        { type: "textarea", name: "answer", label: "Answer", rows: 6 },
      ],
    },
  ],
  side: [
    {
      title: "Display",
      fields: [
        { type: "text", name: "group_name", label: "Group", help: "FAQs are grouped by this name on /faq." },
        { type: "number", name: "sort_order", label: "Sort order", min: 0 },
        { type: "toggle", name: "is_active", label: "Published" },
        { type: "toggle", name: "show_on_home", label: "Show on home page" },
      ],
    },
  ],
};

export function faqInitial(faq: Faq | null): Record<string, unknown> {
  if (faq) return { ...faq };
  return { question: "", answer: "", group_name: "General", sort_order: 0, is_active: true, show_on_home: false };
}
