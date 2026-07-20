"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  IconDashboard,
  IconHistory,
  IconReport,
  IconWand,
} from "@tabler/icons-react"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  // Slot tengah: aksi utama (Klasifikasi Baru) — dirender terpisah di bawah
  {
    title: "Riwayat",
    url: "/klasifikasi",
    icon: IconHistory,
    exclude: ["/klasifikasi/baru"],
  },
  { title: "Laporan", url: "/laporan", icon: IconReport },
]

/** Floating bottom bar untuk mobile (<768px) — halaman inti + CTA Klasifikasi Baru di tengah. */
export function MobileNav() {
  const pathname = usePathname()

  const isActive = (url: string, exclude?: string[]) => {
    if (exclude?.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
      return false
    return pathname === url || pathname.startsWith(`${url}/`)
  }

  const renderItem = (item: (typeof items)[number]) => {
    const active = isActive(item.url, item.exclude)
    const Icon = item.icon
    return (
      <Link
        key={item.title}
        href={item.url}
        className={cn(
          "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition-colors",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="size-5" />
        <span className="truncate">{item.title}</span>
      </Link>
    )
  }

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-4 bottom-4 z-40 md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center gap-1 rounded-2xl border bg-popover/90 px-2 py-1 shadow-lg backdrop-blur supports-backdrop-filter:bg-popover/75">
        {items.slice(0, 2).map(renderItem)}

        {/* CTA utama: Klasifikasi Baru */}
        <Link
          href="/klasifikasi/baru"
          aria-label="Klasifikasi Baru"
          className={cn(
            "-mt-6 flex size-13 shrink-0 flex-col items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-md transition-transform active:scale-95",
            pathname.startsWith("/klasifikasi/baru") && "ring-3 ring-primary/30"
          )}
        >
          <IconWand className="size-6" />
        </Link>

        {items.slice(2).map(renderItem)}
      </div>
    </nav>
  )
}
