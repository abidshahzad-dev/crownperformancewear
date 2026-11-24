import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ProductWithCategory } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { AddToEnquiry } from "./add-to-enquiry";

export function ProductCard({ product, priority = false }: { product: ProductWithCategory; priority?: boolean }) {
  const image = product.images[0];
  const href = `/products/${product.slug}`;
  return (
    <article className="group flex flex-col">
      <Link href={href} className="relative block aspect-[4/4.3] overflow-hidden rounded-[18px] bg-white">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.is_new ? (
            <span className="bg-signal text-ink px-2 py-1 text-[10px] font-extrabold tracking-[0.1em] uppercase">
              New
            </span>
          ) : null}
          {product.is_featured ? (
            <span className="bg-ink/85 px-2 py-1 text-[10px] font-extrabold tracking-[0.1em] text-white uppercase">
              Best seller
            </span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <div className="text-muted flex items-center justify-between gap-3 text-[10px] font-extrabold tracking-[0.12em] uppercase">
          <span>{product.sku}</span>
          {product.category ? <span className="truncate">{product.category.name}</span> : null}
        </div>
        <h3 className="mt-2 text-[19px] leading-[1.15] font-bold tracking-[-0.02em] text-white">
          <Link href={href} className="hover:text-signal">
            {product.name}
          </Link>
        </h3>
        <p className="text-muted mt-2 line-clamp-2 text-[13px] leading-[1.55]">
          {product.fabric} · Sizes {product.sizes.join(", ")}
        </p>
        <div className="mt-3 mb-4 flex items-baseline gap-2 text-[13px]">
          <span className="text-muted">From</span>
          <span className="text-[17px] font-bold text-white">{formatPrice(product.price_from, product.currency)}</span>
          <span className="text-muted">· MOQ {product.moq}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
          <Link
            href={href}
            className="hover:text-signal inline-flex items-center gap-1.5 text-[12px] font-bold text-white"
          >
            View style <ArrowRight className="size-3.5" />
          </Link>
          <AddToEnquiry
            item={{
              product_id: product.id,
              sku: product.sku,
              name: product.name,
              slug: product.slug,
              image: image?.url,
              moq: product.moq,
            }}
          />
        </div>
      </div>
    </article>
  );
}
