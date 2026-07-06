"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

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
import { useStore } from "@/lib/data/store"
import { formatNumber, formatPercent } from "@/lib/format"
import { IconCircleCheck, IconMoodConfuzed } from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts"
import { toast } from "sonner"

/** Sel confusion matrix dengan intensitas warna proporsional nilai. */
function MatrixCell({
  value,
  max,
  variant,
  label,
}: {
  value: number
  max: number
  variant: "good" | "bad"
  label: string
}) {
  const intensity = 0.15 + (value / max) * 0.6
  return (
    <td className="p-1">
      <div
        className="flex flex-col items-center justify-center gap-1 rounded-xl p-4"
        style={{
          backgroundColor:
            variant === "good"
              ? `color-mix(in oklch, var(--success) ${intensity * 100}%, transparent)`
              : `color-mix(in oklch, var(--destructive) ${intensity * 100}%, transparent)`,
        }}
      >
        <span className="text-2xl font-semibold tabular-nums">{formatNumber(value)}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </td>
  )
}

export default function ModelEvaluationPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const { state, hydrated, dispatch, addActivity } = useStore()
  const model = state.models.find((m) => m.id === modelId)
  const dataset = state.datasets.find((d) => d.id === model?.dataset_id)

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!model) {
    return (
      <EmptyState
        icon={<IconMoodConfuzed />}
        title="Model tidak ditemukan"
        action={<Button render={<Link href="/model/training" />}>Ke Training</Button>}
      />
    )
  }

  const { tp, tn, fp, fn } = model.confusion
  const maxCell = Math.max(tp, tn, fp, fn)
  const testTotal = tp + tn + fp + fn

  function activate() {
    if (!model) return
    dispatch({ type: "setActiveModel", id: model.id })
    addActivity("training", `${model.nama} dijadikan model aktif`)
    toast.success(`${model.nama} kini menjadi model aktif.`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{model.nama}</h2>
          <p className="text-sm text-muted-foreground">
            Dilatih dari {dataset?.nama_file ?? model.dataset_id} ·{" "}
            {formatNumber(testTotal)} data uji (20%)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {model.is_active ? (
            <Badge className="bg-success/10 text-success dark:bg-success/20">
              <IconCircleCheck className="size-3.5" />
              Model Aktif
            </Badge>
          ) : (
            <Button onClick={activate}>Jadikan Model Aktif</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @4xl/main:grid-cols-4">
        <StatCard label="Accuracy" value={formatPercent(model.accuracy)} />
        <StatCard label="Precision" value={formatPercent(model.precision_)} />
        <StatCard label="Recall" value={formatPercent(model.recall)} />
        <StatCard label="F1-Score" value={formatPercent(model.f1_score)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>Aktual (baris) × Prediksi (kolom).</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full table-fixed text-center">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="w-24" />
                  <th className="pb-2">Prediksi: Layak</th>
                  <th className="pb-2">Prediksi: Tidak Layak</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="pr-2 text-right text-xs font-medium text-muted-foreground">
                    Aktual: Layak
                  </th>
                  <MatrixCell value={tp} max={maxCell} variant="good" label="True Positive" />
                  <MatrixCell value={fn} max={maxCell} variant="bad" label="False Negative" />
                </tr>
                <tr>
                  <th className="pr-2 text-right text-xs font-medium text-muted-foreground">
                    Aktual: Tidak Layak
                  </th>
                  <MatrixCell value={fp} max={maxCell} variant="bad" label="False Positive" />
                  <MatrixCell value={tn} max={maxCell} variant="good" label="True Negative" />
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Kontribusi 9 fitur terhadap keputusan model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={model.feature_importance}
                layout="vertical"
                margin={{ left: 24, right: 16 }}
              >
                <CartesianGrid horizontal={false} strokeOpacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="fitur"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    backgroundColor: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="skor" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parameter Training</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {Object.entries(model.parameter).map(([k, v]) => (
            <div key={k} className="rounded-2xl border p-3">
              <p className="font-mono text-xs text-muted-foreground">{k}</p>
              <p className="font-semibold tabular-nums">{v}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
