import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { asLink, str } from "@/lib/utils";
import { DisplayTitle } from "./section-heading";

/** Closing call-to-action band shared by inner pages. */
export function CtaBand({ s }: { s: Record<string, unknown> }) {
  const button = asLink(s.button) ?? { label: "Request a quote", href: "/quote" };
  return (
    <section className="bg-navy py-24 md:py-28">
      <div className="shell flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          {s.eyebrow ? <p className="eyebrow text-signal mb-5">{str(s.eyebrow)}</p> : null}
          <DisplayTitle title={s.title} className="display-lg max-w-[860px] text-white" />
          {s.text ? <p className="text-muted-2 mt-6 max-w-[520px] text-[15px] leading-[1.6]">{str(s.text)}</p> : null}
        </div>
        <Link href={button.href} className="btn btn-signal shrink-0 self-start lg:self-end">
          {button.label} <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
