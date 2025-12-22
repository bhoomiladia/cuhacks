import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const protectedPaths = ['/dashboard', '/admin'];
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // Check for admin role if accessing /admin
      if (request.nextUrl.pathname.startsWith('/admin')) {
        if (payload.role !== 'admin') {
          // Redirect to dashboard if not admin
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
