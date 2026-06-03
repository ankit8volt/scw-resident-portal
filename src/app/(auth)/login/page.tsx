import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { auth } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';

const statusMap: Record<string, { title: string; message: string }> = {
  pending: {
    title: 'Account Pending Approval',
    message:
      'Your Google sign-in and residence details are saved. A Super Admin will review your tower and villament number before granting portal access.',
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
  if (session?.user?.email) {
    if (session.user.status === 'Approved') {
      redirect('/dashboard');
    }
    if (
      session.user.status === 'Pending' &&
      !hasCompleteResidence(session.user.tower, session.user.villamentNumber)
    ) {
      redirect('/complete-profile');
    }
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

            <GoogleSignInButton />

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
