'use client';

import { useState } from 'react';
import useSWR from 'swr';

import { ProjectTimeline } from '@/components/features/ProjectTimeline';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import type { ProjectUpdate } from '@/types';

type ProjectUpdatesSectionProps = {
  projectId: string;
  canManage: boolean;
};

export function ProjectUpdatesSection({ projectId, canManage }: ProjectUpdatesSectionProps) {
  const { data, mutate, isLoading } = useSWR<ProjectUpdate[]>(
    `/api/projects/${projectId}/updates`,
    fetcher,
  );
  const [updateDetails, setUpdateDetails] = useState('');
  const [photoLink, setPhotoLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitUpdate() {
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateDetails: updateDetails.trim(),
          photoLink: photoLink.trim(),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || 'Failed to add update.');
        setSubmitting(false);
        return;
      }

      setUpdateDetails('');
      setPhotoLink('');
      await mutate();
      setSubmitting(false);
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading timeline…</p>
      ) : (
        <ProjectTimeline updates={data ?? []} />
      )}

      {canManage ? (
        <section className="rounded-xl border border-border bg-white p-5">
          <h4 className="mb-1 text-base font-semibold text-foreground">Add project update</h4>
          <p className="mb-4 text-sm text-muted-foreground">
            Date and author are recorded automatically when you publish.
          </p>
          <div className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Update details</span>
              <textarea
                className="min-h-24 rounded-lg border border-border bg-input-background px-3 py-2"
                value={updateDetails}
                onChange={(event) => setUpdateDetails(event.target.value)}
                placeholder="Describe progress on this project…"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-foreground">Photo link</span>
              <input
                className="rounded-lg border border-border bg-input-background px-3 py-2"
                value={photoLink}
                onChange={(event) => setPhotoLink(event.target.value)}
                placeholder="https://… (optional)"
                type="url"
              />
            </label>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button
              onClick={submitUpdate}
              disabled={submitting || !updateDetails.trim()}
              loading={submitting}
              loadingText="Publishing…"
            >
              Publish update
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
