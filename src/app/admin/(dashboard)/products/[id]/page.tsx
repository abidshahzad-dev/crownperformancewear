import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityForm } from "@/components/admin/entity-form";
import { PageHeader } from "@/components/admin/ui";
import { getProductById, listCategories } from "@/lib/data/admin";
import { productGroups, productInitial } from "../product-form-config";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage(props: PageProps<"/admin/products/[id]">) {
  const { id } = await props.params;
  const [product, categories] = await Promise.all([getProductById(id), listCategories()]);
  if (!product) notFound();
  const { main, side } = productGroups(categories);
  return (
    <div className="admin-fade-up">
      <PageHeader
        title={product.name}
        description={
          product.deleted_at ? "This product is in the trash. Restore it from the products list." : product.sku
        }
        back={{ href: "/admin/products", label: "Products" }}
      />
      <EntityForm
        key={product.updated_at}
        entity="products"
        id={product.id}
        initial={productInitial(product)}
        main={main}
        side={side}
        basePath="/admin/products"
        publicPath="/products/{slug}"
      />
    </div>
  );
}
