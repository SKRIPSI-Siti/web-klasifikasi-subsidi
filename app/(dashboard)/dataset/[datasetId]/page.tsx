"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { CustomerTable } from "@/components/customer-table"
import { DatasetStatusBadge } from "@/components/dataset-status-badge"
import { EmptyState } from "@/components/empty-state"
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
import { KOLOM_DATASET } from "@/lib/data/seed"
import { useStore } from "@/lib/data/store"
import { formatDate, formatNumber } from "@/lib/format"
import { IconArrowRight, IconDatabaseOff } from "@tabler/icons-react"

// Ringkasan kolom (tipe & missing) — placeholder statis sesuai FR-B5.
const COLUMN_SUMMARY: { kolom: string; tipe: string; missing: number }[] =
  KOLOM_DATASET.map((k) => ({
    kolom: k,
    tipe:
      k === "penghasilan" || k === "luas_bangunan" || k === "pemakaian_kwh"
        ? "number"
        : k === "jumlah_anggota"
          ? "integer"
          : "kategori",
    missing: k === "luas_bangunan" ? 12 : k === "penghasilan" ? 5 : 0,
  }))

export default function DatasetDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>()
  const { state, hydrated } = useStore()
  const dataset = state.datasets.find((d) => d.id === datasetId)

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!dataset) {
    return (
      <EmptyState
        icon={<IconDatabaseOff />}
        title="Dataset tidak ditemukan"
        description="Dataset mungkin sudah dihapus."
        action={
          <Button render={<Link href="/dataset" />}>Kembali ke Daftar Dataset</Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dataset" />}>Dataset</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{dataset.nama_file}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{dataset.nama_file}</h2>
          <p className="text-sm text-muted-foreground">
            {formatNumber(dataset.jumlah_baris)} baris × {dataset.jumlah_kolom} kolom ·
            diunggah {formatDate(dataset.uploaded_at)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DatasetStatusBadge status={dataset.status} />
          {dataset.status === "belum_diproses" ? (
            <Button render={<Link href={`/preprocessing/${dataset.id}`} />}>
              Lanjut ke Preprocessing
              <IconArrowRight />
            </Button>
          ) : (
            <Button
              variant="outline"
              render={<Link href={`/model/training?dataset=${dataset.id}`} />}
            >
              Latih Model
              <IconArrowRight />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Data pelanggan</CardTitle>
            <CardDescription>
              Sampel {dataset.rows.length} baris — 10 baris per halaman.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerTable rows={dataset.rows} />
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ringkasan kolom</CardTitle>
            <CardDescription>Tipe data & jumlah nilai kosong (missing).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kolom</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Missing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COLUMN_SUMMARY.map((c) => (
                  <TableRow key={c.kolom}>
                    <TableCell className="font-mono text-xs">{c.kolom}</TableCell>
                    <TableCell>{c.tipe}</TableCell>
                    <TableCell className="text-right">{c.missing}</TableCell>
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
