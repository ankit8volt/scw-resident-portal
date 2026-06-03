import { appendAuditLog, appendRow, readProjects, updateRow } from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import type { ProjectCategory, ProjectStatus } from '@/types';

export const revalidate = 120;

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const projects = await readProjects();
    const isAdmin = hasCommitteeAccess(session.user.role);

    const filtered = projects.filter((project) => {
      if (!isAdmin && project.status === 'Archived') return false;
      if (status && project.status !== status) return false;
      if (category && project.category !== category) return false;
      return true;
    });

    return Response.json(filtered);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch projects' },
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
      name: string;
      category: ProjectCategory;
      status: ProjectStatus;
      description: string;
      startDate: string;
      expectedEndDate: string;
    };

    await appendRow('Projects', [
      payload.name,
      payload.category,
      payload.status,
      payload.description,
      payload.startDate,
      payload.expectedEndDate,
      session.user.email!,
      new Date().toISOString(),
    ]);

    await appendAuditLog(session.user.email!, 'PROJECT_CREATE', payload.name);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create project' },
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
      name: string;
      category: ProjectCategory;
      status: ProjectStatus;
      description: string;
      startDate: string;
      expectedEndDate: string;
      addedBy: string;
      addedOn: string;
    };

    await updateRow('Projects', Number(payload.id), [
      payload.name,
      payload.category,
      payload.status,
      payload.description,
      payload.startDate,
      payload.expectedEndDate,
      payload.addedBy,
      payload.addedOn,
    ]);

    await appendAuditLog(session.user.email!, 'PROJECT_UPDATE', payload.name);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update project' },
      { status: 500 },
    );
  }
}
