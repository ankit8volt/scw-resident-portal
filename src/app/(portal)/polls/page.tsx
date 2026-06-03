'use client';

import { Calendar, CheckCircle2, Users, Vote } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import { cn } from '@/lib/utils';
import type { Poll } from '@/types';

type VoteState = {
  hasVoted: boolean;
  canViewResults: boolean;
  totalVotes?: number;
  results?: Record<string, number>;
};

function formatShortDate(value: string) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function pollOptions(poll: Poll) {
  return poll.pollType === 'Yes or No'
    ? ['Yes', 'No']
    : [poll.option1, poll.option2, poll.option3, poll.option4].filter(Boolean);
}

export default function PollsPage() {
  const { data, mutate } = useSWR<Poll[]>('/api/polls', fetcher);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [voteState, setVoteState] = useState<Record<string, VoteState>>({});

  const activePolls = (data || []).filter((poll) => poll.status === 'Open');
  const closedPolls = (data || []).filter((poll) => poll.status !== 'Open');

  async function castVote(pollId: string) {
    const choice = selected[pollId];
    if (!choice) return;
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, voteChosen: [choice] }),
    });
    await loadResults(pollId);
  }

  async function loadResults(pollId: string) {
    const response = await fetch(`/api/votes?pollId=${pollId}`);
    const payload = (await response.json()) as VoteState;
    setVoteState((prev) => ({ ...prev, [pollId]: payload }));
    await mutate();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Polls & Voting"
          description="Participate in community decisions and have your voice heard on important matters."
          imageSrc="/images/hero-leaves.jpg"
        />

        {activePolls.length > 0 ? (
          <div className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
              <Vote className="h-6 w-6 text-primary" />
              Active Polls
            </h2>
            <div className="space-y-6">
              {activePolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  selected={selected[poll.id]}
                  voteState={voteState[poll.id]}
                  onSelect={(value) => setSelected((prev) => ({ ...prev, [poll.id]: value }))}
                  onVote={() => castVote(poll.id)}
                  onLoadResults={() => loadResults(poll.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="mb-8 text-sm text-muted-foreground">No active polls at the moment.</p>
        )}

        {closedPolls.length > 0 ? (
          <div>
            <h2 className="mb-4 text-xl font-semibold text-foreground">Closed Polls</h2>
            <div className="space-y-4">
              {closedPolls.map((poll) => (
                <div
                  key={poll.id}
                  className="rounded-xl border border-border bg-white p-6 opacity-75"
                >
                  <PollResultsHeader poll={poll} closed />
                  <PollResultsBody
                    poll={poll}
                    voteState={voteState[poll.id]}
                    onLoadResults={() => loadResults(poll.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PollCard({
  poll,
  selected,
  voteState,
  onSelect,
  onVote,
  onLoadResults,
}: {
  poll: Poll;
  selected?: string;
  voteState?: VoteState;
  onSelect: (value: string) => void;
  onVote: () => void;
  onLoadResults: () => void;
}) {
  const options = pollOptions(poll);
  const showResults = voteState?.canViewResults;
  const totalVotes = voteState?.totalVotes || 0;

  return (
    <article className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <PollResultsHeader poll={poll} />
      {poll.moreDetails ? (
        <p className="mb-4 text-sm text-muted-foreground">{poll.moreDetails}</p>
      ) : null}

      <div className="space-y-3">
        {options.map((option) => {
          const count = voteState?.results?.[option] ?? 0;
          const percentage = showResults && totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          if (showResults) {
            return (
              <div key={option}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm text-foreground">{option}</span>
                  <span className="text-sm font-medium text-foreground">{percentage}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all',
                selected === option
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-secondary',
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2',
                  selected === option ? 'border-primary' : 'border-border',
                )}
              >
                {selected === option ? <div className="h-3 w-3 rounded-full bg-primary" /> : null}
              </div>
              <span className="text-sm font-medium text-foreground">{option}</span>
            </button>
          );
        })}
      </div>

      {!showResults ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={onVote} disabled={!selected}>
            Submit Vote
          </Button>
          <Button variant="secondary" onClick={onLoadResults}>
            View Results
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4" />
          {voteState?.hasVoted ? 'You have voted on this poll' : 'Results loaded'}
        </div>
      )}
    </article>
  );
}

function PollResultsHeader({ poll, closed = false }: { poll: Poll; closed?: boolean }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{poll.question}</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {closed ? 'Closed' : 'Closes'} {formatShortDate(poll.votingCloses)}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {poll.pollType}
          </div>
          {!closed ? (
            <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Open
            </span>
          ) : (
            <span className="whitespace-nowrap rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              Closed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PollResultsBody({
  poll,
  voteState,
  onLoadResults,
}: {
  poll: Poll;
  voteState?: VoteState;
  onLoadResults: () => void;
}) {
  const options = pollOptions(poll);

  if (!voteState?.canViewResults) {
    return (
      <Button variant="secondary" onClick={onLoadResults}>
        View Results
      </Button>
    );
  }

  const totalVotes = voteState.totalVotes || 0;

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const count = voteState.results?.[option] ?? 0;
        const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        return (
          <div key={option}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm text-foreground">{option}</span>
              <span className="text-sm font-medium text-foreground">{percentage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
