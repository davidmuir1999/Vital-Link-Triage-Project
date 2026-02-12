import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const rolePermissions: Record<string, string[]> = {
  "/ward": ["DOCTOR"],
  "/triage": ["TRIAGE_NURSE"],
  "/ops": ["SITE_MANAGER"],
  "/cleaning": ["CLEANER"],
};


export async function proxy(request: NextRequest) {
    const {pathname} = request.nextUrl;

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })

    const isProtectedRoute = Object.keys(rolePermissions).some(route => pathname.startsWith(route));

    if(isProtectedRoute && !token) {
        const url = new URL('/login', request.url)
        url.searchParams.set('callbackUrl', encodeURI(request.url))
        return NextResponse.redirect(url)
    }

    if (token) {
        const userRole = token.role as string

        const matchedPath = Object.keys(rolePermissions).find(route => pathname.startsWith(route));

        if(matchedPath) {
            const allowedRoles = rolePermissions[matchedPath];

            if(!allowedRoles.includes(userRole)) {
                return NextResponse.redirect(new URL('/forbidden', request.url))
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|login|forbidden).*)',
    ],
}
