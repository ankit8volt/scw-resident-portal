import { redirect } from 'next/navigation';

import { PortalShell } from '@/components/layout/PortalShell';
import { Providers } from '@/components/Providers';
import { auth, signOut } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }
  if (session.user.status !== 'Approved') {
    if (
      session.user.status === 'Pending' &&
      !hasCompleteResidence(session.user.tower, session.user.villamentNumber)
    ) {
      redirect('/complete-profile');
    }
    redirect(`/login?status=${session.user.status.toLowerCase()}`);
  }

  const showAdmin =
    session.user.role === 'Committee' || session.user.role === 'SuperAdmin';

  async function signOutAction() {
    'use server';
    await signOut({ redirectTo: '/login' });
  }

  return (
    <Providers session={session}>
      <PortalShell
        role={session.user.role}
        tower={session.user.tower}
        villamentNumber={session.user.villamentNumber}
        flatNumber={session.user.flatNumber}
        showAdmin={showAdmin}
        signOutAction={signOutAction}
      >
        {children}
      </PortalShell>
    </Providers>
  );
}
