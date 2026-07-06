"use client"

import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { IconPlus, IconWand } from "@tabler/icons-react"

export default function PrediksiPage() {
  const { state, hydrated } = useStore()

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Riwayat Prediksi</h2>
          <p className="text-sm text-muted-foreground">
            Semua prediksi klasifikasi yang pernah dijalankan.
          </p>
        </div>
        <Button render={<Link href="/prediksi/baru" />}>
          <IconPlus />
          Prediksi Baru
        </Button>
      </div>

      {state.predictions.length === 0 ? (
        <EmptyState
          icon={<IconWand />}
          title="Belum ada prediksi"
          description="Jalankan prediksi pertama menggunakan model aktif."
          action={
            <Button render={<Link href="/prediksi/baru" />}>
              <IconPlus />
              Prediksi Baru
            </Button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Jumlah data</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Ringkasan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.predictions.map((p) => {
                const model = state.models.find((m) => m.id === p.model_id)
                return (
                  <TableRow key={p.id}>
                    <TableCell>{formatDateTime(p.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant={p.jenis === "batch" ? "secondary" : "outline"}>
                        {p.jenis === "batch" ? "Batch" : "Manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNumber(p.hasil.length)}</TableCell>
                    <TableCell className="max-w-48 truncate">
                      {model?.nama ?? p.model_id}
                    </TableCell>
                    <TableCell>
                      <span className="text-success">{p.jumlah_layak} Layak</span>
                      {" / "}
                      <span className="text-destructive">{p.jumlah_tidak} Tidak Layak</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/prediksi/hasil/${p.id}`} />}
                      >
                        Lihat
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
