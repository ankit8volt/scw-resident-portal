'use client';

import { LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { formatResidenceLabel } from '@/lib/residence-options';
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
  tower?: string;
  villamentNumber?: string;
  flatNumber?: string;
  showAdmin: boolean;
  signOutAction: () => Promise<void>;
};

export function PortalTopBar({
  role,
  tower,
  villamentNumber,
  flatNumber,
  showAdmin,
  signOutAction,
}: PortalTopBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  const residenceLabel =
    tower && villamentNumber
      ? formatResidenceLabel(tower, villamentNumber)
      : flatNumber
        ? `Flat ${flatNumber}`
        : role;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-gradient-to-r from-[#1a4731]/90 via-[#2d6a4f]/85 to-[#40916c]/80 shadow-md backdrop-blur-md">
      <div className="flex h-20 items-center justify-between px-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-4 lg:hidden">
          <button
            type="button"
            className="rounded-xl p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <span className="font-semibold text-white">SCW</span>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-2xl font-semibold text-white drop-shadow-sm">{title}</h2>
          <div className="mt-1 h-0.5 w-12 rounded-full bg-gradient-to-r from-white/60 to-transparent" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="hidden items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 transition-all hover:bg-white/20 hover:shadow-md sm:flex"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white shadow-md">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left text-sm">
                <div className="font-semibold text-white">{residenceLabel}</div>
                <div className="text-xs text-white/70">{role}</div>
              </div>
            </button>

            {showUserMenu ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Close menu"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border/50 bg-white py-2 shadow-xl">
                  <div className="border-b border-border/50 px-4 py-3">
                    <div className="font-semibold text-foreground">{residenceLabel}</div>
                    <div className="text-sm text-muted-foreground">{role} account</div>
                  </div>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </form>
                </div>
              </>
            ) : null}
          </div>

          <form action={signOutAction} className="sm:hidden">
            <button
              type="submit"
              className="rounded-xl p-2.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-white/10 bg-[#1a4731] lg:hidden">
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
                      ? 'bg-white/20 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
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
