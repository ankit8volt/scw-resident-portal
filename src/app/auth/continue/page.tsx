import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { hasCompleteResidence } from '@/lib/residence-options';
import { getUserByEmail } from '@/lib/sheets';

/**
 * Post-OAuth routing: send users to complete profile, pending message, or dashboard.
 */
export default async function AuthContinuePage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmail(session.user!.email!);

  if (!user) {
    redirect('/login');
  }

  if (user.status === 'Approved') {
    redirect('/dashboard');
  }

  if (user.status === 'Pending' && !hasCompleteResidence(user.tower, user.villamentNumber)) {
    redirect('/complete-profile');
  }

  redirect(`/login?status=${user.status.toLowerCase()}`);
}
