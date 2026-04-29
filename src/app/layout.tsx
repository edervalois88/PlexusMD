import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | PlexusMD",
    default: "PlexusMD - Inteligencia Clínica",
  },
  description: "Inteligencia clínica y expediente médico multi-tenant para consultorios modernos.",
  openGraph: {
    title: "PlexusMD - Inteligencia Clínica",
    description: "Gestión médica multi-tenant con IA.",
    url: "https://plexusmd.xyz",
    siteName: "PlexusMD",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop", // placeholder hero image
        width: 1200,
        height: 630,
        alt: "PlexusMD Dashboard",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlexusMD - Inteligencia Clínica",
    description: "Gestión médica multi-tenant con IA.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
