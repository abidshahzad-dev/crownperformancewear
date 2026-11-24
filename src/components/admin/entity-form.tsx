"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteEntity, saveEntity } from "@/app/admin/actions/entities";
import type { EntityName } from "@/lib/admin/entities";
import { cn, formatDateTime, slugify } from "@/lib/utils";
import { DirtyIndicator, FormField, StringListInput, Toggle, inputClass } from "./form-controls";
import { ImageField } from "./image-field";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload";
import { toast, toastResult } from "./toaster";
import { dangerButton, primaryButton, secondaryButton } from "./ui";
import { sameJson, useSaveShortcut, useUnsavedChangesWarning } from "./use-form-guards";

type Base = { name: string; label: string; help?: string };

export type EntityFieldDef =
  | (Base & { type: "text"; placeholder?: string; slugFrom?: string; required?: boolean })
  | (Base & { type: "textarea"; rows?: number })
  | (Base & { type: "markdown"; rows?: number })
  | (Base & { type: "number"; step?: number; min?: number; placeholder?: string })
  | (Base & { type: "image" })
  | (Base & { type: "images" })
  | (Base & { type: "toggle" })
  | (Base & { type: "strings"; placeholder?: string })
  | (Base & { type: "select"; options: Array<{ value: string; label: string }>; emptyLabel?: string })
  | (Base & { type: "datetime" })
  | (Base & { type: "tiers" })
  | (Base & { type: "specs" });

export type FieldGroup = { title: string; description?: string; fields: EntityFieldDef[]; columns?: 1 | 2 };

type Values = Record<string, unknown>;
type Tier = { min_qty: number | string; max_qty: number | string | null; price: number | string };
type SpecRow = { label: string; value: string };
type ImageRow = { url: string; alt: string };

const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Generic create/edit form for admin entities. Field definitions are plain data passed from the
 * server page; validation happens again on the server in `saveEntity`.
 */
export function EntityForm({
  entity,
  id,
  initial,
  main,
  side,
  basePath,
  publicPath,
  deleteLabel = "Move to trash",
}: {
  entity: EntityName;
  id: string | null;
  initial: Values;
  main: FieldGroup[];
  side: FieldGroup[];
  basePath: string;
  /** e.g. "/products/{slug}" — shows a "View" link after saving. */
  publicPath?: string;
  deleteLabel?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [saved, setSaved] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [pending, startTransition] = useTransition();
  const dirty = !sameJson(values, saved);

  const allFields = [...main, ...side].flatMap((g) => g.fields);
  const slugField = allFields.find(
    (f): f is Extract<EntityFieldDef, { type: "text" }> => f.type === "text" && Boolean(f.slugFrom),
  );

  const set = (name: string, value: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (slugField && !slugTouched && slugField.slugFrom === name && typeof value === "string") {
        next[slugField.name] = slugify(value);
      }
      return next;
    });
  };

  const save = () => {
    if (pending) return;
    startTransition(async () => {
      const result = await saveEntity(entity, id, values);
      const fieldErrors = result.fieldErrors ?? {};
      setErrors(fieldErrors);
      toastResult(result);
      if (result.ok) {
        setSaved(values);
        if (!id && result.id) router.replace(`${basePath}/${result.id}`);
      } else {
        const first = Object.keys(fieldErrors)[0]?.split(".")[0];
        if (first) document.getElementById(`field-${first}`)?.focus();
      }
    });
  };

  useSaveShortcut(save);
  useUnsavedChangesWarning(dirty && !pending);

  const remove = () => {
    if (!id || !window.confirm(`${deleteLabel}?`)) return;
    startTransition(async () => {
      const result = await deleteEntity(entity, id);
      toastResult(result);
      if (result.ok) {
        setSaved(values);
        router.push(basePath);
      }
    });
  };

  const renderGroup = (group: FieldGroup) => (
    <section
      key={group.title}
      className="rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_1px_2px_rgba(7,19,27,0.04)]"
    >
      <header className="border-b border-black/[0.06] px-5 py-4">
        <h2 className="text-paper-ink text-[14px] font-bold">{group.title}</h2>
        {group.description ? (
          <p className="text-paper-muted mt-0.5 text-[12px] leading-relaxed">{group.description}</p>
        ) : null}
      </header>
      <div className={cn("grid gap-5 p-5", group.columns === 2 && "sm:grid-cols-2")}>
        {group.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            error={errors[field.name] ?? Object.entries(errors).find(([k]) => k.startsWith(`${field.name}.`))?.[1]}
            onChange={(v) => {
              if (slugField && field.name === slugField.name) setSlugTouched(true);
              set(field.name, v);
            }}
          />
        ))}
      </div>
    </section>
  );

  const viewHref = publicPath && id && str(saved.slug) ? publicPath.replace("{slug}", str(saved.slug)) : null;
  const updatedAt = str(initial.updated_at);
  const inTrash = Boolean(initial.deleted_at);
  const errorCount = Object.keys(errors).length;

  const saveButton = (
    <button type="button" onClick={save} disabled={pending} className={cn(primaryButton, "w-full")}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {pending ? "Saving…" : id ? "Save changes" : "Create"}
    </button>
  );

  return (
    <div>
      {inTrash ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-900">
          <AlertTriangle className="size-4" /> This item is in the trash and hidden from the site. Restore it from the
          list.
        </div>
      ) : null}
      {errorCount ? (
        <div
          className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-800"
          role="alert"
        >
          <AlertTriangle className="size-4" /> Fix {errorCount} highlighted {errorCount === 1 ? "field" : "fields"}{" "}
          before saving.
        </div>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">{main.map(renderGroup)}</div>
        <div className="admin-scroll-light min-w-0 space-y-5 xl:sticky xl:top-[104px] xl:max-h-[calc(100vh-120px)] xl:self-start xl:overflow-y-auto xl:pb-2">
          <section className="hidden rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_1px_2px_rgba(7,19,27,0.04)] xl:block">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-paper-ink text-[14px] font-bold">{id ? "Publish" : "Create"}</h2>
              <DirtyIndicator dirty={dirty} />
            </div>
            {saveButton}
            <p className="text-paper-muted mt-2 text-center text-[11px]">
              <kbd className="rounded border border-black/15 bg-slate-50 px-1 font-sans">Ctrl</kbd> +{" "}
              <kbd className="rounded border border-black/15 bg-slate-50 px-1 font-sans">S</kbd> to save
            </p>
            {id ? (
              <dl className="mt-4 space-y-1.5 border-t border-black/[0.06] pt-4 text-[12px]">
                {updatedAt ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-paper-muted">Last updated</dt>
                    <dd className="font-semibold">{formatDateTime(updatedAt)}</dd>
                  </div>
                ) : null}
                {viewHref ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-paper-muted">On the site</dt>
                    <dd>
                      <a
                        href={viewHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold hover:underline"
                      >
                        View <ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            {id ? (
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className={cn(dangerButton, "mt-4 w-full border border-red-200")}
              >
                <Trash2 className="size-4" /> {deleteLabel}
              </button>
            ) : null}
          </section>
          {side.map(renderGroup)}
        </div>
      </div>
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-black/10 bg-[var(--admin-bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 xl:hidden">
        <div className="flex items-center gap-2">
          {id ? (
            <button type="button" onClick={remove} disabled={pending} className={dangerButton} aria-label={deleteLabel}>
              <Trash2 className="size-4" /> <span className="hidden sm:inline">{deleteLabel}</span>
            </button>
          ) : null}
          <DirtyIndicator dirty={dirty} />
        </div>
        <div className="flex gap-2">
          {viewHref ? (
            <a href={viewHref} target="_blank" rel="noreferrer" className={secondaryButton}>
              <ExternalLink className="size-4" /> View
            </a>
          ) : null}
          <div className="min-w-[150px]">{saveButton}</div>
        </div>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: EntityFieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const id = `field-${field.name}`;
  const wide = ["markdown", "images", "tiers", "specs", "textarea"].includes(field.type);
  // Search engines show roughly 60 characters of a title and 160 of a description.
  const seoMax = field.name === "seo_title" ? 60 : field.name === "seo_description" ? 160 : null;
  const wrap = (child: React.ReactNode) => (
    <FormField
      label={field.label}
      help={field.help ?? (seoMax ? `Aim for up to ${seoMax} characters. Leave empty to use the default.` : undefined)}
      error={error}
      htmlFor={id}
      className={wide ? "sm:col-span-2" : undefined}
      count={seoMax ? { value: str(value).length, max: seoMax } : undefined}
    >
      {child}
    </FormField>
  );

  switch (field.type) {
    case "text":
      return wrap(
        <input
          id={id}
          className={cn(inputClass, error && "border-red-500 focus:ring-red-200")}
          value={str(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />,
      );
    case "textarea":
      return wrap(
        <textarea
          id={id}
          rows={field.rows ?? 3}
          className={cn(inputClass, "resize-y")}
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
        />,
      );
    case "markdown":
      return wrap(
        <textarea
          id={id}
          rows={field.rows ?? 14}
          className={cn(inputClass, "resize-y font-mono text-[13px] leading-relaxed")}
          value={str(value)}
          onChange={(e) => onChange(e.target.value)}
        />,
      );
    case "number":
      return wrap(
        <input
          id={id}
          type="number"
          step={field.step ?? 1}
          min={field.min}
          className={cn(inputClass, error && "border-red-500 focus:ring-red-200")}
          value={value == null ? "" : str(value)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />,
      );
    case "image":
      return wrap(<ImageField id={id} value={str(value)} onChange={onChange} />);
    case "toggle":
      return (
        <div className={wide ? "sm:col-span-2" : undefined}>
          <Toggle checked={Boolean(value)} onChange={onChange} label={field.label} />
          {field.help ? <p className="text-paper-muted mt-1 pl-[46px] text-[12px]">{field.help}</p> : null}
        </div>
      );
    case "strings":
      return wrap(
        <StringListInput id={id} value={arr<string>(value)} onChange={onChange} placeholder={field.placeholder} />,
      );
    case "select":
      return wrap(
        <select id={id} className={inputClass} value={str(value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.emptyLabel ?? "None"}</option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>,
      );
    case "datetime":
      return wrap(
        <input
          id={id}
          type="datetime-local"
          className={inputClass}
          value={toLocalInput(str(value))}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : "")}
        />,
      );
    case "images":
      return wrap(<ImagesEditor value={arr<ImageRow>(value)} onChange={onChange} />);
    case "tiers":
      return wrap(<TiersEditor value={arr<Tier>(value)} onChange={onChange} />);
    case "specs":
      return wrap(<SpecsEditor value={arr<SpecRow>(value)} onChange={onChange} />);
  }
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

function ImagesEditor({ value, onChange }: { value: ImageRow[]; onChange: (v: ImageRow[]) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const uploadMany = async (files: FileList | null | undefined) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setUploading({ done: 0, total: list.length });
    const added: ImageRow[] = [];
    for (const file of list) {
      try {
        const { url } = await uploadImageFile(file);
        added.push({ url, alt: "" });
      } catch (error) {
        toast(error instanceof Error ? error.message : `${file.name}: upload failed.`, false);
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    if (added.length) {
      onChange([...value.filter((v) => v.url), ...added]);
      toast(`${added.length} image${added.length === 1 ? "" : "s"} added.`);
    }
    setUploading(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const iconButton = "text-paper-muted hover:text-paper-ink rounded-md p-1 transition hover:bg-white";

  return (
    <div className="space-y-3">
      {value.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {value.map((img, i) => (
            <div key={i} className="rounded-xl border border-black/10 bg-[#fbfbf9] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-paper-ink inline-flex items-center gap-2 text-[12px] font-bold">
                  {i === 0 ? (
                    <span className="bg-signal text-ink rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase">
                      Main
                    </span>
                  ) : null}
                  Image {i + 1}
                </span>
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Move earlier"
                    disabled={i === 0}
                    onClick={() => onChange(moveItem(value, i, i - 1))}
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className={iconButton}
                    aria-label="Move later"
                    disabled={i === value.length - 1}
                    onClick={() => onChange(moveItem(value, i, i + 1))}
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-red-600 transition hover:bg-red-50"
                    aria-label="Remove image"
                    onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
              <ImageField
                compact
                value={img.url}
                onChange={(url) => onChange(value.map((it, idx) => (idx === i ? { ...it, url } : it)))}
              />
              <input
                className={cn(inputClass, "mt-2 py-1.5 text-[13px]")}
                placeholder="Alt text (describe the photo)"
                value={img.alt ?? ""}
                onChange={(e) => onChange(value.map((it, idx) => (idx === i ? { ...it, alt: e.target.value } : it)))}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && fileInput.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !uploading) {
            e.preventDefault();
            fileInput.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) void uploadMany(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
          dragging
            ? "border-[#7fb800] bg-[#f6fde6]"
            : "hover:border-ink/30 border-black/[0.14] bg-[#fbfbf9] hover:bg-white",
        )}
        aria-label="Upload product images"
      >
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-[#5d9c00]" />
            <p className="text-paper-ink text-[13px] font-semibold">
              Uploading {Math.min(uploading.done + 1, uploading.total)} of {uploading.total}…
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-[#4c6b12]" />
            <p className="text-paper-ink text-[13px] font-semibold">
              Drop product photos here or <span className="underline underline-offset-2">browse</span>
            </p>
            <p className="text-paper-muted text-[11px]">
              Select several at once. {value.length ? "" : "The first image becomes the main photo."}
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange([...value, { url: "", alt: "" }])}
        className="text-paper-ink hover:border-ink inline-flex items-center gap-1.5 rounded-lg border border-dashed border-black/20 px-3 py-2 text-[12px] font-semibold transition hover:bg-white"
      >
        <Plus className="size-3.5" /> Add by URL or library
      </button>
      <input
        ref={fileInput}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => void uploadMany(e.target.files)}
      />
    </div>
  );
}

function TiersEditor({ value, onChange }: { value: Tier[]; onChange: (v: Tier[]) => void }) {
  const update = (i: number, key: keyof Tier, raw: string) =>
    onChange(
      value.map((t, idx) =>
        idx === i ? { ...t, [key]: raw === "" ? (key === "max_qty" ? null : "") : Number(raw) } : t,
      ),
    );
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-[13px]">
          <thead>
            <tr className="text-paper-muted text-left text-[11px] font-bold tracking-[0.06em] uppercase">
              <th className="pr-2 pb-2">Min qty</th>
              <th className="pr-2 pb-2">Max qty (empty = and up)</th>
              <th className="pr-2 pb-2">Unit price</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {value.map((t, i) => (
              <tr key={i}>
                <td className="pr-2 pb-2">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={str(t.min_qty)}
                    onChange={(e) => update(i, "min_qty", e.target.value)}
                  />
                </td>
                <td className="pr-2 pb-2">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={t.max_qty == null ? "" : str(t.max_qty)}
                    onChange={(e) => update(i, "max_qty", e.target.value)}
                  />
                </td>
                <td className="pr-2 pb-2">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className={inputClass}
                    value={str(t.price)}
                    onChange={(e) => update(i, "price", e.target.value)}
                  />
                </td>
                <td className="pb-2">
                  <button
                    type="button"
                    aria-label="Remove tier"
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                    onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                  >
                    <X className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => {
          const last = value[value.length - 1];
          const lastMax = last && last.max_qty != null && last.max_qty !== "" ? Number(last.max_qty) : null;
          onChange([
            ...value,
            { min_qty: lastMax ? lastMax + 1 : 50, max_qty: null, price: last ? Number(last.price) || 0 : 0 },
          ]);
          if (last && (last.max_qty == null || last.max_qty === ""))
            toast("Set a max quantity on the previous tier.", false);
        }}
        className="text-paper-ink hover:border-ink inline-flex items-center gap-1.5 rounded-lg border border-dashed border-black/20 px-3 py-2 text-[12px] font-semibold transition hover:bg-white"
      >
        <Plus className="size-3.5" /> Add price tier
      </button>
    </div>
  );
}

function SpecsEditor({ value, onChange }: { value: SpecRow[]; onChange: (v: SpecRow[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((s, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
          <input
            className={inputClass}
            placeholder="Label"
            value={s.label}
            onChange={(e) => onChange(value.map((it, idx) => (idx === i ? { ...it, label: e.target.value } : it)))}
          />
          <input
            className={inputClass}
            placeholder="Value"
            value={s.value}
            onChange={(e) => onChange(value.map((it, idx) => (idx === i ? { ...it, value: e.target.value } : it)))}
          />
          <button
            type="button"
            aria-label="Remove row"
            className="rounded p-2 text-red-600 hover:bg-red-50"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: "", value: "" }])}
        className="text-paper-ink hover:border-ink inline-flex items-center gap-1.5 rounded-lg border border-dashed border-black/20 px-3 py-2 text-[12px] font-semibold transition hover:bg-white"
      >
        <Plus className="size-3.5" /> Add specification
      </button>
    </div>
  );
}
