import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { EntityList } from "@/components/admin/entity-list";
import { NewButton, PageHeader, TrashTabs } from "@/components/admin/ui";
import { listServices } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage(props: PageProps<"/admin/services">) {
  const params = await props.searchParams;
  const trash = params.trash === "1";
  const services = await listServices({ trash });
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Services"
        description="Service routes shown on the home page and the services section."
        actions={<NewButton href="/admin/services/new" label="Add service" />}
      />
      <div className="mb-3">
        <TrashTabs base="/admin/services" trash={trash} />
      </div>
      <EntityList
        emptyIcon={Briefcase}
        emptyText="Services describe how buyers can work with you."
        entity="services"
        base="/admin/services"
        trash={trash}
        showImage
        newLabel="Add service"
        extraHeaders={["Order"]}
        flagHeaders={["Published"]}
        rows={services.map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: s.excerpt ?? undefined,
          image: s.image_url,
          extra: [s.sort_order],
          flags: [{ field: "is_active", value: s.is_active }],
        }))}
      />
    </div>
  );
}
