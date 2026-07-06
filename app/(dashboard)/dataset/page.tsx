"use client"

import * as React from "react"
import Link from "next/link"

import { DatasetStatusBadge } from "@/components/dataset-status-badge"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
import { IconDatabase, IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

export default function DatasetPage() {
  const { state, hydrated, dispatch } = useStore()
  const [query, setQuery] = React.useState("")
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const datasets = state.datasets.filter((d) =>
    d.nama_file.toLowerCase().includes(query.toLowerCase())
  )
  const toDelete = state.datasets.find((d) => d.id === deleteId)

  function confirmDelete() {
    if (!toDelete) return
    dispatch({ type: "deleteDataset", id: toDelete.id })
    toast.success(`Dataset ${toDelete.nama_file} dihapus.`)
    setDeleteId(null)
  }

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
          <h2 className="text-xl font-semibold">Daftar Dataset</h2>
          <p className="text-sm text-muted-foreground">
            Kelola dataset pelanggan yang telah diimpor ke sistem.
          </p>
        </div>
        <Button render={<Link href="/dataset/upload" />}>
          <IconPlus />
          Upload Dataset Baru
        </Button>
      </div>

      {state.datasets.length > 0 && (
        <Input
          placeholder="Cari nama file…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      )}

      {datasets.length === 0 ? (
        <EmptyState
          icon={<IconDatabase />}
          title={
            state.datasets.length === 0
              ? "Belum ada dataset"
              : "Tidak ada dataset yang cocok"
          }
          description={
            state.datasets.length === 0
              ? "Mulai dengan mengunggah file CSV/XLSX data pelanggan."
              : "Coba kata kunci lain."
          }
          action={
            state.datasets.length === 0 ? (
              <Button render={<Link href="/dataset/upload" />}>
                <IconPlus />
                Upload Dataset Baru
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama file</TableHead>
                <TableHead>Tanggal upload</TableHead>
                <TableHead>Jumlah baris</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.nama_file}</TableCell>
                  <TableCell>{formatDate(d.uploaded_at)}</TableCell>
                  <TableCell>{formatNumber(d.jumlah_baris)}</TableCell>
                  <TableCell>
                    <DatasetStatusBadge status={d.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        render={<Link href={`/dataset/${d.id}`} />}
                      >
                        Lihat
                      </Button>
                      {d.status === "belum_diproses" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          render={<Link href={`/preprocessing/${d.id}`} />}
                        >
                          Preprocessing
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        aria-label={`Hapus ${d.nama_file}`}
                        onClick={() => setDeleteId(d.id)}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus dataset?</DialogTitle>
            <DialogDescription>
              Dataset <span className="font-medium">{toDelete?.nama_file}</span> akan
              dihapus dari daftar. Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              <IconTrash />
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
