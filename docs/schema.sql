-- Skema Supabase / PostgreSQL (PRD Bagian 14) — dokumentasi, belum dijalankan (fase M9).

create table datasets (
  id            uuid primary key default gen_random_uuid(),
  nama_file     text not null,
  jumlah_baris  integer,
  jumlah_kolom  integer,
  status        text check (status in ('belum_diproses','sudah_preprocessing')),
  storage_path  text,
  uploaded_at   timestamptz default now()
);

create table preprocessing_logs (
  id            uuid primary key default gen_random_uuid(),
  dataset_id    uuid references datasets(id) on delete cascade,
  langkah       text, -- cleaning | missing_value | encoding | normalisasi | split
  status        text, -- pending | running | done | failed
  hasil_ringkas jsonb, -- { baris_sebelum, baris_sesudah, distribusi_label }
  created_at    timestamptz default now()
);

create table models (
  id                 uuid primary key default gen_random_uuid(),
  dataset_id         uuid references datasets(id),
  parameter          jsonb, -- { num_leaves, learning_rate, n_estimators, max_depth }
  accuracy           numeric(5,4),
  precision_         numeric(5,4),
  recall             numeric(5,4),
  f1_score           numeric(5,4),
  confusion          jsonb, -- { tp, tn, fp, fn }
  feature_importance jsonb, -- [{fitur, skor}]
  is_active          boolean default false,
  model_path         text,
  created_at         timestamptz default now()
);

create table predictions (
  id            uuid primary key default gen_random_uuid(),
  model_id      uuid references models(id),
  jenis         text check (jenis in ('manual','batch')),
  input_data    jsonb,
  hasil         jsonb, -- [{id_pelanggan, label, confidence}]
  jumlah_layak  integer,
  jumlah_tidak  integer,
  created_at    timestamptz default now()
);

create table reports (
  id            uuid primary key default gen_random_uuid(),
  prediction_id uuid references predictions(id),
  model_id      uuid references models(id),
  judul         text,
  created_at    timestamptz default now()
);

-- admin_users: dikelola Supabase Auth + tabel profil
create table admin_users (
  id    uuid primary key references auth.users(id),
  email text,
  nama  text,
  role  text default 'admin'
);

-- Catatan: aktifkan RLS dengan kebijakan "hanya role admin" saat integrasi (M9).
