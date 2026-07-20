import type { Metadata } from "next"
import { Geist_Mono, Space_Grotesk } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { StoreProvider } from "@/lib/data/store"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sistem Klasifikasi Subsidi Listrik — PLN Aceh",
  description:
    "Klasifikasi kelayakan penerima subsidi listrik rumah tangga pelanggan PLN Aceh menggunakan LightGBM",
}

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <StoreProvider>{children}</StoreProvider>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
