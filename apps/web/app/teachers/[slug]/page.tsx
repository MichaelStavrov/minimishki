import { TeacherDetailPage } from '@/_pages/teacher-detail/index.server';

type TeacherDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function TeacherDetailRoute({ params }: TeacherDetailRouteProps) {
  const { slug } = await params;

  return <TeacherDetailPage slug={slug} />;
}
