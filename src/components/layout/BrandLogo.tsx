import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  variant?: 'onPrimary' | 'default';
};

export function BrandLogo({
  className,
  iconClassName = 'h-6 w-6',
  variant = 'default',
}: BrandLogoProps) {
  const strokeClass = variant === 'onPrimary' ? 'text-white' : 'text-primary';

  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn(iconClassName, className)} aria-hidden>
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={strokeClass}
      />
    </svg>
  );
}
