// Fallback offline untuk halaman training bila server model (app.py) tak terjangkau.
// Jalur utama prediksi/training/evaluasi kini memakai API nyata lewat lib/data/api.ts;
// fungsi di sini hanya dipakai agar demo tidak buntu saat Flask tidak berjalan.

import { FEATURE_LABELS } from "@/lib/data/seed"
import type {
  ConfusionMatrix,
  Dataset,
  FeatureImportance,
  LightGBMParams,
  Model,
} from "@/lib/types"

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
