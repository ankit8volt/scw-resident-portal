'use client';

import { MessageSquare, TrendingUp } from 'lucide-react';
import { useState } from 'react';

import { suggestionStatusStyles } from '@/lib/ui-styles';
import { cn } from '@/lib/utils';
import type { Suggestion } from '@/types';

type SuggestionCardProps = {
  suggestion: Suggestion;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [loading, setLoading] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const statusStyle =
    suggestionStatusStyles[suggestion.status] ?? suggestionStatusStyles.Open;

  async function toggleUpvote() {
    setLoading(true);
    try {
      await fetch(`/api/suggestions/${suggestion.id}/upvote`, { method: 'POST' });
      setUpvoted(!upvoted);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={toggleUpvote}
          aria-label="Toggle upvote"
          className={cn(
            'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
            upvoted
              ? 'bg-primary text-white'
              : 'bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary',
          )}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-sm font-semibold">{suggestion.upvoteCount}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{suggestion.title}</h3>
            <span
              className={cn('rounded-lg border px-3 py-1 text-xs font-medium', statusStyle)}
            >
              {suggestion.status}
            </span>
            <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
              {suggestion.category}
            </span>
          </div>

          <p className="mb-3 text-sm text-foreground">{suggestion.description}</p>

          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span>Submitted by Flat {suggestion.submittedBy}</span>
            <span>{formatDate(suggestion.submittedOn)}</span>
          </div>

          {suggestion.adminResponse ? (
            <div className="mt-3 rounded-lg border border-accent/20 bg-accent/10 p-4">
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                <div>
                  <div className="mb-1 text-xs font-medium text-accent-foreground">
                    RWA Committee Response
                  </div>
                  <p className="text-sm text-foreground">{suggestion.adminResponse}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
