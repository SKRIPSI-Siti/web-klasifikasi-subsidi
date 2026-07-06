"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { generateId, useStore } from "@/lib/data/store"
import { formatNumber } from "@/lib/format"
import type { LightGBMParams } from "@/lib/types"
import { IconHelpCircle, IconPlayerPlay, IconTransform } from "@tabler/icons-react"

interface ParamField {
  key: keyof LightGBMParams
  label: string
  hint: string
  min: number
  max: number
  step: number
  default: number
}

const PARAMS: ParamField[] = [
  {
    key: "num_leaves",
    label: "num_leaves",
    hint: "Jumlah maksimum daun per pohon. Nilai besar = model lebih kompleks. Rentang 2–256.",
    min: 2,
    max: 256,
    step: 1,
    default: 31,
  },
  {
    key: "learning_rate",
    label: "learning_rate",
    hint: "Laju pembelajaran tiap iterasi boosting. Rentang 0.001–1.",
    min: 0.001,
    max: 1,
    step: 0.001,
    default: 0.1,
  },
  {
    key: "n_estimators",
    label: "n_estimators",
    hint: "Jumlah pohon (iterasi boosting). Rentang 10–1000.",
    min: 10,
    max: 1000,
    step: 1,
    default: 100,
  },
  {
    key: "max_depth",
    label: "max_depth",
    hint: "Kedalaman maksimum pohon. -1 berarti tanpa batas. Rentang -1 s.d. 32.",
    min: -1,
    max: 32,
    step: 1,
    default: -1,
  },
]

export default function TrainingConfigPage() {
  return (
    <React.Suspense fallback={<Skeleton className="h-64 w-full max-w-2xl rounded-2xl" />}>
      <TrainingConfig />
    </React.Suspense>
  )
}

function TrainingConfig() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, hydrated, dispatch } = useStore()

  const readyDatasets = state.datasets.filter((d) => d.status === "sudah_preprocessing")
  const presetDataset = searchParams.get("dataset")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // Dataset terpilih: pilihan user menang; jika belum memilih, pakai ?dataset= dari URL.
  const datasetId =
    selectedId ??
    (presetDataset && readyDatasets.some((d) => d.id === presetDataset)
      ? presetDataset
      : null)
  const [values, setValues] = React.useState<Record<keyof LightGBMParams, string>>({
    num_leaves: "31",
    learning_rate: "0.1",
    n_estimators: "100",
    max_depth: "-1",
  })

  const errors: Partial<Record<keyof LightGBMParams, string>> = {}
  for (const p of PARAMS) {
    const v = Number(values[p.key])
    if (values[p.key] === "" || Number.isNaN(v)) errors[p.key] = "Wajib diisi angka."
    else if (v < p.min || v > p.max) errors[p.key] = `Rentang ${p.min} s.d. ${p.max}.`
  }
  const valid = datasetId !== null && Object.keys(errors).length === 0

  function startTraining() {
    if (!valid || !datasetId) return
    const jobId = generateId("job")
    dispatch({
      type: "addJob",
      job: {
        id: jobId,
        dataset_id: datasetId,
        parameter: {
          num_leaves: Number(values.num_leaves),
          learning_rate: Number(values.learning_rate),
          n_estimators: Number(values.n_estimators),
          max_depth: Number(values.max_depth),
        },
        created_at: new Date().toISOString(),
      },
    })
    router.push(`/model/training/${jobId}`)
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
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Training Model LightGBM</h2>
        <p className="text-sm text-muted-foreground">
          Pilih dataset hasil preprocessing dan atur parameter pelatihan.
        </p>
      </div>

      {readyDatasets.length === 0 ? (
        <EmptyState
          icon={<IconTransform />}
          title="Belum ada dataset siap latih"
          description="Jalankan preprocessing terlebih dahulu pada salah satu dataset."
          action={<Button render={<Link href="/preprocessing" />}>Ke Preprocessing</Button>}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi Training</CardTitle>
            <CardDescription>
              Nilai default mengikuti parameter LightGBM pada skripsi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>Dataset siap latih</Label>
              <Select
                value={datasetId}
                onValueChange={(v) => setSelectedId(v as string | null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {datasetId
                      ? readyDatasets.find((d) => d.id === datasetId)?.nama_file
                      : "Pilih dataset…"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {readyDatasets.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.nama_file} ({formatNumber(d.jumlah_baris)} baris)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PARAMS.map((p) => (
                <div key={p.key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <Label htmlFor={p.key} className="font-mono text-xs">
                      {p.label}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button type="button" aria-label={`Penjelasan ${p.label}`} />
                        }
                      >
                        <IconHelpCircle className="size-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-60">{p.hint}</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    id={p.key}
                    type="number"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={values[p.key]}
                    aria-invalid={!!errors[p.key]}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [p.key]: e.target.value }))
                    }
                  />
                  {errors[p.key] && (
                    <p className="text-xs text-destructive">{errors[p.key]}</p>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={startTraining} disabled={!valid} className="w-fit">
              <IconPlayerPlay />
              Mulai Training
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
