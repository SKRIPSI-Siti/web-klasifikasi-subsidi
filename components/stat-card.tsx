import * as React from "react"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  action?: React.ReactNode
}

export function StatCard({ label, value, hint, action }: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      {hint && (
        <CardFooter className="text-sm text-muted-foreground">{hint}</CardFooter>
      )}
    </Card>
  )
}
