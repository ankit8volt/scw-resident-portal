import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();
  if (!session?.user?.email || session.user.status !== 'Approved') {
    redirect('/login');
  }
  redirect('/dashboard');
}
