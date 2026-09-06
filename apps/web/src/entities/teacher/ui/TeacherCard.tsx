import Link from 'next/link';
import type { TeacherDto } from '@minimishki/shared';

import { Button, Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';

type TeacherCardProps = {
  teacher: TeacherDto;
};

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <Card className="group flex min-h-full flex-col overflow-hidden border-0 bg-cream-50 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lifted">
      <CardHeader className="flex-row items-center gap-5">
        <div
          aria-hidden="true"
          className="flex size-18 shrink-0 items-center justify-center rounded-[1.6rem] bg-teal-700 text-2xl font-black text-cream-50 shadow-soft"
        >
          {getInitials(teacher.fullName)}
        </div>

        <div>
          <p className="text-sm font-black tracking-[0.12em] text-coral-400 uppercase">Педагог</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-teal-700">
            {teacher.fullName}
          </h2>
          <p className="mt-1 text-sm font-extrabold text-teal-700/70">{teacher.position}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <p className="text-base leading-7 text-teal-700">
          {teacher.bio ?? 'Скоро расскажем о педагоге и занятиях, которые он ведёт.'}
        </p>
      </CardContent>

      <CardFooter>
        <Button asChild variant="secondary">
          <Link href={`/teachers/${teacher.slug}`}>Познакомиться</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');
}
