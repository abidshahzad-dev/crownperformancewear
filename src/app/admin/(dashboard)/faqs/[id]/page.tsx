import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getFaqById } from "@/lib/data/admin";
import { faqGroups, faqInitial } from "../faq-form-config";

export const metadata: Metadata = { title: "Edit FAQ" };

export default async function EditFaqPage(props: PageProps<"/admin/faqs/[id]">) {
  const { id } = await props.params;
  const faq = await getFaqById(id);
  if (!faq) notFound();
  return (
    <div className="admin-fade-up">
      <PageHeader title="Edit FAQ" description={faq.question} back={{ href: "/admin/faqs", label: "FAQs" }} />
      <EntityForm
        key={faq.updated_at}
        entity="faqs"
        id={faq.id}
        initial={faqInitial(faq)}
        main={faqGroups.main}
        side={faqGroups.side}
        basePath="/admin/faqs"
        deleteLabel="Delete FAQ"
      />
    </div>
  );
}
