// Parser CSV untuk prediksi batch (sisi klien, FR-E2). Logika pemetaan header/kolom
// dipakai bersama dengan lib/data/dataset-file.ts lewat lib/data/row-mapping.ts.

import { parseCsvText } from "@/lib/data/row-mapping"
import type { CustomerRow } from "@/lib/types"

export async function parseCustomerCsv(file: File): Promise<CustomerRow[]> {
  const text = await file.text()
  return parseCsvText(text)
}
