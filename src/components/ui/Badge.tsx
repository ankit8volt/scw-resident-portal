import type { PropsWithChildren } from 'react';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
}>;

export function Badge({ children, tone = 'default' }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
