// Seed dummy terpusat (PRD Bagian 13). Semua angka deterministik agar konsisten antar-render.
import type {
  Activity,
  CustomerRow,
  DayaVA,
  GolonganTarif,
  Label,
  Pekerjaan,
  Prediction,
  Report,
  StatusBansos,
  StatusRumah,
} from "@/lib/types"

// Pekerjaan yang cenderung "Layak" (sosial-ekonomi rendah) vs "Tidak Layak".
const PEKERJAAN_LAYAK: Pekerjaan[] = [
  "Petani",
  "Nelayan",
  "Buruh Harian Lepas",
  "Pemulung",
  "Tukang Bangunan",
  "Pedagang Kecil",
  "Penjahit",
  "Sopir",
  "Satpam",
  "Guru Honorer",
]
const PEKERJAAN_NON: Pekerjaan[] = [
  "ASN",
  "PNS",
  "Dosen",
  "Dokter",
  "Manajer",
  "Pengusaha",
  "Wiraswasta",
  "Karyawan Swasta",
  "Teknisi",
]
const STATUS_RUMAH: StatusRumah[] = ["Milik Sendiri", "Kontrak", "Menumpang"]
const STATUS_BANSOS: StatusBansos[] = ["PKH", "BPNT", "PKH & BPNT", "Tidak"]
const DAYA_LAYAK: DayaVA[] = [450, 900]
const DAYA_NON: DayaVA[] = [1300, 2200]
const TARIF_BY_DAYA: Record<DayaVA, GolonganTarif> = {
  450: "R-1/450",
  900: "R-1/900",
  1300: "R-1/1300",
  2200: "R-1/2200",
}

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

export function generateRows(
  seedNum: number,
  count: number,
  prefix: string
): CustomerRow[] {
  const rand = mulberry32(seedNum)
  const rows: CustomerRow[] = []
  for (let i = 0; i < count; i++) {
    // ± 60% Layak : 40% Tidak Layak
    const layak = rand() < 0.6
    const penghasilan = layak
      ? Math.round((500_000 + rand() * 1_800_000) / 50_000) * 50_000
      : Math.round((2_500_000 + rand() * 5_000_000) / 50_000) * 50_000
    const label: Label = layak ? "Layak" : "Tidak Layak"
    const daya_va: DayaVA = layak
      ? DAYA_LAYAK[Math.floor(rand() * DAYA_LAYAK.length)]
      : DAYA_NON[Math.floor(rand() * DAYA_NON.length)]
    rows.push({
      id_pelanggan: `${prefix}${String(i + 1).padStart(4, "0")}`,
      penghasilan,
      jumlah_anggota: 1 + Math.floor(rand() * 8),
      pekerjaan: layak
        ? PEKERJAAN_LAYAK[Math.floor(rand() * PEKERJAAN_LAYAK.length)]
        : PEKERJAAN_NON[Math.floor(rand() * PEKERJAAN_NON.length)],
      status_rumah: STATUS_RUMAH[Math.floor(rand() * (layak ? 3 : 2))],
      luas_bangunan: layak
        ? 21 + Math.floor(rand() * 40)
        : 45 + Math.floor(rand() * 120),
      status_bansos: layak ? STATUS_BANSOS[Math.floor(rand() * 3)] : "Tidak",
      daya_va,
      golongan_tarif: TARIF_BY_DAYA[daya_va],
      pemakaian_kwh: layak
        ? 30 + Math.floor(rand() * 90)
        : 90 + Math.floor(rand() * 200),
      label,
    })
  }
  return rows
}

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
    jenis: "manual",
    hasil: manualRow,
    jumlah_layak: countLabels(manualRow).layak,
    jumlah_tidak: countLabels(manualRow).tidak,
    created_at: "2026-06-10T09:45:00.000Z",
  },
  {
    id: "prd_003",
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
    judul: "Laporan Klasifikasi Calon Penerima — Mei 2026",
    created_at: "2026-05-20T11:05:00.000Z",
  },
  {
    id: "rpt_002",
    prediction_id: "prd_003",
    judul: "Laporan Klasifikasi Calon Penerima — Juni 2026",
    created_at: "2026-06-15T15:35:00.000Z",
  },
]

export const seedActivities: Activity[] = [
  {
    id: "act_002",
    jenis: "laporan",
    deskripsi: "Laporan Klasifikasi Calon Penerima — Juni 2026 disimpan",
    created_at: "2026-06-15T15:35:00.000Z",
  },
  {
    id: "act_003",
    jenis: "prediksi",
    deskripsi: "Klasifikasi batch calon_penerima_juni.csv (40 data) dijalankan",
    created_at: "2026-06-15T15:30:00.000Z",
  },
]

export const ADMIN_USER = {
  email: "admin@pln.co.id",
  nama: "Admin PLN Aceh",
  role: "admin" as const,
}

export const ADMIN_PASSWORD = "admin123"
