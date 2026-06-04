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
import { HERO_DOT_PATTERN } from '@/lib/ui-patterns';
import { announcementTypeStyles } from '@/lib/ui-styles';
import { cn, isDateVisible } from '@/lib/utils';

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
    <div className="min-h-screen">
      <div className="relative overflow-hidden rounded-b-[3rem] bg-gradient-to-br from-primary via-primary/95 to-primary/85 shadow-2xl">
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
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: HERO_DOT_PATTERN }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1.5 w-16 rounded-full bg-white/80" />
              <div className="h-1.5 w-4 rounded-full bg-white/50" />
            </div>
            <h1 className="mb-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-6xl">
              Welcome to Shriram Chirping Woods
            </h1>
            <p className="text-xl leading-relaxed text-white/95 sm:text-2xl">
              Your community portal for staying connected, informed, and engaged with your
              neighborhood.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        {pinned.length > 0 ? (
          <div className="mb-10 rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-md">
                <Bell className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-4 text-lg font-semibold text-foreground">Important Announcements</h3>
                <div className="space-y-3">
                  {pinned.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-accent/20 bg-white/60 p-4 backdrop-blur-sm transition-shadow hover:shadow-md"
                    >
                      <div className="min-w-0">
                        <span
                          className={cn(
                            'mr-2 inline-block rounded-lg px-3 py-1 text-xs font-medium shadow-sm',
                            announcementTypeStyles[announcement.type] ??
                              announcementTypeStyles.Notice,
                          )}
                        >
                          {announcement.type}
                        </span>
                        <span className="font-medium text-foreground">{announcement.title}</span>
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

        <div className="mb-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/polls"
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-white p-7 transition-all hover:border-primary/30 hover:shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg transition-transform group-hover:scale-110">
                  <Vote className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Active Polls</h3>
              <p className="mb-5 text-sm text-muted-foreground">
                {activePolls.length} poll{activePolls.length === 1 ? '' : 's'} open for voting
              </p>
              <div className="space-y-3">
                {activePolls.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active polls right now.</p>
                ) : (
                  activePolls.slice(0, 2).map((poll) => (
                    <div
                      key={poll.id}
                      className="rounded-lg border border-primary/10 bg-primary/5 p-3 text-sm"
                    >
                      <div className="mb-1 line-clamp-1 font-medium text-foreground">
                        {poll.question}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Closes {formatShortDate(poll.votingCloses)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Link>

          <Link
            href="/projects"
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-white p-7 transition-all hover:border-primary/30 hover:shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-gradient-to-br from-chart-2/5 to-transparent" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-chart-2 to-chart-2/80 shadow-lg transition-transform group-hover:scale-110">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Recent Updates</h3>
              <p className="mb-5 text-sm text-muted-foreground">Latest project progress</p>
              <div className="space-y-3">
                {recentUpdates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No project updates yet.</p>
                ) : (
                  recentUpdates.slice(0, 2).map((update) => (
                    <div
                      key={update.id}
                      className="rounded-lg border border-chart-2/10 bg-chart-2/5 p-3 text-sm"
                    >
                      <div className="mb-1 line-clamp-1 font-medium text-foreground">
                        {update.projectName}
                      </div>
                      <div className="line-clamp-1 text-xs text-muted-foreground">
                        {update.updateDetails}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Link>

          <Link
            href="/suggestions"
            className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-white p-7 transition-all hover:border-primary/30 hover:shadow-2xl md:col-span-2 lg:col-span-1"
          >
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-gradient-to-br from-accent/5 to-transparent" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent/80 shadow-lg transition-transform group-hover:scale-110">
                  <Lightbulb className="h-7 w-7 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Top Suggestions</h3>
              <p className="mb-5 text-sm text-muted-foreground">Most popular community ideas</p>
              <div className="space-y-3">
                {topSuggestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No suggestions yet.</p>
                ) : (
                  topSuggestions.slice(0, 2).map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-accent/10 bg-accent/5 p-3"
                    >
                      <div className="line-clamp-1 text-sm text-foreground">{suggestion.title}</div>
                      <div className="flex shrink-0 items-center gap-1 text-accent-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span className="text-xs font-semibold">{suggestion.upvoteCount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="rounded-2xl border-2 border-border/50 bg-white p-8 shadow-xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">Recent Project Updates</h2>
            <Link
              href="/projects"
              className="flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              View all projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No project updates yet.</p>
          ) : (
            <div className="space-y-5">
              {recentUpdates.map((update) => (
                <div
                  key={update.id}
                  className="flex gap-5 border-b border-border/50 pb-5 last:border-0 last:pb-0"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 font-medium text-foreground">{update.projectName}</h3>
                    <p className="mb-1 text-sm text-muted-foreground">{update.updateDetails}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatLongDate(update.date || update.postedOn)}
                      {update.postedBy ? ` · ${update.postedBy}` : ''}
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
