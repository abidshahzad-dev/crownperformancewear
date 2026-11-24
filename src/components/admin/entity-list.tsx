import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityName } from "@/lib/admin/entities";
import { EditLink, FlagToggle, RestoreButton, TrashButton } from "./row-actions";
import { Card, EmptyState, NewButton, Table, Td, Th, Thumb } from "./ui";

export type EntityRow = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  extra?: ReactNode[];
  flags?: Array<{ field: string; value: boolean }>;
};

/** Standard admin table: title column, optional extra columns, inline toggles, edit/trash actions. */
export function EntityList({
  entity,
  base,
  rows,
  trash = false,
  showImage = false,
  extraHeaders = [],
  flagHeaders = [],
  newLabel,
  softDelete = true,
  emptyIcon,
  emptyText,
  toolbar,
  footer,
}: {
  entity: EntityName;
  base: string;
  rows: EntityRow[];
  trash?: boolean;
  showImage?: boolean;
  extraHeaders?: string[];
  flagHeaders?: string[];
  newLabel: string;
  softDelete?: boolean;
  emptyIcon?: LucideIcon;
  emptyText?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card className="overflow-clip">
      {toolbar}
      {rows.length === 0 ? (
        <EmptyState
          icon={emptyIcon}
          title={trash ? "Trash is empty" : "Nothing here yet"}
          text={trash ? "Items you move to the trash appear here and can be restored." : emptyText}
          action={trash ? undefined : <NewButton href={`${base}/new`} label={newLabel} />}
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              {extraHeaders.map((h) => (
                <Th key={h}>{h}</Th>
              ))}
              {!trash ? flagHeaders.map((h) => <Th key={h}>{h}</Th>) : null}
              <Th className="text-right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    {showImage ? <Thumb src={row.image} /> : null}
                    <div className="max-w-[460px] min-w-0">
                      <Link href={`${base}/${row.id}`} className="line-clamp-1 font-semibold hover:underline">
                        {row.title}
                      </Link>
                      {row.subtitle ? (
                        <p className="text-paper-muted line-clamp-1 text-[12px]">{row.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                </Td>
                {(row.extra ?? []).map((cell, i) => (
                  <Td key={i} className="text-paper-muted">
                    {cell}
                  </Td>
                ))}
                {!trash
                  ? (row.flags ?? []).map((f, i) => (
                      <Td key={f.field}>
                        <FlagToggle
                          entity={entity}
                          id={row.id}
                          field={f.field}
                          value={f.value}
                          label={`${flagHeaders[i] ?? f.field}: ${row.title}`}
                        />
                      </Td>
                    ))
                  : null}
                <Td className="text-right">
                  <div className="flex justify-end gap-1">
                    {trash ? (
                      <>
                        <RestoreButton entity={entity} id={row.id} />
                        <TrashButton entity={entity} id={row.id} permanent />
                      </>
                    ) : (
                      <>
                        <EditLink href={`${base}/${row.id}`} />
                        <TrashButton entity={entity} id={row.id} label={softDelete ? "Trash" : "Delete"} />
                      </>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {footer}
    </Card>
  );
}
