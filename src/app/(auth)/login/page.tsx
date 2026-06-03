import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { auth, signIn } from '@/lib/auth';

const statusMap: Record<string, { title: string; message: string }> = {
  pending: {
    title: 'Account Pending Approval',
    message:
      'Your Google sign-in is complete. A Super Admin must approve your account before portal access.',
  },
  rejected: {
    title: 'Access Rejected',
    message:
      'Your account was rejected by the RWA admin. Please contact the committee if this is unexpected.',
  },
  suspended: {
    title: 'Account Suspended',
    message:
      'Your access is currently suspended. Please contact the RWA committee for support.',
  },
};

type LoginPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.user?.email && session.user.status === 'Approved') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const status = params.status || '';
  const statusContent = statusMap[status];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90 p-4">
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/images/hero-forest.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                <BrandLogo iconClassName="h-10 w-10" />
              </div>
            </div>
            <h1 className="mb-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
              SCW Villaments
            </h1>
            <p className="text-white/90">Community Portal</p>
          </div>

          <div className="px-8 py-10">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to access your community portal</p>
            </div>

            {statusContent ? (
              <div className="mb-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
                <h3 className="mb-1 font-semibold text-foreground">{statusContent.title}</h3>
                <p className="text-sm text-muted-foreground">{statusContent.message}</p>
              </div>
            ) : null}

            <form
              action={async () => {
                'use server';
                await signIn('google', { redirectTo: '/dashboard' });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border bg-white px-6 py-4 font-medium text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-secondary hover:shadow-md"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <LogIn className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  First time signing in? Your account will be pending approval by the RWA admin.
                  You&apos;ll receive access within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/80">
            Need help? Contact us at{' '}
            <a href="mailto:scwrwa@gmail.com" className="font-medium text-white hover:underline">
              scwrwa@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
