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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ADMIN_USER } from "@/lib/data/seed"
import {
  IconBolt,
  IconChartHistogram,
  IconDashboard,
  IconDatabase,
  IconHistory,
  IconReport,
  IconSettings,
  IconTransform,
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

// Dikelompokkan per fokus; fitur utama (klasifikasi) di atas.
const groups: { label: string; items: MenuItem[] }[] = [
  {
    label: "Klasifikasi",
    items: [
      {
        title: "Riwayat Prediksi",
        url: "/prediksi",
        icon: <IconHistory />,
        exclude: ["/prediksi/baru"],
      },
      { title: "Laporan", url: "/laporan", icon: <IconReport /> },
    ],
  },
  {
    label: "Data & Model",
    items: [
      { title: "Dataset", url: "/dataset", icon: <IconDatabase /> },
      { title: "Preprocessing", url: "/preprocessing", icon: <IconTransform /> },
      {
        title: "Model",
        url: "/model/training",
        icon: <IconChartHistogram />,
        base: "/model",
      },
    ],
  },
  {
    label: "Sistem",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: <IconDashboard /> },
      { title: "Pengaturan", url: "/pengaturan", icon: <IconSettings /> },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const isItemActive = (item: MenuItem) => {
    const base = item.base ?? item.url
    if (item.exclude?.some((p) => pathname === p || pathname.startsWith(`${p}/`)))
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
              <span className="text-base font-semibold">Klasifikasi Subsidi</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Aksi utama aplikasi: jalankan prediksi/klasifikasi baru */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Prediksi Baru"
                  isActive={pathname.startsWith("/prediksi/baru")}
                  className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  render={<Link href="/prediksi/baru" />}
                >
                  <IconWand />
                  <span className="font-medium">Prediksi Baru</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isItemActive(item)}
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
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: ADMIN_USER.nama, email: ADMIN_USER.email, avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
