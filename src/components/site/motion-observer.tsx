"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One observer for the whole site:
 * - adds `.is-visible` to `[data-reveal]` elements as they scroll into view (once),
 * - moves `[data-parallax="<speed>"]` layers relative to the viewport centre,
 * - drives `[data-hscroll]` sections: vertical scroll moves their `[data-hscroll-track]` sideways.
 * Content streamed in later (Suspense) is picked up through a MutationObserver.
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("motion-ready");

    // Elements hidden by clip-path or scaleX(0) report no intersection, so those are watched through their
    // parent; `watchers` maps each observed element to the reveal targets it unlocks.
    const watchers = new Map<Element, Set<HTMLElement>>();
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal anything already above the viewport (reload mid-page, anchor jumps).
          if (!entry.isIntersecting && entry.boundingClientRect.bottom > 0) continue;
          for (const target of watchers.get(entry.target) ?? []) target.classList.add("is-visible");
          watchers.delete(entry.target);
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );

    const parallaxLayers = new Set<HTMLElement>();
    const tracks = new Set<HTMLElement>();
    const queued = new WeakSet<HTMLElement>();

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)").forEach((el) => {
        if (reduced) {
          el.classList.add("is-visible");
          return;
        }
        if (queued.has(el)) return;
        queued.add(el);
        const effect = el.dataset.reveal;
        const watched = (effect === "clip" || effect === "grow") && el.parentElement ? el.parentElement : el;
        const set = watchers.get(watched) ?? new Set<HTMLElement>();
        set.add(el);
        watchers.set(watched, set);
        reveal.observe(watched);
      });
      if (!reduced) {
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => parallaxLayers.add(el));
        document.querySelectorAll<HTMLElement>("[data-hscroll]").forEach((el) => tracks.add(el));
      }
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of parallaxLayers) {
        if (!el.isConnected) {
          parallaxLayers.delete(el);
          continue;
        }
        const box = (el.parentElement ?? el).getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) continue;
        const speed = Number(el.dataset.parallax) || 0.12;
        const offset = (box.top + box.height / 2 - vh / 2) * -speed;
        el.style.setProperty("--parallax", `${offset.toFixed(1)}px`);
      }
      for (const section of tracks) {
        if (!section.isConnected) {
          tracks.delete(section);
          continue;
        }
        const track = section.querySelector<HTMLElement>("[data-hscroll-track]");
        if (!track) continue;
        if (window.innerWidth < 1024) {
          track.style.removeProperty("--hx");
          section.style.removeProperty("height");
          continue;
        }
        // How far the cards run past the right edge of the viewport (ignoring the current shift).
        const transform = getComputedStyle(track).transform;
        const shift = transform && transform !== "none" ? new DOMMatrixReadOnly(transform).m41 : 0;
        if (!transform || transform === "none") {
          // The pinned layout is not active (CSS not applied); leave the native horizontal scroll alone.
          section.style.removeProperty("height");
          continue;
        }
        const naturalLeft = track.getBoundingClientRect().left - shift;
        const overflow = Math.max(0, naturalLeft + track.scrollWidth - (window.innerWidth - 40));
        // One pixel of vertical scroll moves the cards one pixel sideways.
        const height = `${Math.round(vh + overflow)}px`;
        if (section.style.height !== height) section.style.height = height;
        const box = section.getBoundingClientRect();
        const distance = box.height - vh;
        const progress = distance > 0 ? Math.min(1, Math.max(0, -box.top / distance)) : 0;
        const next = -overflow * progress;
        track.style.setProperty("--hx", `${next.toFixed(1)}px`);
      }
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    scan();
    request();
    const mutations = new MutationObserver(() => {
      scan();
      request();
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);

    return () => {
      reveal.disconnect();
      mutations.disconnect();
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
