"use client"

import * as React from "react"
import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatDate, formatNumber } from "@/lib/format"
import { IconReport } from "@tabler/icons-react"

export default function LaporanPage() {
  const { state, hydrated } = useStore()
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  const reports = state.reports.filter((r) => {
    const t = new Date(r.created_at).getTime()
    if (dateFrom && t < new Date(dateFrom).getTime()) return false
    if (dateTo && t > new Date(dateTo).getTime() + 24 * 60 * 60 * 1000)
      return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          Hasil klasifikasi yang telah disimpan sebagai laporan.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="from">Dari tanggal</Label>
          <Input
            id="from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="to">Sampai tanggal</Label>
          <Input
            id="to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        {(dateFrom || dateTo) && (
          <Button
            variant="ghost"
            onClick={() => {
              setDateFrom("")
              setDateTo("")
            }}
          >
            Reset filter
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<IconReport />}
          title={
            state.reports.length === 0
              ? "Belum ada laporan"
              : "Tidak ada laporan yang cocok"
          }
          description={
            state.reports.length === 0
              ? "Simpan hasil klasifikasi sebagai laporan dari halaman Hasil Klasifikasi."
              : "Ubah rentang tanggal."
          }
          action={
            state.reports.length === 0 ? (
              <Button render={<Link href="/klasifikasi" />}>
                Ke Klasifikasi
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jumlah data</TableHead>
                <TableHead>Ringkasan hasil</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => {
                const prediction = state.predictions.find(
                  (p) => p.id === r.prediction_id
                )
                return (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-72 truncate font-medium">
                      {r.judul}
                    </TableCell>
                    <TableCell>{formatDate(r.created_at)}</TableCell>
                    <TableCell>
                      {prediction ? formatNumber(prediction.hasil.length) : "—"}
                    </TableCell>
                    <TableCell>
                      {prediction ? (
                        <>
                          <span className="text-success">
                            {prediction.jumlah_layak} Layak
                          </span>
                          {" / "}
                          <span className="text-destructive">
                            {prediction.jumlah_tidak} Tidak Layak
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/laporan/${r.id}`} />}
                      >
                        Lihat Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
