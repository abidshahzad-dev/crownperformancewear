"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * The wholesale "enquiry list": a shortlist of styles the buyer wants quoted.
 * Kept in localStorage (a per-visitor convenience); it is sent to the team through the quote form.
 */

export type EnquiryItem = {
  product_id: string;
  sku: string;
  name: string;
  slug: string;
  image?: string;
  moq: number;
  quantity: number;
};

type EnquiryContextValue = {
  items: EnquiryItem[];
  count: number;
  ready: boolean;
  has: (productId: string) => boolean;
  add: (item: Omit<EnquiryItem, "quantity"> & { quantity?: number }) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "cpw-enquiry-list";
const EnquiryContext = createContext<EnquiryContextValue | null>(null);

function readStorage(): EnquiryItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as EnquiryItem[]).filter((i) => i && typeof i.product_id === "string") : [];
  } catch {
    return [];
  }
}

function writeStorage(items: EnquiryItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode); the list still works for this page view.
  }
}

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydrate from storage after mount so server and client render the same markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setItems(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((next: (prev: EnquiryItem[]) => EnquiryItem[]) => {
    setItems((prev) => {
      const value = next(prev);
      writeStorage(value);
      return value;
    });
  }, []);

  const value = useMemo<EnquiryContextValue>(
    () => ({
      items,
      ready,
      count: items.length,
      has: (id) => items.some((i) => i.product_id === id),
      add: (item) =>
        update((prev) =>
          prev.some((i) => i.product_id === item.product_id)
            ? prev
            : [...prev, { ...item, quantity: item.quantity ?? item.moq }],
        ),
      remove: (id) => update((prev) => prev.filter((i) => i.product_id !== id)),
      setQuantity: (id, quantity) =>
        update((prev) => prev.map((i) => (i.product_id === id ? { ...i, quantity: Math.max(1, quantity) } : i))),
      clear: () => update(() => []),
    }),
    [items, ready, update],
  );

  return <EnquiryContext value={value}>{children}</EnquiryContext>;
}

export function useEnquiry(): EnquiryContextValue {
  const ctx = use(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside EnquiryProvider");
  return ctx;
}
