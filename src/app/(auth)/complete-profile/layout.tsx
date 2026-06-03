import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';

export default async function CompleteProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  if (session.user.status === 'Approved') {
    redirect('/dashboard');
  }

  if (
    session.user.status === 'Pending' &&
    hasCompleteResidence(session.user.tower, session.user.villamentNumber)
  ) {
    redirect('/login?status=pending');
  }

  if (session.user.status !== 'Pending') {
    redirect(`/login?status=${session.user.status.toLowerCase()}`);
  }

  return children;
}
