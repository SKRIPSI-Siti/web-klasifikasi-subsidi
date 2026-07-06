"use client"

import * as React from "react"

import { LabelBadge } from "@/components/dataset-status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatRupiah } from "@/lib/format"
import type { CustomerRow } from "@/lib/types"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

interface CustomerTableProps {
  rows: CustomerRow[]
  pageSize?: number
  /** Tampilkan kolom label (bila dataset berlabel). */
  showLabel?: boolean
}

/** Tabel data pelanggan paginated — dipakai detail dataset & preview (FR-B5). */
export function CustomerTable({ rows, pageSize = 10, showLabel = true }: CustomerTableProps) {
  const [page, setPage] = React.useState(0)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = rows.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Pelanggan</TableHead>
              <TableHead>Penghasilan</TableHead>
              <TableHead>Anggota</TableHead>
              <TableHead>Pekerjaan</TableHead>
              <TableHead>Rumah</TableHead>
              <TableHead>Luas (m²)</TableHead>
              <TableHead>Bansos</TableHead>
              <TableHead>Daya</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>kWh/bln</TableHead>
              {showLabel && <TableHead>Label</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {current.map((row) => (
              <TableRow key={row.id_pelanggan}>
                <TableCell className="font-mono text-xs">{row.id_pelanggan}</TableCell>
                <TableCell>{formatRupiah(row.penghasilan)}</TableCell>
                <TableCell>{row.jumlah_anggota}</TableCell>
                <TableCell>{row.pekerjaan}</TableCell>
                <TableCell>{row.status_rumah}</TableCell>
                <TableCell>{formatNumber(row.luas_bangunan)}</TableCell>
                <TableCell>{row.status_bansos}</TableCell>
                <TableCell>{row.daya_va}</TableCell>
                <TableCell>{row.golongan_tarif}</TableCell>
                <TableCell>{formatNumber(row.pemakaian_kwh)}</TableCell>
                {showLabel && (
                  <TableCell>{row.label ? <LabelBadge label={row.label} /> : "—"}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pageCount > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {page + 1} dari {pageCount} ({formatNumber(rows.length)} baris)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Halaman sebelumnya"
            >
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Halaman berikutnya"
            >
              <IconChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
