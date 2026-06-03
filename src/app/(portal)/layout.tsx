import { redirect } from 'next/navigation';

import { PortalShell } from '@/components/layout/PortalShell';
import { Providers } from '@/components/Providers';
import { auth, signOut } from '@/lib/auth';

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
        flatNumber={session.user.flatNumber}
        showAdmin={showAdmin}
        signOutAction={signOutAction}
      >
        {children}
      </PortalShell>
    </Providers>
  );
}
