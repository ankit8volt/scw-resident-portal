import { PortalSidebar } from '@/components/layout/PortalSidebar';
import { PortalTopBar } from '@/components/layout/PortalTopBar';

type PortalShellProps = {
  role: string;
  flatNumber?: string;
  showAdmin: boolean;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
};

export function PortalShell({
  role,
  flatNumber,
  showAdmin,
  signOutAction,
  children,
}: PortalShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <PortalSidebar showAdmin={showAdmin} />
      <div className="flex min-h-screen flex-col pb-16 lg:pl-64 lg:pb-0">
        <PortalTopBar
          role={role}
          flatNumber={flatNumber}
          showAdmin={showAdmin}
          signOutAction={signOutAction}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
