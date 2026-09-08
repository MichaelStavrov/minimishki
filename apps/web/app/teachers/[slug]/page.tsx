import type { Metadata } from 'next';

import { TeacherDetailPage } from '@/_pages/teacher-detail/index.server';

import { getTeacherBySlug } from '@/entities/teacher/index.server';

import { getOpenGraphImages } from '@/shared/lib/get-open-graph-images';
import { JsonLd } from '@/shared/ui';

type TeacherDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: TeacherDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  return {
    title: teacher.fullName,
    description: `${teacher.position} в детском центре «Минимишки» в Пушкино.`,
    openGraph: {
      title: teacher.fullName,
      description: `${teacher.position} в детском центре «Минимишки» в Пушкино.`,
      images: getOpenGraphImages(teacher.photoUrl),
    },
  };
}

export default async function TeacherDetailRoute({ params }: TeacherDetailRouteProps) {
  const { slug } = await params;
  const teacher = await getTeacherBySlug(slug);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: teacher.fullName,
          jobTitle: teacher.position,
          description: teacher.bio ?? undefined,
          image: teacher.photoUrl ?? undefined,
          worksFor: {
            '@type': 'ChildCare',
            name: 'Детский центр «Минимишки»',
          },
        }}
      />
      <TeacherDetailPage slug={slug} />
    </>
  );
}
