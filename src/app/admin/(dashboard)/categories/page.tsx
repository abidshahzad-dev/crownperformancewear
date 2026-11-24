import { Folder } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { EditLink, FlagToggle, RestoreButton, TrashButton } from "@/components/admin/row-actions";
import { Card, EmptyState, NewButton, PageHeader, Table, Td, Th, Thumb, TrashTabs } from "@/components/admin/ui";
import { countProductsByCategory, listCategories } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage(props: PageProps<"/admin/categories">) {
  const params = await props.searchParams;
  const trash = params.trash === "1";
  const [categories, counts] = await Promise.all([listCategories({ trash }), countProductsByCategory()]);

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Categories"
        description="Product families shown in the catalogue filters, collection pages and the home page."
        actions={<NewButton href="/admin/categories/new" label="Add category" />}
      />
      <div className="mb-3">
        <TrashTabs base="/admin/categories" trash={trash} />
      </div>
      <Card className="overflow-clip">
        {categories.length === 0 ? (
          <EmptyState
            icon={Folder}
            title={trash ? "Trash is empty" : "No categories yet"}
            text={
              trash
                ? "Categories you move to the trash appear here."
                : "Categories group your products into collections."
            }
            action={trash ? undefined : <NewButton href="/admin/categories/new" label="Add category" />}
          />
        ) : (
          <Table minWidth={700}>
            <thead>
              <tr>
                <Th>Category</Th>
                <Th>Products</Th>
                <Th>Order</Th>
                {!trash ? (
                  <>
                    <Th>Published</Th>
                    <Th>On home</Th>
                  </>
                ) : null}
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Thumb src={c.image_url} />
                      <div className="min-w-0">
                        <Link href={`/admin/categories/${c.id}`} className="font-semibold hover:underline">
                          {c.name}
                        </Link>
                        <p className="text-paper-muted text-[12px]">
                          /collections/{c.slug}
                          {c.tagline ? ` · ${c.tagline}` : ""}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/products?category=${c.id}`}
                      className="inline-flex min-w-8 justify-center rounded-full bg-black/[0.05] px-2 py-0.5 text-[12px] font-semibold tabular-nums hover:bg-black/10"
                    >
                      {counts[c.id] ?? 0}
                    </Link>
                  </Td>
                  <Td className="text-paper-muted tabular-nums">{c.sort_order}</Td>
                  {!trash ? (
                    <>
                      <Td>
                        <FlagToggle
                          entity="categories"
                          id={c.id}
                          field="is_active"
                          value={c.is_active}
                          label={`Publish ${c.name}`}
                        />
                      </Td>
                      <Td>
                        <FlagToggle
                          entity="categories"
                          id={c.id}
                          field="is_featured"
                          value={c.is_featured}
                          label={`Show ${c.name} on home`}
                        />
                      </Td>
                    </>
                  ) : null}
                  <Td className="text-right">
                    <div className="flex justify-end gap-1">
                      {trash ? (
                        <>
                          <RestoreButton entity="categories" id={c.id} />
                          <TrashButton entity="categories" id={c.id} permanent />
                        </>
                      ) : (
                        <>
                          <EditLink href={`/admin/categories/${c.id}`} />
                          <TrashButton entity="categories" id={c.id} label="Trash" />
                        </>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
