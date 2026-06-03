import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    loading?: boolean;
    loadingText?: string;
  }
>;

export function Button({
  children,
  variant = 'primary',
  className,
  loading = false,
  loadingText,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        'inline-flex min-h-[42px] cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'bg-primary text-white hover:bg-primary/90'
          : 'border border-border bg-white text-foreground hover:bg-secondary',
        className,
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
