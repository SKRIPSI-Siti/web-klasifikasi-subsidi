"use client"

import * as React from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
import { ADMIN_USER } from "@/lib/data/seed"
import { IconDeviceFloppy } from "@tabler/icons-react"
import { toast } from "sonner"

export default function PengaturanPage() {
  const [oldPass, setOldPass] = React.useState("")
  const [newPass, setNewPass] = React.useState("")
  const [confirmPass, setConfirmPass] = React.useState("")
  const [touched, setTouched] = React.useState(false)

  const errors = {
    oldPass: oldPass ? undefined : "Wajib diisi.",
    newPass:
      newPass.length >= 6 ? undefined : "Minimal 6 karakter.",
    confirmPass:
      confirmPass === newPass && confirmPass !== ""
        ? undefined
        : "Konfirmasi tidak sama dengan password baru.",
  }
  const valid = !errors.oldPass && !errors.newPass && !errors.confirmPass

  function save(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    toast.success("Password berhasil diganti (dummy).")
    setOldPass("")
    setNewPass("")
    setConfirmPass("")
    setTouched(false)
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">Pengaturan</h2>
        <p className="text-sm text-muted-foreground">Profil admin dan keamanan akun.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">
              {ADMIN_USER.nama
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5">
            <p className="font-medium">{ADMIN_USER.nama}</p>
            <p className="text-sm text-muted-foreground">{ADMIN_USER.email}</p>
            <Badge variant="outline" className="mt-1 w-fit">
              {ADMIN_USER.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti Password</CardTitle>
          <CardDescription>
            Fitur dummy — autentikasi nyata diaktifkan pada fase integrasi Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="old">Password lama</Label>
              <Input
                id="old"
                type="password"
                value={oldPass}
                aria-invalid={touched && !!errors.oldPass}
                onChange={(e) => setOldPass(e.target.value)}
              />
              {touched && errors.oldPass && (
                <p className="text-xs text-destructive">{errors.oldPass}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new">Password baru</Label>
              <Input
                id="new"
                type="password"
                value={newPass}
                aria-invalid={touched && !!errors.newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              {touched && errors.newPass && (
                <p className="text-xs text-destructive">{errors.newPass}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm">Konfirmasi password baru</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPass}
                aria-invalid={touched && !!errors.confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              {touched && errors.confirmPass && (
                <p className="text-xs text-destructive">{errors.confirmPass}</p>
              )}
            </div>
            <Button type="submit" className="w-fit">
              <IconDeviceFloppy />
              Simpan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
