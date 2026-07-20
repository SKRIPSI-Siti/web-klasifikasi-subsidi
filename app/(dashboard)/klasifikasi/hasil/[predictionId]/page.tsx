"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { LabelBadge } from "@/components/dataset-status-badge"
import { EmptyState } from "@/components/empty-state"
import { StatCard } from "@/components/stat-card"
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
import { generateId, useStore } from "@/lib/data/store"
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRupiah,
} from "@/lib/format"
import {
  IconCircleCheck,
  IconDeviceFloppy,
  IconDownload,
  IconMoodConfuzed,
} from "@tabler/icons-react"
import { toast } from "sonner"

export default function HasilKlasifikasiPage() {
  const { predictionId } = useParams<{ predictionId: string }>()
  const { state, hydrated, dispatch, addActivity } = useStore()
  const prediction = state.predictions.find((p) => p.id === predictionId)

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!prediction) {
    return (
      <EmptyState
        icon={<IconMoodConfuzed />}
        title="Hasil klasifikasi tidak ditemukan"
        action={
          <Button render={<Link href="/klasifikasi" />}>
            Ke Riwayat Klasifikasi
          </Button>
        }
      />
    )
  }

  const saved = !!prediction.saved_report_id

  function saveToReport() {
    if (!prediction || saved) return
    const reportId = generateId("rpt")
    const judul = `Laporan Klasifikasi ${
      prediction.jenis === "batch" ? prediction.nama_file : "Manual"
    } — ${formatDateTime(prediction.created_at)}`
    dispatch({
      type: "addReport",
      report: {
        id: reportId,
        prediction_id: prediction.id,
        judul,
        created_at: new Date().toISOString(),
      },
    })
    addActivity("laporan", `${judul} disimpan`)
    toast.success("Hasil klasifikasi disimpan ke Laporan.")
  }

  const isManual = prediction.jenis === "manual"
  const single = prediction.hasil[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            Hasil Klasifikasi{" "}
            {isManual ? "Manual" : `Batch — ${prediction.nama_file}`}
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(prediction.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={saveToReport}
            disabled={saved}
            variant={saved ? "outline" : "default"}
          >
            {saved ? <IconCircleCheck /> : <IconDeviceFloppy />}
            {saved ? "Tersimpan ✔" : "Simpan ke Laporan"}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.info("Fitur akan tersedia pada fase integrasi.")
            }
          >
            <IconDownload />
            Export CSV
          </Button>
        </div>
      </div>

      {isManual && single ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10">
              <p
                className={
                  single.label === "Layak"
                    ? "text-4xl font-bold text-success"
                    : "text-4xl font-bold text-destructive"
                }
              >
                {single.label.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence:{" "}
                <span className="font-semibold">
                  {formatPercent(single.confidence)}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rekap Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {(
                    [
                      [
                        "Penghasilan / bulan",
                        formatRupiah(single.input.penghasilan),
                      ],
                      [
                        "Jumlah anggota keluarga",
                        String(single.input.jumlah_anggota),
                      ],
                      ["Pekerjaan kepala keluarga", single.input.pekerjaan],
                      ["Status rumah", single.input.status_rumah],
                      ["Luas bangunan", `${single.input.luas_bangunan} m²`],
                      ["Status bansos", single.input.status_bansos],
                      ["Daya terpasang", `${single.input.daya_va} VA`],
                      ["Golongan tarif", single.input.golongan_tarif],
                      [
                        "Pemakaian / bulan",
                        `${single.input.pemakaian_kwh} kWh`,
                      ],
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <TableRow key={k}>
                      <TableCell className="text-muted-foreground">
                        {k}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {v}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total data"
              value={formatNumber(prediction.hasil.length)}
            />
            <StatCard
              label="Layak"
              value={
                <span className="text-success">
                  {formatNumber(prediction.jumlah_layak)}
                </span>
              }
            />
            <StatCard
              label="Tidak Layak"
              value={
                <span className="text-destructive">
                  {formatNumber(prediction.jumlah_tidak)}
                </span>
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil per pelanggan</CardTitle>
              <CardDescription>
                Label dan tingkat keyakinan model untuk setiap baris data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-2xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pelanggan</TableHead>
                      <TableHead>Penghasilan</TableHead>
                      <TableHead>Daya</TableHead>
                      <TableHead>kWh/bln</TableHead>
                      <TableHead>Bansos</TableHead>
                      <TableHead>Hasil</TableHead>
                      <TableHead className="text-right">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prediction.hasil.map((h) => (
                      <TableRow key={h.id_pelanggan}>
                        <TableCell className="font-mono text-xs">
                          {h.id_pelanggan}
                        </TableCell>
                        <TableCell>
                          {formatRupiah(h.input.penghasilan)}
                        </TableCell>
                        <TableCell>{h.input.daya_va}</TableCell>
                        <TableCell>
                          {formatNumber(h.input.pemakaian_kwh)}
                        </TableCell>
                        <TableCell>{h.input.status_bansos}</TableCell>
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
        </>
      )}
    </div>
  )
}
