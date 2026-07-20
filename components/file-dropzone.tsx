"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { IconFileSpreadsheet, IconUpload, IconX } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
  /** Ekstensi yang diterima, huruf kecil tanpa titik. */
  accept: string[]
  file: File | null
  onFile: (file: File | null) => void
  error?: string | null
  onError?: (msg: string | null) => void
}

/** Dropzone drag-and-drop + file picker dengan validasi ekstensi (FR-B2). */
export function FileDropzone({
  accept,
  file,
  onFile,
  error,
  onError,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  function pick(f: File | undefined) {
    if (!f) return
    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
    if (!accept.includes(ext)) {
      onError?.(
        `Format .${ext} tidak didukung. Gunakan file ${accept.map((a) => `.${a}`).join(" atau ")}.`
      )
      onFile(null)
      return
    }
    onError?.(null)
    onFile(f)
  }

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border p-4">
        <IconFileSpreadsheet className="size-8 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Hapus file"
          onClick={() => {
            onFile(null)
            onError?.(null)
          }}
        >
          <IconX />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files[0])
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:bg-muted/50",
          error && "border-destructive"
        )}
      >
        <IconUpload className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          Tarik & letakkan file di sini, atau klik untuk memilih
        </p>
        <p className="text-xs text-muted-foreground">
          Format: {accept.map((a) => `.${a}`).join(", ")}
        </p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept.map((a) => `.${a}`).join(",")}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
