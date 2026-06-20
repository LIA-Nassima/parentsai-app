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
  metadataBase: new URL("https://app.parentsai.eu"),
  title: "IAla — le professeur particulier IA pour le collège",
  description:
    "IAla transforme l'IA en professeur particulier pour votre collégien : exercices, devoirs surveillés et brevets blancs calés sur son programme. Votre enfant révise sur son téléphone, vous suivez ses progrès.",
  keywords: ["soutien scolaire", "collège", "révisions", "brevet", "devoir surveillé", "IA", "professeur particulier"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IAla",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "IAla — le professeur particulier IA",
    description: "Un prof IA par matière pour réviser, s'entraîner et préparer ses contrôles. Allez, on révise !",
    url: "https://app.parentsai.eu",
    siteName: "IAla",
    locale: "fr_FR",
    type: "website",
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
