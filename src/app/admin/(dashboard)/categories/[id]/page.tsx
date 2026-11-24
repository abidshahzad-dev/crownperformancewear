import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getCategoryById, listCategories } from "@/lib/data/admin";
import { categoryGroups, categoryInitial } from "../category-form-config";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage(props: PageProps<"/admin/categories/[id]">) {
  const { id } = await props.params;
  const [category, categories] = await Promise.all([getCategoryById(id), listCategories()]);
  if (!category) notFound();
  const { main, side } = categoryGroups(categories, category.id);
  return (
    <div className="admin-fade-up">
      <PageHeader title={category.name} back={{ href: "/admin/categories", label: "Categories" }} />
      <EntityForm
        key={category.updated_at}
        entity="categories"
        id={category.id}
        initial={categoryInitial(category)}
        main={main}
        side={side}
        basePath="/admin/categories"
        publicPath="/collections/{slug}"
      />
    </div>
  );
}
