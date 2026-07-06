"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { CustomerTable } from "@/components/customer-table"
import { FileDropzone } from "@/components/file-dropzone"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { generateRows, KOLOM_DATASET } from "@/lib/data/seed"
import { generateId, useStore } from "@/lib/data/store"
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

export default function DatasetUploadPage() {
  const router = useRouter()
  const { dispatch, addActivity } = useStore()
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Preview dummy: baris digenerate deterministik dari nama file (mock parsing CSV/XLSX)
  const previewRows = React.useMemo(() => {
    if (!file) return []
    const seedNum = Array.from(file.name).reduce((a, c) => a + c.charCodeAt(0), 0)
    return generateRows(seedNum, 50, "UPL-")
  }, [file])

  function handleSave() {
    if (!file) return
    setSaving(true)
    const totalRows = 500 + (file.size % 1500) // jumlah baris dummy dari ukuran file
    const id = generateId("ds")
    window.setTimeout(() => {
      dispatch({
        type: "addDataset",
        dataset: {
          id,
          nama_file: file.name,
          jumlah_baris: Math.round(totalRows),
          jumlah_kolom: KOLOM_DATASET.length,
          status: "belum_diproses",
          uploaded_at: new Date().toISOString(),
          rows: previewRows,
        },
      })
      addActivity(
        "import",
        `Dataset ${file.name} diunggah (${Math.round(totalRows)} baris)`
      )
      toast.success("Dataset berhasil disimpan.")
      router.push(`/dataset/${id}`)
    }, 800)
  }

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Upload Dataset</h2>
        <p className="text-sm text-muted-foreground">
          Unggah file data pelanggan (CSV atau XLSX) untuk diklasifikasi.
        </p>
      </div>

      <FileDropzone
        accept={["csv", "xlsx"]}
        file={file}
        onFile={setFile}
        error={fileError}
        onError={setFileError}
      />

      {file && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Kolom terdeteksi</CardTitle>
              <CardDescription>
                {KOLOM_DATASET.length} kolom sesuai Data Dictionary sistem.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {KOLOM_DATASET.map((k) => (
                <Badge key={k} variant="outline" className="font-mono">
                  {k}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview data</CardTitle>
              <CardDescription>10 baris pertama dari file yang diunggah.</CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerTable rows={previewRows.slice(0, 10)} pageSize={10} />
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!file || saving}>
          {saving ? <IconLoader2 className="animate-spin" /> : <IconDeviceFloppy />}
          {saving ? "Menyimpan…" : "Simpan Dataset"}
        </Button>
        <Button variant="outline" render={<Link href="/dataset" />}>
          Batal
        </Button>
      </div>
    </div>
  )
}
