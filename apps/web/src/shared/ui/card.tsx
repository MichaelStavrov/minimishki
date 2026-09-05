import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-2xl border border-cream-200 bg-card text-card-foreground shadow-soft',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn('flex flex-col gap-2 p-6 pb-0 sm:p-7 sm:pb-0', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-xl font-black tracking-tight text-teal-700', className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm leading-6 text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6 sm:p-7', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 p-6 pt-0 sm:p-7 sm:pt-0', className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
