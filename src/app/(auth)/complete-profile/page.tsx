'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { Button } from '@/components/ui/Button';
import {
  formatResidenceLabel,
  TOWER_OPTIONS,
  VILLAMENT_NUMBER_OPTIONS,
} from '@/lib/residence-options';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [tower, setTower] = useState('');
  const [villamentNumber, setVillamentNumber] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitProfile() {
    setError('');
    if (!tower || !villamentNumber) {
      setError('Please select both tower and villament number.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tower, villamentNumber }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || 'Failed to save your details.');
        setSubmitting(false);
        return;
      }

      await update();
      router.push('/login?status=pending');
      router.refresh();
    } catch {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <BrandLogo iconClassName="h-12 w-12 shadow-md" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">Complete your profile</h1>
            <p className="text-sm text-muted-foreground">
              {session?.user?.email || 'Signed in with Google'}
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground">
          Before the RWA admin can approve your account, please confirm your tower and villament
          number.
        </p>

        <div className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Tower</span>
            <select
              className="rounded-lg border border-border bg-input-background px-3 py-2.5"
              value={tower}
              onChange={(event) => setTower(event.target.value)}
            >
              <option value="">Select tower (6–16)</option>
              {TOWER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  Tower {option}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Villament number</span>
            <select
              className="rounded-lg border border-border bg-input-background px-3 py-2.5"
              value={villamentNumber}
              onChange={(event) => setVillamentNumber(event.target.value)}
            >
              <option value="">Select villament number</option>
              {VILLAMENT_NUMBER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {tower && villamentNumber ? (
            <p className="rounded-lg bg-secondary px-3 py-2 text-sm text-muted-foreground">
              Your residence:{' '}
              <span className="font-medium text-foreground">
                {formatResidenceLabel(tower, villamentNumber)}
              </span>
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            onClick={submitProfile}
            disabled={submitting || !tower || !villamentNumber}
            loading={submitting}
            loadingText="Submitting…"
            className="w-full"
          >
            Submit for approval
          </Button>
        </div>
      </div>
    </div>
  );
}
