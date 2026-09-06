import Image from 'next/image';
import Link from 'next/link';
import type { PostDto } from '@minimishki/shared';

import { Button, Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';

type PostCardProps = { post: PostDto };

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="group flex min-h-full flex-col overflow-hidden border-0 bg-cream-50 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lifted">
      {post.coverUrl === null ? <Placeholder /> : <Cover url={post.coverUrl} />}
      <CardHeader>
        <p className="text-sm font-black tracking-[0.12em] text-coral-400 uppercase">
          {formatDate(post.publishedAt)}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-teal-700">{post.title}</h2>
      </CardHeader>
      <CardContent className="flex-1 pt-4">
        <p className="text-base leading-7 text-teal-700">
          {post.excerpt ?? 'Подробности события — в полной публикации.'}
        </p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button asChild variant="secondary">
          <Link href={`/news/${post.slug}`}>Читать новость</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function Cover({ url }: { url: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-teal-700">
      <Image
        src={url}
        alt=""
        fill
        sizes="(min-width: 1280px) 370px, (min-width: 640px) 45vw, 100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
}

function Placeholder() {
  return (
    <div className="relative flex min-h-52 items-end overflow-hidden bg-teal-700 p-6 text-cream-50">
      <div
        aria-hidden="true"
        className="absolute -top-14 -right-9 size-40 rounded-full bg-honey-400"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 -left-8 size-36 rounded-[44%] bg-coral-400"
      />
      <p className="relative max-w-44 text-xl leading-6 font-black">Новости и события центра</p>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (value === null) return 'Новости центра';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(new Date(value));
}
