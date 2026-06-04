import { appendRow, getUserByEmail, readPolls, readVotes } from '@/lib/sheets';
import { formatResidenceFlatNumber, formatResidenceLabel, hasCompleteResidence } from '@/lib/residence-options';
import { hasCommitteeAccess, requireSession } from '@/lib/session';
import {
  emailAlreadyVotedOnPoll,
  residenceVoteKey,
  villamentAlreadyVotedOnPoll,
} from '@/lib/vote-residence';

function voterResidenceFromSession(
  user: { tower: string; villamentNumber: string; flatNumber: string } | undefined,
  session: { user: { tower?: string; villamentNumber?: string; flatNumber?: string } },
) {
  const tower = user?.tower || session.user.tower || '';
  const villamentNumber = user?.villamentNumber || session.user.villamentNumber || '';
  const flatNumber =
    user?.flatNumber ||
    session.user.flatNumber ||
    formatResidenceFlatNumber(tower, villamentNumber);

  return { tower, villamentNumber, flatNumber };
}

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

    const user = await getUserByEmail(session.user.email!);
    const residence = voterResidenceFromSession(user, session);
    const residenceKey = residenceVoteKey(residence);

    const hasVotedByEmail = emailAlreadyVotedOnPoll(
      filteredVotes,
      poll.question,
      session.user.email!,
    );
    const villamentHasVoted = villamentAlreadyVotedOnPoll(
      filteredVotes,
      poll.question,
      residenceKey,
    );
    const hasVoted = hasVotedByEmail || villamentHasVoted;

    const canViewResults =
      session.user.role === 'SuperAdmin' ||
      session.user.role === 'Committee' ||
      poll.showResultsTo === 'Everyone after voting'
        ? hasVoted
        : poll.showResultsTo === 'Everyone after closing'
          ? poll.status === 'Closed' || hasVoted
          : hasCommitteeAccess(session.user.role);

    if (!canViewResults) {
      return Response.json({
        hasVoted,
        villamentHasVoted,
        results: [],
        canViewResults: false,
      });
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
      villamentHasVoted,
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

    const user = await getUserByEmail(session.user.email!);
    const residence = voterResidenceFromSession(user, session);

    if (!hasCompleteResidence(residence.tower, residence.villamentNumber)) {
      return Response.json(
        {
          error:
            'Your tower and villament number must be on file before you can vote. Contact the RWA if this is incorrect.',
        },
        { status: 400 },
      );
    }

    const residenceKey = residenceVoteKey(residence);
    const votes = await readVotes();
    const pollVotes = votes.filter((vote) => vote.pollQuestion === poll.question);

    if (emailAlreadyVotedOnPoll(pollVotes, poll.question, session.user.email!)) {
      return Response.json({ error: 'You have already voted on this poll.' }, { status: 409 });
    }

    if (villamentAlreadyVotedOnPoll(pollVotes, poll.question, residenceKey)) {
      const label = formatResidenceLabel(residence.tower, residence.villamentNumber);
      return Response.json(
        {
          error: `A vote has already been submitted for ${label}. Only one vote per villament is allowed, even if multiple residents share the login.`,
        },
        { status: 409 },
      );
    }

    await appendRow('Votes', [
      poll.question,
      residence.tower,
      residence.villamentNumber,
      residence.flatNumber,
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
