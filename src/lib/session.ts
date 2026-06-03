import { auth } from '@/lib/auth';

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }
  return session;
}

export function hasCommitteeAccess(role?: string) {
  return role === 'Committee' || role === 'SuperAdmin';
}

export function isSuperAdmin(role?: string) {
  return role === 'SuperAdmin';
}
