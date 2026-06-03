'use client';

import { LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Home',
  '/announcements': 'Announcements',
  '/polls': 'Polls',
  '/projects': 'Projects',
  '/documents': 'Documents',
  '/suggestions': 'Suggestions',
  '/admin': 'Admin',
};

type PortalTopBarProps = {
  role: string;
  flatNumber?: string;
  showAdmin: boolean;
  signOutAction: () => Promise<void>;
};

export function PortalTopBar({ role, flatNumber, showAdmin, signOutAction }: PortalTopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Announcements', href: '/announcements' },
    { name: 'Polls', href: '/polls' },
    { name: 'Projects', href: '/projects' },
    { name: 'Documents', href: '/documents' },
    { name: 'Suggestions', href: '/suggestions' },
    ...(showAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  const title =
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BrandLogo variant="onPrimary" iconClassName="h-5 w-5" />
            </div>
            <span className="font-semibold text-foreground">SCW</span>
          </div>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-lg bg-secondary px-3 py-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <div className="font-medium text-foreground">
                {flatNumber ? `Flat ${flatNumber}` : role}
              </div>
              <div className="text-xs text-muted-foreground">{role}</div>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
