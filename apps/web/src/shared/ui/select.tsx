import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-11 w-full cursor-pointer rounded-xl border-2 border-input bg-background px-4 py-2 pr-10 text-base text-foreground shadow-xs transition-colors outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-danger-100',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
