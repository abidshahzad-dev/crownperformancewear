"use client";

import { ArrowDown, ArrowUp, ChevronDown, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Field } from "@/lib/cms/schema";
import { cn } from "@/lib/utils";
import { FormField, StringListInput, inputClass } from "./form-controls";
import { ImageField } from "./image-field";

export type Values = Record<string, unknown>;

function emptyFor(field: Field): unknown {
  switch (field.type) {
    case "link":
      return { label: "", href: "" };
    case "strings":
    case "list":
      return [];
    default:
      return "";
  }
}

export function emptyItem(fields: Field[]): Values {
  return Object.fromEntries(fields.map((f) => [f.name, emptyFor(f)]));
}

function asRecord(v: unknown): Values {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Values) : {};
}

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function asItems(v: unknown): Values[] {
  return Array.isArray(v) ? v.map(asRecord) : [];
}

/** Renders a CMS field list (recursively) as a form over a plain object. */
export function SchemaFields({
  fields,
  value,
  onChange,
  idPrefix,
}: {
  fields: Field[];
  value: Values;
  onChange: (next: Values) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <SchemaField
          key={field.name}
          field={field}
          id={`${idPrefix}-${field.name}`}
          value={value[field.name]}
          onChange={(v) => onChange({ ...value, [field.name]: v })}
        />
      ))}
    </div>
  );
}

function SchemaField({
  field,
  value,
  onChange,
  id,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  id: string;
}) {
  switch (field.type) {
    case "text":
      return (
        <FormField label={field.label} help={field.help} htmlFor={id}>
          <input
            id={id}
            className={inputClass}
            value={asString(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
        </FormField>
      );
    case "textarea":
    case "markdown":
      return (
        <FormField
          label={field.label}
          help={
            field.help ??
            (field.type === "markdown"
              ? "Markdown supported: ## headings, **bold**, - lists, [links](/url)."
              : undefined)
          }
          htmlFor={id}
        >
          <textarea
            id={id}
            rows={field.rows ?? (field.type === "markdown" ? 10 : 3)}
            className={cn(inputClass, "resize-y", field.type === "markdown" && "font-mono text-[13px]")}
            value={asString(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        </FormField>
      );
    case "image":
      return (
        <FormField label={field.label} help={field.help} htmlFor={id}>
          <ImageField id={id} value={asString(value)} onChange={onChange} />
        </FormField>
      );
    case "link": {
      const link = asRecord(value);
      return (
        <FormField label={field.label} help={field.help}>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              aria-label={`${field.label} label`}
              className={inputClass}
              placeholder="Label"
              value={asString(link.label)}
              onChange={(e) => onChange({ ...link, label: e.target.value })}
            />
            <input
              aria-label={`${field.label} URL`}
              className={inputClass}
              placeholder="/page or https://…"
              value={asString(link.href)}
              onChange={(e) => onChange({ ...link, href: e.target.value })}
            />
          </div>
        </FormField>
      );
    }
    case "strings":
      return (
        <FormField label={field.label} help={field.help ?? "Press Enter after each item."} htmlFor={id}>
          <StringListInput id={id} value={asStringArray(value)} onChange={onChange} placeholder={field.placeholder} />
        </FormField>
      );
    case "list":
      return <ListField field={field} items={asItems(value)} onChange={onChange} id={id} />;
  }
}

function ListField({
  field,
  items,
  onChange,
  id,
}: {
  field: Extract<Field, { type: "list" }>;
  items: Values[];
  onChange: (v: Values[]) => void;
  id: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setOpen(to);
  };
  const previewKey = field.fields.find((f) => f.type === "text" || f.type === "textarea")?.name;
  const imageKey = field.fields.find((f) => f.type === "image")?.name;
  const iconButton =
    "text-paper-muted hover:text-paper-ink rounded-md p-1.5 transition hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-paper-ink text-[12px] font-bold">
          {field.label}{" "}
          <span className="text-paper-muted ml-1 rounded-full bg-black/[0.05] px-1.5 py-px text-[11px] font-semibold">
            {items.length}
          </span>
        </p>
      </div>
      {field.help ? <p className="text-paper-muted mb-2 text-[12px]">{field.help}</p> : null}
      <div className="space-y-2">
        {items.map((item, i) => {
          const preview = previewKey ? asString(item[previewKey]).split("\n")[0] : "";
          const thumb = imageKey ? asString(item[imageKey]) : "";
          const isOpen = open === i;
          return (
            <div
              key={i}
              className={cn(
                "overflow-clip rounded-xl border transition",
                isOpen
                  ? "border-ink/25 bg-white shadow-[0_8px_24px_-18px_rgba(7,19,27,0.5)]"
                  : "border-black/10 bg-[#fbfbf9]",
              )}
            >
              <div className="flex items-center gap-1 py-1.5 pr-2 pl-3">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="text-paper-ink flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left text-[13px] font-semibold"
                  aria-expanded={isOpen}
                >
                  <ChevronDown
                    className={cn(
                      "text-paper-muted size-4 shrink-0 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-black/[0.05] text-[11px] font-bold tabular-nums">
                    {i + 1}
                  </span>
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- arbitrary image hosts
                    <img src={thumb} alt="" className="size-7 shrink-0 rounded-md object-cover ring-1 ring-black/10" />
                  ) : null}
                  <span className="min-w-0 truncate">
                    {preview || <span className="text-paper-muted font-normal">{`${field.itemLabel} ${i + 1}`}</span>}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  className={iconButton}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  className={iconButton}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...items];
                    next.splice(i + 1, 0, structuredClone(item));
                    onChange(next);
                    setOpen(i + 1);
                  }}
                  className={iconButton}
                  aria-label="Duplicate"
                  title="Duplicate"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove ${field.itemLabel.toLowerCase()} ${i + 1}?`)) {
                      onChange(items.filter((_, idx) => idx !== i));
                      setOpen(null);
                    }
                  }}
                  className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50"
                  aria-label="Remove"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              {isOpen ? (
                <div className="border-t border-black/[0.07] p-4">
                  <SchemaFields
                    fields={field.fields}
                    value={item}
                    idPrefix={`${id}-${i}`}
                    onChange={(next) => onChange(items.map((it, idx) => (idx === i ? next : it)))}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          onChange([...items, emptyItem(field.fields)]);
          setOpen(items.length);
        }}
        className="text-paper-ink hover:border-ink mt-2 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-black/20 px-3 py-2 text-[12px] font-semibold transition hover:bg-white"
      >
        <Plus className="size-3.5" /> Add {field.itemLabel.toLowerCase()}
      </button>
    </div>
  );
}
