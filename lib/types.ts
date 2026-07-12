// Kontrak data MVP — mengikuti skema Supabase (PRD Bagian 14) & kontrak API Flask (PRD Bagian 15).
// Tipe ini dibekukan sejak M0; perubahan harus disepakati (lihat MVP.md M0 Exit Criteria).

export type DatasetStatus = "belum_diproses" | "sudah_preprocessing"

export type Label = "Layak" | "Tidak Layak"

// Kategori mengikuti nilai aktual dataset model (Model/Data/Dataset Subsidi Listrik.xlsx),
// bukan asumsi — agar payload form manual = kategori yang dikenal LightGBM (encoder di app.py).
export type Pekerjaan =
  | "ASN"
  | "PNS"
  | "Dosen"
  | "Dokter"
  | "Guru Honorer"
  | "Manajer"
  | "Pengusaha"
  | "Wiraswasta"
  | "Karyawan Swasta"
  | "Teknisi"
  | "Pedagang Kecil"
  | "Penjahit"
  | "Sopir"
  | "Satpam"
  | "Petani"
  | "Nelayan"
  | "Tukang Bangunan"
  | "Buruh Harian Lepas"
  | "Pemulung"

export type StatusRumah = "Milik Sendiri" | "Kontrak" | "Menumpang"

export type StatusBansos = "PKH" | "BPNT" | "PKH & BPNT" | "Tidak"

/** Daya terpasang (VA) — angka mentah sesuai kolom dataset. */
export type DayaVA = 450 | 900 | 1300 | 2200

export type GolonganTarif = "R-1/450" | "R-1/900" | "R-1/1300" | "R-1/2200"

/** Satu baris data pelanggan — 9 fitur Data Dictionary (PRD Bagian 10) + label. */
export interface CustomerRow {
  id_pelanggan: string
  penghasilan: number
  jumlah_anggota: number
  pekerjaan: Pekerjaan
  status_rumah: StatusRumah
  luas_bangunan: number
  status_bansos: StatusBansos
  daya_va: DayaVA
  golongan_tarif: GolonganTarif
  pemakaian_kwh: number
  label?: Label
}

export interface Dataset {
  id: string
  nama_file: string
  jumlah_baris: number
  jumlah_kolom: number
  status: DatasetStatus
  uploaded_at: string // ISO
  /** Sampel baris untuk preview & tabel (± 50 baris). */
  rows: CustomerRow[]
}

export type PreprocessingStepKey =
  | "cleaning"
  | "missing_value"
  | "encoding"
  | "normalisasi"
  | "split"

export type StepStatus = "pending" | "running" | "done"

export interface PreprocessingResult {
  dataset_id: string
  baris_sebelum: number
  baris_valid: number
  distribusi_label: { layak: number; tidak_layak: number }
  created_at: string
}

export interface LightGBMParams {
  num_leaves: number
  learning_rate: number
  n_estimators: number
  max_depth: number
}

export interface ConfusionMatrix {
  tp: number
  tn: number
  fp: number
  fn: number
}

export interface FeatureImportance {
  fitur: string
  skor: number
}

export interface Model {
  id: string
  dataset_id: string
  nama: string
  parameter: LightGBMParams
  accuracy: number
  precision_: number
  recall: number
  f1_score: number
  confusion: ConfusionMatrix
  feature_importance: FeatureImportance[]
  is_active: boolean
  created_at: string
}

export interface TrainingJob {
  id: string
  dataset_id: string
  parameter: LightGBMParams
  /** Diisi setelah training "selesai". */
  model_id?: string
  created_at: string
}

export type PredictionKind = "manual" | "batch"

export interface PredictionResultRow {
  id_pelanggan: string
  input: CustomerRow
  label: Label
  confidence: number // 0–1
}

export interface Prediction {
  id: string
  model_id: string
  jenis: PredictionKind
  nama_file?: string // untuk batch
  hasil: PredictionResultRow[]
  jumlah_layak: number
  jumlah_tidak: number
  created_at: string
  saved_report_id?: string
}

export interface Report {
  id: string
  prediction_id: string
  model_id: string
  judul: string
  created_at: string
}

export type ActivityKind =
  | "import"
  | "preprocessing"
  | "training"
  | "prediksi"
  | "laporan"

export interface Activity {
  id: string
  jenis: ActivityKind
  deskripsi: string
  created_at: string
}

export interface AdminUser {
  email: string
  nama: string
  role: "admin"
}
