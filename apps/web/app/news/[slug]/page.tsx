import type { Metadata } from 'next';

import { PostDetailPage } from '@/_pages/post-detail/index.server';

import { getPostBySlug } from '@/entities/post/index.server';

import { getOpenGraphImages } from '@/shared/lib/get-open-graph-images';

type PostDetailRouteProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const description = post.excerpt ?? undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: getOpenGraphImages(post.coverUrl),
    },
  };
}

export default async function PostDetailRoute({ params }: PostDetailRouteProps) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} />;
}
