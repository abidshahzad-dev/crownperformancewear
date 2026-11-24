import type { Metadata } from "next";
import { Badge, Card, PageHeader, SetupNotice, Table, Td, Th } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { listProfiles } from "@/lib/data/admin";
import { supabaseServiceKey } from "@/lib/env";
import { formatDate } from "@/lib/utils";
import { CreateAdminForm, RoleButton } from "./users-client";

export const metadata: Metadata = { title: "Admin users" };

export default async function UsersPage() {
  const [{ user }, profiles] = await Promise.all([requireAdmin(), listProfiles()]);
  const canCreate = Boolean(supabaseServiceKey());
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Admin users"
        description="People who can sign in to this dashboard. Only admins can access it."
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="overflow-clip">
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Joined</Th>
                <Th className="text-right">Access</Th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          p.role === "admin"
                            ? "bg-signal text-ink grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-extrabold uppercase"
                            : "text-paper-muted grid size-9 shrink-0 place-items-center rounded-full bg-black/[0.06] text-[12px] font-bold uppercase"
                        }
                        aria-hidden
                      >
                        {(p.full_name || p.email).slice(0, 1)}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold">
                          {p.full_name || p.email}
                          {p.id === user.id ? <span className="text-paper-muted ml-1.5 text-[11px]">(you)</span> : null}
                        </p>
                        {p.full_name ? <p className="text-paper-muted text-[12px]">{p.email}</p> : null}
                      </div>
                    </div>
                  </Td>
                  <Td>{p.role === "admin" ? <Badge tone="lime">Admin</Badge> : <Badge>User</Badge>}</Td>
                  <Td className="text-paper-muted">{formatDate(p.created_at)}</Td>
                  <Td className="text-right">
                    <RoleButton userId={p.id} role={p.role} isSelf={p.id === user.id} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <div className="space-y-4">
          {canCreate ? null : (
            <SetupNotice title="Creating users needs the service key">
              <p>
                Add <code>SUPABASE_SECRET_KEY</code> (or <code>SUPABASE_SERVICE_ROLE_KEY</code>) to the server
                environment to create admins from here. You can still promote users who already have an account.
              </p>
            </SetupNotice>
          )}
          <Card title="Add an admin">
            <CreateAdminForm enabled={canCreate} />
          </Card>
        </div>
      </div>
    </div>
  );
}
