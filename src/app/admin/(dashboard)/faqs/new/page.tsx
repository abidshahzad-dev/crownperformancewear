import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { faqGroups, faqInitial } from "../faq-form-config";

export const metadata: Metadata = { title: "New FAQ" };

export default function NewFaqPage() {
  return (
    <div className="admin-fade-up">
      <PageHeader title="New FAQ" back={{ href: "/admin/faqs", label: "FAQs" }} />
      <EntityForm
        entity="faqs"
        id={null}
        initial={faqInitial(null)}
        main={faqGroups.main}
        side={faqGroups.side}
        basePath="/admin/faqs"
      />
    </div>
  );
}
