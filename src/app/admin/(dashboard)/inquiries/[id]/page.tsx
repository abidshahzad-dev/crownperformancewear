import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Card, PageHeader, Table, Td, Th } from "@/components/admin/ui";
import { getInquiryById } from "@/lib/data/admin";
import { formatDateTime, whatsappHref } from "@/lib/utils";
import { statusLabel, statusTone } from "../status";
import { InquiryEditor } from "./inquiry-editor";

export const metadata: Metadata = { title: "Inquiry" };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === "") return null;
  return (
    <div className="grid grid-cols-[130px_1fr] gap-3 border-b border-black/[0.05] py-2.5 text-[13px] last:border-0">
      <dt className="text-paper-muted font-semibold">{label}</dt>
      <dd className="text-paper-ink min-w-0 break-words">{value}</dd>
    </div>
  );
}

export default async function InquiryPage(props: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const inquiry = await getInquiryById(id);
  if (!inquiry) notFound();

  const reply = `mailto:${inquiry.email}?subject=${encodeURIComponent("Your Crown Performance Wear wholesale request")}`;

  return (
    <div className="admin-fade-up">
      <PageHeader
        title={inquiry.name || inquiry.email}
        description={
          <span className="inline-flex items-center gap-2">
            <Badge tone={statusTone(inquiry.status)}>{statusLabel(inquiry.status)}</Badge>
            <span className="capitalize">{inquiry.type} request</span> · {formatDateTime(inquiry.created_at)}
          </span>
        }
        back={{ href: "/admin/inquiries", label: "Inquiries" }}
        actions={
          <>
            <a
              href={reply}
              className="bg-ink hover:bg-ink-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mail className="size-4" /> Reply by email
            </a>
            {inquiry.phone ? (
              <a
                href={whatsappHref(inquiry.phone)}
                target="_blank"
                rel="noreferrer"
                className="text-paper-ink hover:border-ink/40 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border-strong)] bg-white px-4 text-[13px] font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            ) : null}
          </>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card title="Contact">
            <dl>
              <Row label="Name" value={inquiry.name} />
              <Row
                label="Email"
                value={
                  <a href={`mailto:${inquiry.email}`} className="underline">
                    {inquiry.email}
                  </a>
                }
              />
              <Row
                label="Phone"
                value={
                  inquiry.phone ? (
                    <a href={`tel:${inquiry.phone}`} className="inline-flex items-center gap-1 underline">
                      <Phone className="size-3.5" /> {inquiry.phone}
                    </a>
                  ) : null
                }
              />
              <Row label="Company" value={inquiry.company} />
              <Row label="Country" value={inquiry.country} />
              <Row label="Category" value={inquiry.category} />
              <Row label="Quantity" value={inquiry.quantity} />
              <Row label="Sent from" value={inquiry.source_page} />
            </dl>
          </Card>
          <Card title="Message">
            <p className="text-paper-ink text-[14px] leading-relaxed whitespace-pre-wrap">
              {inquiry.message || "No message."}
            </p>
          </Card>
          {inquiry.items.length ? (
            <Card title={`Requested styles (${inquiry.items.length})`} className="overflow-clip">
              <div className="-m-5">
                <Table>
                  <thead>
                    <tr>
                      <Th>Style</Th>
                      <Th>SKU</Th>
                      <Th className="text-right">Quantity</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiry.items.map((item, i) => (
                      <tr key={`${item.sku}-${i}`}>
                        <Td className="font-semibold">{item.name}</Td>
                        <Td className="text-paper-muted">{item.sku ?? "—"}</Td>
                        <Td className="text-right">{item.quantity ?? "—"}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          ) : null}
        </div>
        <Card title="Manage">
          <InquiryEditor id={inquiry.id} status={inquiry.status} notes={inquiry.admin_notes ?? ""} />
        </Card>
      </div>
    </div>
  );
}
