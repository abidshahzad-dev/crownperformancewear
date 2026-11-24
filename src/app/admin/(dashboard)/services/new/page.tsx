import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { serviceGroups, serviceInitial } from "../service-form-config";

export const metadata: Metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <div className="admin-fade-up">
      <PageHeader title="New service" back={{ href: "/admin/services", label: "Services" }} />
      <EntityForm
        entity="services"
        id={null}
        initial={serviceInitial(null)}
        main={serviceGroups.main}
        side={serviceGroups.side}
        basePath="/admin/services"
      />
    </div>
  );
}
