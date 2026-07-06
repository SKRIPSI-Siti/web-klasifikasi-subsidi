import { NextResponse, type NextRequest } from "next/server"

import { SESSION_COOKIE } from "@/lib/auth"

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE)
  const { pathname } = request.nextUrl

  if (pathname === "/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/dataset/:path*",
    "/preprocessing/:path*",
    "/model/:path*",
    "/prediksi/:path*",
    "/laporan/:path*",
    "/pengaturan/:path*",
  ],
}
