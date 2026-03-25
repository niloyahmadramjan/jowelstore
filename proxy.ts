import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicRoute = [
    "/",
    "/login",
    "/register",
    "/api/auth",
    "/favicon.ico",
    "/_next",
  ];
  if (publicRoute.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackeUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // un-authorized access
  const role = token.role
  if(!pathname.startsWith("/user")  &&  role !=="user"){
    return NextResponse.redirect(new URL("/unathorize", req.url))
  }
  if(!pathname.startsWith("/rider")  &&  role !=="deliveryman"){
    return NextResponse.redirect(new URL("/unathorize", req.url))
  }
  if(!pathname.startsWith("/admin")  &&  role !=="admin"){
    return NextResponse.redirect(new URL("/unathorize", req.url))
  }


  return NextResponse.next();
}
// will be not run this middleware if below action
export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images).*)",
};

/**
 *  req---middleware---server
 *
 * login register api auth public route direact sent to server
 *
 */
