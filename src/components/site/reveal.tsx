import type { CSSProperties, ReactNode } from "react";

export type RevealEffect = "up" | "fade" | "clip" | "lines" | "stagger" | "grow";

/**
 * Marks content for a scroll-triggered entrance. MotionObserver (mounted once in the site layout) adds
 * `.is-visible` when it enters the viewport; the effect itself is pure CSS (see globals.css "Motion system").
 */
export function Reveal({
  children,
  className,
  delay = 0,
  effect = "up",
  as: Tag = "div",
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  effect?: RevealEffect;
  as?: "div" | "section" | "article" | "li" | "ul" | "ol" | "span";
  style?: CSSProperties;
}) {
  return (
    <Tag
      data-reveal={effect}
      className={className}
      style={delay ? ({ ...style, "--d": `${delay}ms` } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
