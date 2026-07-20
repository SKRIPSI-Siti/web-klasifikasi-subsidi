// Mock "backend" untuk prediksi (PRD Bagian 15) — heuristik skoring kelayakan subsidi
// dijalankan langsung di sisi klien selama backend Flask (M8+) belum terintegrasi.

import type { CustomerRow, Label, PredictionResultRow } from "@/lib/types"

const DAYA_RENDAH = new Set([450, 900])

/**
 * Heuristik skoring kelayakan berbasis Data Dictionary (PRD Bagian 10). Setiap faktor
 * menyumbang bobot ke skor 0–1; skor ≥ 0.5 → "Layak". Mengembalikan skor mentah agar
 * bisa dipetakan ke confidence oleh pemanggil.
 */
export function scoreRow(row: CustomerRow): number {
  let skor = 0

  // Penghasilan rendah → cenderung layak (bobot terbesar, sesuai feature importance PRD).
  skor += row.penghasilan <= 2_300_000 ? 0.3 : 0
  // Pemakaian listrik rendah → indikasi rumah tangga kecil/sederhana.
  skor += row.pemakaian_kwh <= 90 ? 0.2 : 0
  // Penerima bansos (PKH/BPNT) → indikator kuat kelayakan.
  skor += row.status_bansos !== "Tidak" ? 0.2 : 0
  // Luas bangunan kecil.
  skor += row.luas_bangunan <= 60 ? 0.15 : 0
  // Daya terpasang rendah (450/900 VA).
  skor += DAYA_RENDAH.has(row.daya_va) ? 0.15 : 0

  return skor
}

/** Prediksi satu baris data pelanggan menjadi label + confidence. */
export function predictRow(row: CustomerRow): PredictionResultRow {
  const skor = scoreRow(row)
  const label: Label = skor >= 0.5 ? "Layak" : "Tidak Layak"
  // Confidence dipetakan dari jarak skor ke ambang 0.5 agar terasa proporsional.
  const confidence =
    label === "Layak" ? 0.6 + skor * 0.4 : 0.6 + (1 - skor) * 0.4

  return {
    id_pelanggan: row.id_pelanggan,
    input: row,
    label,
    confidence: Math.min(confidence, 0.99),
  }
}

/** Prediksi banyak baris sekaligus (mode batch). */
export function predictRows(rows: CustomerRow[]): PredictionResultRow[] {
  return rows.map(predictRow)
}
