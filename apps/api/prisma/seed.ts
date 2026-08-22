import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { z } from 'zod';

const prisma = new PrismaClient();

const DEV_ADMIN_EMAIL = 'admin@minimishki.ru';
const DEV_ADMIN_PASSWORD = 'minimishki-dev-admin';

/**
 * Seed запускается отдельным процессом и не использует Nest ConfigModule,
 * поэтому проверяет только собственные переменные окружения.
 *
 * В development и test разрешены dev-значения по умолчанию. Production-запуск
 * запрещён целиком: этот файл содержит вымышленные данные и не является способом
 * первоначального создания администратора в рабочем окружении.
 */
const seedEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    SEED_ADMIN_EMAIL: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email('SEED_ADMIN_EMAIL: ожидается корректный email'))
      .optional(),

    SEED_ADMIN_PASSWORD: z
      .string()
      .min(8, 'SEED_ADMIN_PASSWORD: пароль короче 8 символов')
      .max(128, 'SEED_ADMIN_PASSWORD: пароль длиннее 128 символов')
      .optional(),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === 'production') {
      context.addIssue({
        code: 'custom',
        path: ['NODE_ENV'],
        message: 'Demo-seed запрещён в production; используйте отдельный production-bootstrap',
      });
    }
  })
  .transform((env) => ({
    email: env.SEED_ADMIN_EMAIL ?? DEV_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD ?? DEV_ADMIN_PASSWORD,
  }));

function getAdminCredentials(): { email: string; password: string } {
  const result = seedEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Некорректные переменные окружения для seed:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

async function seedAdmin(): Promise<void> {
  const credentials = getAdminCredentials();
  const passwordHash = await argon2.hash(credentials.password);

  await prisma.user.upsert({
    where: { email: credentials.email },
    update: {
      passwordHash,
      name: 'Администратор',
      role: Role.ADMIN,
    },
    create: {
      email: credentials.email,
      passwordHash,
      name: 'Администратор',
      role: Role.ADMIN,
    },
  });

  console.log(`Администратор создан или обновлён: ${credentials.email}`);
}

async function seedCourses(): Promise<Map<string, string>> {
  const courses = [
    {
      slug: 'rannee-razvitie',
      title: 'Раннее развитие',
      description: 'Игровые занятия для развития речи, внимания, памяти и мелкой моторики.',
      ageFrom: 2,
      ageTo: 4,
      price: 1200,
      imageUrl: '/images/demo/courses/rannee-razvitie.jpg',
      isPublished: true,
      sortOrder: 10,
    },
    {
      slug: 'podgotovka-k-shkole',
      title: 'Подготовка к школе',
      description:
        'Знакомство с чтением, письмом и математикой через понятные ребёнку игровые задания.',
      ageFrom: 5,
      ageTo: 7,
      price: 1500,
      imageUrl: '/images/demo/courses/podgotovka-k-shkole.jpg',
      isPublished: true,
      sortOrder: 20,
    },
    {
      slug: 'tvorcheskaya-masterskaya',
      title: 'Творческая мастерская',
      description: 'Рисование, лепка и работа с разными материалами для развития воображения.',
      ageFrom: 4,
      ageTo: 10,
      price: 1000,
      imageUrl: '/images/demo/courses/tvorcheskaya-masterskaya.jpg',
      isPublished: true,
      sortOrder: 30,
    },
  ];

  const courseIds = new Map<string, string>();

  for (const course of courses) {
    const savedCourse = await prisma.course.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });

    courseIds.set(savedCourse.slug, savedCourse.id);
  }

  console.log(`Направления созданы или обновлены: ${courses.length}`);

  return courseIds;
}

function getCourseId(courseIds: ReadonlyMap<string, string>, slug: string): string {
  const courseId = courseIds.get(slug);

  if (courseId === undefined) {
    throw new Error(`Seed не нашёл направление со slug "${slug}"`);
  }

  return courseId;
}

async function seedTeachers(courseIds: ReadonlyMap<string, string>): Promise<void> {
  const teachers = [
    {
      slug: 'elena-sokolova',
      fullName: 'Елена Андреевна Соколова',
      position: 'Педагог-психолог',
      bio: 'Помогает детям развивать уверенность, внимание и навыки общения через игру.',
      photoUrl: '/images/demo/teachers/elena-sokolova.jpg',
      isPublished: true,
      sortOrder: 10,
      courseSlugs: ['rannee-razvitie', 'podgotovka-k-shkole'],
    },
    {
      slug: 'maria-lebedeva',
      fullName: 'Мария Игоревна Лебедева',
      position: 'Педагог дополнительного образования',
      bio: 'Проводит творческие занятия и помогает детям свободно выражать свои идеи.',
      photoUrl: '/images/demo/teachers/maria-lebedeva.jpg',
      isPublished: true,
      sortOrder: 20,
      courseSlugs: ['rannee-razvitie', 'tvorcheskaya-masterskaya'],
    },
  ];

  for (const { courseSlugs, ...teacher } of teachers) {
    const connectedCourses = courseSlugs.map((slug) => ({
      id: getCourseId(courseIds, slug),
    }));

    await prisma.teacher.upsert({
      where: { slug: teacher.slug },
      update: {
        ...teacher,
        courses: {
          set: connectedCourses,
        },
      },
      create: {
        ...teacher,
        courses: {
          connect: connectedCourses,
        },
      },
    });
  }

  console.log(`Педагоги созданы или обновлены: ${teachers.length}`);
}

async function seedPosts(): Promise<void> {
  const posts = [
    {
      slug: 'otkryta-zapis-na-novyy-uchebnyy-god',
      title: 'Открыта запись на новый учебный год',
      excerpt: 'Приглашаем детей на развивающие и творческие занятия.',
      content:
        'Мы открыли запись в группы раннего развития, подготовки к школе и творческой мастерской. Познакомиться с педагогами и подобрать подходящее направление можно на пробном занятии.',
      coverUrl: '/images/demo/posts/zapis-na-uchebnyy-god.jpg',
      isPublished: true,
      publishedAt: new Date('2026-08-01T09:00:00.000Z'),
      gallery: [],
    },
    {
      slug: 'den-otkrytyh-dverey',
      title: 'Как прошёл день открытых дверей',
      excerpt: 'Дети познакомились с педагогами и попробовали занятия разных направлений.',
      content:
        'На дне открытых дверей гости участвовали в творческих мастер-классах, играх на развитие внимания и занятиях по подготовке к школе. Благодарим семьи, которые провели этот день вместе с нами.',
      coverUrl: '/images/demo/posts/den-otkrytyh-dverey-cover.jpg',
      isPublished: true,
      publishedAt: new Date('2026-08-10T09:00:00.000Z'),
      gallery: [
        {
          url: '/images/demo/gallery/den-otkrytyh-dverey-1.jpg',
          alt: 'Дети рисуют на творческом мастер-классе',
          sortOrder: 10,
        },
        {
          url: '/images/demo/gallery/den-otkrytyh-dverey-2.jpg',
          alt: 'Педагог проводит развивающее занятие',
          sortOrder: 20,
        },
      ],
    },
  ];

  for (const { gallery, ...post } of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        gallery: {
          deleteMany: {},
          create: gallery,
        },
      },
      create: {
        ...post,
        gallery: {
          create: gallery,
        },
      },
    });
  }

  console.log(`Новости созданы или обновлены: ${posts.length}`);
}

async function main(): Promise<void> {
  console.log('Запуск seed...');

  await seedAdmin();
  const courseIds = await seedCourses();
  await seedTeachers(courseIds);
  await seedPosts();

  console.log('Seed завершён успешно');
}

void main()
  .catch((error: unknown) => {
    console.error('Seed завершился с ошибкой');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
