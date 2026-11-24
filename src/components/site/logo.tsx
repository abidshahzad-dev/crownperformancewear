import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Crown mark: a cream tile with a geometric crown, mirroring the square monogram style of the design. */
export function CrownMark({ className }: { className?: string }) {
  return (
    <span className={cn("text-ink grid size-11 shrink-0 place-items-center bg-[#f3eee3]", className)} aria-hidden>
      <svg viewBox="0 0 32 32" className="size-7" fill="none">
        <path d="M5 22.5 3.5 9.5l7.2 5.6L16 6.5l5.3 8.6 7.2-5.6L27 22.5H5Z" fill="currentColor" />
        <rect x="5" y="24.5" width="22" height="3" fill="currentColor" />
        <circle cx="3.5" cy="8.5" r="1.8" fill="currentColor" />
        <circle cx="16" cy="5" r="1.8" fill="currentColor" />
        <circle cx="28.5" cy="8.5" r="1.8" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Logo({
  name,
  logoUrl,
  className,
  href = "/",
}: {
  name: string;
  logoUrl?: string;
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3.5 text-[19px] font-extrabold tracking-[0.08em]", className)}
    >
      {logoUrl ? (
        <Image src={logoUrl} alt="" width={44} height={44} className="size-11 object-contain" />
      ) : (
        <CrownMark />
      )}
      <span className="leading-none">{name}</span>
    </Link>
  );
}
