// Parser dataset CSV/XLSX untuk halaman Upload Dataset (FR-B2/FR-B3) — menggantikan preview
// dummy sebelumnya (data digenerate dari nama file). Membaca file yang sesungguhnya diunggah
// admin agar preview & jumlah baris/kolom yang ditampilkan nyata.

import { buildCustomerRow, mapHeaders, parseCsvText, splitCsvLine } from "@/lib/data/row-mapping"
import type { CustomerRow } from "@/lib/types"

export interface ParsedDataset {
  rows: CustomerRow[]
  /** Nama kolom mentah sebagaimana ditemukan di file (untuk chip "kolom terdeteksi"). */
  detectedColumns: string[]
  totalRows: number
}

async function parseCsvDataset(file: File): Promise<ParsedDataset> {
  const text = await file.text()
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "")
  const detectedColumns = lines.length > 0 ? splitCsvLine(lines[0]) : []
  const rows = parseCsvText(text)
  return { rows, detectedColumns, totalRows: rows.length }
}

async function parseXlsxDataset(file: File): Promise<ParsedDataset> {
  // Impor dinamis: exceljs cukup besar, tidak perlu dibundel di halaman lain.
  const ExcelJS = (await import("exceljs")).default
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await file.arrayBuffer())
  const sheet = workbook.worksheets[0]
  if (!sheet) return { rows: [], detectedColumns: [], totalRows: 0 }

  const headerRow = sheet.getRow(1)
  const detectedColumns: string[] = []
  headerRow.eachCell({ includeEmpty: false }, (cell) => {
    detectedColumns.push(String(cell.value ?? "").trim())
  })
  const headers = mapHeaders(detectedColumns)

  const rows: CustomerRow[] = []
  for (let r = 2; r <= sheet.rowCount; r++) {
    const excelRow = sheet.getRow(r)
    if (excelRow.cellCount === 0) continue
    const cells: unknown[] = []
    for (let c = 1; c <= detectedColumns.length; c++) {
      const val: unknown = excelRow.getCell(c).value
      // exceljs bisa mengembalikan objek formula ({ result, ... }); ambil hasil primitifnya.
      cells.push(
        val && typeof val === "object" && "result" in (val as Record<string, unknown>)
          ? (val as { result: unknown }).result
          : val
      )
    }
    if (cells.every((v) => v === null || v === undefined || v === "")) continue
    rows.push(buildCustomerRow(headers, cells, `row_${r - 1}`))
  }

  return { rows, detectedColumns, totalRows: rows.length }
}

export async function parseDatasetFile(file: File): Promise<ParsedDataset> {
  const ext = file.name.split(".").pop()?.toLowerCase()
  if (ext === "xlsx") return parseXlsxDataset(file)
  return parseCsvDataset(file)
}
