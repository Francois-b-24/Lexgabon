import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { getSafeMetadataBase } from "@/lib/metadata-base";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSafeMetadataBase(),
  title: "LexGabon",
  description: "Droit gabonais · Ouvert · Structuré",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
