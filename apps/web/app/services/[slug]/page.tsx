import { ServiceDetailPage } from '@/_pages/service-detail/index.server';

type ServiceDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ServiceDetailRoute({ params }: ServiceDetailRouteProps) {
  const { slug } = await params;

  return <ServiceDetailPage slug={slug} />;
}
