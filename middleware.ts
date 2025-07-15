import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Exclude static files, API, and Clerk auth pages
    '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)',
  ],
}; 