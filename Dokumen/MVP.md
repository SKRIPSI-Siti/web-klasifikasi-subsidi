# MVP Plan — Milestone Breakdown
## Sistem Klasifikasi Kelayakan Penerima Subsidi Listrik Rumah Tangga Pelanggan PLN Aceh Menggunakan Metode Light Gradient Boosting Machine (LightGBM)

| Informasi | Keterangan |
|---|---|
| **Versi** | 2.0 — selaras dengan PRD v2.0 |
| **Stack** | Next.js 15 (App Router) + TypeScript + Tailwind CSS + Recharts; Supabase & Flask disiapkan untuk fase lanjutan |
| **Fokus tahap ini** | Kerangka UI + routing 16 halaman dengan dummy data terpusat (belum terhubung backend nyata) |
| **Referensi** | PRD v2.0 (FR/NFR ber-ID), Bab III skripsi (Use Case & Activity Diagram) |

---

## 1. Ringkasan Milestone & Timeline

| Milestone | Nama | Cakupan FR (PRD) | Estimasi | Dependensi |
|---|---|---|---|---|
| **M0** | Setup Project & Design Foundation | — (fondasi) | 1–2 hari | — |
| **M1** | Auth Flow & Layout Utama | FR-A1…A4 | 1–2 hari | M0 |
| **M2** | Modul Dataset | FR-B1…B6 | 2 hari | M1 |
| **M3** | Modul Preprocessing | FR-C1…C5 | 1–2 hari | M2 |
| **M4** | Modul Model (Training & Evaluasi) | FR-D1…D6 | 2–3 hari | M3 |
| **M5** | Modul Prediksi | FR-E1…E6 | 2 hari | M4 |
| **M6** | Modul Laporan & Dashboard (+ Pengaturan) | FR-F1…F5, FR-G1…G2 | 2 hari | M5 |
| **M7** | QA Internal & Polish Akhir | Audit NFR-1…7 | 1 hari | M0–M6 |

**Total estimasi:** ± **12–16 hari kerja** (part-time) untuk kerangka UI lengkap siap didemokan.

**Prinsip pengerjaan:**
1. **Vertikal per modul** — tiap milestone menghasilkan bagian yang bisa didemokan mandiri, mengikuti urutan alur Bab III.
2. **Dummy-first, contract-locked** — data dummy hanya lewat `lib/data/*`, bentuknya mengikuti kontrak API Flask (PRD Bagian 15) agar migrasi mudah.
3. **Definition of Done ketat** — milestone dianggap selesai hanya jika seluruh exit criteria tercentang.

```
Gantt sederhana (hari kerja):
M0 ██
M1   ██
M2     ██
M3       ██
M4         ███
M5            ██
M6              ██
M7                █
```

---

## 2. M0 — Setup Project & Design Foundation (1–2 hari)

**Tujuan:** Menyiapkan fondasi teknis, tipe data, dan visual sebelum membangun halaman — agar M1–M6 tinggal "merakit".

### Task Checklist
- [ ] Inisialisasi project: `create-next-app` (App Router, TypeScript, Tailwind, ESLint).
- [ ] Konfigurasi tema Tailwind: warna primer `#0F62AC`, semantik (hijau/merah/kuning/abu), font Inter, skala tipografi 24/20/16/14/12.
- [ ] Struktur folder sesuai routing PRD Bagian 9: `app/(auth)`, `app/(dashboard)`, `components/ui`, `components/layout`, `lib/data`, `lib/types.ts`, `lib/utils.ts`.
- [ ] Definisikan **seluruh tipe entitas** di `lib/types.ts`: `Dataset`, `PreprocessingLog`, `Model`, `Prediction`, `Report`, `Activity`, `AdminUser` — mengikuti skema Supabase (PRD Bagian 14).
- [ ] Buat **seed dummy terpusat** `lib/data/seed.ts` sesuai spesifikasi PRD Bagian 13 (3 dataset, 2 model, 3 prediksi, 2 laporan, 5 aktivitas, ±50 baris pelanggan/dataset).
- [ ] Buat store global (Context/Zustand) + persist `localStorage` untuk mutasi dummy.
- [ ] Bangun komponen dasar reusable: **Button, Input, Select, Card, Table (+Pagination), Badge, Modal/Dialog, Toast, Stepper, StatCard, EmptyState, Skeleton, Sidebar, Navbar**.
- [ ] Rancang skema Supabase (SQL DDL) sebagai file dokumentasi `docs/schema.sql` (belum dijalankan).
- [ ] Halaman placeholder untuk 16 route (judul + "coming soon") agar routing terverifikasi dini.

### Deliverable
- Project berjalan (`npm run dev`) dengan seluruh route ter-generate.
- Storybook mini/halaman `/dev/ui` (opsional) untuk melihat semua komponen dasar.
- `docs/schema.sql` + `lib/types.ts` sebagai kontrak data.

### Exit Criteria (Definition of Done)
- ✅ Semua 16 route dapat diakses (placeholder, tanpa 404).
- ✅ Komponen dasar dipakai ulang tanpa styling ad-hoc.
- ✅ Tipe TypeScript entitas final & disepakati (tidak berubah tanpa alasan kuat).

---

## 3. M1 — Auth Flow & Layout Utama (1–2 hari)

**Tujuan:** Alur masuk sistem + kerangka navigasi (sesuai Activity Diagram Login). Memenuhi **FR-A1…A4**.

### Task Checklist
- [ ] `/login`: form email + password (toggle show/hide), validasi field kosong, loading saat submit, error inline untuk kredensial salah.
- [ ] Kredensial dummy: `admin@pln.co.id` / `admin123` (didokumentasikan di README).
- [ ] Simpan sesi dummy (cookie/`localStorage`) + middleware Next.js: tanpa sesi → redirect `/login`; sudah login akses `/login` → redirect `/dashboard`.
- [ ] `layout.tsx` grup `(dashboard)`: Sidebar 7 menu (**Dashboard, Dataset, Preprocessing, Model, Prediksi, Laporan, Pengaturan**) dengan highlight menu aktif; Navbar (nama admin, avatar inisial, tombol logout).
- [ ] Root `page.tsx` (`/`): redirect ke `/dashboard` atau `/login` sesuai sesi.
- [ ] Sidebar collapsible untuk tablet (≥768px).

### Deliverable
- Login dummy fungsional dengan proteksi route penuh.
- Sidebar + Navbar konsisten di seluruh halaman dashboard.

### Exit Criteria
- ✅ Login benar → `/dashboard`; salah → pesan error tanpa reload aneh.
- ✅ Semua menu sidebar mengarah ke route benar (bukan link mati).
- ✅ Logout menghapus sesi & kembali ke `/login`; akses paksa URL dashboard tanpa sesi tertolak.

---

## 4. M2 — Modul Dataset (2 hari)

**Tujuan:** Merepresentasikan fungsi *Import Dataset* (Bab III). Memenuhi **FR-B1…B6**.

### Halaman
| Route | Isi |
|---|---|
| `/dataset` | Tabel dataset: Nama file, Tanggal upload, Jumlah baris, Badge status, Aksi (Lihat / Preprocessing / Hapus) + tombol "+ Upload Dataset Baru" |
| `/dataset/upload` | Dropzone CSV/XLSX (drag-and-drop + picker), preview 10 baris pertama, chip kolom terdeteksi, tombol Simpan/Batal |
| `/dataset/[datasetId]` | Metadata, tabel data paginated (10/hal), ringkasan kolom (tipe & missing — placeholder), tombol "Lanjut ke Preprocessing" |

### Task Checklist
- [ ] Render daftar dari store (seed M0), pencarian nama file (opsional).
- [ ] Validasi ekstensi upload; file salah → error di dropzone (PRD Bagian 18).
- [ ] Parsing preview dummy (boleh hasil parse nyata via PapaParse/SheetJS untuk CSV, atau mock).
- [ ] "Simpan Dataset" → tambah entri baru ke store (status "Belum diproses") + toast + redirect ke detail.
- [ ] Hapus dataset → dialog konfirmasi → hilang dari daftar.
- [ ] Empty state daftar dataset (bila store dikosongkan).

### Exit Criteria
- ✅ Alur lengkap: daftar → upload → preview → simpan → muncul di daftar → buka detail.
- ✅ "Lanjut ke Preprocessing" membawa `datasetId` yang benar ke M3.
- ✅ Dataset baru tercatat sebagai aktivitas di store (untuk Dashboard M6).

---

## 5. M3 — Modul Preprocessing (1–2 hari)

**Tujuan:** Merepresentasikan tahap *Preprocessing Data*. Memenuhi **FR-C1…C5**.

### Halaman
| Route | Isi |
|---|---|
| `/preprocessing` | Daftar dataset berstatus "Belum diproses" + tombol "Mulai Preprocessing"; empty state bila tidak ada |
| `/preprocessing/[datasetId]` | Stepper 5 langkah + panel ringkasan sebelum/sesudah + tombol eksekusi |

### Task Checklist
- [ ] Stepper vertikal: **Cleaning Data → Handling Missing Value → Encoding Kategori → Normalisasi → Split Data (80:20)** dengan deskripsi singkat per langkah.
- [ ] Simulasi eksekusi berurutan (delay ±1 dtk/langkah) dengan status ikon: menunggu ○ / berjalan ◐ (spinner) / selesai ✔.
- [ ] Panel ringkasan sebelum/sesudah: total baris → baris valid, distribusi label Layak vs Tidak Layak (mini bar, angka dummy konsisten seed).
- [ ] Selesai → banner sukses, status dataset di store berubah "Sudah preprocessing", tombol "Lanjut ke Training Model" → `/model/training?dataset=[id]`.
- [ ] Tombol tidak bisa dipicu ulang saat proses berjalan.

### Exit Criteria
- ✅ Status dataset di `/dataset` ikut berubah setelah proses selesai (satu store, FR-F5).
- ✅ Alur mulus ke M4 dengan dataset terpilih otomatis.

---

## 6. M4 — Modul Model: Training & Evaluasi (2–3 hari)

**Tujuan:** Merepresentasikan *Pelatihan Model LightGBM* dan *Evaluasi Model*. Memenuhi **FR-D1…D6**.

### Halaman
| Route | Isi |
|---|---|
| `/model/training` | Select dataset siap-latih + form parameter LightGBM (default: `num_leaves=31`, `learning_rate=0.1`, `n_estimators=100`, `max_depth=-1`) + validasi rentang |
| `/model/training/[jobId]` | Progress bar 0–100% + log bergaya terminal + ringkasan accuracy sekilas |
| `/model/evaluation/[modelId]` | 4 card metrik, Confusion Matrix 2×2, bar chart Feature Importance (9 fitur), info parameter, tombol "Jadikan Model Aktif" |

### Task Checklist
- [ ] Form parameter dengan keterangan/tooltip tiap parameter + validasi rentang (PRD 7.8).
- [ ] "Mulai Training" → buat `job_id` di store → redirect halaman progres.
- [ ] Simulasi progres bertahap (interval) + log: "Memuat data…" → "Training iterasi i/n…" → "Menghitung metrik…" → "Selesai ✔"; tombol lanjut disabled sampai 100%.
- [ ] Generate hasil evaluasi dummy realistis (Accuracy/Precision/Recall/F1 di kisaran 91–95%, confusion matrix konsisten dengan jumlah data uji, feature importance 9 fitur sesuai Data Dictionary).
- [ ] Confusion Matrix dengan pewarnaan intensitas & label sumbu Aktual × Prediksi.
- [ ] "Jadikan Model Aktif": hanya 1 model aktif; model aktif lama otomatis nonaktif; badge + toast.
- [ ] Training tercatat sebagai aktivitas (Dashboard M6).

### Exit Criteria
- ✅ Admin bisa memicu training dummy end-to-end dan membuka evaluasi lengkap.
- ✅ Minimal 1 model aktif tersedia & dirujuk modul Prediksi (M5).
- ✅ Angka metrik ↔ confusion matrix ↔ jumlah data uji saling konsisten (tidak asal acak).

---

## 7. M5 — Modul Prediksi (2 hari)

**Tujuan:** Merepresentasikan *Prediksi Klasifikasi* dengan model aktif. Memenuhi **FR-E1…E6**.

### Halaman
| Route | Isi |
|---|---|
| `/prediksi` | Tabel riwayat: Tanggal, Jenis (manual/batch), Jumlah data, Model, Ringkasan "X Layak / Y Tidak Layak", Aksi |
| `/prediksi/baru` | Info model aktif + tab **Input Manual** / **Upload Batch** |
| `/prediksi/hasil/[predictionId]` | Hasil manual (label besar + confidence) atau batch (ringkasan + tabel) |

### Task Checklist
- [ ] Guard: belum ada model aktif → alert kuning + tombol "Latih Model Sekarang" (PRD Bagian 18).
- [ ] Form manual 9 field sesuai **Data Dictionary PRD Bagian 10**, dikelompokkan *Sosial Ekonomi* dan *Kelistrikan*; field kategori memakai `select`; validasi rentang numerik; submit disabled sampai valid.
- [ ] Upload batch: dropzone CSV + preview ringkas.
- [ ] "Jalankan Klasifikasi" → loading 1–2 dtk → hasil dummy (label + confidence 70–98%) → redirect halaman hasil.
- [ ] Hasil manual: label besar **LAYAK** (hijau) / **TIDAK LAYAK** (merah) + confidence + rekap input.
- [ ] Hasil batch: card ringkasan (total, X Layak, Y Tidak Layak) + tabel per baris.
- [ ] "Simpan ke Laporan" → buat entri `report` di store + toast + tombol berubah "Tersimpan ✔"; "Export CSV" → toast placeholder.
- [ ] Prediksi tercatat di riwayat & aktivitas.

### Exit Criteria
- ✅ Prediksi manual & batch dapat dijalankan dan hasilnya tervisualisasi jelas.
- ✅ Hasil yang disimpan langsung muncul di modul Laporan (M6) tanpa refresh manual.

---

## 8. M6 — Modul Laporan, Dashboard & Pengaturan (2 hari)

**Tujuan:** Merepresentasikan *Menampilkan Hasil Analisis* & *Penyimpanan Hasil* + ringkasan sistem. Memenuhi **FR-F1…F5, FR-G1…G2**.

### Halaman
| Route | Isi |
|---|---|
| `/laporan` | Tabel laporan + filter (rentang tanggal, model, status) |
| `/laporan/[id]` | Metrik model, tabel hasil klasifikasi, chart distribusi Layak/Tidak Layak, tombol "Export PDF" (placeholder) |
| `/dashboard` | 4 StatCard, donut chart distribusi, tabel 5 aktivitas terbaru, 2 tombol shortcut |
| `/pengaturan` | Profil admin + form ganti password (dummy) |

### Task Checklist
- [ ] Daftar laporan membaca store yang sama dengan M5 (laporan tersimpan otomatis muncul).
- [ ] Filter fungsional atas data dummy (tanggal/model/status).
- [ ] Detail laporan menampilkan metrik model terkait + distribusi hasil (Recharts).
- [ ] Dashboard: agregasi **dihitung dari store** (bukan angka hardcoded terpisah) → Total dataset, Total pelanggan dianalisis, Rasio Layak:Tidak Layak, Model aktif + akurasi.
- [ ] Tabel aktivitas terbaru (5 entri terakhir dari store: import, preprocessing, training, prediksi, simpan laporan).
- [ ] Shortcut: "Import Dataset Baru" → `/dataset/upload`; "Jalankan Prediksi Baru" → `/prediksi/baru`.
- [ ] Empty state dashboard bila store kosong.
- [ ] Pengaturan: card profil + form ganti password (validasi konfirmasi) + toast.

### Exit Criteria
- ✅ Alur end-to-end penuh tertelusuri tanpa dead-end: Login → Dataset → Preprocessing → Training → Evaluasi → Prediksi → Laporan → Dashboard.
- ✅ Angka dashboard = agregat data dummy modul lain (FR-F5 lulus).

---

## 9. M7 — QA Internal & Polish Akhir (1 hari)

**Tujuan:** Memastikan konsistensi dan kesiapan demo/integrasi. Audit terhadap **NFR-1…7** dan Kriteria Penerimaan PRD Bagian 20.

### Checklist QA
**Fungsional & navigasi**
- [ ] Klik semua tombol/link di 16 halaman → 0 link mati/404.
- [ ] Skenario demo end-to-end < 5 menit tanpa error (sesuai Metrik Keberhasilan PRD Bagian 4).
- [ ] Refresh di tengah alur → state dummy tetap konsisten (persist `localStorage`).

**Kesesuaian skripsi**
- [ ] Review silang Use Case Diagram: 8/8 fungsi terwakili (Login, Import Dataset, Preprocessing, Training, Prediksi, Evaluasi, Tampilkan Hasil, Simpan Hasil).
- [ ] Review Activity Diagram Login vs perilaku `/login` + middleware.
- [ ] Istilah pada UI konsisten dengan istilah Bab III (agar mudah dipertanggungjawabkan saat sidang).

**Visual & UX**
- [ ] Audit warna/spacing/tipografi lintas halaman (design system PRD Bagian 16).
- [ ] Semua loading/empty/error state sesuai PRD Bagian 18.
- [ ] Kontras teks & label form (aksesibilitas dasar, NFR-4).
- [ ] Responsivitas: desktop ≥1280px penuh; tablet ≥768px terbaca & fungsional.

**Kesiapan integrasi**
- [ ] Semua akses data hanya lewat `lib/data/*` (grep pastikan tidak ada dummy inline di halaman).
- [ ] Bentuk data dummy = kontrak API Flask (PRD Bagian 15).
- [ ] `README.md`: cara run, kredensial dummy, peta folder, catatan integrasi.

### Exit Criteria
- ✅ Seluruh Kriteria Penerimaan PRD Bagian 20 (butir 1–8) tercentang.
- ✅ Kerangka MVP siap didemokan ke pembimbing/penguji **atau** lanjut fase integrasi.

---

## 10. Roadmap Setelah MVP UI (Referensi — di luar scope M0–M7)

| Fase | Deskripsi | Ketergantungan |
|---|---|---|
| **M8** | Bangun Flask API sesuai kontrak PRD Bagian 15: `/api/preprocess`, `/api/train` (+status job), `/api/evaluate`, `/api/predict` — menjalankan LightGBM asli dari notebook skripsi | Model & pipeline dari skripsi final |
| **M9** | Hubungkan Supabase nyata (Auth admin, Storage dataset, tabel PRD Bagian 14 + RLS) menggantikan store dummy | M8 |
| **M10** | Export PDF/CSV fungsional di halaman Laporan & Hasil Prediksi | M9 |
| **M11** | Pengujian **Black Box** sesuai skenario Bab III.5.1 skripsi (import, preprocessing, training, prediksi, evaluasi, tampilan hasil, penyimpanan) + dokumentasi hasil uji untuk Bab IV | M8–M10 |

---

## 11. Manajemen Risiko Jadwal

| Risiko | Mitigasi |
|---|---|
| M4 molor (halaman paling kompleks: 3 halaman + chart) | Alokasi 3 hari; confusion matrix pakai tabel HTML berwarna (bukan chart lib custom) |
| Tergoda mempercantik terlalu dini | Polish dikunci hanya di M7; M1–M6 pakai komponen M0 apa adanya |
| Perubahan permintaan dari pembimbing di tengah jalan | Update PRD dulu (naik versi), baru sesuaikan milestone — hindari perubahan diam-diam |
| Waktu part-time terpotong pekerjaan lain | Setiap milestone berdiri sendiri & bisa didemokan parsial, sehingga jeda tidak merusak progres |

---

*Milestone ini dirancang agar setiap tahap menghasilkan bagian yang dapat didemokan mandiri, tetap setia pada perancangan Bab III skripsi, dan meminimalkan rework saat integrasi Flask + Supabase.*
