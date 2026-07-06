"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { LabelBadge } from "@/components/dataset-status-badge"
import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRupiah,
} from "@/lib/format"
import { IconDownload, IconMoodConfuzed } from "@tabler/icons-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { toast } from "sonner"

export default function LaporanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, hydrated } = useStore()
  const report = state.reports.find((r) => r.id === id)
  const prediction = state.predictions.find((p) => p.id === report?.prediction_id)
  const model = state.models.find((m) => m.id === report?.model_id)

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!report || !prediction) {
    return (
      <EmptyState
        icon={<IconMoodConfuzed />}
        title="Laporan tidak ditemukan"
        action={<Button render={<Link href="/laporan" />}>Ke Daftar Laporan</Button>}
      />
    )
  }

  const distData = [
    { name: "Layak", value: prediction.jumlah_layak },
    { name: "Tidak Layak", value: prediction.jumlah_tidak },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/laporan" />}>Laporan</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-96 truncate">{report.judul}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{report.judul}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(report.created_at)} · model: {model?.nama ?? "—"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => toast.info("Fitur akan tersedia pada fase integrasi.")}
        >
          <IconDownload />
          Export PDF
        </Button>
      </div>

      {model && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @4xl/main:grid-cols-4">
          <StatCard label="Accuracy" value={formatPercent(model.accuracy)} />
          <StatCard label="Precision" value={formatPercent(model.precision_)} />
          <StatCard label="Recall" value={formatPercent(model.recall)} />
          <StatCard label="F1-Score" value={formatPercent(model.f1_score)} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Hasil</CardTitle>
            <CardDescription>
              {formatNumber(prediction.hasil.length)} data diklasifikasi.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                Layak ({formatNumber(prediction.jumlah_layak)})
              </span>
              <span className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-destructive" />
                Tidak Layak ({formatNumber(prediction.jumlah_tidak)})
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hasil Klasifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pelanggan</TableHead>
                    <TableHead>Penghasilan</TableHead>
                    <TableHead>Daya</TableHead>
                    <TableHead>Hasil</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prediction.hasil.map((h) => (
                    <TableRow key={h.id_pelanggan}>
                      <TableCell className="font-mono text-xs">{h.id_pelanggan}</TableCell>
                      <TableCell>{formatRupiah(h.input.penghasilan)}</TableCell>
                      <TableCell>{h.input.daya_va}</TableCell>
                      <TableCell>
                        <LabelBadge label={h.label} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(h.confidence)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
