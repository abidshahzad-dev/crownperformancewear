"use client";

import { ImageIcon, Link2, Loader2, RefreshCw, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { listMediaForPicker } from "@/app/admin/actions/media";
import type { Media } from "@/lib/types";
import { cn } from "@/lib/utils";
import { inputClass } from "./form-controls";
import { toast } from "./toaster";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "./upload";

type PickerItem = Pick<Media, "id" | "url" | "filename" | "alt">;

/** Library picker dialog with search. Calls `onPick` with the chosen URL. */
export function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
}) {
  const [items, setItems] = useState<PickerItem[] | null>(null);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      try {
        setItems(await listMediaForPicker());
      } catch {
        setItems([]);
        toast("Could not load the media library.", false);
      }
    });
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!items || !q) return items ?? [];
    return items.filter((i) => [i.filename, i.alt, i.url].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  if (!open) return null;

  return (
    <div
      className="admin-overlay fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Media library"
      onClick={onClose}
    >
      <div
        className="admin-pop flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-paper-ink text-[16px] font-bold">Media library</p>
            <p className="text-paper-muted text-[12px]">
              {items ? `${items.length} image${items.length === 1 ? "" : "s"}` : "Loading…"}
            </p>
          </div>
          <div className="relative hidden w-64 sm:block">
            <Search className="text-paper-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or alt text"
              className={cn(inputClass, "pl-9")}
              aria-label="Search media"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-paper-muted hover:text-paper-ink rounded-lg p-1.5 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="admin-scroll-light overflow-y-auto p-5">
          {pending || items === null ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="admin-skeleton aspect-square rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-paper-muted py-14 text-center text-[13px]">
              <ImageIcon className="mx-auto mb-3 size-8 opacity-40" />
              {items.length === 0 ? "No images yet. Upload one, or add files from Media library." : "No images match."}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item.url);
                    onClose();
                  }}
                  className="group hover:ring-signal hover:border-ink overflow-hidden rounded-xl border border-black/10 text-left transition hover:ring-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary media hosts */}
                  <img
                    src={item.url}
                    alt={item.alt ?? ""}
                    loading="lazy"
                    className="admin-checker aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="text-paper-muted block truncate px-2 py-1.5 text-[11px]">
                    {item.filename ?? "Image"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Image input: drag-and-drop or click to upload, choose from the library, or paste a URL.
 * Shows a preview with replace/remove and upload progress.
 */
export function ImageField({
  value,
  onChange,
  id,
  compact = false,
}: {
  value: string;
  onChange: (url: string) => void;
  id?: string;
  compact?: boolean;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const uploading = progress !== null;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setProgress(0);
    try {
      const { url } = await uploadImageFile(file, setProgress);
      onChange(url);
      toast("Image uploaded.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Upload failed.", false);
    } finally {
      setProgress(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (!uploading) setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (!uploading) void onFile(e.dataTransfer.files?.[0]);
    },
  };

  const smallButton =
    "inline-flex items-center gap-1.5 rounded-lg border border-black/[0.12] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-paper-ink transition hover:border-ink/40 disabled:opacity-60";

  const progressBar = uploading ? (
    <div className="absolute inset-x-3 bottom-3 overflow-hidden rounded-full bg-white/70">
      <div className="bg-signal h-1.5 transition-[width]" style={{ width: `${Math.round((progress ?? 0) * 100)}%` }} />
    </div>
  ) : null;

  return (
    <div>
      {value ? (
        <div className={cn("flex gap-3", compact ? "items-center" : "items-start")} {...dropHandlers}>
          <div
            className={cn(
              "admin-checker relative shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10 transition",
              compact ? "size-14" : "aspect-[4/3] w-40 sm:w-48",
              dragging && "ring-signal ring-2",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary image hosts */}
            <img src={value} alt="" className="size-full object-cover" />
            {uploading ? (
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                <Loader2 className="size-5 animate-spin text-white" />
              </div>
            ) : null}
            {progressBar}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-paper-muted truncate text-[12px]" title={value}>
              {value.split("/").pop()?.split("?")[0]}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={smallButton}
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                <RefreshCw className="size-3.5" /> Replace
              </button>
              <button type="button" className={smallButton} onClick={() => setPickerOpen(true)}>
                <ImageIcon className="size-3.5" /> Library
              </button>
              <button type="button" className={smallButton} onClick={() => setShowUrl((v) => !v)}>
                <Link2 className="size-3.5" /> URL
              </button>
              <button
                type="button"
                className={cn(smallButton, "text-red-700 hover:border-red-300 hover:bg-red-50")}
                onClick={() => onChange("")}
              >
                <Trash2 className="size-3.5" /> Remove
              </button>
            </div>
            {showUrl ? (
              <input
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://…"
                className={inputClass}
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
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
            {...dropHandlers}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition",
              compact ? "py-4" : "py-7",
              dragging
                ? "border-[#7fb800] bg-[#f6fde6]"
                : "hover:border-ink/30 border-black/[0.14] bg-[#fbfbf9] hover:bg-white",
            )}
            aria-label="Upload an image"
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 animate-spin text-[#5d9c00]" />
                <p className="text-paper-ink text-[13px] font-semibold">
                  Uploading… {Math.round((progress ?? 0) * 100)}%
                </p>
                {progressBar}
              </>
            ) : (
              <>
                <span className="grid size-10 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/[0.06]">
                  <UploadCloud className="size-5 text-[#4c6b12]" />
                </span>
                <p className="text-paper-ink text-[13px] font-semibold">
                  Drop an image here or <span className="underline underline-offset-2">browse</span>
                </p>
                {!compact ? (
                  <p className="text-paper-muted text-[11px]">JPG, PNG, WebP, AVIF or GIF · up to 10 MB</p>
                ) : null}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={smallButton} onClick={() => setPickerOpen(true)}>
              <ImageIcon className="size-3.5" /> Choose from library
            </button>
            <input
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="…or paste an image URL"
              className={cn(inputClass, "min-w-[200px] flex-1 py-1.5 text-[13px]")}
            />
          </div>
        </div>
      )}
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onChange} />
    </div>
  );
}
