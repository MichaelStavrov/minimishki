import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

function BrandMark({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn('grid size-11 place-items-center rounded-2xl', className)}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M12 1.75 14.75 9.25 22.25 12l-7.5 2.75L12 22.25l-2.75-7.5L1.75 12l7.5-2.75L12 1.75Z" />
      </svg>
    </span>
  );
}

export { BrandMark };
