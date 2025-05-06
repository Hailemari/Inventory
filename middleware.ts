import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session and trying to access protected routes
  if (
    !session &&
    (req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/inventory") ||
      req.nextUrl.pathname.startsWith("/suppliers") ||
      req.nextUrl.pathname.startsWith("/transactions") ||
      req.nextUrl.pathname.startsWith("/categories") ||
      req.nextUrl.pathname.startsWith("/reports") ||
      req.nextUrl.pathname.startsWith("/settings"))
  ) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    return NextResponse.redirect(redirectUrl)
  }

  // If session exists and trying to access auth pages
  if (session && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/inventory/:path*",
    "/suppliers/:path*",
    "/transactions/:path*",
    "/categories/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
}
