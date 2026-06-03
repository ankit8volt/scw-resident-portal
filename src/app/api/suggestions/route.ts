import {
  appendAuditLog,
  appendRow,
  readSuggestions,
  readUsers,
  updateRow,
} from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import type { SuggestionStatus } from '@/types';

export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const sort = url.searchParams.get('sort') || 'upvotes';

    const suggestions = await readSuggestions();
    const filtered = suggestions.filter((item) => {
      if (category && item.category !== category) return false;
      if (status && item.status !== status) return false;
      return true;
    });

    filtered.sort((a, b) => {
      if (sort === 'latest') {
        return new Date(b.submittedOn).valueOf() - new Date(a.submittedOn).valueOf();
      }
      return b.upvoteCount - a.upvoteCount;
    });

    return Response.json(filtered);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch suggestions' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    const payload = (await request.json()) as {
      title: string;
      description: string;
      category: string;
    };

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === session.user.email!.toLowerCase(),
    );
    const flat = user?.flatNumber || session.user.flatNumber;

    await appendRow('Suggestions', [
      payload.title,
      payload.description,
      payload.category,
      'Open',
      '',
      0,
      flat,
      new Date().toISOString(),
      session.user.email!,
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create suggestion' },
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
      status: SuggestionStatus;
      adminResponse: string;
    };

    const suggestions = await readSuggestions();
    const suggestion = suggestions.find((item) => item.id === payload.id);
    if (!suggestion) return Response.json({ error: 'Suggestion not found' }, { status: 404 });

    await updateRow('Suggestions', Number(payload.id), [
      suggestion.title,
      suggestion.description,
      suggestion.category,
      payload.status,
      payload.adminResponse,
      suggestion.upvoteCount,
      suggestion.submittedBy,
      suggestion.submittedOn,
      suggestion.submittedByEmail,
    ]);
    await appendAuditLog(
      session.user.email!,
      'SUGGESTION_UPDATE',
      `${suggestion.title} -> ${payload.status}`,
    );
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update suggestion' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) return Response.json({ error: 'id is required' }, { status: 400 });

    const suggestions = await readSuggestions();
    const suggestion = suggestions.find((item) => item.id === id);
    if (!suggestion) return Response.json({ error: 'Suggestion not found' }, { status: 404 });

    const isOwner =
      suggestion.submittedByEmail.toLowerCase() === session.user.email!.toLowerCase();
    const isAdmin = hasCommitteeAccess(session.user.role);

    if (!isOwner && !isAdmin) return Response.json({ error: 'Forbidden' }, { status: 403 });

    if (
      isOwner &&
      (suggestion.status !== 'Open' || suggestion.upvoteCount > 0) &&
      !isAdmin
    ) {
      return Response.json({ error: 'Cannot delete this suggestion' }, { status: 400 });
    }

    await updateRow('Suggestions', Number(id), [
      suggestion.title,
      suggestion.description,
      suggestion.category,
      'Removed',
      suggestion.adminResponse,
      suggestion.upvoteCount,
      suggestion.submittedBy,
      suggestion.submittedOn,
      suggestion.submittedByEmail,
    ]);

    if (isAdmin) {
      await appendAuditLog(session.user.email!, 'SUGGESTION_REMOVE', suggestion.title);
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to remove suggestion' },
      { status: 500 },
    );
  }
}
