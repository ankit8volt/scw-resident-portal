import { appendAuditLog, readUsers, updateRow } from '@/lib/sheets';
import { isSuperAdmin, requireSession } from '@/lib/session';
import type { UserRole, UserStatus } from '@/types';

export async function GET() {
  try {
    const session = await requireSession();
    if (!session) {
      return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!isSuperAdmin(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const users = await readUsers();
    return Response.json(users);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    if (!session) {
      return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    if (!isSuperAdmin(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = (await request.json()) as {
      email: string;
      status: UserStatus;
      role: UserRole;
      flatNumber: string;
      actionReason?: string;
    };

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (!user?.rowNumber) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await updateRow('Users', user.rowNumber, [
      user.email,
      user.name,
      user.picture,
      payload.flatNumber,
      payload.role,
      payload.status,
      session.user.email!,
      user.addedOn || new Date().toISOString(),
      payload.status === 'Approved' ? new Date().toISOString() : '',
      payload.actionReason || '',
    ]);

    await appendAuditLog(
      session.user.email!,
      'USER_STATUS_CHANGE',
      `${payload.email} -> ${payload.status} (${payload.role})`,
    );

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 },
    );
  }
}
