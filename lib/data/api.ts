// Klien REST ke API model Flask (../Model/app.py) — kontrak PRD Bagian 15.
// Ini adalah satu-satunya tempat halaman menyentuh backend nyata; komponen tetap memakai
// tipe dari lib/types.ts. Karena kategori form sudah diselaraskan dengan dataset asli
// (lihat lib/types.ts), payload prediksi dikirim apa adanya tanpa penerjemahan nilai.

import type {
  CustomerRow,
  FeatureImportance,
  Label,
  LightGBMParams,
  Model,
  PredictionResultRow,
} from "@/lib/types"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000"

export class ApiError extends Error {
  code: string
  status: number
  constructor(message: string, code = "error", status = 0) {
    super(message)
    this.name = "ApiError"
    this.code = code
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...init?.headers }
        : init?.headers,
      ...init,
    })
  } catch {
    // Jaringan/CORS/server mati → error yang bisa ditangani pemanggil (fallback demo).
    throw new ApiError(
      "Tidak dapat terhubung ke server model. Pastikan Flask (app.py) berjalan.",
      "network_error"
    )
  }

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const err = data?.error
    throw new ApiError(err?.message ?? res.statusText, err?.code ?? "http_error", res.status)
  }
  return data as T
}

// ---- Bentuk mentah respons API (snake_case sesuai app.py) ----

interface ApiDataset {
  id: string
  nama_file: string
  jumlah_baris: number
  jumlah_kolom: number
  status: "belum_diproses" | "sudah_preprocessing"
}

interface ApiModelBase {
  id: string
  dataset_id: string
  nama: string
  parameter: LightGBMParams
  accuracy: number
  f1_score: number
  is_active: boolean
}

interface ApiEvaluation {
  accuracy: number
  precision: number
  recall: number
  f1_score: number
  confusion: { tp: number; tn: number; fp: number; fn: number }
  feature_importance: FeatureImportance[]
  parameter: LightGBMParams
}

export interface PreprocessResult {
  langkah: { nama: string; status: string }[]
  ringkasan: {
    baris_sebelum: number
    baris_valid: number
    distribusi_label: { Layak: number; "Tidak Layak": number }
  }
}

export interface TrainStatus {
  progress: number
  log: string[]
  status: "running" | "done" | "failed"
  model_id: string | null
}

interface ApiPredictResponse {
  prediction_id: string
  mode: "manual" | "batch"
  hasil:
    | { id_pelanggan: string; label: Label; confidence: number }
    | { id_pelanggan: string; label: Label; confidence: number }[]
}

// ---- Pemetaan bentuk API → tipe frontend ----

const FEATURE_KEYS: (keyof CustomerRow)[] = [
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
]

function toApiRow(row: CustomerRow): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of FEATURE_KEYS) out[k] = row[k]
  return out
}

function mergeModel(base: ApiModelBase, evalData: ApiEvaluation): Model {
  return {
    id: base.id,
    dataset_id: base.dataset_id,
    nama: base.nama,
    parameter: evalData.parameter ?? base.parameter,
    accuracy: evalData.accuracy,
    precision_: evalData.precision,
    recall: evalData.recall,
    f1_score: evalData.f1_score,
    confusion: evalData.confusion,
    feature_importance: evalData.feature_importance,
    is_active: base.is_active,
    created_at: new Date().toISOString(),
  }
}

// ---- Endpoint ----

export function getDatasets(): Promise<ApiDataset[]> {
  return request<ApiDataset[]>("/api/datasets")
}

/** Daftar model lengkap dengan metrik evaluasi (menggabungkan /api/models + /api/evaluate). */
export async function getModels(): Promise<Model[]> {
  const bases = await request<ApiModelBase[]>("/api/models")
  return Promise.all(
    bases.map(async (b) => mergeModel(b, await evaluate(b.id)))
  )
}

export async function getModelById(modelId: string): Promise<Model> {
  const bases = await request<ApiModelBase[]>("/api/models")
  const base = bases.find((b) => b.id === modelId)
  if (!base) throw new ApiError("Model tidak ditemukan", "model_not_found", 404)
  return mergeModel(base, await evaluate(modelId))
}

export function preprocess(datasetId: string): Promise<PreprocessResult> {
  return request<PreprocessResult>("/api/preprocess", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId }),
  })
}

export function train(
  datasetId: string,
  parameter: LightGBMParams
): Promise<{ job_id: string }> {
  return request<{ job_id: string }>("/api/train", {
    method: "POST",
    body: JSON.stringify({ dataset_id: datasetId, parameter }),
  })
}

export function getTrainStatus(jobId: string): Promise<TrainStatus> {
  return request<TrainStatus>(`/api/train/status/${jobId}`)
}

export function evaluate(modelId: string): Promise<ApiEvaluation> {
  return request<ApiEvaluation>(`/api/evaluate/${modelId}`)
}

export function activateModel(modelId: string): Promise<{ id: string; is_active: boolean }> {
  return request(`/api/models/${modelId}/activate`, { method: "POST" })
}

/**
 * Prediksi satu/lebih baris memakai model tertentu. Mengembalikan hasil per baris lengkap
 * dengan input aslinya (API hanya mengembalikan label+confidence, input digabung di sini
 * agar halaman hasil bisa menampilkan rekap fitur).
 */
export async function predict(
  modelId: string,
  rows: CustomerRow[],
  mode: "manual" | "batch"
): Promise<PredictionResultRow[]> {
  const res = await request<ApiPredictResponse>("/api/predict", {
    method: "POST",
    body: JSON.stringify({
      model_id: modelId,
      mode,
      data: mode === "manual" ? toApiRow(rows[0]) : rows.map(toApiRow),
    }),
  })
  const hasilArr = Array.isArray(res.hasil) ? res.hasil : [res.hasil]
  return hasilArr.map((h, i) => ({
    id_pelanggan: h.id_pelanggan ?? rows[i]?.id_pelanggan ?? `row_${i + 1}`,
    input: rows[i],
    label: h.label,
    confidence: h.confidence,
  }))
}
