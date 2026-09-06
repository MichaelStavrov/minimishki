import { PostDetailPage } from '@/_pages/post-detail/index.server';

type PostDetailRouteProps = { params: Promise<{ slug: string }> };

export default async function PostDetailRoute({ params }: PostDetailRouteProps) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} />;
}
