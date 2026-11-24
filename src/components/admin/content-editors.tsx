"use client";

import { ChevronDown, ChevronsDownUp, ChevronsUpDown, ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useState, useTransition, type ReactNode } from "react";
import { resetSystemPage, saveSettings, saveSystemPage } from "@/app/admin/actions/content";
import type { SectionSchema } from "@/lib/cms/schema";
import { cn } from "@/lib/utils";
import { DirtyIndicator, FormField, inputClass } from "./form-controls";
import { SchemaFields, type Values } from "./schema-form";
import { toastResult } from "./toaster";
import { primaryButton, secondaryButton } from "./ui";
import { sameJson, useSaveShortcut, useUnsavedChangesWarning } from "./use-form-guards";

function SaveBar({
  pending,
  dirty,
  onSave,
  children,
}: {
  pending: boolean;
  dirty: boolean;
  onSave: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-black/10 bg-[var(--admin-bg)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <DirtyIndicator dirty={dirty} />
          <span className="text-paper-muted hidden text-[11px] md:inline">
            <kbd className="rounded border border-black/15 bg-white px-1 font-sans">Ctrl</kbd> +{" "}
            <kbd className="rounded border border-black/15 bg-white px-1 font-sans">S</kbd> to save
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {children}
          <button type="button" onClick={onSave} disabled={pending} className={cn(primaryButton, "min-w-[150px]")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  section,
  index,
  open,
  onToggle,
  children,
}: {
  section: SectionSchema;
  index: number;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      id={`section-${section.key}`}
      className={cn(
        "scroll-mt-28 rounded-2xl border bg-white transition-shadow",
        open
          ? "border-ink/20 shadow-[0_14px_36px_-24px_rgba(7,19,27,0.55)]"
          : "border-[var(--admin-border)] shadow-[0_1px_2px_rgba(7,19,27,0.04)]",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-lg text-[12px] font-extrabold tabular-nums transition-colors",
              open ? "bg-signal text-ink" : "text-paper-muted bg-black/[0.05]",
            )}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="min-w-0">
            <span className="text-paper-ink block truncate text-[15px] font-bold">{section.label}</span>
            <span className="text-paper-muted block truncate text-[12px]">
              {section.description ?? `${section.fields.length} field${section.fields.length === 1 ? "" : "s"}`}
            </span>
          </span>
        </span>
        <ChevronDown className={cn("text-paper-muted size-5 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open ? <div className="border-t border-black/[0.06] p-5">{children}</div> : null}
    </section>
  );
}

/** Editor for a system page: one collapsible card per section, with section jump links. */
export function SystemPageEditor({
  slug,
  path,
  sections,
  initial,
  seo,
}: {
  slug: string;
  path: string;
  sections: SectionSchema[];
  initial: Record<string, Values>;
  seo: { seo_title: string; seo_description: string };
}) {
  const [value, setValue] = useState<Record<string, Values>>(initial);
  const [meta, setMeta] = useState(seo);
  const [saved, setSaved] = useState({ value: initial, meta: seo });
  const [open, setOpen] = useState<Set<string>>(() => new Set(sections[0] ? [sections[0].key] : []));
  const [pending, startTransition] = useTransition();
  const dirty = !sameJson({ value, meta }, saved);
  const allOpen = open.size === sections.length;

  const save = () => {
    if (pending) return;
    startTransition(async () => {
      const result = await saveSystemPage(slug, value, meta);
      toastResult(result);
      if (result.ok) setSaved({ value, meta });
    });
  };

  useSaveShortcut(save);
  useUnsavedChangesWarning(dirty && !pending);

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const jump = (key: string) => {
    setOpen((prev) => new Set(prev).add(key));
    requestAnimationFrame(() =>
      document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Page sections" className="hidden xl:block">
        <div className="sticky top-[104px]">
          <p className="text-paper-muted mb-2 px-2 text-[10px] font-extrabold tracking-[0.16em] uppercase">Sections</p>
          <ul className="space-y-0.5">
            {sections.map((section, i) => (
              <li key={section.key}>
                <button
                  type="button"
                  onClick={() => jump(section.key)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold transition-colors",
                    open.has(section.key)
                      ? "text-paper-ink bg-white"
                      : "text-paper-muted hover:text-paper-ink hover:bg-white/60",
                  )}
                >
                  <span className="w-5 text-[10px] tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="truncate">{section.label}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => jump("seo")}
                className="text-paper-muted hover:text-paper-ink flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] font-semibold hover:bg-white/60"
              >
                <span className="w-5 text-[10px] opacity-60">··</span> SEO
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div className="min-w-0">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(sections.map((s) => s.key)))}
            className="text-paper-muted hover:text-paper-ink inline-flex items-center gap-1.5 text-[12px] font-semibold"
          >
            {allOpen ? <ChevronsDownUp className="size-3.5" /> : <ChevronsUpDown className="size-3.5" />}
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <div className="space-y-3">
          {sections.map((section, i) => (
            <SectionCard
              key={section.key}
              section={section}
              index={i}
              open={open.has(section.key)}
              onToggle={() => toggle(section.key)}
            >
              <SchemaFields
                fields={section.fields}
                idPrefix={section.key}
                value={value[section.key] ?? {}}
                onChange={(next) => setValue((prev) => ({ ...prev, [section.key]: next }))}
              />
            </SectionCard>
          ))}
          <section
            id="section-seo"
            className="scroll-mt-28 rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-[0_1px_2px_rgba(7,19,27,0.04)]"
          >
            <p className="text-paper-ink text-[15px] font-bold">Search engine listing</p>
            <p className="text-paper-muted mb-4 text-[12px]">How this page appears in Google and when shared.</p>
            <div className="grid gap-4">
              <FormField
                label="SEO title"
                help="Leave empty to use the default."
                htmlFor="seo-title"
                count={{ value: meta.seo_title.length, max: 60 }}
              >
                <input
                  id="seo-title"
                  className={inputClass}
                  value={meta.seo_title}
                  onChange={(e) => setMeta({ ...meta, seo_title: e.target.value })}
                />
              </FormField>
              <FormField
                label="SEO description"
                htmlFor="seo-description"
                count={{ value: meta.seo_description.length, max: 160 }}
              >
                <textarea
                  id="seo-description"
                  rows={2}
                  className={inputClass}
                  value={meta.seo_description}
                  onChange={(e) => setMeta({ ...meta, seo_description: e.target.value })}
                />
              </FormField>
              <div className="rounded-xl border border-black/[0.07] bg-[#fbfbf9] p-4">
                <p className="text-paper-muted text-[11px] font-semibold">Preview</p>
                <p className="mt-1 truncate text-[16px] text-[#1a0dab]">{meta.seo_title || "Default page title"}</p>
                <p className="truncate text-[12px] text-[#006621]">yourdomain.com{path === "/" ? "" : path}</p>
                <p className="text-paper-muted mt-0.5 line-clamp-2 text-[13px]">
                  {meta.seo_description || "The default site description is used when this is empty."}
                </p>
              </div>
            </div>
          </section>
        </div>
        <SaveBar pending={pending} dirty={dirty} onSave={save}>
          <a href={path} target="_blank" rel="noreferrer" className={secondaryButton}>
            <ExternalLink className="size-4" /> View page
          </a>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Reset this page to the default content? Your edits to it will be lost.")) return;
              startTransition(async () => {
                const result = await resetSystemPage(slug);
                toastResult(result);
                if (result.ok) window.location.reload();
              });
            }}
            className={secondaryButton}
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        </SaveBar>
      </div>
    </div>
  );
}

/** Site settings editor over the flat settings object, with section jump links. */
export function SettingsEditor({ sections, initial }: { sections: SectionSchema[]; initial: Values }) {
  const [value, setValue] = useState<Values>(initial);
  const [saved, setSaved] = useState<Values>(initial);
  const [pending, startTransition] = useTransition();
  const dirty = !sameJson(value, saved);

  const save = () => {
    if (pending) return;
    startTransition(async () => {
      const result = await saveSettings(value);
      toastResult(result);
      if (result.ok) setSaved(value);
    });
  };

  useSaveShortcut(save);
  useUnsavedChangesWarning(dirty && !pending);

  return (
    <div className="grid gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="hidden xl:block">
        <ul className="sticky top-[104px] space-y-0.5">
          {sections.map((section) => (
            <li key={section.key}>
              <a
                href={`#settings-${section.key}`}
                className="text-paper-muted hover:text-paper-ink block rounded-lg px-2 py-1.5 text-[12px] font-semibold hover:bg-white/60"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <div className="space-y-4">
          {sections.map((section) => (
            <section
              key={section.key}
              id={`settings-${section.key}`}
              className="scroll-mt-28 rounded-2xl border border-[var(--admin-border)] bg-white shadow-[0_1px_2px_rgba(7,19,27,0.04)]"
            >
              <header className="border-b border-black/[0.06] px-5 py-4">
                <h2 className="text-paper-ink text-[15px] font-bold">{section.label}</h2>
                {section.description ? (
                  <p className="text-paper-muted mt-0.5 text-[12px]">{section.description}</p>
                ) : null}
              </header>
              <div className="p-5">
                <SchemaFields fields={section.fields} idPrefix={section.key} value={value} onChange={setValue} />
              </div>
            </section>
          ))}
        </div>
        <SaveBar pending={pending} dirty={dirty} onSave={save} />
      </div>
    </div>
  );
}
