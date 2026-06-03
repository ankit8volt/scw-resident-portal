import { appendRow, readPolls, readUsers, readVotes } from '@/lib/sheets';
import { hasCommitteeAccess, requireSession } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const url = new URL(request.url);
    const pollId = url.searchParams.get('pollId');
    if (!pollId) {
      return Response.json({ error: 'pollId is required' }, { status: 400 });
    }

    const polls = await readPolls();
    const poll = polls.find((item) => item.id === pollId);
    if (!poll) return Response.json({ error: 'Poll not found' }, { status: 404 });

    const votes = await readVotes();
    const filteredVotes = votes.filter((vote) => vote.pollQuestion === poll.question);

    const hasVoted = filteredVotes.some(
      (vote) => vote.voterEmail.toLowerCase() === session.user.email!.toLowerCase(),
    );

    const canViewResults =
      session.user.role === 'SuperAdmin' ||
      session.user.role === 'Committee' ||
      poll.showResultsTo === 'Everyone after voting'
        ? hasVoted
        : poll.showResultsTo === 'Everyone after closing'
          ? poll.status === 'Closed' || hasVoted
          : hasCommitteeAccess(session.user.role);

    if (!canViewResults) {
      return Response.json({ hasVoted, results: [], canViewResults: false });
    }

    const counts = filteredVotes.reduce<Record<string, number>>((acc, vote) => {
      const selected = vote.voteChosen.split(',').map((item) => item.trim());
      selected.forEach((entry) => {
        acc[entry] = (acc[entry] || 0) + 1;
      });
      return acc;
    }, {});

    return Response.json({
      hasVoted,
      canViewResults: true,
      totalVotes: filteredVotes.length,
      results: counts,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch votes' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return Response.json({ error: 'Unauthenticated' }, { status: 401 });

    const payload = (await request.json()) as {
      pollId: string;
      voteChosen: string[];
    };

    const polls = await readPolls();
    const poll = polls.find((item) => item.id === payload.pollId);
    if (!poll) return Response.json({ error: 'Poll not found' }, { status: 404 });

    if (poll.status !== 'Open') {
      return Response.json({ error: 'Poll is not open' }, { status: 400 });
    }

    const users = await readUsers();
    const user = users.find(
      (item) => item.email.toLowerCase() === session.user.email!.toLowerCase(),
    );

    const flatNumber = user?.flatNumber || session.user.flatNumber;
    if (!flatNumber) {
      return Response.json({ error: 'Flat number missing for voter' }, { status: 400 });
    }

    const votes = await readVotes();
    const duplicate = votes.find(
      (vote) =>
        vote.pollQuestion === poll.question &&
        vote.voterEmail.toLowerCase() === session.user.email!.toLowerCase(),
    );
    if (duplicate) {
      return Response.json({ error: 'Vote already submitted' }, { status: 409 });
    }

    await appendRow('Votes', [
      poll.question,
      flatNumber,
      session.user.email!,
      payload.voteChosen.join(', '),
      new Date().toISOString(),
    ]);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to cast vote' },
      { status: 500 },
    );
  }
}
