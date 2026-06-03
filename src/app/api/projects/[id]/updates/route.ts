import {
  appendAuditLog,
  appendRow,
  readProjectUpdates,
  readProjects,
} from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await context.params;
    const projects = await readProjects();
    const project = projects.find((item) => item.id === id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }
    const updates = await readProjectUpdates();
    const filtered = updates.filter((item) => item.projectName === project.name);
    return Response.json(filtered);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch updates' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasCommitteeAccess(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const projects = await readProjects();
    const project = projects.find((item) => item.id === id);
    if (!project) {
      return Response.json({ error: 'Project not found' }, { status: 404 });
    }

    const payload = (await request.json()) as {
      updateDetails: string;
      photoLink: string;
      date: string;
    };

    await appendRow('Project Updates', [
      project.name,
      payload.updateDetails,
      payload.photoLink,
      payload.date || new Date().toISOString(),
      session.user.email!,
      new Date().toISOString(),
    ]);

    await appendAuditLog(
      session.user.email!,
      'PROJECT_UPDATE_ADD',
      `${project.name}: ${payload.updateDetails}`,
    );

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create update' },
      { status: 500 },
    );
  }
}
