"use client";

import { Check, Copy, ImageIcon, Link2, Loader2, Search, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { deleteMedia, recordMedia, updateMediaAlt } from "@/app/admin/actions/media";
import { inputClass } from "@/components/admin/form-controls";
import { toast, toastResult } from "@/components/admin/toaster";
import { EmptyState, SetupNotice, secondaryButton } from "@/components/admin/ui";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "@/components/admin/upload";
import type { Media } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

function size(bytes: number | null) {
  if (!bytes) return "";
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function MediaLibrary({ items, s3Ready, s3Missing }: { items: Media[]; s3Ready: boolean; s3Missing: string[] }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.filename, i.alt, i.url].some((v) => v?.toLowerCase().includes(q)));
  }, [items, query]);

  const onFiles = async (files: FileList | null | undefined) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });
    let ok = 0;
    for (const file of list) {
      try {
        await uploadImageFile(file);
        ok++;
      } catch (error) {
        toast(error instanceof Error ? error.message : `${file.name}: upload failed`, false);
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    if (ok) toast(`${ok} image${ok > 1 ? "s" : ""} uploaded.`);
    setProgress(null);
    if (fileInput.current) fileInput.current.value = "";
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {s3Ready ? null : (
        <SetupNotice title="Image uploads are not set up yet">
          <p>Missing: {s3Missing.join(", ")}. You can still add images by URL below.</p>
        </SetupNotice>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !progress && fileInput.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !progress) {
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
            if (!progress) void onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center transition",
            dragging ? "border-[#7fb800] bg-[#f6fde6]" : "hover:border-ink/30 border-black/[0.14]",
          )}
          aria-label="Upload images"
        >
          {progress ? (
            <>
              <Loader2 className="size-8 animate-spin text-[#5d9c00]" />
              <p className="text-paper-ink text-[14px] font-bold">
                Uploading {Math.min(progress.done + 1, progress.total)} of {progress.total}…
              </p>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="bg-signal h-full transition-[width]"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-full bg-[#f1f4ec]">
                <UploadCloud className="size-6 text-[#4c6b12]" />
              </span>
              <p className="text-paper-ink text-[14px] font-bold">
                Drop images here or <span className="underline underline-offset-2">browse</span>
              </p>
              <p className="text-paper-muted text-[12px]">
                JPG, PNG, WebP, AVIF or GIF up to 10 MB each · select several
              </p>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
        </div>
        <div className="rounded-2xl border border-[var(--admin-border)] bg-white p-5">
          <p className="text-[14px] font-bold">Add an image by URL</p>
          <p className="text-paper-muted mt-1 text-[12px]">
            Keeps external images (for example a CDN) in your library.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              className={inputClass}
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="button"
              disabled={pending || !url}
              className={cn(secondaryButton, "shrink-0")}
              onClick={() =>
                startTransition(async () => {
                  const result = await recordMedia({ url, filename: url.split("/").pop()?.split("?")[0] ?? null });
                  toastResult(result);
                  if (result.ok) {
                    setUrl("");
                    router.refresh();
                  }
                })
              }
            >
              <Link2 className="size-4" /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-paper-muted text-[13px] font-semibold">
          {filtered.length} of {items.length} image{items.length === 1 ? "" : "s"}
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="text-paper-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or alt text"
            className={cn(inputClass, "pl-9")}
            aria-label="Search media"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[var(--admin-border)] bg-white">
          <EmptyState
            icon={ImageIcon}
            title="No images yet"
            text="Uploaded images appear here and can be picked from any image field."
          />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-paper-muted rounded-2xl border border-dashed border-black/15 bg-white px-6 py-10 text-center text-[13px]">
          No images match “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({ item }: { item: Media }) {
  const [alt, setAlt] = useState(item.alt ?? "");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  return (
    <div className="group overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white transition hover:shadow-[0_14px_30px_-22px_rgba(7,19,27,0.6)]">
      <div className="admin-checker relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary media hosts */}
        <img
          src={item.url}
          alt={item.alt ?? ""}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-x-2 top-2 flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg bg-white/95 shadow hover:bg-white"
            aria-label="Copy URL"
            title="Copy URL"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(item.url);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                toast("Could not copy. Select the URL manually.", false);
              }
            }}
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          </button>
          <button
            type="button"
            disabled={pending}
            className="grid size-8 place-items-center rounded-lg bg-white/95 text-red-700 shadow hover:bg-white"
            aria-label="Delete image"
            title="Delete"
            onClick={() => {
              if (!window.confirm("Delete this image? Pages that use its URL will show a broken image.")) return;
              startTransition(async () => toastResult(await deleteMedia(item.id)));
            }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <p className="truncate text-[12px] font-semibold" title={item.filename ?? item.url}>
          {item.filename ?? "Image"}
        </p>
        <p className="text-paper-muted text-[11px]">
          {formatDate(item.created_at)} {item.size_bytes ? `· ${size(item.size_bytes)}` : ""}
        </p>
        <input
          className={`${inputClass} py-1.5 text-[12px]`}
          placeholder="Alt text"
          aria-label={`Alt text for ${item.filename ?? "image"}`}
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => {
            if (alt !== (item.alt ?? "")) startTransition(async () => toastResult(await updateMediaAlt(item.id, alt)));
          }}
        />
      </div>
    </div>
  );
}
