import {
  appendAuditLog,
  appendRow,
  readSuggestionUpvotes,
  readSuggestions,
  readUsers,
  updateRow,
} from '@/lib/sheets';
import { requireSession } from '@/lib/session';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const { id } = await context.params;
    const suggestions = await readSuggestions();
    const suggestion = suggestions.find((item) => item.id === id);
    if (!suggestion) return Response.json({ error: 'Suggestion not found' }, { status: 404 });

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === session.user.email!.toLowerCase(),
    );
    const flatNumber = user?.flatNumber || session.user.flatNumber;

    const upvotes = await readSuggestionUpvotes();
    const current = upvotes.find(
      (item) =>
        item.suggestionId === id &&
        item.voterEmail.toLowerCase() === session.user.email!.toLowerCase(),
    );

    if (!current || current.withdrawn === 'TRUE') {
      await appendRow('Suggestion Upvotes', [
        id,
        session.user.email!,
        flatNumber,
        'FALSE',
        new Date().toISOString(),
      ]);
      await updateRow('Suggestions', Number(id), [
        suggestion.title,
        suggestion.description,
        suggestion.category,
        suggestion.status,
        suggestion.adminResponse,
        suggestion.upvoteCount + 1,
        suggestion.submittedBy,
        suggestion.submittedOn,
        suggestion.submittedByEmail,
      ]);
      return Response.json({ ok: true, upvoted: true });
    }

    await appendRow('Suggestion Upvotes', [
      id,
      session.user.email!,
      flatNumber,
      'TRUE',
      new Date().toISOString(),
    ]);
    await updateRow('Suggestions', Number(id), [
      suggestion.title,
      suggestion.description,
      suggestion.category,
      suggestion.status,
      suggestion.adminResponse,
      Math.max(0, suggestion.upvoteCount - 1),
      suggestion.submittedBy,
      suggestion.submittedOn,
      suggestion.submittedByEmail,
    ]);
    await appendAuditLog(
      session.user.email!,
      'SUGGESTION_UPVOTE_TOGGLE',
      `${suggestion.title}: withdraw`,
    );
    return Response.json({ ok: true, upvoted: false });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to toggle upvote' },
      { status: 500 },
    );
  }
}
