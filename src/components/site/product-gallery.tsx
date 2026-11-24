"use client";

import Image from "next/image";
import { useState } from "react";
import type { ImageRef } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name, sku }: { images: ImageRef[]; name: string; sku: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <div className="lg:sticky lg:top-[120px]">
      <div className="overflow-hidden rounded-[22px] bg-white">
        <div className="relative aspect-square">
          {current ? (
            <Image
              src={current.url}
              alt={current.alt || name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="text-ink flex items-center justify-between gap-4 px-6 py-5">
          <p className="text-[20px] font-bold tracking-[-0.03em]">{name}</p>
          <p className="text-paper-muted shrink-0 text-[12px]">{sku}</p>
        </div>
      </div>
      {images.length > 1 ? (
        <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative size-20 shrink-0 overflow-hidden rounded-[10px] bg-white ring-2 transition",
                i === active ? "ring-signal" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
