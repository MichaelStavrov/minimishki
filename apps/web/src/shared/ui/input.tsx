import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-base text-foreground shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-danger-100',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
