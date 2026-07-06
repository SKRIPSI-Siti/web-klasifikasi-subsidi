# Product Requirements Document (PRD)
## Sistem Klasifikasi Kelayakan Penerima Subsidi Listrik Rumah Tangga Pelanggan PLN Aceh Menggunakan Metode Light Gradient Boosting Machine (LightGBM)

| Informasi | Keterangan |
|---|---|
| **Versi Dokumen** | 2.0 (MVP — Kerangka UI & Routing) |
| **Status** | Aktif — acuan pembangunan tahap 1 |
| **Disusun berdasarkan** | Skripsi Siti Nur Faiza (NIM 2022573010045) — Teknik Informatika, Politeknik Negeri Lhokseumawe |
| **Referensi utama** | Bab III skripsi: Use Case Diagram, Activity Diagram, Perancangan Sistem & Skenario Pengujian |
| **Fokus tahap ini** | Kerangka aplikasi web: UI, routing, alur navigasi, dummy data (belum terhubung backend/model asli) |
| **Di luar dokumen ini** | Implementasi model LightGBM (notebook/Flask) — diatur pada fase M8+ |

---

## Daftar Isi

1. Latar Belakang & Konteks
2. Rumusan Masalah Produk
3. Tujuan Produk & Non-Goals
4. Metrik Keberhasilan MVP
5. Target Pengguna (Actor & Persona)
6. User Stories
7. Tech Stack & Keputusan Arsitektur
8. Arsitektur Informasi (Sitemap)
9. Struktur Routing (Next.js App Router)
10. Data Dictionary — Variabel Klasifikasi
11. Kebutuhan Fungsional (FR) per Modul
12. Detail Halaman (Page-by-Page)
13. Spesifikasi Dummy Data & State Management
14. Skema Database (Supabase / PostgreSQL)
15. Kontrak API Flask (Disiapkan untuk Fase Integrasi)
16. Design System & Panduan UI
17. Kebutuhan Non-Fungsional (NFR)
18. Penanganan State: Loading, Empty, Error
19. Risiko & Mitigasi
20. Kriteria Penerimaan MVP (Acceptance Criteria)
21. Glosarium

---

## 1. Latar Belakang & Konteks

Penyaluran subsidi listrik rumah tangga di Indonesia — khususnya golongan tarif **R-1/450 VA** dan **R-1/900 VA** — masih menghadapi persoalan **ketepatan sasaran**: sebagian pelanggan yang secara sosial-ekonomi tidak layak masih menerima subsidi, sementara sebagian yang layak justru belum tercakup. Penentuan kelayakan secara manual memakan waktu, subjektif, dan sulit diskalakan untuk jumlah pelanggan yang besar.

Penelitian ini membangun **model klasifikasi biner** (Layak / Tidak Layak) menggunakan algoritma **Light Gradient Boosting Machine (LightGBM)** — algoritma gradient boosting berbasis pohon keputusan yang efisien untuk data tabular, cepat dilatih, dan mampu menangani fitur kategorikal — untuk membantu menentukan kelayakan penerima subsidi listrik pelanggan rumah tangga **PLN Aceh**.

Sumber data yang digunakan:

| Kelompok Data | Sumber | Contoh Fitur |
|---|---|---|
| Data sosial ekonomi | Dinas Sosial | Penghasilan keluarga, jumlah anggota keluarga, pekerjaan kepala keluarga, status kepemilikan rumah, luas bangunan, status penerima bansos (PKH/BPNT) |
| Data karakteristik kelistrikan | Sintetis (mengacu regulasi ESDM) | Daya terpasang (VA), golongan tarif, pemakaian listrik per bulan (kWh) |
| Label | Hasil pelabelan | Layak / Tidak Layak menerima subsidi |

Alur sistem yang dirancang pada Bab III skripsi:

```
Login (Admin) → Import Dataset → Preprocessing → Training Model (LightGBM)
→ Evaluasi Model → Prediksi Klasifikasi → Tampilkan Hasil Analisis → Penyimpanan Hasil
```

**Web app ini adalah implementasi antarmuka** dari alur tersebut, agar model LightGBM yang dikembangkan dapat dioperasikan secara praktis oleh Admin (petugas PLN / Dinas Sosial) tanpa menyentuh kode.

---

## 2. Rumusan Masalah Produk

1. Belum ada antarmuka yang merepresentasikan alur end-to-end sistem klasifikasi sesuai perancangan Bab III, sehingga sulit didemokan ke pembimbing/penguji.
2. Proses ML (preprocessing → training → evaluasi → prediksi) perlu dituangkan menjadi alur UI yang runtut dan mudah dipahami pengguna non-teknis.
3. Backend (Flask + model LightGBM) masih dalam pengembangan paralel, sehingga frontend harus bisa divalidasi lebih dulu menggunakan dummy data, dengan struktur yang **siap disambungkan** tanpa rombak besar.

---

## 3. Tujuan Produk & Non-Goals

### 3.1 Tujuan (Goals) MVP

| ID | Tujuan | Indikator |
|---|---|---|
| G-1 | Menyediakan kerangka web app yang merepresentasikan **seluruh 8 fungsi** sistem pada Use Case Diagram skripsi | Semua fungsi terpetakan ke minimal 1 halaman |
| G-2 | Menyediakan UI yang jelas dan runtut untuk tiap tahapan pipeline ML | Alur Login → Laporan bisa ditelusuri tanpa dead-end |
| G-3 | Menyusun routing terstruktur yang siap diintegrasikan dengan Flask + Supabase | Kontrak API & skema DB terdokumentasi (Bagian 14–15) |
| G-4 | Memvalidasi UX dengan dummy data sebelum backend ML selesai | Demo lengkap dapat dilakukan tanpa server Python |

### 3.2 Non-Goals (Di Luar Scope Tahap Ini)

- ❌ Koneksi nyata ke Supabase (skema disiapkan, CRUD nyata belum wajib).
- ❌ Endpoint Flask nyata untuk training/prediksi LightGBM (seluruhnya di-mock di frontend).
- ❌ Autentikasi produksi & RBAC penuh — cukup **1 role: Admin**, login dummy.
- ❌ Export PDF/CSV fungsional (tombol placeholder).
- ❌ Multi-tenant, notifikasi, audit log penuh, atau manajemen banyak admin.
- ❌ Optimasi SEO (aplikasi internal, bukan publik).

---

## 4. Metrik Keberhasilan MVP

| Metrik | Target |
|---|---|
| Cakupan fungsi Use Case skripsi terwakili di UI | 8/8 fungsi (100%) |
| Halaman selesai & bisa dinavigasi | 16/16 halaman, 0 link mati/404 |
| Alur demo end-to-end (Login → Laporan) | Dapat diselesaikan < 5 menit tanpa error |
| Konsistensi design system | 100% halaman memakai komponen bersama (tanpa styling ad-hoc) |
| Kesiapan integrasi | Setiap pemanggilan data dummy terisolasi dalam 1 layer (mudah diganti fetch API) |
| Umpan balik pembimbing/penguji | Alur dinilai sesuai perancangan Bab III |

---

## 5. Target Pengguna (Actor & Persona)

Berdasarkan Use Case Diagram skripsi, aktor sistem hanya **satu**: **Admin**.

### 5.1 Tabel Actor

| Actor | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Admin** | Staf PLN / Dinas Sosial yang mengelola data pelanggan dan menjalankan proses klasifikasi | Login, kelola dataset, jalankan preprocessing, latih model, lihat evaluasi, jalankan prediksi, lihat & simpan laporan |

### 5.2 Persona Ringkas

> **"Bu Rina, 34 tahun — Analis Data Dinas Sosial/PLN"**
> Terbiasa dengan Excel dan aplikasi kantor, **bukan** programmer. Ia butuh alur yang jelas langkah-demi-langkah (upload → proses → hasil), istilah teknis ML yang dijelaskan seperlunya, tabel yang mudah dibaca, dan hasil akhir yang tegas: *Layak / Tidak Layak* beserta tingkat keyakinannya.

**Implikasi desain:** stepper/wizard untuk proses bertahap, label berbahasa Indonesia, tooltip untuk istilah teknis (mis. *F1-Score*), warna status yang konsisten (hijau = Layak, merah = Tidak Layak).

---

## 6. User Stories

Format: *Sebagai Admin, saya ingin … agar …*

| ID | User Story | Modul | Prioritas |
|---|---|---|---|
| US-01 | login dengan email & password agar hanya petugas berwenang yang mengakses sistem | Auth | Must |
| US-02 | melihat ringkasan sistem (jumlah dataset, hasil klasifikasi, model aktif) begitu masuk agar cepat memahami kondisi terkini | Dashboard | Must |
| US-03 | mengunggah file dataset (CSV/XLSX) dan melihat preview-nya agar yakin data yang masuk benar | Dataset | Must |
| US-04 | melihat daftar & detail dataset yang pernah diunggah agar mudah mengelolanya | Dataset | Must |
| US-05 | menjalankan preprocessing bertahap dengan status tiap langkah agar memahami apa yang terjadi pada data | Preprocessing | Must |
| US-06 | mengatur parameter LightGBM dan memulai training agar model dapat dilatih sesuai kebutuhan | Model | Must |
| US-07 | memantau progres training agar tahu kapan proses selesai | Model | Must |
| US-08 | melihat evaluasi model (Accuracy, Precision, Recall, F1-Score, Confusion Matrix, Feature Importance) agar dapat menilai kualitas model | Model | Must |
| US-09 | menetapkan satu model sebagai "model aktif" agar prediksi selalu memakai model terbaik | Model | Must |
| US-10 | menjalankan prediksi untuk 1 pelanggan (form manual) agar bisa demo/uji cepat | Prediksi | Must |
| US-11 | menjalankan prediksi batch dari file agar banyak pelanggan bisa diklasifikasi sekaligus | Prediksi | Must |
| US-12 | menyimpan hasil prediksi sebagai laporan agar dapat dirujuk kembali | Laporan | Must |
| US-13 | memfilter dan membuka detail laporan agar mudah mencari hasil analisis tertentu | Laporan | Should |
| US-14 | mengubah profil & password agar akun tetap aman | Pengaturan | Could |
| US-15 | logout agar sesi tertutup dengan aman | Auth | Must |

---

## 7. Tech Stack & Keputusan Arsitektur

| Layer | Teknologi | Alasan Pemilihan |
|---|---|---|
| Frontend | **Next.js 15 (App Router) + TypeScript** | Routing berbasis folder yang memetakan langsung sitemap; TypeScript menjaga kontrak data saat migrasi dummy → API |
| Styling | **Tailwind CSS** | Cepat membangun dashboard konsisten; utility-first cocok untuk komponen tabel/kartu/form |
| Komponen UI | Komponen custom + (opsional) **shadcn/ui** | Percepat form, table, dialog, toast dengan aksesibilitas bawaan |
| Charting | **Recharts** | Integrasi React natural; cukup untuk pie/bar chart & confusion matrix custom |
| State dummy | React state + Context (atau **Zustand**) + `localStorage` | Data dummy bertahan antar-halaman & antar-refresh selama demo |
| Backend (fase M8+) | **Python Flask + LightGBM** | Serving model: preprocessing, training, evaluasi, prediksi via REST API |
| Database (fase M9+) | **Supabase (PostgreSQL)** | Simpan dataset, metadata model, hasil prediksi, laporan; Auth bawaan |
| Auth (fase M9+) | Supabase Auth (email/password) | MVP: 1 admin, login dummy dulu |

### Keputusan Arsitektur Kunci

1. **Data-layer terisolasi:** semua data dummy diakses melalui satu folder `lib/data/` (mis. `getDatasets()`, `runTrainingMock()`). Saat integrasi, hanya isi fungsi-fungsi ini yang diganti `fetch()` — halaman tidak berubah.
2. **Tipe data dibekukan sejak awal:** semua entitas (Dataset, Model, Prediction, Report) didefinisikan sebagai TypeScript `interface` di `lib/types.ts`, mengikuti skema Supabase pada Bagian 14. Ini kontrak antara frontend ↔ backend.
3. **Simulasi proses asinkron:** training/preprocessing dummy memakai `setInterval`/`setTimeout` agar loading state dan progress bar teruji nyata sejak MVP.

---

## 8. Arsitektur Informasi (Sitemap)

```
/login
/dashboard
/dataset
  /dataset/upload
  /dataset/[datasetId]
/preprocessing
  /preprocessing/[datasetId]
/model
  /model/training
  /model/training/[jobId]
  /model/evaluation/[modelId]
/prediksi
  /prediksi/baru
  /prediksi/hasil/[predictionId]
/laporan
  /laporan/[id]
/pengaturan
```

**Total: 16 halaman** (1 auth + 15 dashboard).

---

## 9. Struktur Routing (Next.js App Router)

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx                     → /login
│
├── (dashboard)/                         → layout: Sidebar + Navbar (setelah login)
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx                     → /dashboard
│   ├── dataset/
│   │   ├── page.tsx                     → /dataset
│   │   ├── upload/
│   │   │   └── page.tsx                 → /dataset/upload
│   │   └── [datasetId]/
│   │       └── page.tsx                 → /dataset/:id
│   ├── preprocessing/
│   │   ├── page.tsx                     → /preprocessing
│   │   └── [datasetId]/
│   │       └── page.tsx                 → /preprocessing/:datasetId
│   ├── model/
│   │   ├── training/
│   │   │   ├── page.tsx                 → /model/training
│   │   │   └── [jobId]/
│   │   │       └── page.tsx             → /model/training/:jobId
│   │   └── evaluation/
│   │       └── [modelId]/
│   │           └── page.tsx             → /model/evaluation/:modelId
│   ├── prediksi/
│   │   ├── page.tsx                     → /prediksi
│   │   ├── baru/
│   │   │   └── page.tsx                 → /prediksi/baru
│   │   └── hasil/
│   │       └── [predictionId]/
│   │           └── page.tsx             → /prediksi/hasil/:id
│   ├── laporan/
│   │   ├── page.tsx                     → /laporan
│   │   └── [id]/
│   │       └── page.tsx                 → /laporan/:id
│   └── pengaturan/
│       └── page.tsx                     → /pengaturan
│
├── layout.tsx                            → root layout (font, metadata, provider)
└── page.tsx                              → "/" → redirect /dashboard (atau /login)
```

**Aturan navigasi:**
- Middleware memeriksa sesi (MVP: flag dummy di cookie/`localStorage`); belum login → redirect `/login`.
- Sidebar 7 menu, urut sesuai alur kerja Bab III: **Dashboard, Dataset, Preprocessing, Model, Prediksi, Laporan, Pengaturan**.
- Menu aktif di-highlight; breadcrumb pada halaman detail (mis. `Dataset / data_pelanggan.csv`).

---

## 10. Data Dictionary — Variabel Klasifikasi

Sembilan variabel input + 1 label, sesuai skripsi. Dipakai konsisten di: form prediksi manual (7.12), preview dataset, dan dokumentasi kontrak API.

| # | Variabel | Kunci (key) | Tipe | Contoh Nilai / Opsi | Kelompok |
|---|---|---|---|---|---|
| 1 | Penghasilan keluarga per bulan | `penghasilan` | number (Rp) | 1.500.000 | Sosial ekonomi |
| 2 | Jumlah anggota keluarga | `jumlah_anggota` | integer | 4 | Sosial ekonomi |
| 3 | Pekerjaan kepala keluarga | `pekerjaan` | kategori | Petani, Nelayan, Buruh, Wiraswasta, PNS, Karyawan Swasta, Tidak Bekerja, Lainnya | Sosial ekonomi |
| 4 | Status kepemilikan rumah | `status_rumah` | kategori | Milik Sendiri, Sewa/Kontrak, Menumpang | Sosial ekonomi |
| 5 | Luas bangunan | `luas_bangunan` | number (m²) | 36 | Sosial ekonomi |
| 6 | Status penerima bansos (PKH/BPNT) | `status_bansos` | kategori | PKH, BPNT, PKH & BPNT, Tidak Menerima | Sosial ekonomi |
| 7 | Daya terpasang | `daya_va` | kategori | 450 VA, 900 VA | Kelistrikan |
| 8 | Golongan tarif | `golongan_tarif` | kategori | R-1/450 VA, R-1/900 VA (subsidi), R-1M/900 VA (RTM/non-subsidi) | Kelistrikan |
| 9 | Pemakaian listrik per bulan | `pemakaian_kwh` | number (kWh) | 85 | Kelistrikan |
| — | **Label** | `label` | kategori | **Layak** / **Tidak Layak** | Target |

**Aturan validasi form (MVP, sisi klien):**
- Semua field wajib diisi.
- `penghasilan` ≥ 0; `jumlah_anggota` 1–20; `luas_bangunan` > 0; `pemakaian_kwh` ≥ 0.
- Field kategori memakai `select` (bukan input bebas) agar konsisten dengan encoding di backend nanti.

---

## 11. Kebutuhan Fungsional (FR) per Modul

Pemetaan fungsi Use Case skripsi → requirement ber-ID.

### Modul A — Autentikasi (Use Case: *Login*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-A1 | Sistem menampilkan form login (email + password) dengan validasi field kosong | Must |
| FR-A2 | Kredensial dummy valid → redirect `/dashboard`; salah → pesan error inline | Must |
| FR-A3 | Route dashboard terlindungi middleware; akses tanpa sesi → redirect `/login` | Must |
| FR-A4 | Tombol logout di Navbar menghapus sesi dummy dan kembali ke `/login` | Must |

### Modul B — Dataset (Use Case: *Import Dataset*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-B1 | Menampilkan daftar dataset (nama file, tanggal, jumlah baris, status, aksi) | Must |
| FR-B2 | Upload via drag-and-drop / file picker; format CSV & XLSX; validasi ekstensi | Must |
| FR-B3 | Preview 10 baris pertama + daftar kolom terdeteksi sebelum disimpan | Must |
| FR-B4 | Dataset tersimpan (dummy) muncul di daftar dengan status "Belum diproses" | Must |
| FR-B5 | Halaman detail: metadata, tabel data paginated, ringkasan kolom (tipe, missing) | Must |
| FR-B6 | Aksi hapus dataset dengan dialog konfirmasi | Should |

### Modul C — Preprocessing (Use Case: *Preprocessing Data*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-C1 | Daftar dataset berstatus "Belum diproses" yang dapat dipilih | Must |
| FR-C2 | Stepper 5 langkah: Cleaning → Handling Missing Value → Encoding → Normalisasi → Split Data (80:20) | Must |
| FR-C3 | Simulasi eksekusi per langkah dengan indikator status (menunggu/berjalan/selesai) | Must |
| FR-C4 | Ringkasan sebelum/sesudah: jumlah baris valid, distribusi label Layak vs Tidak Layak | Must |
| FR-C5 | Setelah selesai, status dataset berubah "Sudah preprocessing" & tombol lanjut ke training | Must |

### Modul D — Model (Use Case: *Pelatihan Model* & *Evaluasi Model*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-D1 | Form konfigurasi training: pilih dataset siap-latih + parameter LightGBM (`num_leaves`, `learning_rate`, `n_estimators`, `max_depth`) dengan nilai default | Must |
| FR-D2 | Simulasi progres training 0–100% dengan log bertahap | Must |
| FR-D3 | Halaman evaluasi: card Accuracy, Precision, Recall, F1-Score | Must |
| FR-D4 | Confusion Matrix 2×2 (TP/TN/FP/FN) dengan pewarnaan intensitas | Must |
| FR-D5 | Grafik Feature Importance (bar chart horizontal, 9 fitur) | Must |
| FR-D6 | Tombol "Jadikan Model Aktif" — hanya 1 model aktif pada satu waktu | Must |

### Modul E — Prediksi (Use Case: *Prediksi Klasifikasi*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-E1 | Riwayat batch prediksi dalam tabel | Must |
| FR-E2 | Dua mode input: upload file batch **atau** form manual 1 pelanggan (9 field Bagian 10) | Must |
| FR-E3 | Menampilkan model aktif yang digunakan; jika belum ada model aktif → arahkan ke training | Must |
| FR-E4 | Hasil manual: label besar LAYAK/TIDAK LAYAK + confidence score | Must |
| FR-E5 | Hasil batch: tabel per baris (ID pelanggan, fitur ringkas, hasil, confidence) | Must |
| FR-E6 | Tombol "Simpan ke Laporan" membuat entri laporan baru | Must |

### Modul F — Laporan & Dashboard (Use Case: *Tampilkan Hasil Analisis* & *Penyimpanan Hasil*)
| ID | Requirement | Prioritas |
|---|---|---|
| FR-F1 | Daftar laporan tersimpan + filter tanggal/model/status | Must |
| FR-F2 | Detail laporan: metrik model, tabel hasil, grafik distribusi Layak vs Tidak Layak | Must |
| FR-F3 | Tombol Export PDF/CSV (placeholder, toast "Segera hadir") | Should |
| FR-F4 | Dashboard: 4 card statistik, pie chart distribusi, tabel 5 aktivitas terbaru, 2 tombol shortcut | Must |
| FR-F5 | Angka dashboard konsisten dengan data dummy modul lain (single source of truth) | Must |

### Modul G — Pengaturan
| ID | Requirement | Prioritas |
|---|---|---|
| FR-G1 | Tampilan profil admin (nama, email) | Could |
| FR-G2 | Form ganti password (dummy, validasi konfirmasi password) | Could |

---

## 12. Detail Halaman (Page-by-Page)

> Setiap halaman mencantumkan: Tujuan, Komponen UI, State, dan Navigasi keluar.

### 7.1 `/login` — Halaman Login
- **Tujuan:** Autentikasi Admin (Activity Diagram Login).
- **Komponen:** Logo + judul sistem, form (email, password dengan toggle show/hide), tombol "Masuk" (loading spinner saat submit), pesan error inline.
- **State:** idle → submitting → success/error.
- **Navigasi:** sukses → `/dashboard`.
- **Dummy:** kredensial hardcoded, mis. `admin@pln.co.id` / `admin123`.

### 7.2 `/dashboard` — Ringkasan Sistem
- **Komponen:**
  - 4 card statistik: Total Dataset, Total Pelanggan Dianalisis, Rasio Layak : Tidak Layak, Model Aktif (+ akurasi).
  - Donut chart distribusi hasil klasifikasi (Recharts).
  - Tabel "Aktivitas Terbaru" (5 baris: jenis, deskripsi, waktu).
  - Shortcut: "Import Dataset Baru" → `/dataset/upload`; "Jalankan Prediksi Baru" → `/prediksi/baru`.
- **Empty state:** belum ada aktivitas → ilustrasi + CTA "Mulai dengan mengunggah dataset".

### 7.3 `/dataset` — Daftar Dataset
- **Komponen:** header + tombol "+ Upload Dataset Baru"; tabel (Nama file, Tanggal upload, Jumlah baris, Status badge, Aksi: Lihat / Preprocessing / Hapus); pencarian nama file (opsional).
- **Badge status:** `Belum diproses` (abu-abu), `Sudah preprocessing` (hijau).

### 7.4 `/dataset/upload` — Upload Dataset
- **Komponen:** dropzone (drag-and-drop + klik), indikator file terpilih (nama, ukuran), preview tabel 10 baris pertama, daftar kolom terdeteksi (chip), tombol "Simpan Dataset" & "Batal".
- **Validasi:** hanya `.csv`/`.xlsx`; file lain → pesan error.
- **Navigasi:** simpan → `/dataset/[datasetId]` dengan toast sukses.

### 7.5 `/dataset/[datasetId]` — Detail Dataset
- **Komponen:** breadcrumb, metadata (nama, baris×kolom, tanggal, status), tabel data paginated (10 baris/halaman), panel ringkasan kolom (nama, tipe, jumlah missing — placeholder), tombol "Lanjut ke Preprocessing" → `/preprocessing/[datasetId]`.

### 7.6 `/preprocessing` — Pilih Dataset
- **Komponen:** daftar/kartu dataset berstatus "Belum diproses", tombol "Mulai Preprocessing" per item.
- **Empty state:** semua sudah diproses → info + link ke `/dataset/upload`.

### 7.7 `/preprocessing/[datasetId]` — Proses Preprocessing
- **Komponen:**
  - Stepper vertikal 5 langkah: **Cleaning Data → Handling Missing Value → Encoding Kategori → Normalisasi → Split Data (Train/Test 80:20)**; tiap langkah punya deskripsi singkat + status ikon.
  - Panel ringkasan Sebelum/Sesudah: total baris, baris valid, distribusi label (2 mini bar).
  - Tombol "Jalankan Preprocessing" → animasi langkah berjalan berurutan (delay ± 1 dtk/langkah).
  - Setelah selesai: banner sukses + tombol "Lanjut ke Training Model" → `/model/training?dataset=[id]`.

### 7.8 `/model/training` — Konfigurasi & Mulai Training
- **Komponen:** select dataset siap-latih; form parameter dengan default & keterangan:

  | Parameter | Default | Rentang input |
  |---|---|---|
  | `num_leaves` | 31 | 2–256 |
  | `learning_rate` | 0.1 | 0.001–1 |
  | `n_estimators` | 100 | 10–1000 |
  | `max_depth` | -1 (tanpa batas) | -1 s.d. 32 |

- tombol "Mulai Training" → `/model/training/[jobId]`.

### 7.9 `/model/training/[jobId]` — Progress Training
- **Komponen:** progress bar 0–100%, log console bergaya terminal ("Memuat data…", "Training iterasi 50/100…", "Menghitung metrik…", "Selesai ✔"), ringkasan singkat (accuracy sekilas) setelah selesai, tombol "Lihat Evaluasi Lengkap" → `/model/evaluation/[modelId]`.
- **Catatan:** halaman tidak boleh bisa "diskip" saat progres berjalan (tombol disabled).

### 7.10 `/model/evaluation/[modelId]` — Evaluasi Model
- **Komponen:**
  - 4 card metrik: Accuracy, Precision, Recall, F1-Score (dummy realistis, mis. 91–95%).
  - Confusion Matrix 2×2 dengan label sumbu (Aktual × Prediksi) dan sel TP/TN/FP/FN berwarna gradasi.
  - Bar chart horizontal Feature Importance untuk 9 fitur (Bagian 10).
  - Info parameter training yang dipakai.
  - Tombol "Jadikan Model Aktif" → badge "Model Aktif" + toast; model aktif sebelumnya otomatis nonaktif.

### 7.11 `/prediksi` — Riwayat Prediksi
- **Komponen:** tabel riwayat (Tanggal, Jenis manual/batch, Jumlah data, Model, Ringkasan "X Layak / Y Tidak Layak", Aksi Lihat), tombol "+ Prediksi Baru".

### 7.12 `/prediksi/baru` — Jalankan Prediksi Baru
- **Komponen:**
  - Info model aktif (nama + akurasi); jika tidak ada → alert + link ke `/model/training`.
  - Tab/segmented control: **Input Manual** | **Upload Batch**.
  - *Input Manual:* form 9 field sesuai Data Dictionary (Bagian 10), tersusun 2 kelompok (Sosial Ekonomi & Kelistrikan).
  - *Upload Batch:* dropzone CSV + preview.
  - Tombol "Jalankan Klasifikasi" → simulasi loading 1–2 dtk → `/prediksi/hasil/[predictionId]`.

### 7.13 `/prediksi/hasil/[predictionId]` — Hasil Prediksi
- **Komponen:**
  - *Manual:* label besar **LAYAK** (hijau) / **TIDAK LAYAK** (merah) + confidence (mis. 92,4%) + rekap input.
  - *Batch:* card ringkasan (total, X Layak, Y Tidak Layak) + tabel hasil per baris.
  - Tombol "Simpan ke Laporan" (→ entri baru di `/laporan` + toast) & "Export CSV" (placeholder).

### 7.14 `/laporan` — Daftar Laporan
- **Komponen:** tabel (Judul, Tanggal, Model, Jumlah data, Ringkasan hasil, Aksi), filter (rentang tanggal, model, status), tombol "Lihat Detail".

### 7.15 `/laporan/[id]` — Detail Laporan
- **Komponen:** header laporan, metrik model yang dipakai, tabel hasil klasifikasi, pie/bar chart distribusi Layak vs Tidak Layak, tombol "Export PDF" (placeholder).

### 7.16 `/pengaturan` — Pengaturan Admin
- **Komponen:** card profil (nama, email, role), form ganti password (password lama, baru, konfirmasi; dummy), tombol simpan + toast.

---

## 13. Spesifikasi Dummy Data & State Management

Agar demo terasa nyata dan konsisten antar-halaman:

| Entitas | Jumlah seed | Catatan |
|---|---|---|
| `datasets` | 3 (2 "Sudah preprocessing", 1 "Belum diproses") | Nama file realistis, mis. `data_pelanggan_pln_aceh_2025.csv`, 500–2.000 baris |
| Baris data pelanggan | ± 50 baris dummy per dataset (untuk preview & tabel) | Nilai mengikuti Data Dictionary; distribusi label ± 60% Layak : 40% Tidak Layak |
| `models` | 2 (1 aktif, accuracy 93,2%) | Parameter default LightGBM |
| `predictions` | 3 riwayat (1 manual, 2 batch) | Confidence 70–98% |
| `reports` | 2 laporan | Terhubung ke predictions |
| Aktivitas dashboard | 5 entri | Import, preprocessing, training, prediksi, simpan laporan |

**Aturan implementasi:**
- Seluruh seed berada di `lib/data/seed.ts`; akses hanya lewat fungsi di `lib/data/*.ts`.
- Mutasi (upload, training, prediksi, simpan laporan) memperbarui store (Context/Zustand) + `localStorage`, sehingga Dashboard, Laporan, dan Riwayat selalu sinkron (memenuhi FR-F5).
- ID memakai format konsisten, mis. `ds_001`, `mdl_001`, `prd_001`, `rpt_001`, `job_001`.

---

## 14. Skema Database (Supabase / PostgreSQL — disiapkan, belum wajib fungsional)

```sql
-- datasets
id            uuid PK default gen_random_uuid()
nama_file     text NOT NULL
jumlah_baris  integer
jumlah_kolom  integer
status        text CHECK (status IN ('belum_diproses','sudah_preprocessing'))
storage_path  text            -- path file di Supabase Storage
uploaded_at   timestamptz default now()

-- preprocessing_logs
id            uuid PK
dataset_id    uuid FK → datasets.id
langkah       text            -- cleaning | missing_value | encoding | normalisasi | split
status        text            -- pending | running | done | failed
hasil_ringkas jsonb           -- { baris_sebelum, baris_sesudah, distribusi_label }
created_at    timestamptz

-- models
id            uuid PK
dataset_id    uuid FK → datasets.id
parameter     jsonb           -- { num_leaves, learning_rate, n_estimators, max_depth }
accuracy      numeric(5,4)
precision_    numeric(5,4)    -- "precision" reserved-ish; beri underscore
recall        numeric(5,4)
f1_score      numeric(5,4)
confusion     jsonb           -- { tp, tn, fp, fn }
feature_importance jsonb      -- [{fitur, skor}]
is_active     boolean default false
model_path    text            -- path artefak .txt/.pkl LightGBM
created_at    timestamptz

-- predictions
id            uuid PK
model_id      uuid FK → models.id
jenis         text CHECK (jenis IN ('manual','batch'))
input_data    jsonb           -- manual: 1 objek; batch: metadata file
hasil         jsonb           -- [{id_pelanggan, label, confidence}] / objek tunggal
jumlah_layak  integer
jumlah_tidak  integer
created_at    timestamptz

-- reports
id            uuid PK
prediction_id uuid FK → predictions.id
model_id      uuid FK → models.id
judul         text
created_at    timestamptz

-- admin_users (dikelola Supabase Auth + tabel profil)
id            uuid PK (ref auth.users)
email         text
nama          text
role          text default 'admin'
```

**Catatan:** aktifkan RLS dengan kebijakan sederhana "hanya user ber-role admin" saat integrasi (M9).

---

## 15. Kontrak API Flask (Disiapkan untuk Fase Integrasi — M8)

Frontend MVP mem-mock respons persis berformat ini, agar migrasi tinggal ganti URL.

| Endpoint | Method | Request (ringkas) | Response (ringkas) |
|---|---|---|---|
| `/api/preprocess` | POST | `{ dataset_id }` | `{ status, langkah: [...], ringkasan: { baris_valid, distribusi_label } }` |
| `/api/train` | POST | `{ dataset_id, parameter: { num_leaves, learning_rate, n_estimators, max_depth } }` | `{ job_id }` |
| `/api/train/status/<job_id>` | GET | — | `{ progress: 0-100, log: [...], model_id? }` |
| `/api/evaluate/<model_id>` | GET | — | `{ accuracy, precision, recall, f1_score, confusion: {tp,tn,fp,fn}, feature_importance: [...] }` |
| `/api/predict` | POST | `{ model_id, mode: 'manual'|'batch', data: {...} | file }` | `{ prediction_id, hasil: [{label, confidence}, ...] }` |

Format error seragam: `{ error: { code, message } }` dengan HTTP status semantik (400/404/500).

---

## 16. Design System & Panduan UI

| Elemen | Ketentuan |
|---|---|
| **Warna primer** | Biru PLN-like (mis. `#0F62AC`) untuk aksi utama & sidebar aktif |
| **Warna semantik** | Hijau `#16A34A` = Layak/sukses; Merah `#DC2626` = Tidak Layak/error; Kuning `#F59E0B` = peringatan/pending; Abu = netral |
| **Tipografi** | 1 keluarga font (mis. Inter); skala: 24/20/16/14/12 |
| **Komponen wajib reusable** | Button (primary/secondary/danger/ghost), Input, Select, Card, Table (+ pagination), Badge status, Modal/Dialog, Toast, Stepper, StatCard, EmptyState, Skeleton |
| **Layout dashboard** | Sidebar tetap kiri (≥1024px), collapsible di tablet; konten max-width nyaman; padding konsisten (mis. `p-6`) |
| **Ikon** | lucide-react, ukuran konsisten 16/20px |
| **Bahasa antarmuka** | Bahasa Indonesia penuh; istilah ML tetap Inggris bila lazim (Accuracy, F1-Score) + tooltip penjelasan |

---

## 17. Kebutuhan Non-Fungsional (NFR)

| ID | Kebutuhan | Target |
|---|---|---|
| NFR-1 | **Responsif** | Layak penuh di desktop ≥1280px; terbaca & fungsional di tablet ≥768px |
| NFR-2 | **Konsistensi UI** | 100% halaman memakai komponen Bagian 16; tanpa warna/spacing ad-hoc |
| NFR-3 | **Loading state** | Semua area yang kelak memanggil API punya Skeleton/Spinner sejak MVP |
| NFR-4 | **Aksesibilitas dasar** | Kontras teks ≥ WCAG AA; semua input ber-`label`; fokus keyboard terlihat |
| NFR-5 | **Performa** | Navigasi antar-halaman terasa instan (dummy data lokal); tanpa layout shift mencolok |
| NFR-6 | **Kesiapan integrasi** | Data-layer terisolasi (Bagian 7.3 poin 1); tipe TypeScript = kontrak API |
| NFR-7 | **Maintainability** | Penamaan file/komponen konsisten; tanpa duplikasi komponen tabel/form antar-modul |

---

## 18. Penanganan State: Loading, Empty, Error

| Situasi | Perlakuan UI |
|---|---|
| Data sedang "dimuat" | Skeleton (tabel: baris skeleton; card: blok skeleton) |
| Daftar kosong (dataset/laporan/prediksi) | EmptyState: ilustrasi/ikon + kalimat + CTA relevan |
| Belum ada model aktif saat membuka Prediksi | Alert kuning + tombol "Latih Model Sekarang" |
| Upload file salah format | Pesan error di dropzone, file ditolak |
| Form invalid | Error inline per-field, submit disabled sampai valid |
| Aksi destruktif (hapus dataset) | Dialog konfirmasi dengan penjelasan akibat |
| Aksi sukses | Toast hijau singkat |
| Fitur placeholder (Export PDF/CSV) | Toast info "Fitur akan tersedia pada fase integrasi" |

---

## 19. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Dummy data antar-halaman tidak sinkron (dashboard ≠ laporan) | Demo terlihat tidak kredibel | Single store (Context/Zustand) + seed terpusat (Bagian 13) |
| Struktur dummy berbeda dengan output Flask nanti | Rework besar saat integrasi | Bekukan kontrak API (Bagian 15) & tipe TS sejak M0 |
| Scope creep (menambah fitur di luar Use Case skripsi) | Molor dari estimasi | Non-Goals (Bagian 3.2) sebagai acuan penolakan fitur |
| Terlalu lama mempercantik UI di awal | Milestone akhir terdesak | Design system dikunci di M0; polish dipusatkan di M7 |
| Ketidaksesuaian dengan diagram Bab III | Revisi dari pembimbing | Review silang Use Case/Activity Diagram di M7 (checklist) |

---

## 20. Kriteria Penerimaan MVP (Acceptance Criteria)

MVP dinyatakan **selesai** bila seluruh butir berikut terpenuhi:

1. ✅ 16 halaman terimplementasi dan dapat diakses sesuai sitemap; tidak ada 404/link mati.
2. ✅ Alur end-to-end dapat didemokan: Login → Upload Dataset → Preprocessing → Training → Evaluasi → Jadikan Model Aktif → Prediksi (manual & batch) → Simpan ke Laporan → Lihat di Dashboard.
3. ✅ Seluruh 8 fungsi Use Case skripsi terwakili minimal 1 halaman/aksi.
4. ✅ Semua FR ber-prioritas *Must* (Bagian 11) terpenuhi.
5. ✅ Data dummy konsisten lintas halaman (angka dashboard = agregat modul lain).
6. ✅ Loading/empty/error state tersedia sesuai Bagian 18.
7. ✅ Design system dipakai konsisten (audit visual M7 lulus).
8. ✅ Dokumentasi singkat `README.md`: cara menjalankan, kredensial dummy, peta folder.

---

## 21. Glosarium

| Istilah | Arti |
|---|---|
| **LightGBM** | Light Gradient Boosting Machine — algoritma gradient boosting berbasis pohon keputusan yang efisien untuk klasifikasi data tabular |
| **Preprocessing** | Tahap penyiapan data: pembersihan, penanganan missing value, encoding kategori, normalisasi, dan pembagian data latih/uji |
| **Confusion Matrix** | Tabel 2×2 berisi TP, TN, FP, FN untuk mengukur performa klasifikasi |
| **Accuracy / Precision / Recall / F1-Score** | Metrik evaluasi model klasifikasi (sesuai Bab III.5.2–3.5.3 skripsi) |
| **Feature Importance** | Skor kontribusi tiap fitur terhadap keputusan model |
| **Confidence** | Probabilitas keyakinan model terhadap label hasil prediksi |
| **Model Aktif** | Model yang ditetapkan sebagai model yang dipakai modul Prediksi |
| **PKH / BPNT** | Program Keluarga Harapan / Bantuan Pangan Non-Tunai (program bansos) |
| **R-1/450 VA & R-1/900 VA** | Golongan tarif rumah tangga bersubsidi PLN |

---

*Dokumen ini adalah acuan pembangunan kerangka UI & routing MVP. Perubahan scope wajib dicatat sebagai revisi versi dokumen.*
