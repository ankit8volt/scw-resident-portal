import { appendAuditLog, appendRow, readDocuments, updateRow } from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import type { DocumentCategory, DocumentVisibility } from '@/types';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const year = url.searchParams.get('year');
    const query = url.searchParams.get('q')?.toLowerCase();

    const isAdmin = hasCommitteeAccess(session.user.role);
    const docs = await readDocuments();
    const filtered = docs.filter((item) => {
      if (!isAdmin && item.visibleTo === 'Admins Only') return false;
      if (category && item.category !== category) return false;
      if (year && item.year !== year) return false;
      if (
        query &&
        !`${item.documentTitle} ${item.shortDescription}`.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
    return Response.json(filtered);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
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
      documentTitle: string;
      category: DocumentCategory;
      year: string;
      shortDescription: string;
      googleDriveLink: string;
      visibleTo: DocumentVisibility;
    };

    await appendRow('Documents', [
      payload.documentTitle,
      payload.category,
      payload.year,
      payload.shortDescription,
      payload.googleDriveLink,
      payload.visibleTo,
      session.user.email!,
      new Date().toISOString(),
    ]);

    await appendAuditLog(session.user.email!, 'DOCUMENT_ADD', payload.documentTitle);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to add document' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    if (!hasCommitteeAccess(session.user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

    const docs = await readDocuments();
    const doc = docs.find((item) => item.id === id);
    if (!doc) {
      return Response.json({ error: 'Document not found' }, { status: 404 });
    }

    await updateRow('Documents', Number(id), [
      doc.documentTitle,
      doc.category,
      doc.year,
      doc.shortDescription,
      doc.googleDriveLink,
      'Admins Only',
      doc.addedBy,
      doc.addedOn,
    ]);
    await appendAuditLog(session.user.email!, 'DOCUMENT_REMOVE', doc.documentTitle);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 },
    );
  }
}
