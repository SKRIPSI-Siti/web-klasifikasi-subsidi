// Mock "backend" — bentuk hasil mengikuti kontrak API Flask (PRD Bagian 15).
// Saat integrasi M8+, isi fungsi-fungsi ini diganti fetch() ke Flask; pemanggil tidak berubah.

import { FEATURE_LABELS } from "@/lib/data/seed"
import type {
  ConfusionMatrix,
  CustomerRow,
  Dataset,
  FeatureImportance,
  Label,
  LightGBMParams,
  Model,
  PredictionResultRow,
} from "@/lib/types"

/** Heuristik dummy: nilai "layak" dari fitur sosial-ekonomi & kelistrikan (0–1). */
export function scoreRow(row: CustomerRow): number {
  let s = 0.5
  if (row.penghasilan < 1_000_000) s += 0.22
  else if (row.penghasilan < 2_000_000) s += 0.12
  else if (row.penghasilan > 4_000_000) s -= 0.3
  else s -= 0.12
  if (row.status_bansos !== "Tidak Menerima") s += 0.18
  if (row.daya_va === "450 VA") s += 0.08
  if (row.golongan_tarif === "R-1M/900 VA") s -= 0.15
  if (row.luas_bangunan < 45) s += 0.07
  else if (row.luas_bangunan > 90) s -= 0.12
  if (row.pemakaian_kwh < 80) s += 0.05
  else if (row.pemakaian_kwh > 150) s -= 0.08
  if (row.jumlah_anggota >= 5) s += 0.04
  if (row.pekerjaan === "PNS" || row.pekerjaan === "Karyawan Swasta") s -= 0.08
  if (row.status_rumah === "Menumpang") s += 0.04
  return Math.min(0.98, Math.max(0.02, s))
}

/** Prediksi satu baris → label + confidence (70–98%). */
export function predictRow(row: CustomerRow): PredictionResultRow {
  const s = scoreRow(row)
  const label: Label = s >= 0.5 ? "Layak" : "Tidak Layak"
  const confidence = Math.min(0.98, Math.max(0.7, label === "Layak" ? s + 0.25 : 1.05 - s))
  return { id_pelanggan: row.id_pelanggan, input: row, label, confidence }
}

/** Hasil evaluasi dummy realistis & konsisten dengan 20% data uji dataset. */
export function generateEvaluation(
  dataset: Dataset,
  parameter: LightGBMParams,
  modelId: string
): Model {
  const testCount = Math.max(20, Math.round(dataset.jumlah_baris * 0.2))
  // Akurasi 91–95%, sedikit dipengaruhi parameter agar terasa "nyata"
  const seedish =
    (dataset.jumlah_baris + parameter.num_leaves * 7 + parameter.n_estimators) % 41
  const accuracy = 0.91 + (seedish / 41) * 0.04

  const positives = Math.round(testCount * 0.6) // ± distribusi label 60:40
  const negatives = testCount - positives
  const errors = Math.round(testCount * (1 - accuracy))
  const fn = Math.floor(errors / 2)
  const fp = errors - fn
  const confusion: ConfusionMatrix = {
    tp: positives - fn,
    fn,
    tn: negatives - fp,
    fp,
  }
  const precision_ = confusion.tp / (confusion.tp + confusion.fp)
  const recall = confusion.tp / (confusion.tp + confusion.fn)
  const f1_score = (2 * precision_ * recall) / (precision_ + recall)

  const feature_importance: FeatureImportance[] = FEATURE_LABELS.map((fitur, i) => ({
    fitur,
    skor: Math.round(430 - i * 45 + ((seedish * (i + 3)) % 25)),
  }))

  return {
    id: modelId,
    dataset_id: dataset.id,
    nama: `LightGBM (${dataset.nama_file})`,
    parameter,
    accuracy,
    precision_,
    recall,
    f1_score,
    confusion,
    feature_importance,
    is_active: false,
    created_at: new Date().toISOString(),
  }
}

export const TRAINING_LOG_STEPS = (n: number) => [
  "Memuat data hasil preprocessing…",
  "Membangun struktur LightGBM…",
  `Training iterasi ${Math.round(n * 0.25)}/${n}…`,
  `Training iterasi ${Math.round(n * 0.5)}/${n}…`,
  `Training iterasi ${Math.round(n * 0.75)}/${n}…`,
  `Training iterasi ${n}/${n}…`,
  "Menghitung metrik evaluasi…",
  "Menyimpan artefak model…",
  "Selesai ✔",
]
