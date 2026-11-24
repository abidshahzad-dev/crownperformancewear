import type { Metadata } from "next";
import { Toaster } from "@/components/admin/toaster";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Crown Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-root text-paper-ink min-h-screen font-sans">
      {children}
      <Toaster />
    </div>
  );
}
