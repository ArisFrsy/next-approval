// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass public routes
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();

  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.redirect("https://otobos.alfahuma.com");
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    // check expiration
    const { payload } = await jwtVerify(token, secret);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.redirect("https://otobos.alfahuma.com");
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect("https://otobos.alfahuma.com");
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};
