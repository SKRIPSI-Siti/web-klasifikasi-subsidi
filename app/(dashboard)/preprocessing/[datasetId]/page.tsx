"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { EmptyState } from "@/components/empty-state"
import { Stepper, type StepperStep } from "@/components/stepper"
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
import { useStore } from "@/lib/data/store"
import { formatNumber } from "@/lib/format"
import type { StepStatus } from "@/lib/types"
import {
  IconArrowRight,
  IconCircleCheck,
  IconDatabaseOff,
  IconPlayerPlay,
} from "@tabler/icons-react"

const STEPS = [
  {
    key: "cleaning",
    title: "Cleaning Data",
    description: "Menghapus duplikasi dan baris tidak valid.",
  },
  {
    key: "missing_value",
    title: "Handling Missing Value",
    description: "Mengisi/menghapus nilai kosong pada kolom numerik & kategori.",
  },
  {
    key: "encoding",
    title: "Encoding Kategori",
    description: "Mengubah fitur kategorikal menjadi representasi numerik.",
  },
  {
    key: "normalisasi",
    title: "Normalisasi",
    description: "Menskalakan fitur numerik ke rentang seragam.",
  },
  {
    key: "split",
    title: "Split Data (Train/Test 80:20)",
    description: "Membagi data latih dan data uji.",
  },
] as const

export default function PreprocessingDetailPage() {
  const { datasetId } = useParams<{ datasetId: string }>()
  const { state, hydrated, dispatch, addActivity } = useStore()
  const dataset = state.datasets.find((d) => d.id === datasetId)

  const [statuses, setStatuses] = React.useState<StepStatus[]>(
    Array(STEPS.length).fill("pending")
  )
  const [running, setRunning] = React.useState(false)
  const alreadyDone = dataset?.status === "sudah_preprocessing"
  const finished = alreadyDone || statuses.every((s) => s === "done")

  function run() {
    if (running || !dataset) return
    setRunning(true)
    STEPS.forEach((_, i) => {
      window.setTimeout(() => {
        setStatuses((prev) => prev.map((s, j) => (j === i ? "running" : s)))
      }, i * 1000)
      window.setTimeout(
        () => {
          setStatuses((prev) => prev.map((s, j) => (j === i ? "done" : s)))
          if (i === STEPS.length - 1) {
            setRunning(false)
            dispatch({
              type: "setDatasetStatus",
              id: dataset.id,
              status: "sudah_preprocessing",
            })
            addActivity("preprocessing", `Preprocessing ${dataset.nama_file} selesai`)
          }
        },
        i * 1000 + 950
      )
    })
  }

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
        action={<Button render={<Link href="/preprocessing" />}>Kembali</Button>}
      />
    )
  }

  // Ringkasan dummy konsisten dengan seed: 60% Layak : 40% Tidak Layak, ± 4% baris gugur
  const barisValid = Math.round(dataset.jumlah_baris * 0.96)
  const layak = Math.round(barisValid * 0.6)
  const tidakLayak = barisValid - layak

  const steps: StepperStep[] = STEPS.map((s, i) => ({
    ...s,
    status: alreadyDone ? "done" : statuses[i],
  }))

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/preprocessing" />}>
              Preprocessing
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{dataset.nama_file}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {finished && (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm">
          <IconCircleCheck className="size-5 shrink-0 text-success" />
          <p>
            Preprocessing selesai — dataset siap dilatih. Status dataset diperbarui menjadi{" "}
            <span className="font-medium">Sudah preprocessing</span>.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tahapan Preprocessing</CardTitle>
            <CardDescription>
              Lima langkah dijalankan berurutan sesuai perancangan Bab III.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Stepper steps={steps} />
            {!finished && (
              <Button onClick={run} disabled={running} className="w-fit">
                <IconPlayerPlay />
                {running ? "Sedang berjalan…" : "Jalankan Preprocessing"}
              </Button>
            )}
            {finished && (
              <Button
                className="w-fit"
                render={<Link href={`/model/training?dataset=${dataset.id}`} />}
              >
                Lanjut ke Training Model
                <IconArrowRight />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ringkasan Sebelum / Sesudah</CardTitle>
            <CardDescription>Perubahan data setelah preprocessing.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border p-4">
                <p className="text-muted-foreground">Total baris</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {formatNumber(dataset.jumlah_baris)}
                </p>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-muted-foreground">Baris valid</p>
                <p className="text-2xl font-semibold tabular-nums">
                  {finished ? formatNumber(barisValid) : "—"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground">Distribusi label</p>
              {finished ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0">Layak</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-success"
                        style={{ width: `${(layak / barisValid) * 100}%` }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums">
                      {formatNumber(layak)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0">Tidak Layak</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-destructive"
                        style={{ width: `${(tidakLayak / barisValid) * 100}%` }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums">
                      {formatNumber(tidakLayak)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Jalankan preprocessing untuk melihat distribusi.
                </p>
              )}
            </div>
            {finished && (
              <p className="text-xs text-muted-foreground">
                Data latih: {formatNumber(Math.round(barisValid * 0.8))} baris · Data uji:{" "}
                {formatNumber(barisValid - Math.round(barisValid * 0.8))} baris (80:20)
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
