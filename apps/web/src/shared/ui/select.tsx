import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

function Select({ className, children, ...props }: ComponentProps<'select'>) {
  const isListbox = props.multiple || (props.size !== undefined && props.size > 1);

  return (
    <select
      data-slot="select"
      className={cn(
        'flex h-11 w-full cursor-pointer rounded-xl border-2 border-input bg-background px-4 py-2 pr-10 text-base text-foreground shadow-xs transition-colors outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-danger-100',
        !isListbox &&
          `appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2317464c'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-size-[1rem_1rem] bg-position-[right_1rem_center] bg-no-repeat forced-colors:appearance-auto forced-colors:bg-none`,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
