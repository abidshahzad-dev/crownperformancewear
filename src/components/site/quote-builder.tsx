"use client";

import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import { useEnquiry, type EnquiryItem } from "./enquiry-list";
import { InquiryForm } from "./inquiry-form";

type Props = {
  categories: string[];
  pendingAdd: Omit<EnquiryItem, "quantity"> | null;
  empty: { eyebrow: string; title: string; text: string; link: { label: string; href: string } | null };
};

/** Enquiry list editor plus the quote request form that submits the list. */
export function QuoteBuilder({ categories, pendingAdd, empty }: Props) {
  const { items, ready, add, remove, setQuantity, clear } = useEnquiry();
  const added = useRef(false);

  // `/quote?add=<slug>` from a product page adds that style once.
  useEffect(() => {
    if (ready && pendingAdd && !added.current) {
      added.current = true;
      add(pendingAdd);
    }
  }, [ready, pendingAdd, add]);

  const onSuccess = useCallback(() => clear(), [clear]);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
      <div>
        {!ready ? (
          <div className="h-40 animate-pulse rounded-md bg-white/5" />
        ) : items.length ? (
          <ul className="border-t border-white/10">
            {items.map((item) => (
              <li
                key={item.product_id}
                className="grid grid-cols-[72px_1fr] gap-4 border-b border-white/10 py-5 sm:grid-cols-[88px_1fr_auto] sm:items-center"
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative aspect-square overflow-hidden rounded-[10px] bg-white"
                >
                  {item.image ? <Image src={item.image} alt="" fill sizes="88px" className="object-cover" /> : null}
                </Link>
                <div>
                  <p className="text-muted text-[10px] font-extrabold tracking-[0.12em] uppercase">{item.sku}</p>
                  <Link
                    href={`/products/${item.slug}`}
                    className="hover:text-signal mt-1 block text-[17px] font-bold text-white"
                  >
                    {item.name}
                  </Link>
                  <p className="text-muted mt-1 text-[12px]">MOQ {item.moq} pieces · mixed sizes</p>
                </div>
                <div className="col-start-2 flex items-center gap-3 sm:col-start-auto">
                  <div className="flex items-center border border-white/15">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="grid size-10 place-items-center text-white hover:bg-white/10"
                      onClick={() => setQuantity(item.product_id, item.quantity - 10)}
                    >
                      <Minus className="size-4" />
                    </button>
                    <input
                      aria-label={`Quantity for ${item.name}`}
                      inputMode="numeric"
                      value={item.quantity}
                      onChange={(e) => setQuantity(item.product_id, Number(e.target.value.replace(/\D/g, "")) || 1)}
                      className="h-10 w-20 bg-transparent text-center text-[14px] font-bold text-white outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="grid size-10 place-items-center text-white hover:bg-white/10"
                      onClick={() => setQuantity(item.product_id, item.quantity + 10)}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => remove(item.product_id)}
                    className="text-muted grid size-10 place-items-center hover:text-white"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {item.quantity < item.moq ? (
                  <p className="col-span-full text-[12px] font-semibold text-[#ffcf5c]">
                    Below the {item.moq}-piece minimum. We&apos;ll suggest options in your quote.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-white/10 p-8">
            <p className="eyebrow text-signal">{empty.eyebrow}</p>
            <p className="mt-3 text-[26px] font-bold tracking-[-0.04em] text-white">{empty.title}</p>
            <p className="text-muted mt-3 max-w-[520px] text-[14px] leading-[1.6]">{empty.text}</p>
            {empty.link ? (
              <Link href={empty.link.href} className="btn btn-signal mt-6">
                {empty.link.label} <ArrowRight className="size-4" />
              </Link>
            ) : null}
          </div>
        )}
        {ready && items.length ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link href="/products" className="text-link hover:text-signal text-white">
              Add more styles <ArrowRight className="size-4" />
            </Link>
            <p className="text-muted text-[13px]">
              {items.length} {items.length === 1 ? "style" : "styles"} ·{" "}
              {items.reduce((n, i) => n + i.quantity, 0).toLocaleString()} pieces
            </p>
          </div>
        ) : null}
      </div>

      <div className="lg:sticky lg:top-[120px] lg:self-start">
        <InquiryForm
          type="quote"
          variant="full"
          categories={categories}
          submitLabel={
            items.length
              ? `Request quote for ${items.length} ${items.length === 1 ? "style" : "styles"}`
              : "Send request"
          }
          items={items.map((i) => ({ product_id: i.product_id, sku: i.sku, name: i.name, quantity: i.quantity }))}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}
