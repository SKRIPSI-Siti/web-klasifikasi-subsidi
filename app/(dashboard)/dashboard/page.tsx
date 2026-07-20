"use client"

import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStore } from "@/lib/data/store"
import { formatDateTime, formatNumber } from "@/lib/format"
import type { ActivityKind } from "@/lib/types"
import { IconChartPie, IconWand, IconReport } from "@tabler/icons-react"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts"

const ACTIVITY_LABEL: Record<
  ActivityKind,
  { label: string; icon: React.ReactNode }
> = {
  prediksi: { label: "Klasifikasi", icon: <IconWand className="size-4" /> },
  laporan: { label: "Laporan", icon: <IconReport className="size-4" /> },
}

export default function DashboardPage() {
  const { state, hydrated } = useStore()

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @4xl/main:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  // Agregasi dihitung dari store — single source of truth (FR-F5)
  const totalDianalisis = state.predictions.reduce(
    (a, p) => a + p.hasil.length,
    0
  )
  const totalLayak = state.predictions.reduce((a, p) => a + p.jumlah_layak, 0)
  const totalTidak = state.predictions.reduce((a, p) => a + p.jumlah_tidak, 0)
  const recentActivities = [...state.activities]
    .filter((a) => a.jenis in ACTIVITY_LABEL)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  const empty = state.predictions.length === 0

  if (empty) {
    return (
      <EmptyState
        icon={<IconWand />}
        title="Belum ada aktivitas"
        description="Mulai dengan menjalankan klasifikasi kelayakan penerima subsidi."
        action={
          <Button render={<Link href="/klasifikasi/baru" />}>
            <IconWand />
            Jalankan Klasifikasi Baru
          </Button>
        }
      />
    )
  }

  const distData = [
    { name: "Layak", value: totalLayak },
    { name: "Tidak Layak", value: totalTidak },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Ringkasan Sistem</h2>
          <p className="text-sm text-muted-foreground">
            Kondisi terkini hasil klasifikasi kelayakan subsidi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button render={<Link href="/klasifikasi/baru" />}>
            <IconWand />
            Jalankan Klasifikasi Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @4xl/main:grid-cols-3">
        <StatCard
          label="Total Pelanggan Dianalisis"
          value={formatNumber(totalDianalisis)}
        />
        <StatCard
          label="Rasio Layak : Tidak Layak"
          value={
            totalDianalisis > 0 ? (
              <>
                <span className="text-success">{totalLayak}</span>
                {" : "}
                <span className="text-destructive">{totalTidak}</span>
              </>
            ) : (
              "—"
            )
          }
        />
        <StatCard
          label="Total Laporan Disimpan"
          value={formatNumber(state.reports.length)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Hasil Klasifikasi</CardTitle>
            <CardDescription>Akumulasi seluruh klasifikasi.</CardDescription>
          </CardHeader>
          <CardContent>
            {totalDianalisis === 0 ? (
              <EmptyState
                icon={<IconChartPie />}
                title="Belum ada hasil"
                description="Jalankan klasifikasi untuk melihat distribusi."
                className="border-0"
              />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={distData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      <Cell fill="var(--success)" />
                      <Cell fill="var(--destructive)" />
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        color: "var(--popover-foreground)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-success" />
                    Layak ({formatNumber(totalLayak)})
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-destructive" />
                    Tidak Layak ({formatNumber(totalTidak)})
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>5 aktivitas terakhir pada sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5">
                        {ACTIVITY_LABEL[a.jenis].icon}
                        {ACTIVITY_LABEL[a.jenis].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-96 truncate">
                      {a.deskripsi}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDateTime(a.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
