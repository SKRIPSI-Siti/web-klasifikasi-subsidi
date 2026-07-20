// Pemetaan header → CustomerRow, dipakai oleh parser CSV prediksi batch (lib/data/csv.ts).
// Menerima header bergaya Data Dictionary (penghasilan, daya_va, …) maupun nama kolom asli
// dataset model (Penghasilan, VA, KwH_Perbulan, …).

import type {
  CustomerRow,
  DayaVA,
  GolonganTarif,
  Pekerjaan,
  StatusBansos,
  StatusRumah,
} from "@/lib/types"

export type Canonical = keyof CustomerRow

export const HEADER_ALIASES: Record<string, Canonical> = {
  id_pelanggan: "id_pelanggan",
  penghasilan: "penghasilan",
  jumlah_anggota: "jumlah_anggota",
  jumla_anggota_keluarga: "jumlah_anggota",
  jumlah_anggota_keluarga: "jumlah_anggota",
  pekerjaan: "pekerjaan",
  pekerjaan_kepala_keluarga: "pekerjaan",
  status_rumah: "status_rumah",
  status_kepemilikan_rumah: "status_rumah",
  luas_bangunan: "luas_bangunan",
  luas_bangunan_m2: "luas_bangunan",
  status_bansos: "status_bansos",
  penerima_bantuan: "status_bansos",
  daya_va: "daya_va",
  va: "daya_va",
  golongan_tarif: "golongan_tarif",
  pemakaian_kwh: "pemakaian_kwh",
  kwh_perbulan: "pemakaian_kwh",
  label: "label",
}

export const NUMERIC_FIELDS = new Set<Canonical>([
  "penghasilan",
  "jumlah_anggota",
  "luas_bangunan",
  "pemakaian_kwh",
  "daya_va",
])

/** Normalisasi teks header mentah → kunci alias (lower-case, spasi jadi underscore). */
export function normalizeHeader(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "_")
}

/** Petakan header mentah (urutan kolom) ke kunci kanonis; `undefined` bila tak dikenal. */
export function mapHeaders(rawHeaders: string[]): (Canonical | undefined)[] {
  return rawHeaders.map((h) => HEADER_ALIASES[normalizeHeader(h)])
}

/** Bangun satu CustomerRow dari nilai mentah per kolom (hasil split CSV atau sel XLSX). */
export function buildCustomerRow(
  headers: (Canonical | undefined)[],
  cells: unknown[],
  fallbackId: string
): CustomerRow {
  const row: Partial<Record<Canonical, unknown>> = {}
  headers.forEach((key, c) => {
    if (!key) return
    const raw = cells[c]
    if (raw === undefined || raw === null || raw === "") return
    row[key] = NUMERIC_FIELDS.has(key) ? Number(raw) : String(raw).trim()
  })
  return {
    id_pelanggan: (row.id_pelanggan as string) || fallbackId,
    penghasilan: (row.penghasilan as number) ?? 0,
    jumlah_anggota: (row.jumlah_anggota as number) ?? 0,
    pekerjaan: row.pekerjaan as Pekerjaan,
    status_rumah: row.status_rumah as StatusRumah,
    luas_bangunan: (row.luas_bangunan as number) ?? 0,
    status_bansos: row.status_bansos as StatusBansos,
    daya_va: row.daya_va as DayaVA,
    golongan_tarif: row.golongan_tarif as GolonganTarif,
    pemakaian_kwh: (row.pemakaian_kwh as number) ?? 0,
    label: row.label as CustomerRow["label"],
  }
}

/** Pecah satu baris CSV, menghormati tanda kutip ganda. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else inQuotes = false
      } else cur += ch
    } else if (ch === '"') inQuotes = true
    else if (ch === ",") {
      out.push(cur)
      cur = ""
    } else cur += ch
  }
  out.push(cur)
  return out.map((c) => c.trim())
}

/** Parse teks CSV lengkap → daftar CustomerRow (baris kosong diabaikan). */
export function parseCsvText(text: string): CustomerRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
  if (lines.length < 2) return []
  const headers = mapHeaders(splitCsvLine(lines[0]))
  const rows: CustomerRow[] = []
  for (let r = 1; r < lines.length; r++) {
    rows.push(buildCustomerRow(headers, splitCsvLine(lines[r]), `row_${r}`))
  }
  return rows
}
