import { appendAuditLog, appendRow, readPolls, updateRow } from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import type { PollResultVisibility, PollStatus, PollType } from '@/types';

export const revalidate = 30;

export async function GET() {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
    const polls = await readPolls();
    return Response.json(polls);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch polls' },
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
      question: string;
      moreDetails: string;
      pollType: PollType;
      option1: string;
      option2: string;
      option3: string;
      option4: string;
      votingOpens: string;
      votingCloses: string;
      showResultsTo: PollResultVisibility;
      status: PollStatus;
    };

    await appendRow('Polls', [
      payload.question,
      payload.moreDetails,
      payload.pollType,
      payload.option1,
      payload.option2,
      payload.option3,
      payload.option4,
      payload.votingOpens,
      payload.votingCloses,
      payload.showResultsTo,
      payload.status,
      session.user.email!,
      new Date().toISOString(),
    ]);

    await appendAuditLog(session.user.email!, 'POLL_CREATE', payload.question);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to create poll' },
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
      question: string;
      moreDetails: string;
      pollType: PollType;
      option1: string;
      option2: string;
      option3: string;
      option4: string;
      votingOpens: string;
      votingCloses: string;
      showResultsTo: PollResultVisibility;
      status: PollStatus;
      createdBy: string;
      createdOn: string;
    };

    await updateRow('Polls', Number(payload.id), [
      payload.question,
      payload.moreDetails,
      payload.pollType,
      payload.option1,
      payload.option2,
      payload.option3,
      payload.option4,
      payload.votingOpens,
      payload.votingCloses,
      payload.showResultsTo,
      payload.status,
      payload.createdBy,
      payload.createdOn,
    ]);

    await appendAuditLog(session.user.email!, 'POLL_UPDATE', payload.question);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to update poll' },
      { status: 500 },
    );
  }
}
