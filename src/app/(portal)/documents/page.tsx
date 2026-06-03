'use client';

import { ExternalLink, FileText, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import type { DocumentItem } from '@/types';

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const apiQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (year) params.set('year', year);
    return params.toString() ? `?${params.toString()}` : '';
  }, [query, category, year]);

  const { data, mutate } = useSWR<DocumentItem[]>(`/api/documents${apiQuery}`, fetcher);
  const canManage =
    session?.user.role === 'Committee' || session?.user.role === 'SuperAdmin';

  async function addDocument() {
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentTitle: title,
        category: category || 'Other',
        year: year || String(new Date().getFullYear()),
        shortDescription: '',
        googleDriveLink: link,
        visibleTo: 'Everyone',
      }),
    });
    setTitle('');
    setLink('');
    await mutate();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Document Library"
          description="Access meeting minutes, financial reports, bylaws, and other community documents."
          imageSrc="/images/hero-garden.jpg"
        />

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1.5 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Search className="h-4 w-4" />
              Search
            </span>
            <input
              className="rounded-lg border border-border bg-input-background px-3 py-2"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Category</span>
            <select
              className="rounded-lg border border-border bg-input-background px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All</option>
              <option value="Meeting Minutes">Meeting Minutes</option>
              <option value="Financial Report">Financial Report</option>
              <option value="Rules & Bylaws">Rules & Bylaws</option>
              <option value="Vendor Contract">Vendor Contract</option>
              <option value="Notice">Notice</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Year</span>
            <input
              className="rounded-lg border border-border bg-input-background px-3 py-2"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(data || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents found.</p>
          ) : null}
          {(data || []).map((doc) => (
            <article
              key={doc.id}
              className="rounded-xl border border-border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-foreground">{doc.documentTitle}</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                {doc.category} · {doc.year}
              </p>
              {doc.shortDescription ? (
                <p className="mb-4 text-sm text-foreground">{doc.shortDescription}</p>
              ) : null}
              <a
                href={doc.googleDriveLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
              >
                Open document
                <ExternalLink className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        {canManage ? (
          <section className="mt-8 rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-foreground">Add document (Committee+)</h3>
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Title</span>
                <input
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-medium">Google Drive link</span>
                <input
                  className="rounded-lg border border-border bg-input-background px-3 py-2"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </label>
              <Button onClick={addDocument} disabled={!title || !link}>
                Add document
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
