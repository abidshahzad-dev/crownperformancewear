import type { CSSProperties } from "react";
import { cn, lines } from "@/lib/utils";

/**
 * Display title from newline-separated CMS text. Each line is wrapped as `.line > span` so it can be
 * revealed line by line (`reveal` prop, or automatically inside `.hero-copy`).
 */
export function DisplayTitle({
  title,
  as: Tag = "h2",
  className,
  reveal = true,
}: {
  title: unknown;
  as?: "h1" | "h2" | "h3";
  className?: string;
  reveal?: boolean;
}) {
  const parts = lines(title);
  return (
    <Tag className={cn("display", className)} data-reveal={reveal && Tag !== "h1" ? "lines" : undefined}>
      {parts.map((line, i) => (
        <span key={i} className="line" style={{ "--li": i } as CSSProperties}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!children) return null;
  return <p className={cn("eyebrow", className)}>{children}</p>;
}
