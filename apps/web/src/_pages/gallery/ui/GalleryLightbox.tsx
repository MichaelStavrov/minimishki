'use client';

import Image from 'next/image';
import type { GalleryItemDto } from '@minimishki/shared';

import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/shared/ui';

type GalleryLightboxProps = {
  item: GalleryItemDto;
  index: number;
};

export function GalleryLightbox({ item, index }: GalleryLightboxProps) {
  const description = item.alt ?? item.caption ?? `Фотография из галереи «Минимишек», ${index + 1}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group relative block aspect-[4/3] w-full overflow-hidden rounded-[1.75rem] bg-teal-100 text-left shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lifted focus-visible:ring-[3px] focus-visible:ring-teal-600/45 focus-visible:outline-none"
          aria-label={`Открыть: ${description}`}
        >
          <Image
            src={item.url}
            alt={description}
            fill
            sizes="(min-width: 1280px) 370px, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-ink/70 to-transparent px-5 pt-14 pb-5 text-sm font-extrabold text-cream-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            Открыть фотографию
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl overflow-hidden p-0">
        <DialogTitle className="sr-only">{description}</DialogTitle>
        <div className="relative aspect-[4/3] max-h-[calc(100dvh-8rem)] bg-teal-700">
          <Image src={item.url} alt={description} fill sizes="90vw" className="object-contain" />
        </div>
        <DialogDescription
          className={
            item.caption === null
              ? 'sr-only'
              : 'px-6 pr-14 pb-6 text-base font-bold text-teal-700 sm:px-8 sm:pb-8'
          }
        >
          {item.caption ?? description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
