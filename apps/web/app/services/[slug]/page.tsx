import type { Metadata } from 'next';

import { ServiceDetailPage } from '@/_pages/service-detail/index.server';

import { getServiceBySlug } from '@/entities/service/index.server';

import { getOpenGraphImages } from '@/shared/lib/get-open-graph-images';
import { JsonLd } from '@/shared/ui';

type ServiceDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ServiceDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  return {
    title: service.seoTitle ?? service.title,
    description: service.seoDescription ?? service.summary ?? undefined,
    openGraph: {
      title: service.seoTitle ?? service.title,
      description: service.seoDescription ?? service.summary ?? undefined,
      images: getOpenGraphImages(service.coverUrl),
    },
  };
}

export default async function ServiceDetailRoute({ params }: ServiceDetailRouteProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.seoDescription ?? service.summary ?? undefined,
          image: service.coverUrl ?? undefined,
          provider: {
            '@type': 'ChildCare',
            name: 'Детский центр «Минимишки»',
          },
        }}
      />
      <ServiceDetailPage slug={slug} />
    </>
  );
}
