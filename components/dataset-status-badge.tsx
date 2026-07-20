import { Badge } from "@/components/ui/badge"
import type { Label } from "@/lib/types"

export function LabelBadge({ label }: { label: Label }) {
  if (label === "Layak") {
    return (
      <Badge className="bg-success/10 text-success dark:bg-success/20">
        Layak
      </Badge>
    )
  }
  return (
    <Badge className="bg-destructive/10 text-destructive dark:bg-destructive/20">
      Tidak Layak
    </Badge>
  )
}
