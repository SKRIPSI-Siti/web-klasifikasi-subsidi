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
import { Skeleton } from "@/components/ui/skeleton"
import { parseDatasetFile, type ParsedDataset } from "@/lib/data/dataset-file"
import { generateId, useStore } from "@/lib/data/store"
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"

// Sampel yang disimpan di store (PRD Bagian 13: "± 50 baris untuk preview & tabel").
const SAMPLE_SIZE = 50

export default function DatasetUploadPage() {
  const router = useRouter()
  const { dispatch, addActivity } = useStore()
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [parsing, setParsing] = React.useState(false)
  const [parsed, setParsed] = React.useState<ParsedDataset | null>(null)
  const parseRunId = React.useRef(0)

  // Parse file sungguhan (CSV/XLSX) begitu dipilih — bukan data dummy. Dijalankan langsung
  // dari handler pemilihan file (bukan effect) agar tidak memicu setState "di dalam effect".
  async function handleFile(f: File | null) {
    setFile(f)
    setParsed(null)
    if (!f) return

    const runId = ++parseRunId.current
    setParsing(true)
    try {
      const result = await parseDatasetFile(f)
      if (parseRunId.current !== runId) return
      if (result.rows.length === 0) {
        setFileError("File tidak berisi baris data yang bisa dibaca.")
        setFile(null)
        return
      }
      setParsed(result)
    } catch {
      if (parseRunId.current !== runId) return
      setFileError("Gagal membaca file. Pastikan format & isi file benar.")
      setFile(null)
    } finally {
      if (parseRunId.current === runId) setParsing(false)
    }
  }

  function handleSave() {
    if (!file || !parsed) return
    setSaving(true)
    const id = generateId("ds")
    window.setTimeout(() => {
      dispatch({
        type: "addDataset",
        dataset: {
          id,
          nama_file: file.name,
          jumlah_baris: parsed.totalRows,
          jumlah_kolom: parsed.detectedColumns.length,
          status: "belum_diproses",
          uploaded_at: new Date().toISOString(),
          rows: parsed.rows.slice(0, SAMPLE_SIZE),
        },
      })
      addActivity("import", `Dataset ${file.name} diunggah (${parsed.totalRows} baris)`)
      toast.success("Dataset berhasil disimpan.")
      router.push(`/dataset/${id}`)
    }, 400)
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
        onFile={(f) => void handleFile(f)}
        error={fileError}
        onError={setFileError}
      />

      {file && parsing && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      )}

      {file && parsed && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Kolom terdeteksi</CardTitle>
              <CardDescription>
                {parsed.detectedColumns.length} kolom ditemukan pada file, {parsed.totalRows}{" "}
                baris data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {parsed.detectedColumns.map((k) => (
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
              <CustomerTable rows={parsed.rows.slice(0, 10)} pageSize={10} />
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={!file || !parsed || saving}>
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
