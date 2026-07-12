"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as api from "@/lib/data/api"
import { parseCustomerCsv } from "@/lib/data/csv"
import { generateId, useActiveModel, useStore } from "@/lib/data/store"
import { formatPercent } from "@/lib/format"
import type {
  CustomerRow,
  DayaVA,
  GolonganTarif,
  Pekerjaan,
  PredictionResultRow,
  StatusBansos,
  StatusRumah,
} from "@/lib/types"
import {
  IconAlertTriangle,
  IconLoader2,
  IconWand,
} from "@tabler/icons-react"
import { toast } from "sonner"

// Urutan pilihan mengikuti kategori nyata dataset model (lihat lib/types.ts).
const PEKERJAAN_OPTS: Pekerjaan[] = [
  "ASN",
  "PNS",
  "Dosen",
  "Dokter",
  "Guru Honorer",
  "Manajer",
  "Pengusaha",
  "Wiraswasta",
  "Karyawan Swasta",
  "Teknisi",
  "Pedagang Kecil",
  "Penjahit",
  "Sopir",
  "Satpam",
  "Petani",
  "Nelayan",
  "Tukang Bangunan",
  "Buruh Harian Lepas",
  "Pemulung",
]
const RUMAH_OPTS: StatusRumah[] = ["Milik Sendiri", "Kontrak", "Menumpang"]
const BANSOS_OPTS: StatusBansos[] = ["PKH", "BPNT", "PKH & BPNT", "Tidak"]
const DAYA_OPTS: DayaVA[] = [450, 900, 1300, 2200]
const TARIF_OPTS: GolonganTarif[] = ["R-1/450", "R-1/900", "R-1/1300", "R-1/2200"]

interface ManualForm {
  penghasilan: string
  jumlah_anggota: string
  pekerjaan: Pekerjaan | null
  status_rumah: StatusRumah | null
  luas_bangunan: string
  status_bansos: StatusBansos | null
  daya_va: DayaVA | null
  golongan_tarif: GolonganTarif | null
  pemakaian_kwh: string
}

const EMPTY_FORM: ManualForm = {
  penghasilan: "",
  jumlah_anggota: "",
  pekerjaan: null,
  status_rumah: null,
  luas_bangunan: "",
  status_bansos: null,
  daya_va: null,
  golongan_tarif: null,
  pemakaian_kwh: "",
}

function validate(f: ManualForm): Partial<Record<keyof ManualForm, string>> {
  const e: Partial<Record<keyof ManualForm, string>> = {}
  const num = (v: string) => (v === "" ? NaN : Number(v))
  if (Number.isNaN(num(f.penghasilan)) || num(f.penghasilan) < 0)
    e.penghasilan = "Wajib diisi, ≥ 0."
  const anggota = num(f.jumlah_anggota)
  if (Number.isNaN(anggota) || anggota < 1 || anggota > 20)
    e.jumlah_anggota = "Wajib diisi, 1–20."
  if (Number.isNaN(num(f.luas_bangunan)) || num(f.luas_bangunan) <= 0)
    e.luas_bangunan = "Wajib diisi, > 0."
  if (Number.isNaN(num(f.pemakaian_kwh)) || num(f.pemakaian_kwh) < 0)
    e.pemakaian_kwh = "Wajib diisi, ≥ 0."
  if (!f.pekerjaan) e.pekerjaan = "Wajib dipilih."
  if (!f.status_rumah) e.status_rumah = "Wajib dipilih."
  if (!f.status_bansos) e.status_bansos = "Wajib dipilih."
  if (!f.daya_va) e.daya_va = "Wajib dipilih."
  if (!f.golongan_tarif) e.golongan_tarif = "Wajib dipilih."
  return e
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
}: {
  id: string
  label: string
  value: T | null
  options: T[]
  onChange: (v: T | null) => void
  error?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T | null)}>
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
          <SelectValue>{value ?? "Pilih…"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

export default function PrediksiBaruPage() {
  const router = useRouter()
  const { hydrated, dispatch, addActivity } = useStore()
  const activeModel = useActiveModel()

  const [form, setForm] = React.useState<ManualForm>(EMPTY_FORM)
  const [touched, setTouched] = React.useState(false)
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [running, setRunning] = React.useState(false)

  const errors = validate(form)
  const manualValid = Object.keys(errors).length === 0

  function set<K extends keyof ManualForm>(key: K, value: ManualForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function commitPrediction(
    hasil: PredictionResultRow[],
    jenis: "manual" | "batch",
    nama_file?: string
  ) {
    if (!activeModel) return
    const id = generateId("prd")
    dispatch({
      type: "addPrediction",
      prediction: {
        id,
        model_id: activeModel.id,
        jenis,
        nama_file,
        hasil,
        jumlah_layak: hasil.filter((h) => h.label === "Layak").length,
        jumlah_tidak: hasil.filter((h) => h.label === "Tidak Layak").length,
        created_at: new Date().toISOString(),
      },
    })
    addActivity(
      "prediksi",
      jenis === "manual"
        ? "Prediksi manual 1 pelanggan dijalankan"
        : `Prediksi batch ${nama_file} (${hasil.length} data) dijalankan`
    )
    router.push(`/prediksi/hasil/${id}`)
  }

  async function runManual() {
    setTouched(true)
    if (!manualValid || !activeModel) return
    setRunning(true)
    const row: CustomerRow = {
      id_pelanggan: `MAN-${Date.now().toString().slice(-6)}`,
      penghasilan: Number(form.penghasilan),
      jumlah_anggota: Number(form.jumlah_anggota),
      pekerjaan: form.pekerjaan!,
      status_rumah: form.status_rumah!,
      luas_bangunan: Number(form.luas_bangunan),
      status_bansos: form.status_bansos!,
      daya_va: form.daya_va!,
      golongan_tarif: form.golongan_tarif!,
      pemakaian_kwh: Number(form.pemakaian_kwh),
    }
    try {
      const hasil = await api.predict(activeModel.id, [row], "manual")
      commitPrediction(hasil, "manual")
    } catch (e) {
      setRunning(false)
      toast.error(e instanceof api.ApiError ? e.message : "Gagal menjalankan prediksi.")
    }
  }

  async function runBatch() {
    if (!file || !activeModel) return
    setRunning(true)
    try {
      const rows = await parseCustomerCsv(file)
      if (rows.length === 0) throw new api.ApiError("File tidak berisi baris data.", "empty_file")
      const hasil = await api.predict(activeModel.id, rows, "batch")
      commitPrediction(hasil, "batch", file.name)
    } catch (e) {
      setRunning(false)
      toast.error(e instanceof api.ApiError ? e.message : "Gagal memproses file batch.")
    }
  }

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!activeModel) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-xl font-semibold">Prediksi Baru</h2>
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4">
          <IconAlertTriangle className="size-5 shrink-0 text-warning" />
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium">Belum ada model aktif</p>
            <p className="text-muted-foreground">
              Prediksi membutuhkan satu model yang ditetapkan sebagai model aktif. Latih
              model terlebih dahulu, lalu aktifkan dari halaman evaluasi.
            </p>
            <Button className="w-fit" render={<Link href="/model/training" />}>
              Latih Model Sekarang
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const showErr = (k: keyof ManualForm) => (touched ? errors[k] : undefined)

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Prediksi Baru</h2>
        <p className="text-sm text-muted-foreground">
          Klasifikasikan kelayakan penerima subsidi dengan model aktif.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border p-4 text-sm">
        <Badge className="bg-success/10 text-success dark:bg-success/20">Model Aktif</Badge>
        <p>
          <span className="font-medium">{activeModel.nama}</span> — accuracy{" "}
          {formatPercent(activeModel.accuracy)}
        </p>
      </div>

      <Tabs defaultValue="manual">
        <TabsList>
          <TabsTrigger value="manual">Input Manual</TabsTrigger>
          <TabsTrigger value="batch">Upload Batch</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Data Pelanggan</CardTitle>
              <CardDescription>
                Isi 9 variabel sesuai data pelanggan yang akan diklasifikasi.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <fieldset className="flex flex-col gap-4">
                <legend className="mb-2 text-sm font-semibold">Sosial Ekonomi</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField
                    id="penghasilan"
                    label="Penghasilan keluarga / bulan (Rp)"
                    value={form.penghasilan}
                    onChange={(v) => set("penghasilan", v)}
                    error={showErr("penghasilan")}
                    placeholder="1500000"
                  />
                  <NumberField
                    id="jumlah_anggota"
                    label="Jumlah anggota keluarga"
                    value={form.jumlah_anggota}
                    onChange={(v) => set("jumlah_anggota", v)}
                    error={showErr("jumlah_anggota")}
                    placeholder="4"
                  />
                  <SelectField
                    id="pekerjaan"
                    label="Pekerjaan kepala keluarga"
                    value={form.pekerjaan}
                    options={PEKERJAAN_OPTS}
                    onChange={(v) => set("pekerjaan", v)}
                    error={showErr("pekerjaan")}
                  />
                  <SelectField
                    id="status_rumah"
                    label="Status kepemilikan rumah"
                    value={form.status_rumah}
                    options={RUMAH_OPTS}
                    onChange={(v) => set("status_rumah", v)}
                    error={showErr("status_rumah")}
                  />
                  <NumberField
                    id="luas_bangunan"
                    label="Luas bangunan (m²)"
                    value={form.luas_bangunan}
                    onChange={(v) => set("luas_bangunan", v)}
                    error={showErr("luas_bangunan")}
                    placeholder="36"
                  />
                  <SelectField
                    id="status_bansos"
                    label="Status penerima bansos (PKH/BPNT)"
                    value={form.status_bansos}
                    options={BANSOS_OPTS}
                    onChange={(v) => set("status_bansos", v)}
                    error={showErr("status_bansos")}
                  />
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-4">
                <legend className="mb-2 text-sm font-semibold">Kelistrikan</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="daya_va">Daya terpasang</Label>
                    <Select
                      value={form.daya_va != null ? String(form.daya_va) : null}
                      onValueChange={(v) =>
                        set("daya_va", v ? (Number(v) as DayaVA) : null)
                      }
                    >
                      <SelectTrigger
                        id="daya_va"
                        className="w-full"
                        aria-invalid={!!showErr("daya_va")}
                      >
                        <SelectValue>
                          {form.daya_va != null ? `${form.daya_va} VA` : "Pilih…"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {DAYA_OPTS.map((o) => (
                          <SelectItem key={o} value={String(o)}>
                            {o} VA
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {showErr("daya_va") && (
                      <p className="text-xs text-destructive">{showErr("daya_va")}</p>
                    )}
                  </div>
                  <SelectField
                    id="golongan_tarif"
                    label="Golongan tarif"
                    value={form.golongan_tarif}
                    options={TARIF_OPTS}
                    onChange={(v) => set("golongan_tarif", v)}
                    error={showErr("golongan_tarif")}
                  />
                  <NumberField
                    id="pemakaian_kwh"
                    label="Pemakaian listrik / bulan (kWh)"
                    value={form.pemakaian_kwh}
                    onChange={(v) => set("pemakaian_kwh", v)}
                    error={showErr("pemakaian_kwh")}
                    placeholder="85"
                  />
                </div>
              </fieldset>

              <Button
                onClick={runManual}
                disabled={running || (touched && !manualValid)}
                className="w-fit"
              >
                {running ? <IconLoader2 className="animate-spin" /> : <IconWand />}
                {running ? "Menjalankan klasifikasi…" : "Jalankan Klasifikasi"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Upload File Batch</CardTitle>
              <CardDescription>
                File CSV berisi data pelanggan (kolom sesuai Data Dictionary).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FileDropzone
                accept={["csv"]}
                file={file}
                onFile={setFile}
                error={fileError}
                onError={setFileError}
              />
              <Button onClick={runBatch} disabled={!file || running} className="w-fit">
                {running ? <IconLoader2 className="animate-spin" /> : <IconWand />}
                {running ? "Menjalankan klasifikasi…" : "Jalankan Klasifikasi"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
