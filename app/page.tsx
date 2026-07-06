import Link from "next/link"

import {
  AnimatedGradientText,
  BentoCard,
  BlurFade,
  GridPattern,
  Marquee,
  NumberTicker,
  ShimmerButton,
} from "@/components/landing/magic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  IconArrowRight,
  IconBolt,
  IconChartHistogram,
  IconDatabase,
  IconFileAnalytics,
  IconReport,
  IconShieldCheck,
  IconSparkles,
  IconTransform,
  IconWand,
} from "@tabler/icons-react"

const MARQUEE_ITEMS = [
  "LightGBM",
  "Klasifikasi Biner",
  "Data Sosial Ekonomi",
  "R-1/450 VA",
  "R-1/900 VA",
  "Confusion Matrix",
  "Feature Importance",
  "Preprocessing Otomatis",
  "Prediksi Batch",
]

const STEPS = [
  {
    no: "01",
    title: "Import Dataset",
    desc: "Unggah data pelanggan (CSV/XLSX) dari Dinas Sosial & PLN.",
  },
  {
    no: "02",
    title: "Preprocessing",
    desc: "Cleaning, missing value, encoding, normalisasi, split 80:20.",
  },
  {
    no: "03",
    title: "Training & Evaluasi",
    desc: "Latih LightGBM, tinjau accuracy, precision, recall, F1-Score.",
  },
  {
    no: "04",
    title: "Prediksi & Laporan",
    desc: "Klasifikasikan pelanggan lalu simpan hasilnya sebagai laporan.",
  },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <IconBolt className="size-4" />
            </span>
            Klasifikasi Subsidi
          </div>
          <Button render={<Link href="/login" />}>
            Masuk
            <IconArrowRight />
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <GridPattern />
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-4 pt-20 pb-16 text-center">
            <BlurFade delay={0}>
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full px-3 py-1 text-xs"
              >
                <IconSparkles className="size-3.5 text-primary" />
                Skripsi — Teknik Informatika, Politeknik Negeri Lhokseumawe
              </Badge>
            </BlurFade>
            <BlurFade delay={100}>
              <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                Klasifikasi Kelayakan Penerima{" "}
                <AnimatedGradientText>Subsidi Listrik</AnimatedGradientText>{" "}
                secara Tepat Sasaran
              </h1>
            </BlurFade>
            <BlurFade delay={200}>
              <p className="max-w-2xl text-balance text-muted-foreground">
                Sistem klasifikasi kelayakan penerima subsidi listrik rumah tangga
                pelanggan PLN Aceh menggunakan metode{" "}
                <span className="font-medium text-foreground">
                  Light Gradient Boosting Machine (LightGBM)
                </span>{" "}
                — dari import data hingga laporan hasil, dalam satu alur.
              </p>
            </BlurFade>
            <BlurFade delay={300} className="flex flex-wrap items-center justify-center gap-3">
              <ShimmerButton href="/login">
                <IconWand className="size-4" />
                Mulai Klasifikasi
              </ShimmerButton>
              <Button variant="outline" size="lg" render={<Link href="/login" />}>
                Lihat Dashboard
              </Button>
            </BlurFade>
          </div>

          {/* Marquee */}
          <BlurFade delay={400}>
            <div className="mx-auto w-full max-w-4xl px-4 pb-16">
              <Marquee>
                {MARQUEE_ITEMS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-card px-4 py-1.5 text-sm whitespace-nowrap text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </Marquee>
            </div>
          </BlurFade>
        </section>

        {/* Stats */}
        <section className="border-y bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-12 text-center sm:grid-cols-4">
            {[
              { value: 93.2, suffix: "%", decimals: 1, label: "Akurasi model" },
              { value: 9, suffix: "", decimals: 0, label: "Variabel klasifikasi" },
              { value: 2000, suffix: "+", decimals: 0, label: "Data pelanggan diuji" },
              { value: 5, suffix: "", decimals: 0, label: "Tahap preprocessing" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <p className="text-3xl font-bold text-primary">
                  <NumberTicker value={s.value} suffix={s.suffix} decimals={s.decimals} />
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bento features */}
        <section className="mx-auto w-full max-w-6xl px-4 py-20">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Satu alur, dari data mentah sampai keputusan
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Seluruh fungsi sistem pada perancangan skripsi terwakili dalam antarmuka
              yang runtut dan mudah dipakai petugas non-teknis.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <BentoCard
              icon={<IconWand />}
              title="Prediksi Manual & Batch"
              description="Klasifikasikan satu pelanggan lewat form 9 variabel, atau ribuan pelanggan sekaligus dari file CSV — lengkap dengan confidence score."
              className="sm:col-span-2 lg:col-span-2"
            >
              <div className="flex gap-2">
                <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                  LAYAK · 92,4%
                </span>
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                  TIDAK LAYAK · 88,1%
                </span>
              </div>
            </BentoCard>
            <BentoCard
              icon={<IconDatabase />}
              title="Manajemen Dataset"
              description="Upload drag-and-drop, preview data, dan ringkasan kolom sebelum diproses."
            />
            <BentoCard
              icon={<IconTransform />}
              title="Preprocessing Bertahap"
              description="Lima langkah dengan status per tahap: cleaning hingga split data 80:20."
            />
            <BentoCard
              icon={<IconChartHistogram />}
              title="Training LightGBM"
              description="Atur parameter, pantau progres, dan bandingkan model dari evaluasinya."
            />
            <BentoCard
              icon={<IconFileAnalytics />}
              title="Evaluasi Transparan"
              description="Confusion matrix dan feature importance menjelaskan alasan di balik prediksi."
            />
            <BentoCard
              icon={<IconReport />}
              title="Laporan Tersimpan"
              description="Simpan hasil klasifikasi sebagai laporan yang dapat dirujuk kembali."
            />
            <BentoCard
              icon={<IconShieldCheck />}
              title="Akses Terkendali"
              description="Hanya admin berwenang (petugas PLN / Dinas Sosial) yang dapat masuk."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-20">
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">
              Cara kerjanya
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step) => (
                <div key={step.no} className="relative flex flex-col gap-2 rounded-3xl border bg-card p-6">
                  <span className="text-sm font-mono font-semibold text-primary">
                    {step.no}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <GridPattern className="[mask-image:radial-gradient(ellipse_60%_60%_at_50%_100%,black,transparent)]" />
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Siap menyalurkan subsidi dengan{" "}
              <AnimatedGradientText>lebih tepat sasaran</AnimatedGradientText>?
            </h2>
            <p className="text-muted-foreground">
              Masuk sebagai admin dan jalankan klasifikasi pertama dalam hitungan menit.
            </p>
            <ShimmerButton href="/login">
              Masuk ke Sistem
              <IconArrowRight className="size-4" />
            </ShimmerButton>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© 2026 Siti Nur Faiza — Politeknik Negeri Lhokseumawe</p>
          <p>Skripsi: Klasifikasi Subsidi Listrik dengan LightGBM</p>
        </div>
      </footer>
    </div>
  )
}
