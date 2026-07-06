"use client"

import Link from "next/link"

import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useStore } from "@/lib/data/store"
import { formatDate, formatNumber } from "@/lib/format"
import { IconArrowRight, IconTransform } from "@tabler/icons-react"

export default function PreprocessingPage() {
  const { state, hydrated } = useStore()
  const pending = state.datasets.filter((d) => d.status === "belum_diproses")

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Preprocessing Data</h2>
        <p className="text-sm text-muted-foreground">
          Pilih dataset yang belum diproses untuk menjalankan tahapan preprocessing.
        </p>
      </div>

      {pending.length === 0 ? (
        <EmptyState
          icon={<IconTransform />}
          title="Semua dataset sudah diproses"
          description="Unggah dataset baru untuk menjalankan preprocessing."
          action={
            <Button render={<Link href="/dataset/upload" />}>Upload Dataset Baru</Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {pending.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle>{d.nama_file}</CardTitle>
                <CardDescription>
                  {formatNumber(d.jumlah_baris)} baris · diunggah {formatDate(d.uploaded_at)}
                </CardDescription>
                <CardAction>
                  <Button render={<Link href={`/preprocessing/${d.id}`} />}>
                    Mulai Preprocessing
                    <IconArrowRight />
                  </Button>
                </CardAction>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
