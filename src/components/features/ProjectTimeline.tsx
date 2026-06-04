'use client';

import type { ProjectUpdate } from '@/types';

function formatTimelineDate(value: string) {
  const raw = value?.trim();
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.valueOf())) return raw;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPostedBy(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'Committee';
  if (trimmed.includes('@')) {
    const local = trimmed.split('@')[0] ?? trimmed;
    return local.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return trimmed;
}

type ProjectTimelineProps = {
  updates: ProjectUpdate[];
};

export function ProjectTimeline({ updates }: ProjectTimelineProps) {
  const sorted = [...updates].sort((a, b) => {
    const aTime = new Date(a.date || a.postedOn).valueOf();
    const bTime = new Date(b.date || b.postedOn).valueOf();
    return bTime - aTime;
  });

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No timeline updates yet for this project.</p>
    );
  }

  return (
    <div>
      <h4 className="mb-6 text-lg font-semibold text-foreground">Project Timeline</h4>
      <ol className="relative space-y-0">
        {sorted.map((update, index) => {
          const step = sorted.length - index;
          const isLast = index === sorted.length - 1;
          const displayDate = formatTimelineDate(update.date || update.postedOn);

          return (
            <li key={update.id} className="relative flex gap-4 pb-10 last:pb-0">
              {!isLast ? (
                <span
                  className="absolute left-4 top-10 bottom-0 w-px -translate-x-1/2 bg-border"
                  aria-hidden
                />
              ) : null}

              <div
                className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
                aria-hidden
              >
                {step}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                {displayDate ? (
                  <p className="mb-2 text-sm text-muted-foreground">{displayDate}</p>
                ) : null}
                <p className="text-base leading-relaxed text-foreground">{update.updateDetails}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Posted by {formatPostedBy(update.postedBy)}
                </p>
                {update.photoLink ? (
                  <div className="mt-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={update.photoLink}
                      alt=""
                      className="max-w-full rounded-2xl border border-border object-cover sm:max-w-sm sm:h-48"
                      loading="lazy"
                    />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
