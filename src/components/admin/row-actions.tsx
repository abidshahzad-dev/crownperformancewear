"use client";

import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { deleteEntity, purgeEntity, restoreEntity, toggleEntityFlag } from "@/app/admin/actions/entities";
import type { EntityName } from "@/lib/admin/entities";
import { Toggle } from "./form-controls";
import { toastResult } from "./toaster";

export function FlagToggle({
  entity,
  id,
  field,
  value,
  label,
}: {
  entity: EntityName;
  id: string;
  field: string;
  value: boolean;
  label: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, startTransition] = useTransition();
  return (
    <Toggle
      checked={optimistic}
      disabled={pending}
      srLabel={label}
      onChange={(next) =>
        startTransition(async () => {
          setOptimistic(next);
          const result = await toggleEntityFlag(entity, id, field, next);
          if (!result.ok) toastResult(result);
        })
      }
    />
  );
}

const actionButton =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50";

export function EditLink({ href }: { href: string }) {
  return (
    <Link href={href} className={`${actionButton} text-paper-ink hover:bg-black/[0.05]`}>
      <Pencil className="size-3.5" /> Edit
    </Link>
  );
}

export function TrashButton({
  entity,
  id,
  label = "Delete",
  permanent = false,
}: {
  entity: EntityName;
  id: string;
  label?: string;
  permanent?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`${actionButton} text-red-700 hover:bg-red-50`}
      title={permanent ? "Delete permanently" : label}
      onClick={() => {
        const msg = permanent ? "Delete permanently? This cannot be undone." : `${label}?`;
        if (!window.confirm(msg)) return;
        startTransition(async () => {
          toastResult(permanent ? await purgeEntity(entity, id) : await deleteEntity(entity, id));
        });
      }}
    >
      <Trash2 className="size-3.5" /> <span className="hidden sm:inline">{permanent ? "Delete forever" : label}</span>
    </button>
  );
}

export function RestoreButton({ entity, id }: { entity: EntityName; id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={`${actionButton} text-paper-ink hover:bg-black/[0.05]`}
      onClick={() => startTransition(async () => toastResult(await restoreEntity(entity, id)))}
    >
      <RotateCcw className="size-3.5" /> Restore
    </button>
  );
}
