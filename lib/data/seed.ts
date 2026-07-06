// Seed dummy terpusat (PRD Bagian 13). Semua angka deterministik agar konsisten antar-render.
import type {
  Activity,
  CustomerRow,
  Dataset,
  DayaVA,
  GolonganTarif,
  Label,
  Model,
  Pekerjaan,
  Prediction,
  Report,
  StatusBansos,
  StatusRumah,
} from "@/lib/types"

const PEKERJAAN: Pekerjaan[] = [
  "Petani",
  "Nelayan",
  "Buruh",
  "Wiraswasta",
  "PNS",
  "Karyawan Swasta",
  "Tidak Bekerja",
  "Lainnya",
]
const STATUS_RUMAH: StatusRumah[] = ["Milik Sendiri", "Sewa/Kontrak", "Menumpang"]
const STATUS_BANSOS: StatusBansos[] = ["PKH", "BPNT", "PKH & BPNT", "Tidak Menerima"]
const DAYA: DayaVA[] = ["450 VA", "900 VA"]
const TARIF: GolonganTarif[] = ["R-1/450 VA", "R-1/900 VA", "R-1M/900 VA"]

/** PRNG deterministik (mulberry32) agar seed stabil. */
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateRows(seedNum: number, count: number, prefix: string): CustomerRow[] {
  const rand = mulberry32(seedNum)
  const rows: CustomerRow[] = []
  for (let i = 0; i < count; i++) {
    // ± 60% Layak : 40% Tidak Layak
    const layak = rand() < 0.6
    const penghasilan = layak
      ? Math.round((500_000 + rand() * 1_800_000) / 50_000) * 50_000
      : Math.round((2_500_000 + rand() * 5_000_000) / 50_000) * 50_000
    const label: Label = layak ? "Layak" : "Tidak Layak"
    rows.push({
      id_pelanggan: `${prefix}${String(i + 1).padStart(4, "0")}`,
      penghasilan,
      jumlah_anggota: 1 + Math.floor(rand() * 8),
      pekerjaan: layak
        ? PEKERJAAN[Math.floor(rand() * 4)] // petani/nelayan/buruh/wiraswasta lebih sering
        : PEKERJAAN[3 + Math.floor(rand() * 3)],
      status_rumah: STATUS_RUMAH[Math.floor(rand() * (layak ? 3 : 2))],
      luas_bangunan: layak ? 21 + Math.floor(rand() * 40) : 45 + Math.floor(rand() * 120),
      status_bansos: layak
        ? STATUS_BANSOS[Math.floor(rand() * 3)]
        : "Tidak Menerima",
      daya_va: layak ? DAYA[Math.floor(rand() * 2)] : "900 VA",
      golongan_tarif: layak ? TARIF[Math.floor(rand() * 2)] : TARIF[1 + Math.floor(rand() * 2)],
      pemakaian_kwh: layak ? 30 + Math.floor(rand() * 90) : 90 + Math.floor(rand() * 200),
      label,
    })
  }
  return rows
}

export const KOLOM_DATASET = [
  "id_pelanggan",
  "penghasilan",
  "jumlah_anggota",
  "pekerjaan",
  "status_rumah",
  "luas_bangunan",
  "status_bansos",
  "daya_va",
  "golongan_tarif",
  "pemakaian_kwh",
  "label",
] as const

export const seedDatasets: Dataset[] = [
  {
    id: "ds_001",
    nama_file: "data_pelanggan_pln_aceh_2024.csv",
    jumlah_baris: 1500,
    jumlah_kolom: 11,
    status: "sudah_preprocessing",
    uploaded_at: "2026-05-12T09:15:00.000Z",
    rows: generateRows(101, 50, "PLN24-"),
  },
  {
    id: "ds_002",
    nama_file: "data_pelanggan_pln_aceh_2025.csv",
    jumlah_baris: 2000,
    jumlah_kolom: 11,
    status: "sudah_preprocessing",
    uploaded_at: "2026-06-03T13:40:00.000Z",
    rows: generateRows(202, 50, "PLN25-"),
  },
  {
    id: "ds_003",
    nama_file: "data_verifikasi_dinsos_juni.xlsx",
    jumlah_baris: 750,
    jumlah_kolom: 11,
    status: "belum_diproses",
    uploaded_at: "2026-06-28T08:05:00.000Z",
    rows: generateRows(303, 50, "DSJ-"),
  },
]

export const FEATURE_LABELS = [
  "penghasilan",
  "pemakaian_kwh",
  "status_bansos",
  "luas_bangunan",
  "daya_va",
  "pekerjaan",
  "jumlah_anggota",
  "golongan_tarif",
  "status_rumah",
]

export const seedModels: Model[] = [
  {
    id: "mdl_001",
    dataset_id: "ds_001",
    nama: "LightGBM v1 (data 2024)",
    parameter: { num_leaves: 31, learning_rate: 0.1, n_estimators: 100, max_depth: -1 },
    accuracy: 0.9167,
    precision_: 0.9235,
    recall: 0.9391,
    f1_score: 0.9312,
    // 300 data uji (20% dari 1500): 173+31+14+82 = 300
    confusion: { tp: 173, tn: 102, fp: 14, fn: 11 },
    feature_importance: [
      { fitur: "penghasilan", skor: 412 },
      { fitur: "pemakaian_kwh", skor: 356 },
      { fitur: "status_bansos", skor: 298 },
      { fitur: "luas_bangunan", skor: 241 },
      { fitur: "daya_va", skor: 187 },
      { fitur: "pekerjaan", skor: 154 },
      { fitur: "jumlah_anggota", skor: 121 },
      { fitur: "golongan_tarif", skor: 96 },
      { fitur: "status_rumah", skor: 63 },
    ],
    is_active: false,
    created_at: "2026-05-14T10:30:00.000Z",
  },
  {
    id: "mdl_002",
    dataset_id: "ds_002",
    nama: "LightGBM v2 (data 2025)",
    parameter: { num_leaves: 31, learning_rate: 0.1, n_estimators: 100, max_depth: -1 },
    accuracy: 0.932,
    precision_: 0.9386,
    recall: 0.9502,
    f1_score: 0.9444,
    // 400 data uji (20% dari 2000): 229+144+15+12 = 400
    confusion: { tp: 229, tn: 144, fp: 15, fn: 12 },
    feature_importance: [
      { fitur: "penghasilan", skor: 438 },
      { fitur: "pemakaian_kwh", skor: 371 },
      { fitur: "status_bansos", skor: 315 },
      { fitur: "luas_bangunan", skor: 252 },
      { fitur: "daya_va", skor: 198 },
      { fitur: "pekerjaan", skor: 161 },
      { fitur: "jumlah_anggota", skor: 117 },
      { fitur: "golongan_tarif", skor: 89 },
      { fitur: "status_rumah", skor: 58 },
    ],
    is_active: true,
    created_at: "2026-06-05T14:20:00.000Z",
  },
]

function toPredictionRows(rows: CustomerRow[], seedNum: number) {
  const rand = mulberry32(seedNum)
  return rows.map((r) => ({
    id_pelanggan: r.id_pelanggan,
    input: r,
    label: (r.label ?? "Layak") as Label,
    confidence: 0.7 + rand() * 0.28,
  }))
}

const batch1Rows = toPredictionRows(generateRows(404, 25, "BATCH1-"), 41)
const batch2Rows = toPredictionRows(generateRows(505, 40, "BATCH2-"), 51)
const manualRow = toPredictionRows(generateRows(606, 1, "MAN-"), 61)

const countLabels = (rows: { label: Label }[]) => ({
  layak: rows.filter((r) => r.label === "Layak").length,
  tidak: rows.filter((r) => r.label === "Tidak Layak").length,
})

export const seedPredictions: Prediction[] = [
  {
    id: "prd_001",
    model_id: "mdl_001",
    jenis: "batch",
    nama_file: "calon_penerima_mei.csv",
    hasil: batch1Rows,
    jumlah_layak: countLabels(batch1Rows).layak,
    jumlah_tidak: countLabels(batch1Rows).tidak,
    created_at: "2026-05-20T11:00:00.000Z",
    saved_report_id: "rpt_001",
  },
  {
    id: "prd_002",
    model_id: "mdl_002",
    jenis: "manual",
    hasil: manualRow,
    jumlah_layak: countLabels(manualRow).layak,
    jumlah_tidak: countLabels(manualRow).tidak,
    created_at: "2026-06-10T09:45:00.000Z",
  },
  {
    id: "prd_003",
    model_id: "mdl_002",
    jenis: "batch",
    nama_file: "calon_penerima_juni.csv",
    hasil: batch2Rows,
    jumlah_layak: countLabels(batch2Rows).layak,
    jumlah_tidak: countLabels(batch2Rows).tidak,
    created_at: "2026-06-15T15:30:00.000Z",
    saved_report_id: "rpt_002",
  },
]

export const seedReports: Report[] = [
  {
    id: "rpt_001",
    prediction_id: "prd_001",
    model_id: "mdl_001",
    judul: "Laporan Klasifikasi Calon Penerima — Mei 2026",
    created_at: "2026-05-20T11:05:00.000Z",
  },
  {
    id: "rpt_002",
    prediction_id: "prd_003",
    model_id: "mdl_002",
    judul: "Laporan Klasifikasi Calon Penerima — Juni 2026",
    created_at: "2026-06-15T15:35:00.000Z",
  },
]

export const seedActivities: Activity[] = [
  {
    id: "act_001",
    jenis: "import",
    deskripsi: "Dataset data_verifikasi_dinsos_juni.xlsx diunggah (750 baris)",
    created_at: "2026-06-28T08:05:00.000Z",
  },
  {
    id: "act_002",
    jenis: "laporan",
    deskripsi: "Laporan Klasifikasi Calon Penerima — Juni 2026 disimpan",
    created_at: "2026-06-15T15:35:00.000Z",
  },
  {
    id: "act_003",
    jenis: "prediksi",
    deskripsi: "Prediksi batch calon_penerima_juni.csv (40 data) dijalankan",
    created_at: "2026-06-15T15:30:00.000Z",
  },
  {
    id: "act_004",
    jenis: "training",
    deskripsi: "Model LightGBM v2 dilatih dari data_pelanggan_pln_aceh_2025.csv",
    created_at: "2026-06-05T14:20:00.000Z",
  },
  {
    id: "act_005",
    jenis: "preprocessing",
    deskripsi: "Preprocessing data_pelanggan_pln_aceh_2025.csv selesai",
    created_at: "2026-06-04T10:10:00.000Z",
  },
]

export const ADMIN_USER = {
  email: "admin@pln.co.id",
  nama: "Admin PLN Aceh",
  role: "admin" as const,
}

export const ADMIN_PASSWORD = "admin123"
