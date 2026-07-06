# Sistem Klasifikasi Kelayakan Penerima Subsidi Listrik — PLN Aceh

Kerangka UI (MVP) untuk sistem klasifikasi kelayakan penerima subsidi listrik rumah tangga
menggunakan **LightGBM**. Tahap ini seluruh backend **di-mock di frontend** (dummy data
terpusat); integrasi Flask + Supabase menyusul pada fase M8+.

Referensi: `Dokumen/PRD.md` (kebutuhan) dan `Dokumen/MVP.md` (milestone).

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000 — otomatis diarahkan ke halaman login.

## Kredensial dummy

| Email | Password |
|---|---|
| `admin@pln.co.id` | `admin123` |

Sesi disimpan sebagai cookie dummy dan diperiksa `proxy.ts` (route guard). Logout lewat menu
avatar di sidebar.

## Peta folder

```
app/
├── (auth)/login/          → halaman login
├── (dashboard)/           → layout Sidebar + Header (setelah login)
│   ├── dashboard/         → ringkasan sistem
│   ├── dataset/           → daftar, upload, detail dataset
│   ├── preprocessing/     → pilih dataset + stepper 5 langkah
│   ├── model/
│   │   ├── training/      → konfigurasi + progres training
│   │   └── evaluation/    → metrik, confusion matrix, feature importance
│   ├── prediksi/          → riwayat, prediksi baru (manual/batch), hasil
│   ├── laporan/           → daftar + detail laporan
│   └── pengaturan/        → profil admin + ganti password (dummy)
components/
├── ui/                    → komponen shadcn (style base-rhea) — jangan styling ad-hoc
└── *.tsx                  → komponen komposit (Stepper, StatCard, EmptyState, dropzone, dll)
lib/
├── types.ts               → kontrak tipe entitas (= skema Supabase)
├── format.ts              → util format angka/tanggal/persen (id-ID)
├── auth.ts                → sesi dummy (cookie)
└── data/
    ├── seed.ts            → seed dummy terpusat (PRD Bagian 13)
    ├── store.tsx          → store global (Context + localStorage)
    └── mock-api.ts        → mock backend (bentuk = kontrak API Flask, PRD Bagian 15)
docs/schema.sql            → skema Supabase (dokumentasi, belum dijalankan)
```

## Menambah komponen UI

Gunakan registry shadcn dengan style yang sudah terpasang (`base-rhea`):

```bash
npx shadcn@latest add <nama-komponen>
```

## Catatan integrasi (M8+)

- Semua akses data lewat `lib/data/*` — saat integrasi cukup ganti isi fungsi dengan
  `fetch()` ke Flask/Supabase; halaman tidak berubah.
- Bentuk data mock mengikuti kontrak API pada PRD Bagian 15.
- State dummy dipersist di `localStorage` (`klasifikasi-subsidi-store-v1`); hapus key
  tersebut untuk kembali ke seed awal.
