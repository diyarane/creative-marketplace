import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "reelcraft_session";

const ROLE_PREFIXES: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/client", roles: ["CLIENT"] },
  { prefix: "/dashboard/creator", roles: ["CREATOR"] },
  { prefix: "/creator/profile", roles: ["CREATOR"] },
  { prefix: "/creator/portfolio", roles: ["CREATOR"] },
  { prefix: "/creator/services", roles: ["CREATOR"] },
  { prefix: "/projects/opportunities", roles: ["CREATOR"] },
  { prefix: "/earnings", roles: ["CREATOR"] },
  { prefix: "/reviews", roles: ["CREATOR"] },
  { prefix: "/project/new", roles: ["CLIENT"] },
];

const AUTH_REQUIRED_PREFIXES = ["/projects", "/messages", "/notifications"];

async function getRole(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.role as string) || null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const roleRule = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  const requiresAuth = roleRule || AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!requiresAuth) return NextResponse.next();

  const role = await getRole(req);

  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (roleRule && !roleRule.roles.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/creator/profile/:path*",
    "/creator/portfolio/:path*",
    "/creator/services/:path*",
    "/projects/:path*",
    "/project/new",
    "/messages/:path*",
    "/notifications/:path*",
    "/subscription/:path*",
    "/earnings/:path*",
    "/reviews/:path*",
  ],
};
