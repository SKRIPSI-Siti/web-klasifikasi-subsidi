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
  IconChartHistogram,
  IconDashboard,
  IconDatabase,
  IconReport,
  IconSettings,
  IconTransform,
  IconWand,
} from "@tabler/icons-react"

// Sidebar 7 menu, urut sesuai alur kerja Bab III (PRD Bagian 9).
const menu = [
  { title: "Dashboard", url: "/dashboard", icon: <IconDashboard /> },
  { title: "Dataset", url: "/dataset", icon: <IconDatabase /> },
  { title: "Preprocessing", url: "/preprocessing", icon: <IconTransform /> },
  { title: "Model", url: "/model/training", icon: <IconChartHistogram />, base: "/model" },
  { title: "Prediksi", url: "/prediksi", icon: <IconWand /> },
  { title: "Laporan", url: "/laporan", icon: <IconReport /> },
  { title: "Pengaturan", url: "/pengaturan", icon: <IconSettings /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => {
                const base = item.base ?? item.url
                const isActive = pathname === base || pathname.startsWith(`${base}/`)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: ADMIN_USER.nama, email: ADMIN_USER.email, avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}
