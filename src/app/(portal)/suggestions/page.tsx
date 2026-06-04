'use client';

import { Filter, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { SuggestionCard } from '@/components/features/SuggestionCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetcher } from '@/hooks/fetcher';
import { cn } from '@/lib/utils';
import type { Suggestion } from '@/types';

const categories = [
  'All',
  'Amenities',
  'Safety & Security',
  'Events & Community',
  'Rules & Policies',
  'Green & Environment',
  'Other',
] as const;

const filterChipClass = (active: boolean) =>
  cn(
    'inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors',
    active
      ? 'bg-primary text-white'
      : 'border border-border bg-white text-muted-foreground hover:bg-secondary',
  );

export default function SuggestionsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'upvotes' | 'date'>('upvotes');

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    return params.toString();
  }, [sortBy]);

  const { data } = useSWR<Suggestion[]>(`/api/suggestions?${query}`, fetcher);

  const filtered =
    data?.filter((item) =>
      selectedCategory === 'All' ? true : item.category === selectedCategory,
    ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <PageHeader
          title="Suggestions Forum"
          description="Share your ideas for community improvements and support suggestions from fellow residents."
          imageSrc="/images/hero-canopy.jpg"
        />

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Filter className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={filterChipClass(selectedCategory === category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="shrink-0 text-sm text-muted-foreground">Sort by:</span>
            <button
              type="button"
              onClick={() => setSortBy('upvotes')}
              className={filterChipClass(sortBy === 'upvotes')}
            >
              Most Popular
            </button>
            <button
              type="button"
              onClick={() => setSortBy('date')}
              className={filterChipClass(sortBy === 'date')}
            >
              Recent
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No suggestions found.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another category or submit the first idea below.
              </p>
            </div>
          ) : (
            filtered.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))
          )}
        </div>

        <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 font-semibold text-foreground">Have a suggestion?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Share your ideas to improve our community. All suggestions are reviewed by the RWA
                committee.
              </p>
              <Link
                href="/suggestions/new"
                className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
              >
                Submit New Suggestion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
