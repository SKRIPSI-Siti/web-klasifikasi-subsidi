"use client"

// Komponen bergaya MagicUI (blur-fade, gradient text, shimmer button, marquee,
// bento grid, number ticker, grid pattern) — dibangun dengan CSS/Tailwind di atas
// token tema shadcn yang sudah ada, tanpa dependensi baru.

import * as React from "react"

import { cn } from "@/lib/utils"

/** Muncul dengan blur + fade + naik, dengan delay berjenjang. */
export function BlurFade({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn("animate-blur-fade", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

/** Teks dengan gradien warna chart yang bergerak pelan. */
export function AnimatedGradientText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "animate-gradient-x bg-gradient-to-r from-[var(--chart-2)] via-[var(--chart-4)] to-[var(--chart-2)] bg-[length:200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}

/** Tombol primary dengan kilau shimmer berjalan. */
export function ShimmerButton({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "group relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] bg-[length:200%_100%]"
      />
      {children}
    </a>
  )
}

/** Marquee horizontal tak berujung (konten diduplikasi). */
export function Marquee({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "group flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        className
      )}
    >
      <div className="flex shrink-0 animate-marquee items-center gap-4 pr-4 group-hover:[animation-play-state:paused]">
        {children}
        {children}
      </div>
    </div>
  )
}

/** Latar pola grid halus khas MagicUI. */
export function GridPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] bg-[size:44px_44px]",
        className
      )}
    />
  )
}

/** Angka yang berhitung naik saat masuk viewport. */
export function NumberTicker({
  value,
  suffix = "",
  decimals = 0,
  className,
}: {
  value: number
  suffix?: string
  decimals?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = React.useState(0)
  const started = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return
        started.current = true
        const duration = 1200
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(value * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display.toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/** Kartu bento dengan ikon, judul, deskripsi + hover lift. */
export function BentoCard({
  icon,
  title,
  description,
  className,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
      />
      {children}
      <div className="flex flex-col gap-2">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary [&_svg]:size-5">
          {icon}
        </div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
