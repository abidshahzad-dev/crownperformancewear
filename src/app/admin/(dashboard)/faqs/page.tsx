import { HelpCircle } from "lucide-react";
import type { Metadata } from "next";
import { EntityList } from "@/components/admin/entity-list";
import { NewButton, PageHeader } from "@/components/admin/ui";
import { listFaqs } from "@/lib/data/admin";

export const metadata: Metadata = { title: "FAQs" };

export default async function FaqsPage() {
  const faqs = await listFaqs();
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="FAQs"
        description="Questions shown on /faq. Turn on “Home” to feature a question on the home page."
        actions={<NewButton href="/admin/faqs/new" label="Add FAQ" />}
      />
      <EntityList
        emptyIcon={HelpCircle}
        emptyText="Answer the questions buyers ask before requesting a quote."
        entity="faqs"
        base="/admin/faqs"
        newLabel="Add FAQ"
        softDelete={false}
        extraHeaders={["Group", "Order"]}
        flagHeaders={["Published", "Home"]}
        rows={faqs.map((f) => ({
          id: f.id,
          title: f.question,
          subtitle: f.answer,
          extra: [f.group_name, f.sort_order],
          flags: [
            { field: "is_active", value: f.is_active },
            { field: "show_on_home", value: f.show_on_home },
          ],
        }))}
      />
    </div>
  );
}
