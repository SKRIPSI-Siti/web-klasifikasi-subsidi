import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SESSION_COOKIE } from "@/lib/auth"

export default async function Page() {
  const cookieStore = await cookies()
  redirect(cookieStore.has(SESSION_COOKIE) ? "/dashboard" : "/login")
}
