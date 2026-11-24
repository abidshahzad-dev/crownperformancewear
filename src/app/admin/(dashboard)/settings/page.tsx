import type { Metadata } from "next";
import { SettingsEditor } from "@/components/admin/content-editors";
import { PageHeader } from "@/components/admin/ui";
import { DEFAULT_SETTINGS } from "@/lib/cms/defaults";
import { SETTINGS_SCHEMA } from "@/lib/cms/schema";
import { getSettingsData } from "@/lib/data/admin";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const saved = await getSettingsData();
  const initial = { ...DEFAULT_SETTINGS, ...saved } as Record<string, unknown>;
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Site settings"
        description="Brand, contact details, menus, footer, enquiry options and SEO defaults used across the whole site."
      />
      <SettingsEditor sections={SETTINGS_SCHEMA} initial={initial} />
    </div>
  );
}
