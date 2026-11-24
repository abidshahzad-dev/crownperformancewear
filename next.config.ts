import type { NextConfig } from "next";

type RemotePattern = { protocol: "https"; hostname: string };

/**
 * Remote image hosts. Product and page images live in S3 (or a CDN in front of it);
 * the dummy content uses Unsplash. Add your CDN host through NEXT_PUBLIC_S3_PUBLIC_URL.
 */
const remotePatterns: RemotePattern[] = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "**.amazonaws.com" },
  // Supabase Storage public objects (https://<ref>.supabase.co/storage/v1/object/public/...)
  { protocol: "https", hostname: "**.supabase.co" },
];

const publicBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || process.env.S3_URL;
if (publicBase) {
  try {
    const { hostname } = new URL(publicBase);
    if (!hostname.endsWith(".amazonaws.com")) remotePatterns.push({ protocol: "https", hostname });
  } catch {
    // Ignore a malformed URL here; the upload route reports it clearly at runtime.
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: { remotePatterns },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
