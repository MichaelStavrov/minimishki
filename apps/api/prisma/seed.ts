import { AgeMode, DayOfWeek, PriceType, PrismaClient, Role, ScheduleType } from '@prisma/client';
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

async function seedServices(): Promise<Map<string, string>> {
  const services = [
    {
      slug: 'rannee-razvitie',
      title: 'Раннее развитие',
      summary: 'Игровые занятия для развития речи, внимания, памяти и мелкой моторики.',
      contentHtml:
        '<p>На занятиях дети знакомятся с окружающим миром, развивают речь, внимание, память и мелкую моторику через игру.</p>',
      ageFromMonths: 18,
      ageToMonths: 48,
      ageNote: null,
      coverUrl: '/images/demo/services/rannee-razvitie.jpg',
      seoTitle: 'Раннее развитие детей',
      seoDescription: 'Игровые развивающие занятия для детей от полутора до четырёх лет.',
      isPublished: true,
      archivedAt: null,
      sortOrder: 10,
      offerGroups: [
        {
          title: 'Варианты занятий',
          descriptionHtml: null,
          isPublished: true,
          sortOrder: 10,
          offers: {
            create: [
              {
                title: 'Разовое занятие',
                descriptionHtml: null,
                imageUrl: null,
                priceType: PriceType.FIXED,
                amount: 120_000,
                priceUnit: 'за занятие',
                priceNote: null,
                durationMinutes: 60,
                ageMode: AgeMode.INHERIT,
                ageFromMonths: null,
                ageToMonths: null,
                ageNote: null,
                isPublished: true,
                sortOrder: 10,
              },
              {
                title: 'Абонемент на четыре занятия',
                descriptionHtml:
                  '<p>Подходит для регулярного посещения занятий в течение месяца.</p>',
                imageUrl: null,
                priceType: PriceType.FROM,
                amount: 400_000,
                priceUnit: 'за абонемент',
                priceNote: 'Итоговая стоимость зависит от выбранной группы.',
                durationMinutes: 60,
                ageMode: AgeMode.INHERIT,
                ageFromMonths: null,
                ageToMonths: null,
                ageNote: null,
                isPublished: true,
                sortOrder: 20,
              },
            ],
          },
        },
      ],
      schedules: [
        {
          scheduleType: ScheduleType.RECURRING,
          daysOfWeek: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
          startTime: '10:00',
          endTime: '11:00',
          validFrom: null,
          validUntil: null,
          label: null,
          isPublished: true,
          sortOrder: 10,
        },
      ],
      gallery: [
        {
          url: '/images/demo/gallery/rannee-razvitie-1.jpg',
          alt: 'Дети занимаются в группе раннего развития',
          caption: 'Игровое занятие в группе раннего развития',
          isPublished: true,
          sortOrder: 10,
        },
      ],
    },
    {
      slug: 'podgotovka-k-shkole',
      title: 'Подготовка к школе',
      summary: 'Знакомство с чтением, письмом и математикой через игровые задания.',
      contentHtml:
        '<p>Программа помогает ребёнку подготовиться к школьной нагрузке, развить самостоятельность и интерес к обучению.</p>',
      ageFromMonths: 60,
      ageToMonths: 84,
      ageNote: null,
      coverUrl: '/images/demo/services/podgotovka-k-shkole.jpg',
      seoTitle: 'Подготовка к школе',
      seoDescription: 'Занятия по подготовке к школе для детей от пяти до семи лет.',
      isPublished: true,
      archivedAt: null,
      sortOrder: 20,
      offerGroups: [
        {
          title: 'Занятия',
          descriptionHtml: null,
          isPublished: true,
          sortOrder: 10,
          offers: {
            create: [
              {
                title: 'Разовое занятие',
                descriptionHtml: null,
                imageUrl: null,
                priceType: PriceType.FIXED,
                amount: 150_000,
                priceUnit: 'за занятие',
                priceNote: null,
                durationMinutes: 60,
                ageMode: AgeMode.INHERIT,
                ageFromMonths: null,
                ageToMonths: null,
                ageNote: null,
                isPublished: true,
                sortOrder: 10,
              },
            ],
          },
        },
      ],
      schedules: [
        {
          scheduleType: ScheduleType.RECURRING,
          daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
          startTime: '17:00',
          endTime: '18:00',
          validFrom: null,
          validUntil: null,
          label: null,
          isPublished: true,
          sortOrder: 10,
        },
      ],
      gallery: [],
    },
    {
      slug: 'tvorcheskaya-masterskaya',
      title: 'Творческая мастерская',
      summary: 'Рисование, лепка и работа с разными материалами.',
      contentHtml:
        '<p>На творческих занятиях дети пробуют разные материалы и техники, развивают воображение и учатся выражать собственные идеи.</p>',
      ageFromMonths: 48,
      ageToMonths: 120,
      ageNote: null,
      coverUrl: '/images/demo/services/tvorcheskaya-masterskaya.jpg',
      seoTitle: 'Творческая мастерская для детей',
      seoDescription: 'Творческие занятия для детей от четырёх до десяти лет.',
      isPublished: true,
      archivedAt: null,
      sortOrder: 30,
      offerGroups: [
        {
          title: 'Мастер-классы',
          descriptionHtml: '<p>Темы и материалы мастер-классов регулярно обновляются.</p>',
          isPublished: true,
          sortOrder: 10,
          offers: {
            create: [
              {
                title: 'Тематический мастер-класс',
                descriptionHtml: null,
                imageUrl: null,
                priceType: PriceType.ON_REQUEST,
                amount: null,
                priceUnit: 'за участника',
                priceNote: 'Стоимость зависит от темы и используемых материалов.',
                durationMinutes: 90,
                ageMode: AgeMode.CUSTOM,
                ageFromMonths: 72,
                ageToMonths: 144,
                ageNote: 'Сложность программы адаптируется под возраст группы.',
                isPublished: true,
                sortOrder: 10,
              },
            ],
          },
        },
      ],
      schedules: [
        {
          scheduleType: ScheduleType.ON_REQUEST,
          daysOfWeek: [],
          startTime: null,
          endTime: null,
          validFrom: null,
          validUntil: null,
          label: 'Дата и время мастер-класса согласовываются с группой',
          isPublished: true,
          sortOrder: 10,
        },
      ],
      gallery: [],
    },
  ];

  const serviceIds = new Map<string, string>();

  for (const { offerGroups, schedules, gallery, ...service } of services) {
    const savedService = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        ...service,
        offerGroups: {
          deleteMany: {},
          create: offerGroups,
        },
        schedules: {
          deleteMany: {},
          create: schedules,
        },
        gallery: {
          deleteMany: {},
          create: gallery,
        },
      },
      create: {
        ...service,
        offerGroups: {
          create: offerGroups,
        },
        schedules: {
          create: schedules,
        },
        gallery: {
          create: gallery,
        },
      },
    });

    serviceIds.set(savedService.slug, savedService.id);
  }

  console.log(`Услуги созданы или обновлены: ${services.length}`);

  return serviceIds;
}

function getServiceId(serviceIds: ReadonlyMap<string, string>, slug: string): string {
  const serviceId = serviceIds.get(slug);

  if (serviceId === undefined) {
    throw new Error(`Seed не нашёл услугу со slug "${slug}"`);
  }

  return serviceId;
}

async function seedTeachers(serviceIds: ReadonlyMap<string, string>): Promise<void> {
  const teachers = [
    {
      slug: 'elena-sokolova',
      fullName: 'Елена Андреевна Соколова',
      position: 'Педагог-психолог',
      bio: 'Помогает детям развивать уверенность, внимание и навыки общения через игру.',
      photoUrl: '/images/demo/teachers/elena-sokolova.jpg',
      isPublished: true,
      archivedAt: null,
      sortOrder: 10,
      serviceSlugs: ['rannee-razvitie', 'podgotovka-k-shkole'],
    },
    {
      slug: 'maria-lebedeva',
      fullName: 'Мария Игоревна Лебедева',
      position: 'Педагог дополнительного образования',
      bio: 'Проводит творческие занятия и помогает детям свободно выражать свои идеи.',
      photoUrl: '/images/demo/teachers/maria-lebedeva.jpg',
      isPublished: true,
      archivedAt: null,
      sortOrder: 20,
      serviceSlugs: ['rannee-razvitie', 'tvorcheskaya-masterskaya'],
    },
  ];

  for (const { serviceSlugs, ...teacher } of teachers) {
    const connectedServices = serviceSlugs.map((slug) => ({
      id: getServiceId(serviceIds, slug),
    }));

    await prisma.teacher.upsert({
      where: { slug: teacher.slug },
      update: {
        ...teacher,
        services: {
          set: connectedServices,
        },
      },
      create: {
        ...teacher,
        services: {
          connect: connectedServices,
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
      contentHtml:
        '<p>Мы открыли запись в группы раннего развития, подготовки к школе и творческой мастерской. Познакомиться с педагогами и подобрать подходящую услугу можно на пробном занятии.</p>',
      coverUrl: '/images/demo/posts/zapis-na-uchebnyy-god.jpg',
      isPublished: true,
      publishedAt: new Date('2026-08-01T09:00:00.000Z'),
      gallery: [],
    },
    {
      slug: 'den-otkrytyh-dverey',
      title: 'Как прошёл день открытых дверей',
      excerpt: 'Дети познакомились с педагогами и попробовали занятия разных направлений.',
      contentHtml:
        '<p>На дне открытых дверей гости участвовали в творческих мастер-классах, играх на развитие внимания и занятиях по подготовке к школе. Благодарим семьи, которые провели этот день вместе с нами.</p>',
      coverUrl: '/images/demo/posts/den-otkrytyh-dverey-cover.jpg',
      isPublished: true,
      publishedAt: new Date('2026-08-10T09:00:00.000Z'),
      gallery: [
        {
          url: '/images/demo/gallery/den-otkrytyh-dverey-1.jpg',
          alt: 'Дети рисуют на творческом мастер-классе',
          caption: 'Творческий мастер-класс на дне открытых дверей',
          isPublished: true,
          sortOrder: 10,
        },
        {
          url: '/images/demo/gallery/den-otkrytyh-dverey-2.jpg',
          alt: 'Педагог проводит развивающее занятие',
          caption: 'Знакомство с развивающими занятиями',
          isPublished: true,
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
  const serviceIds = await seedServices();
  await seedTeachers(serviceIds);
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
