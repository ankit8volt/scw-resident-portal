import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  /** Kept for API compatibility; icon uses the branded asset in all contexts. */
  variant?: 'onPrimary' | 'default';
};

export function BrandLogo({
  className,
  iconClassName = 'h-6 w-6',
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/app-icon.svg"
      alt=""
      className={cn('shrink-0 rounded-[22%] object-cover', iconClassName, className)}
    />
  );
}
