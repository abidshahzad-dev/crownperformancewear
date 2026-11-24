import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { listCategories } from "@/lib/data/admin";
import { categoryGroups, categoryInitial } from "../category-form-config";

export const metadata: Metadata = { title: "New category" };

export default async function NewCategoryPage() {
  const { main, side } = categoryGroups(await listCategories());
  return (
    <div className="admin-fade-up">
      <PageHeader title="New category" back={{ href: "/admin/categories", label: "Categories" }} />
      <EntityForm
        entity="categories"
        id={null}
        initial={categoryInitial(null)}
        main={main}
        side={side}
        basePath="/admin/categories"
      />
    </div>
  );
}
