import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-extrabold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-coral-400 text-ink shadow-soft hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lifted',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:-translate-y-0.5 hover:brightness-95 hover:shadow-lifted focus-visible:ring-destructive/35',
        outline:
          'border-2 border-teal-600 bg-background text-teal-700 hover:-translate-y-0.5 hover:bg-teal-50',
        secondary:
          'bg-honey-100 text-ink hover:-translate-y-0.5 hover:bg-honey-400 hover:shadow-soft',
        ghost: 'text-teal-700 hover:bg-teal-50',
        link: 'text-teal-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 text-base has-[>svg]:px-4',
        xs: 'h-7 gap-1 rounded-full px-2.5 text-xs has-[>svg]:px-2',
        sm: 'h-9 gap-1.5 px-4 text-sm has-[>svg]:px-3',
        lg: 'h-13 px-7 text-base has-[>svg]:px-5',
        icon: 'size-11',
        'icon-xs': 'size-7 rounded-full [&_svg:not([class*="size-"])]:size-3',
        'icon-sm': 'size-9',
        'icon-lg': 'size-13',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
