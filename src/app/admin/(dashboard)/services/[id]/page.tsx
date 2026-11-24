import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getServiceById } from "@/lib/data/admin";
import { serviceGroups, serviceInitial } from "../service-form-config";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage(props: PageProps<"/admin/services/[id]">) {
  const { id } = await props.params;
  const service = await getServiceById(id);
  if (!service) notFound();
  return (
    <div className="admin-fade-up">
      <PageHeader title={service.title} back={{ href: "/admin/services", label: "Services" }} />
      <EntityForm
        key={service.updated_at}
        entity="services"
        id={service.id}
        initial={serviceInitial(service)}
        main={serviceGroups.main}
        side={serviceGroups.side}
        basePath="/admin/services"
        publicPath="/services/{slug}"
      />
    </div>
  );
}
