import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renders admin-authored Markdown. Raw HTML is not rendered, so content cannot inject scripts. */
export function Markdown({
  children,
  className,
  dark = false,
}: {
  children: string | null;
  className?: string;
  dark?: boolean;
}) {
  if (!children) return null;
  return (
    <div className={cn("prose-crown", dark && "prose-dark", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: content }) =>
            href && href.startsWith("/") ? (
              <Link href={href}>{content}</Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer">
                {content}
              </a>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
