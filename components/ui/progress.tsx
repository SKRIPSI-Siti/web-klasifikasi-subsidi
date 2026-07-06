"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      {...props}
    >
      <ProgressPrimitive.Track
        className={cn(
          "block h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
      >
        <ProgressPrimitive.Indicator className="block h-full rounded-full bg-primary transition-[width] duration-300" />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
