"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ADMIN_USER } from "@/lib/data/seed"
import {
  IconBolt,
  IconDashboard,
  IconHistory,
  IconReport,
  IconSettings,
  IconWand,
} from "@tabler/icons-react"

interface MenuItem {
  title: string
  url: string
  icon: React.ReactNode
  /** Prefix path untuk highlight aktif (default: url). */
  base?: string
  /** Path yang dikecualikan dari highlight (untuk pemisahan riwayat vs baru). */
  exclude?: string[]
}

// Item aktif selalu ditandai warna biru (primary), terlepas dari jenis item-nya.
const ACTIVE_ITEM_CLASSNAME =
  "data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary/90 data-active:hover:text-primary-foreground"

const navItems: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: <IconDashboard /> },
  {
    title: "Riwayat Klasifikasi",
    url: "/klasifikasi",
    icon: <IconHistory />,
    exclude: ["/klasifikasi/baru"],
  },
  { title: "Laporan", url: "/laporan", icon: <IconReport /> },
  { title: "Pengaturan", url: "/pengaturan", icon: <IconSettings /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isItemActive = (item: MenuItem) => {
    const base = item.base ?? item.url
    if (
      item.exclude?.some((p) => pathname === p || pathname.startsWith(`${p}/`))
    )
      return false
    return pathname === base || pathname.startsWith(`${base}/`)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <IconBolt className="size-5!" />
              <span className="text-base font-semibold">SmartVolt</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Dashboard"
                  isActive={isItemActive(navItems[0])}
                  className={ACTIVE_ITEM_CLASSNAME}
                  render={<Link href={navItems[0].url} />}
                >
                  {navItems[0].icon}
                  <span>{navItems[0].title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Aksi utama aplikasi: jalankan klasifikasi baru */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Klasifikasi Baru"
                  isActive={pathname.startsWith("/klasifikasi/baru")}
                  className={ACTIVE_ITEM_CLASSNAME}
                  render={<Link href="/klasifikasi/baru" />}
                >
                  <IconWand />
                  <span className="font-medium">Klasifikasi Baru</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {navItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isItemActive(item)}
                    className={ACTIVE_ITEM_CLASSNAME}
                    render={<Link href={item.url} />}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{ name: ADMIN_USER.nama, email: ADMIN_USER.email, avatar: "" }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
