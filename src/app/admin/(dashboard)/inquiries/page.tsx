import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Segmented,
  Table,
  Td,
  Th,
  paginate,
} from "@/components/admin/ui";
import { inquiryStatusCounts, listInquiries } from "@/lib/data/admin";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { statusLabel, statusTone } from "./status";

export const metadata: Metadata = { title: "Inquiries" };

const TYPE_LABELS: Record<string, string> = {
  quote: "Quote",
  catalogue: "Catalogue",
  contact: "Contact",
  sample: "Sample",
};

export default async function InquiriesPage(props: PageProps<"/admin/inquiries">) {
  const params = await props.searchParams;
  const status = INQUIRY_STATUSES.find((s) => s === params.status) as InquiryStatus | undefined;
  const [inquiries, counts] = await Promise.all([listInquiries(status), inquiryStatusCounts()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const { rows, ...pageInfo } = paginate(inquiries, params.page);

  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Inquiries"
        description="Quote requests, catalogue requests and contact messages from the website. New leads are highlighted."
      />
      <div className="mb-3">
        <Segmented
          items={[
            { href: "/admin/inquiries", label: "All", count: total, active: !status },
            ...INQUIRY_STATUSES.map((s) => ({
              href: `/admin/inquiries?status=${s}`,
              label: statusLabel(s),
              count: counts[s] ?? 0,
              active: status === s,
            })),
          ]}
        />
      </div>
      <Card className="overflow-clip">
        {inquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={status ? `No ${statusLabel(status).toLowerCase()} inquiries` : "No inquiries yet"}
            text="New requests from the quote, contact and catalogue forms will appear in this list."
          />
        ) : (
          <Table minWidth={760}>
            <thead>
              <tr>
                <Th>From</Th>
                <Th>Type</Th>
                <Th>Request</Th>
                <Th>Status</Th>
                <Th>Received</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className={cn(q.status === "new" && "!bg-[#f8ffe9]")}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-bold uppercase",
                          q.status === "new" ? "bg-signal text-ink" : "text-paper-muted bg-black/[0.05]",
                        )}
                        aria-hidden
                      >
                        {(q.name || q.email).slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <Link href={`/admin/inquiries/${q.id}`} className="font-semibold hover:underline">
                          {q.name || q.email}
                        </Link>
                        <p className="text-paper-muted truncate text-[12px]">
                          {q.company ? `${q.company} · ` : ""}
                          {q.email}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Badge tone="gray" dot={false}>
                      {TYPE_LABELS[q.type] ?? q.type}
                    </Badge>
                  </Td>
                  <Td className="text-paper-muted max-w-[280px]">
                    <p className="line-clamp-1">
                      {q.items.length
                        ? `${q.items.length} style${q.items.length > 1 ? "s" : ""}: ${q.items.map((i) => i.name).join(", ")}`
                        : q.category || q.message || "—"}
                    </p>
                  </Td>
                  <Td>
                    <Badge tone={statusTone(q.status)}>{statusLabel(q.status)}</Badge>
                  </Td>
                  <Td className="text-paper-muted whitespace-nowrap">{formatDateTime(q.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {inquiries.length ? (
          <Pagination base="/admin/inquiries" params={params} noun="inquiries" {...pageInfo} />
        ) : null}
      </Card>
    </div>
  );
}
