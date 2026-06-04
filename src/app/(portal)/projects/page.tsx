'use client';

import { AlertCircle, Calendar, CheckCircle2, Clock, FolderOpen, Pause } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { ProjectUpdatesSection } from '@/components/features/ProjectUpdatesSection';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import { projectStatusStyles } from '@/lib/ui-styles';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

const categories = ['All', 'Infrastructure', 'Amenities', 'Maintenance', 'Events', 'Other'] as const;

const projectStatusIcons = {
  'In Progress': Clock,
  Completed: CheckCircle2,
  Planned: AlertCircle,
  'On Hold': Pause,
  Archived: Pause,
} as const;

function formatDate(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    return params.toString() ? `?${params.toString()}` : '';
  }, [status, category]);

  const { data, mutate } = useSWR<Project[]>(`/api/projects${query}`, fetcher);
  const canManage =
    session?.user.role === 'Committee' || session?.user.role === 'SuperAdmin';

  const filtered =
    data?.filter((project) =>
      selectedCategory === 'All' ? true : project.category === selectedCategory,
    ) ?? [];

  async function createProject() {
    setCreating(true);
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category: category || 'Other',
          status: status || 'Planned',
          description,
          startDate: '',
          expectedEndDate: '',
        }),
      });
      setName('');
      setDescription('');
      await mutate();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
        <PageHeader
          title="Project Updates"
          description="Track the progress of ongoing community improvement projects and view completed initiatives."
          imageSrc="/images/hero-forest.jpg"
        />

        <div className="mb-6 flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          <FolderOpen className="h-5 w-5 shrink-0 text-muted-foreground" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                selectedCategory === cat
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white text-muted-foreground hover:bg-secondary',
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects found.</p>
          ) : null}
          {filtered.map((project) => {
            const statusStyle =
              projectStatusStyles[project.status] ?? projectStatusStyles.Planned;
            const StatusIcon =
              projectStatusIcons[project.status as keyof typeof projectStatusIcons] ?? Clock;
            const isExpanded = expandedId === project.id;

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                  className="w-full p-6 text-left transition-colors hover:bg-secondary/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-lg border px-3 py-1 text-xs font-medium',
                            statusStyle,
                          )}
                        >
                          <StatusIcon className="mr-1 inline h-3 w-3" />
                          {project.status}
                        </span>
                        <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                          {project.category}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(project.startDate)} → {formatDate(project.expectedEndDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-border bg-secondary/30 px-6 py-6">
                    <ProjectUpdatesSection
                      projectId={project.id}
                      canManage={canManage}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {canManage ? (
          <section className="mt-8 rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Create project (Committee+)</h3>
            <div className="mb-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Status filter (list)</span>
                <select
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Category filter (list)</span>
                <select
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Amenities">Amenities</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Project name</span>
                <input
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Description</span>
                <textarea
                  className="min-h-24 rounded-lg border border-border bg-input-background px-3 py-2"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <Button
                onClick={createProject}
                disabled={creating || !name || !description}
                loading={creating}
                loadingText="Creating…"
              >
                Add project
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
