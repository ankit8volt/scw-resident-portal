'use client';

import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Home,
  Lightbulb,
  Shield,
  Sparkles,
  Vote,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/BrandLogo';
import { SIDEBAR_GRID_PATTERN } from '@/lib/ui-patterns';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Announcements', href: '/announcements', icon: Bell },
  { name: 'Polls', href: '/polls', icon: Vote },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Suggestions', href: '/suggestions', icon: Lightbulb },
];

type PortalSidebarProps = {
  showAdmin: boolean;
};

export function PortalSidebar({ showAdmin }: PortalSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const links = showAdmin
    ? [...navigation, { name: 'Admin', href: '/admin', icon: Shield }]
    : navigation;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' || pathname === '/' : pathname.startsWith(href);

  return (
    <>
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-gradient-to-b from-white via-white to-primary/5 shadow-xl transition-all duration-300 lg:flex',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: SIDEBAR_GRID_PATTERN }}
          aria-hidden
        />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex h-20 items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent px-5">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <BrandLogo iconClassName="h-12 w-12 shadow-lg" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-chart-2" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-foreground">SCW Villaments</h1>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    Community Portal
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative mx-auto">
                <BrandLogo iconClassName="h-12 w-12 shadow-lg" />
                <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-chart-2" />
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
            {links.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/30'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary',
                  )}
                >
                  {active ? (
                    <div className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                  ) : null}
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-all',
                      active ? 'bg-white/20' : 'bg-transparent group-hover:bg-primary/10',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </div>
                  {!collapsed ? <span className="text-sm font-medium">{item.name}</span> : null}
                  {!collapsed && !active ? (
                    <div className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border/50 bg-gradient-to-t from-primary/5 to-transparent p-4">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:bg-primary/10 hover:text-primary hover:shadow"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span>Collapse Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white lg:hidden">
        <nav className="flex items-center justify-around px-2 py-2">
          {links.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex min-w-0 flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
