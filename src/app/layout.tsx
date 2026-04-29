import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Arctic Clinical",
    default: "Arctic Clinical - EMR & AI Management",
  },
  description: "Sistema Avanzado de Expediente Médico con Inteligencia Artificial Integrada. Optimiza tu clínica con Arctic Clinical.",
  openGraph: {
    title: "Arctic Clinical",
    description: "Gestión médica de próxima generación con IA.",
    url: "https://arctic-clinical.com",
    siteName: "Arctic Clinical",
    images: [
      {
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=630&fit=crop", // placeholder hero image
        width: 1200,
        height: 630,
        alt: "Arctic Clinical Dashboard",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arctic Clinical",
    description: "Gestión médica de próxima generación con IA.",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
