import Link from 'next/link';
import type { ServiceDto } from '@minimishki/shared';

import { Button, Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';

type ServiceCardProps = {
  service: ServiceDto;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="group relative flex min-h-full flex-col overflow-hidden border-0 bg-cream-50 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <div className="relative min-h-36 overflow-hidden bg-teal-700 p-6 text-cream-50">
        <div
          aria-hidden="true"
          className="absolute -top-12 -right-8 size-36 rounded-full bg-honey-400"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-5 size-32 rounded-[42%] bg-coral-400"
        />

        <p className="relative text-xs font-black tracking-[0.14em] text-honey-400 uppercase">
          {formatAge(service)}
        </p>
        <p className="relative mt-5 text-4xl font-black tracking-[-0.07em]">
          {getMonogram(service.title)}
        </p>
      </div>

      <CardHeader>
        <h2 className="text-2xl font-black tracking-tight text-teal-700">{service.title}</h2>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <p className="text-base leading-7 text-teal-700">
          {service.summary ?? 'Подробности программы скоро появятся на странице услуги.'}
        </p>
      </CardContent>

      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/services/${service.slug}`}>Узнать больше</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function formatAge(service: ServiceDto): string {
  if (service.ageNote !== null) {
    return service.ageNote;
  }

  if (service.ageFromMonths !== null && service.ageToMonths !== null) {
    return `${formatAgeValue(service.ageFromMonths)}–${formatAgeValue(service.ageToMonths)}`;
  }

  if (service.ageFromMonths !== null) {
    return `от ${formatAgeValue(service.ageFromMonths)}`;
  }

  if (service.ageToMonths !== null) {
    return `до ${formatAgeValue(service.ageToMonths)}`;
  }

  return 'Для детей';
}

function formatAgeValue(months: number): string {
  const years = months / 12;

  if (!Number.isInteger(years)) {
    return `${years.toString().replace('.', ',')} года`;
  }

  const remainder = years % 100;
  const lastDigit = years % 10;

  if (remainder >= 11 && remainder <= 14) {
    return `${years} лет`;
  }

  if (lastDigit === 1) {
    return `${years} год`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${years} года`;
  }

  return `${years} лет`;
}

function getMonogram(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}
