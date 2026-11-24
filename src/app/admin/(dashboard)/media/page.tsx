import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { listMedia } from "@/lib/data/admin";
import { isS3Configured, missingS3Settings } from "@/lib/s3";
import { MediaLibrary } from "./media-library";

export const metadata: Metadata = { title: "Media" };

export default async function MediaPage() {
  const items = await listMedia();
  return (
    <div className="admin-fade-up">
      <PageHeader
        title="Media library"
        description="Images uploaded to your S3 bucket. Every image field in the dashboard can pick from this library."
      />
      <MediaLibrary items={items} s3Ready={isS3Configured()} s3Missing={missingS3Settings()} />
    </div>
  );
}
