import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { getSafeMetadataBase } from "@/lib/metadata-base";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: "LexGabon",
  description: "Droit gabonais · Ouvert · Structuré",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-dvh min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
