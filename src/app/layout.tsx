import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Crown Performance Wear | Wholesale Activewear & Sportswear",
    template: "%s | Crown Performance Wear",
  },
  description:
    "Wholesale performance wear for teams, gyms and retailers. Tiered bulk pricing, private label and custom branding.",
};

export const viewport: Viewport = {
  themeColor: "#07121c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${archivoBlack.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
