import type { Metadata } from "next";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { listCategories } from "@/lib/data/admin";
import { productGroups, productInitial } from "../product-form-config";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await listCategories();
  const { main, side } = productGroups(categories);
  return (
    <div className="admin-fade-up">
      <PageHeader title="New product" back={{ href: "/admin/products", label: "Products" }} />
      <EntityForm
        entity="products"
        id={null}
        initial={productInitial(null)}
        main={main}
        side={side}
        basePath="/admin/products"
      />
    </div>
  );
}
