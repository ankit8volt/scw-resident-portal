import { appendAuditLog, appendRow, readAnnouncements, updateRow } from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import { isDateVisible } from '@/lib/utils';
import type { AnnouncementStatus, AnnouncementType } from '@/types';

export const revalidate = 120;

export async function GET() {
  try {
    const session = await requireSession();
    if (!session) {
      return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    const announcements = await readAnnouncements();
    const isAdmin = hasCommitteeAccess(session.user.role);
    const visible = announcements.filter((item) => {
      if (isAdmin) return true;
      return item.status === 'Published' && isDateVisible(item.showFromDate);
    });

    visible.sort((a, b) => {
      if (a.pinOnHomepage !== b.pinOnHomepage) {
        return a.pinOnHomepage === 'Yes' ? -1 : 1;
      }
      return new Date(b.addedOn).valueOf() - new Date(a.addedOn).valueOf();
    });
    return Response.json(visible);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch announcements' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasCommitteeAccess(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = (await request.json()) as {
      title: string;
      fullMessage: string;
      type: AnnouncementType;
      pinOnHomepage: 'Yes' | 'No';
      showFromDate: string;
      status: AnnouncementStatus;
    };

    await appendRow('Announcements', [
      payload.title,
      payload.fullMessage,
      payload.type,
      payload.pinOnHomepage,
      payload.showFromDate,
      payload.status,
      session.user.email!,
      new Date().toISOString(),
    ]);

    await appendAuditLog(session.user.email!, 'ANNOUNCEMENT_CREATE', payload.title);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create announcement' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasCommitteeAccess(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = (await request.json()) as {
      id: string;
      title: string;
      fullMessage: string;
      type: AnnouncementType;
      pinOnHomepage: 'Yes' | 'No';
      showFromDate: string;
      status: AnnouncementStatus;
      addedBy: string;
      addedOn: string;
    };

    await updateRow('Announcements', Number(payload.id), [
      payload.title,
      payload.fullMessage,
      payload.type,
      payload.pinOnHomepage,
      payload.showFromDate,
      payload.status,
      payload.addedBy,
      payload.addedOn,
    ]);

    await appendAuditLog(session.user.email!, 'ANNOUNCEMENT_UPDATE', payload.title);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update announcement' },
      { status: 500 },
    );
  }
}
