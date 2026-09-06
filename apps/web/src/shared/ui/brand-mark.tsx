import Image from 'next/image';

import { cn } from '@/shared/lib/cn';

type BrandMarkProps = {
  className?: string;
  priority?: boolean;
};

function BrandMark({ className, priority = false }: BrandMarkProps) {
  return (
    <Image
      src="/images/brand/logo.png"
      alt=""
      aria-hidden="true"
      width={190}
      height={87}
      priority={priority}
      className={cn('h-auto w-32 sm:w-40', className)}
    />
  );
}

export { BrandMark };
