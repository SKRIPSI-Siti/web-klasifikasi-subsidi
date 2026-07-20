// Kontrak data MVP — mengikuti skema Supabase (PRD Bagian 14) & kontrak API Flask (PRD Bagian 15).
// Tipe ini dibekukan sejak M0; perubahan harus disepakati (lihat MVP.md M0 Exit Criteria).

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

export type PredictionKind = "manual" | "batch"

export interface PredictionResultRow {
  id_pelanggan: string
  input: CustomerRow
  label: Label
  confidence: number // 0–1
}

export interface Prediction {
  id: string
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
  judul: string
  created_at: string
}

export type ActivityKind = "prediksi" | "laporan"

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
