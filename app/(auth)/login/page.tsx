"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginDummy } from "@/lib/auth"
import { ADMIN_PASSWORD, ADMIN_USER } from "@/lib/data/seed"
import { IconBolt, IconEye, IconEyeOff, IconLoader2 } from "@tabler/icons-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.")
      return
    }
    setSubmitting(true)
    // Simulasi autentikasi (MVP: kredensial dummy — lihat README)
    window.setTimeout(() => {
      if (email.trim().toLowerCase() === ADMIN_USER.email && password === ADMIN_PASSWORD) {
        loginDummy()
        router.push("/dashboard")
        router.refresh()
      } else {
        setError("Email atau password salah. Coba lagi.")
        setSubmitting(false)
      }
    }, 700)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <IconBolt className="size-5" />
          </div>
          <h1 className="text-xl font-semibold">Sistem Klasifikasi Subsidi Listrik</h1>
          <p className="text-sm text-muted-foreground">
            PLN Aceh — Klasifikasi kelayakan penerima subsidi menggunakan LightGBM
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Masuk sebagai Admin</CardTitle>
            <CardDescription>
              Gunakan email dan password petugas yang berwenang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pln.co.id"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </Button>
                </div>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting && <IconLoader2 className="animate-spin" />}
                {submitting ? "Memeriksa…" : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          Aplikasi internal — hanya untuk petugas PLN / Dinas Sosial.
        </p>
      </div>
    </div>
  )
}
