'use client';

import { Bell, Calendar, Filter } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import useSWR from 'swr';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import { announcementTypeStyles } from '@/lib/ui-styles';
import { cn } from '@/lib/utils';
import type { Announcement } from '@/types';

const types = ['All', 'Alert', 'Notice', 'News', 'Meeting Minutes', 'Event Alert'] as const;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<string>('All');
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState('Notice');
  const [creating, setCreating] = useState(false);
  const { data, mutate, error } = useSWR<Announcement[]>('/api/announcements', fetcher);

  async function createAnnouncement() {
    setCreating(true);
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          fullMessage: newMessage,
          type: newType,
          pinOnHomepage: 'No',
          showFromDate: '',
          status: 'Published',
        }),
      });
      setNewTitle('');
      setNewMessage('');
      await mutate();
    } finally {
      setCreating(false);
    }
  }

  const items = data?.filter((item) => (selectedType === 'All' ? true : item.type === selectedType)) ?? [];
  const pinnedItems = items.filter((item) => item.pinOnHomepage === 'Yes');
  const regularItems = items.filter((item) => item.pinOnHomepage !== 'Yes');
  const canManage =
    session?.user.role === 'Committee' || session?.user.role === 'SuperAdmin';

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Announcements"
          description="Stay updated with the latest news, notices, and important information from the RWA committee."
          imageSrc="/images/hero-garden.jpg"
        />

        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 shrink-0 text-muted-foreground" />
          {types.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedType === type
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white text-muted-foreground hover:bg-secondary',
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {error ? <p className="mb-4 text-sm text-muted-foreground">Failed to load announcements.</p> : null}

        {pinnedItems.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <Bell className="h-5 w-5 text-primary" />
              Pinned Announcements
            </h2>
            <div className="space-y-3">
              {pinnedItems.map((announcement) => (
                <AnnouncementCard key={announcement.id} announcement={announcement} pinned />
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          {regularItems.length === 0 && pinnedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements found.</p>
          ) : null}
          {regularItems.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>

        {canManage ? (
          <section className="mt-8 rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">
              Create announcement (Committee+)
            </h3>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-foreground">Title</span>
                <input
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-foreground">Message</span>
                <textarea
                  className="min-h-24 rounded-lg border border-border bg-input-background px-3 py-2"
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium text-foreground">Type</span>
                <select
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={newType}
                  onChange={(event) => setNewType(event.target.value)}
                >
                  <option value="Notice">Notice</option>
                  <option value="News">News</option>
                  <option value="Alert">Alert</option>
                  <option value="Meeting Minutes">Meeting Minutes</option>
                  <option value="Event Alert">Event Alert</option>
                </select>
              </label>
              <Button
                onClick={createAnnouncement}
                disabled={creating || !newTitle || !newMessage}
                loading={creating}
                loadingText="Publishing…"
              >
                Publish
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function AnnouncementCard({
  announcement,
  pinned = false,
}: {
  announcement: Announcement;
  pinned?: boolean;
}) {
  const typeStyle =
    announcementTypeStyles[announcement.type] ?? announcementTypeStyles.Notice;

  return (
    <article
      className={cn(
        'rounded-xl bg-white p-6',
        pinned ? 'border-2 border-primary/30 shadow-sm' : 'border border-border hover:shadow-md',
      )}
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <span className={cn('rounded-lg border px-3 py-1 text-xs font-medium', typeStyle)}>
          {announcement.type}
        </span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(announcement.addedOn)}
        </div>
        {announcement.status !== 'Published' ? (
          <span className="text-xs text-muted-foreground">({announcement.status})</span>
        ) : null}
      </div>
      <h3 className={cn('mb-2 font-semibold text-foreground', pinned ? 'text-xl' : 'text-lg')}>
        {announcement.title}
      </h3>
      <p className="text-muted-foreground">{announcement.fullMessage}</p>
    </article>
  );
}
