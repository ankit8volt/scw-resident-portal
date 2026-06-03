import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/config', '/auth/continue'];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith('/api');
  if (!req.auth && !isApi) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/admin')) {
    const role = req.auth?.user?.role;
    if (role !== 'Committee' && role !== 'SuperAdmin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (req.auth?.user?.status && req.auth.user.status !== 'Approved' && !isApi) {
    if (pathname.startsWith('/complete-profile')) {
      return NextResponse.next();
    }

    if (
      req.auth.user.status === 'Pending' &&
      !hasCompleteResidence(req.auth.user.tower, req.auth.user.villamentNumber)
    ) {
      return NextResponse.redirect(new URL('/complete-profile', req.url));
    }

    const status = req.auth.user.status.toLowerCase();
    return NextResponse.redirect(new URL(`/login?status=${status}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
