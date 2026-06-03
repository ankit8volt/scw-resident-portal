'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';

export default function NewSuggestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitSuggestion() {
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category: category || 'Other',
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || 'Failed to submit suggestion.');
        setSubmitting(false);
        return;
      }

      router.push('/suggestions');
      router.refresh();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Submit a Suggestion"
          description="Share an idea with the RWA committee and fellow residents."
        />

        <section className="rounded-xl border border-border bg-white p-6">
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Title</span>
              <input
                className="rounded-lg border border-border bg-input-background px-3 py-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Description</span>
              <textarea
                className="min-h-28 rounded-lg border border-border bg-input-background px-3 py-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Category</span>
              <input
                className="rounded-lg border border-border bg-input-background px-3 py-2"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Amenities, Safety & Security, Events..."
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={submitSuggestion}
                disabled={submitting || !title.trim() || !description.trim()}
                loading={submitting}
                loadingText="Submitting…"
              >
                Submit suggestion
              </Button>
              <Link
                href="/suggestions"
                className="inline-flex items-center rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
