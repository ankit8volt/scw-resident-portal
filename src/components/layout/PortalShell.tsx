import { PortalSidebar } from '@/components/layout/PortalSidebar';
import { PortalTopBar } from '@/components/layout/PortalTopBar';
import { PORTAL_GRID_PATTERN } from '@/lib/ui-patterns';

type PortalShellProps = {
  role: string;
  tower?: string;
  villamentNumber?: string;
  flatNumber?: string;
  showAdmin: boolean;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function PortalShell({
  role,
  tower,
  villamentNumber,
  flatNumber,
  showAdmin,
  signOutAction,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/[0.02] to-accent/[0.03]">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        style={{ backgroundImage: PORTAL_GRID_PATTERN }}
        aria-hidden
      />
      <PortalSidebar showAdmin={showAdmin} />
      <div className="relative flex min-h-screen flex-col pb-16 lg:pl-72 lg:pb-0">
        <PortalTopBar
          role={role}
          tower={tower}
          villamentNumber={villamentNumber}
          flatNumber={flatNumber}
          showAdmin={showAdmin}
          signOutAction={signOutAction}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
