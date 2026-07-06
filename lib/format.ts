export function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("id-ID").format(n)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** 0.932 → "93,2%" */
export function formatPercent(v: number, digits = 1) {
  return `${(v * 100).toFixed(digits).replace(".", ",")}%`
}
