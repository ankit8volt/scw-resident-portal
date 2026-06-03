'use client';

import { Shield } from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';

import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { fetcher } from '@/hooks/fetcher';
import { formatResidenceLabel, hasCompleteResidence } from '@/lib/residence-options';
import type { User, UserRole, UserStatus } from '@/types';

export default function AdminPage() {
  const [busyEmail, setBusyEmail] = useState('');
  const { data, mutate, error } = useSWR<User[]>('/api/users', fetcher);

  async function updateUser(
    user: User,
    status: UserStatus,
    role: UserRole,
  ) {
    setBusyEmail(user.email);
    try {
      await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          status,
          role,
          tower: user.tower,
          villamentNumber: user.villamentNumber,
        }),
      });
      await mutate();
    } finally {
      setBusyEmail('');
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          This page is available only to Super Admin users.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Admin Panel"
          description="Pending approvals and user role management for committee and super admins."
        />

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          Manage resident access and roles
        </div>

        <div className="space-y-4">
          {(data || []).map((user) => {
            const residence =
              user.tower && user.villamentNumber
                ? formatResidenceLabel(user.tower, user.villamentNumber)
                : user.flatNumber || 'Not provided';
            const profileReady = hasCompleteResidence(user.tower, user.villamentNumber);

            return (
              <article
                key={user.email}
                className="rounded-xl border border-border bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-foreground">{user.name || user.email}</h3>
                <p className="mb-1 text-sm text-muted-foreground">{user.email}</p>
                <p className="mb-4 text-sm text-foreground">
                  <span className="font-medium">Residence:</span> {residence} · {user.role} ·{' '}
                  {user.status}
                </p>
                {user.status === 'Pending' && !profileReady ? (
                  <p className="mb-4 text-sm text-destructive">
                    Waiting for resident to select tower and villament number.
                  </p>
                ) : null}
                {user.status === 'Pending' ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={busyEmail === user.email || !profileReady}
                      onClick={() => updateUser(user, 'Approved', 'Resident')}
                    >
                      Approve as Resident
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={busyEmail === user.email}
                      onClick={() => updateUser(user, 'Rejected', user.role)}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
