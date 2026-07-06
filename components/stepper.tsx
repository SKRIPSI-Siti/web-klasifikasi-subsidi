"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { IconCheck, IconLoader2 } from "@tabler/icons-react"
import type { StepStatus } from "@/lib/types"

export interface StepperStep {
  key: string
  title: string
  description?: string
  status: StepStatus
}

/** Stepper vertikal untuk proses bertahap (preprocessing, dsb). */
export function Stepper({ steps, className }: { steps: StepperStep[]; className?: string }) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, i) => (
        <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-px",
                step.status === "done" ? "bg-primary" : "bg-border"
              )}
            />
          )}
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
              step.status === "done" &&
                "border-primary bg-primary text-primary-foreground",
              step.status === "running" && "border-primary text-primary",
              step.status === "pending" && "border-border text-muted-foreground"
            )}
          >
            {step.status === "done" ? (
              <IconCheck className="size-4" />
            ) : step.status === "running" ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              i + 1
            )}
          </span>
          <div className="flex flex-col gap-0.5 pt-1">
            <span
              className={cn(
                "text-sm font-medium",
                step.status === "pending" && "text-muted-foreground"
              )}
            >
              {step.title}
            </span>
            {step.description && (
              <span className="text-xs text-muted-foreground">{step.description}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
