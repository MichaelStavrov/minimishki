'use client';

import type { ComponentProps } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';

type NavigationLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function NavigationLink({ href, className, ...props }: NavigationLinkProps) {
  const pathname = usePathname();
  const isCurrentPage = pathname === href;
  const isActive = isCurrentPage || pathname.startsWith(`${href}/`);

  return (
    <Link
      {...props}
      href={href}
      aria-current={isCurrentPage ? 'page' : isActive ? 'location' : undefined}
      className={cn(
        className,
        isActive &&
          'bg-teal-50 text-teal-700 underline decoration-honey-400 decoration-2 underline-offset-4',
      )}
    />
  );
}
