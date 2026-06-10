import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Dancing_Script } from "next/font/google"
import "./globals.css"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
})

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-dancing",
  display: "swap",
})

export const metadata: Metadata = {
  title: "IAlla",
  description: "allez, on révise — le prof IA pour vos enfants",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IAlla",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#2E7D6B",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${plusJakartaSans.variable} ${dancingScript.variable} font-sans min-h-full bg-background`}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}
