import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';

export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }
  if (session.user.status === 'Approved') {
    redirect('/dashboard');
  }
  if (
    session.user.status === 'Pending' &&
    !hasCompleteResidence(session.user.tower, session.user.villamentNumber)
  ) {
    redirect('/complete-profile');
  }
  redirect(`/login?status=${session.user.status.toLowerCase()}`);
}
