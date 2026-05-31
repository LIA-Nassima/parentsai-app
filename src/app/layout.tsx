import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({ subsets: ["latin"] });

// Métadonnées générales + PWA Apple
export const metadata: Metadata = {
  title: "ParentsAI",
  description: "Le professeur particulier IA pour vos enfants",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ParentsAI",
  },
  formatDetection: {
    telephone: false,
  },
};

// Viewport séparé (obligatoire depuis Next.js 14+)
export const viewport: Viewport = {
  themeColor: "#2e3b4e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} min-h-full bg-background`}>
        {/* Enregistrement du service worker PWA — composant invisible */}
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
