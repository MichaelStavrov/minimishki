'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';

type LeadLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'href'>;

export const LeadLink = forwardRef<HTMLAnchorElement, LeadLinkProps>(function LeadLink(
  { onClick, ...props },
  ref,
) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      pathname !== '/'
    ) {
      return;
    }

    event.preventDefault();

    document.getElementById('lead')?.scrollIntoView({
      block: 'start',
    });
    window.history.replaceState(null, '', '#lead');
  }

  return <Link ref={ref} href="/#lead" scroll={false} onClick={handleClick} {...props} />;
});
