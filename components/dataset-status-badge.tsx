import { Badge } from "@/components/ui/badge"
import type { DatasetStatus, Label } from "@/lib/types"

export function DatasetStatusBadge({ status }: { status: DatasetStatus }) {
  if (status === "sudah_preprocessing") {
    return (
      <Badge className="bg-success/10 text-success dark:bg-success/20">
        Sudah preprocessing
      </Badge>
    )
  }
  return <Badge variant="secondary">Belum diproses</Badge>
}

export function LabelBadge({ label }: { label: Label }) {
  if (label === "Layak") {
    return <Badge className="bg-success/10 text-success dark:bg-success/20">Layak</Badge>
  }
  return (
    <Badge className="bg-destructive/10 text-destructive dark:bg-destructive/20">
      Tidak Layak
    </Badge>
  )
}
