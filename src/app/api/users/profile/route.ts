import { readUsers, updateUserRow } from '@/lib/sheets';
import {
  hasCompleteResidence,
  isValidTower,
  isValidVillamentNumber,
} from '@/lib/residence-options';
import { requireSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireSession();
    if (!session) {
      return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    }

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === session.user.email!.toLowerCase(),
    );

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      tower: user.tower,
      villamentNumber: user.villamentNumber,
      status: user.status,
      profileComplete: hasCompleteResidence(user.tower, user.villamentNumber),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profile' },
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

    const payload = (await request.json()) as {
      tower: string;
      villamentNumber: string;
    };

    if (!isValidTower(payload.tower)) {
      return Response.json({ error: 'Invalid tower selection' }, { status: 400 });
    }
    if (!isValidVillamentNumber(payload.villamentNumber)) {
      return Response.json({ error: 'Invalid villament number' }, { status: 400 });
    }

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === session.user.email!.toLowerCase(),
    );

    if (!user?.rowNumber) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.status !== 'Pending') {
      return Response.json(
        { error: 'Residence details can only be updated while approval is pending' },
        { status: 403 },
      );
    }

    await updateUserRow({
      ...user,
      tower: payload.tower,
      villamentNumber: payload.villamentNumber,
      flatNumber: `${payload.tower}-${payload.villamentNumber}`,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update profile' },
      { status: 500 },
    );
  }
}
