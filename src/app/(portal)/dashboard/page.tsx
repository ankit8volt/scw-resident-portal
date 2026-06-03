import {
  ArrowRight,
  Bell,
  Calendar,
  Lightbulb,
  TrendingUp,
  Vote,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { readAnnouncements, readPolls, readProjectUpdates, readSuggestions } from '@/lib/sheets';
import { announcementTypeStyles } from '@/lib/ui-styles';
import { isDateVisible } from '@/lib/utils';

function formatShortDate(value: string) {
  if (!value) return 'TBD';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

function formatLongDate(value: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function DashboardPage() {
  const [announcements, polls, projectUpdates, suggestions] = await Promise.all([
    readAnnouncements(),
    readPolls(),
    readProjectUpdates(),
    readSuggestions(),
  ]);

  const pinned = announcements
    .filter((item) => item.status === 'Published' && item.pinOnHomepage === 'Yes')
    .filter((item) => isDateVisible(item.showFromDate))
    .slice(0, 3);

  const activePolls = polls.filter((item) => item.status === 'Open').slice(0, 3);
  const recentUpdates = [...projectUpdates]
    .sort((a, b) => new Date(b.postedOn).valueOf() - new Date(a.postedOn).valueOf())
    .slice(0, 3);
  const topSuggestions = [...suggestions]
    .sort((a, b) => b.upvoteCount - a.upvoteCount)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero-forest.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="mb-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-white sm:text-5xl">
              Welcome to Shriram Chirping Woods
            </h1>
            <p className="text-xl text-white/90">
              Your community portal for staying connected, informed, and engaged with your
              neighborhood.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {pinned.length > 0 ? (
          <div className="mb-8 rounded-xl border border-accent bg-accent/20 p-6">
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-6 w-6 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <h3 className="mb-3 font-semibold text-foreground">Important Announcements</h3>
                <div className="space-y-3">
                  {pinned.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span
                          className={`mr-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${
                            announcementTypeStyles[announcement.type] ??
                            announcementTypeStyles.Notice
                          }`}
                        >
                          {announcement.type}
                        </span>
                        <span className="text-foreground">{announcement.title}</span>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                        {formatShortDate(announcement.addedOn)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/polls"
            className="group rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Vote className="h-6 w-6 text-primary" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">Active Polls</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {activePolls.length} poll{activePolls.length === 1 ? '' : 's'} open for voting
            </p>
            <div className="space-y-2">
              {activePolls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active polls right now.</p>
              ) : (
                activePolls.slice(0, 2).map((poll) => (
                  <div key={poll.id} className="text-sm">
                    <div className="line-clamp-1 text-foreground">{poll.question}</div>
                    <div className="text-xs text-muted-foreground">
                      Closes {formatShortDate(poll.votingCloses)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Link>

          <Link
            href="/projects"
            className="group rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">Recent Updates</h3>
            <p className="mb-4 text-sm text-muted-foreground">Latest project progress</p>
            <div className="space-y-2">
              {recentUpdates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No project updates yet.</p>
              ) : (
                recentUpdates.slice(0, 2).map((update) => (
                  <div key={update.id} className="text-sm">
                    <div className="line-clamp-1 font-medium text-foreground">
                      {update.projectName}
                    </div>
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {update.updateDetails}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Link>

          <Link
            href="/suggestions"
            className="group rounded-xl border border-border bg-white p-6 transition-all hover:shadow-lg md:col-span-2 lg:col-span-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <h3 className="mb-1 font-semibold text-foreground">Top Suggestions</h3>
            <p className="mb-4 text-sm text-muted-foreground">Most popular community ideas</p>
            <div className="space-y-2">
              {topSuggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No suggestions yet.</p>
              ) : (
                topSuggestions.slice(0, 2).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="line-clamp-1 text-sm text-foreground">{suggestion.title}</div>
                    <div className="flex shrink-0 items-center gap-1 text-primary">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs font-medium">{suggestion.upvoteCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Project Updates</h2>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No project updates yet.</p>
          ) : (
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-medium text-foreground">{update.projectName}</h3>
                    <p className="mb-1 text-sm text-muted-foreground">{update.updateDetails}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatLongDate(update.postedOn)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
