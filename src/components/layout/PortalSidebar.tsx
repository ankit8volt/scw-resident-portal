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
  Vote,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BrandLogo } from '@/components/layout/BrandLogo';
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
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-white transition-all duration-300 lg:flex',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <BrandLogo variant="onPrimary" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-foreground">SCW Villaments</h1>
                  <p className="text-xs text-muted-foreground">Community Portal</p>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <BrandLogo variant="onPrimary" />
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {links.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
                    active
                      ? 'bg-primary text-white'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed ? <span className="text-sm font-medium">{item.name}</span> : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <>
                  <ChevronLeft className="h-5 w-5" />
                  <span className="text-sm">Collapse</span>
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
                  'flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors',
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
