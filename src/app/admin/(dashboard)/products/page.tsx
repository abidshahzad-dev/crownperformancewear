import { Shirt } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { EditLink, FlagToggle, RestoreButton, TrashButton } from "@/components/admin/row-actions";
import {
  Badge,
  Card,
  EmptyState,
  NewButton,
  PageHeader,
  Pagination,
  Table,
  Td,
  Th,
  Thumb,
  TrashTabs,
  paginate,
} from "@/components/admin/ui";
import { listCategories, listProducts } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage(props: PageProps<"/admin/products">) {
  const params = await props.searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const trash = params.trash === "1";
  const [products, categories] = await Promise.all([
    listProducts({ q, category: category || undefined, trash }),
    listCategories(),
  ]);
  const categoryName = (id: string | null) => categories.find((c) => c.id === id)?.name ?? "—";
  const { rows, ...pageInfo } = paginate(products, params.page);

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Products"
        description="Your wholesale catalogue. Toggle visibility inline, or open a product to edit pricing, images and specs."
        actions={<NewButton href="/admin/products/new" label="Add product" />}
      />
      <div className="mb-3">
        <TrashTabs base="/admin/products" trash={trash} />
      </div>
      <Card className="overflow-clip">
        <ListToolbar
          action="/admin/products"
          q={q}
          trash={trash}
          count={products.length}
          noun={products.length === 1 ? "product" : "products"}
          filters={[
            {
              name: "category",
              value: category,
              label: "All categories",
              options: categories.map((c) => ({ value: c.id, label: c.name })),
            },
          ]}
        />
        {products.length === 0 ? (
          <EmptyState
            icon={Shirt}
            title={trash ? "Trash is empty" : q || category ? "No products match" : "No products yet"}
            text={
              trash
                ? "Products you move to the trash appear here and can be restored."
                : q || category
                  ? "Try a different search or clear the filters."
                  : "Add your first wholesale style to start building the catalogue."
            }
            action={trash ? undefined : <NewButton href="/admin/products/new" label="Add product" />}
          />
        ) : (
          <Table minWidth={760}>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>From</Th>
                <Th>MOQ</Th>
                {!trash ? (
                  <>
                    <Th>Published</Th>
                    <Th>Featured</Th>
                  </>
                ) : null}
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Thumb src={p.images[0]?.url} alt="" />
                      <div className="max-w-[340px] min-w-0">
                        <Link href={`/admin/products/${p.id}`} className="line-clamp-1 font-semibold hover:underline">
                          {p.name}
                        </Link>
                        <p className="text-paper-muted flex items-center gap-1.5 text-[12px]">
                          <span className="font-mono">{p.sku}</span>
                          {p.is_new ? (
                            <Badge tone="lime" dot={false}>
                              New
                            </Badge>
                          ) : null}
                          {!p.images.length ? (
                            <Badge tone="amber" dot={false}>
                              No photo
                            </Badge>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-paper-muted">{categoryName(p.category_id)}</Td>
                  <Td className="font-semibold tabular-nums">{formatPrice(p.price_from, p.currency)}</Td>
                  <Td className="tabular-nums">{p.moq}</Td>
                  {!trash ? (
                    <>
                      <Td>
                        <FlagToggle
                          entity="products"
                          id={p.id}
                          field="is_active"
                          value={p.is_active}
                          label={`Publish ${p.name}`}
                        />
                      </Td>
                      <Td>
                        <FlagToggle
                          entity="products"
                          id={p.id}
                          field="is_featured"
                          value={p.is_featured}
                          label={`Feature ${p.name}`}
                        />
                      </Td>
                    </>
                  ) : null}
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      {trash ? (
                        <>
                          <RestoreButton entity="products" id={p.id} />
                          <TrashButton entity="products" id={p.id} permanent />
                        </>
                      ) : (
                        <>
                          <EditLink href={`/admin/products/${p.id}`} />
                          <TrashButton entity="products" id={p.id} label="Trash" />
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {products.length ? <Pagination base="/admin/products" params={params} noun="products" {...pageInfo} /> : null}
      </Card>
    </div>
  );
}
