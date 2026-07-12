"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import * as api from "@/lib/data/api"
import { generateEvaluation, TRAINING_LOG_STEPS } from "@/lib/data/mock-api"
import { generateId, useStore } from "@/lib/data/store"
import { formatPercent } from "@/lib/format"
import { IconArrowRight, IconMoodConfuzed } from "@tabler/icons-react"

export default function TrainingProgressPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const { state, hydrated, dispatch, addActivity, syncFromApi } = useStore()
  const job = state.jobs.find((j) => j.id === jobId)
  const dataset = state.datasets.find((d) => d.id === job?.dataset_id)
  const model = state.models.find((m) => m.id === job?.model_id)

  const [progress, setProgress] = React.useState(job?.model_id ? 100 : 0)
  const [logs, setLogs] = React.useState<string[]>([])
  const startedRef = React.useRef(false)

  React.useEffect(() => {
    if (!hydrated || !job || !dataset || job.model_id || startedRef.current) return
    startedRef.current = true
    let cancelled = false

    /** Fallback: simulasi lokal bila server model tak terjangkau (demo tetap jalan). */
    function runMockFallback() {
      const steps = TRAINING_LOG_STEPS(job!.parameter.n_estimators)
      steps.forEach((line, i) => {
        window.setTimeout(() => {
          if (cancelled) return
          setLogs((prev) => [...prev, line])
          setProgress(Math.round(((i + 1) / steps.length) * 100))
          if (i === steps.length - 1) {
            const newModel = generateEvaluation(dataset!, job!.parameter, generateId("mdl"))
            dispatch({ type: "finishJob", jobId: job!.id, model: newModel })
            addActivity("training", `Model ${newModel.nama} selesai dilatih`)
          }
        }, i * 700)
      })
    }

    async function runRealTraining() {
      try {
        const { job_id } = await api.train(dataset!.id, job!.parameter)
        // Polling status sampai selesai/gagal.
        while (!cancelled) {
          const status = await api.getTrainStatus(job_id)
          setProgress(status.progress)
          setLogs(status.log)
          if (status.status === "done" && status.model_id) {
            const newModel = await api.getModelById(status.model_id)
            if (cancelled) return
            dispatch({ type: "finishJob", jobId: job!.id, model: newModel })
            addActivity("training", `Model ${newModel.nama} selesai dilatih`)
            void syncFromApi()
            return
          }
          if (status.status === "failed") throw new api.ApiError("Training gagal di server model.")
          await new Promise((r) => setTimeout(r, 600))
        }
      } catch {
        // Server tak terjangkau / dataset lokal belum ada di server → pakai simulasi.
        if (!cancelled) runMockFallback()
      }
    }

    void runRealTraining()
    return () => {
      cancelled = true
    }
  }, [hydrated, job, dataset, dispatch, addActivity, syncFromApi])

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!job || !dataset) {
    return (
      <EmptyState
        icon={<IconMoodConfuzed />}
        title="Job training tidak ditemukan"
        description="Mulai training baru dari halaman konfigurasi."
        action={<Button render={<Link href="/model/training" />}>Ke Konfigurasi</Button>}
      />
    )
  }

  const done = progress >= 100 && !!model

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Progres Training</h2>
        <p className="text-sm text-muted-foreground">
          Dataset: {dataset.nama_file} · parameter: num_leaves=
          {job.parameter.num_leaves}, learning_rate={job.parameter.learning_rate},
          n_estimators={job.parameter.n_estimators}, max_depth={job.parameter.max_depth}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {done ? "Training selesai" : "Training sedang berjalan…"}
          </CardTitle>
          <CardDescription>{progress}%</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={progress} />
          <div className="max-h-64 overflow-y-auto rounded-2xl bg-foreground/95 p-4 font-mono text-xs text-background dark:bg-muted dark:text-foreground">
            {(job.model_id && logs.length === 0
              ? TRAINING_LOG_STEPS(job.parameter.n_estimators)
              : logs
            ).map((line, i) => (
              <p key={i} className="leading-relaxed">
                <span className="opacity-50">$ </span>
                {line}
              </p>
            ))}
            {logs.length === 0 && !job.model_id && (
              <p className="opacity-50">Menunggu proses dimulai…</p>
            )}
          </div>
          {done && model && (
            <div className="flex items-center justify-between rounded-2xl border border-success/30 bg-success/10 p-4 text-sm">
              <p>
                Accuracy sekilas:{" "}
                <span className="font-semibold">{formatPercent(model.accuracy)}</span>
              </p>
              <Button render={<Link href={`/model/evaluation/${model.id}`} />}>
                Lihat Evaluasi Lengkap
                <IconArrowRight />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
