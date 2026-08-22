# Доменная модель (`apps/api/prisma/schema.prisma`)

> ✅ **Модель услуг v2 применена 22.08.2026.** `Course` заменён на `Service`,
> миграция `20260822112243_services_v2` применена, а ограничения целостности
> проверены непосредственно в PostgreSQL. Старая схема ниже сохранена только как
> историческое описание исходной модели и не используется для нового CRUD.

## Модель услуг v2 — согласованная структура

Верхнеуровневая структура подтверждена пользователем 22.08.2026:

```text
Service
├── ServiceOfferGroup[]
│   └── ServiceOffer[]
├── ServiceSchedule[]
├── Teacher[]
├── GalleryItem[]
└── Lead[]
```

Назначение сущностей:

| Сущность | Ответственность |
|---|---|
| `Service` | Публичная страница услуги: основная информация, публикация и порядок вывода |
| `ServiceOfferGroup` | Управляемая группа предложений внутри услуги: «Абонементы», «Шоу», «Мастер-классы» |
| `ServiceOffer` | Конкретный тариф или программа: название, описание, цена, единица расчёта, длительность и возраст |
| `ServiceSchedule` | Один вариант расписания либо период действия услуги |
| `Teacher` | Необязательная many-to-many связь с услугами |
| `GalleryItem` | Фотография может принадлежать услуге, новости или общей галерее |
| `Lead` | Необязательная ссылка `serviceId`; при удалении услуги заявка сохраняется через `SetNull` |

Категории верхнего уровня пока не создаются: исходный каталог плоский. Если позже
появится реальная группировка услуг, сущность категории добавляется отдельным решением.

Точные поля и ограничения будут записаны после последовательного согласования:

1. ~~формата редактируемого содержимого~~ — согласовано;
2. ~~представления цен и единиц расчёта~~ — согласовано;
3. ~~регулярного и произвольного расписания~~ — согласовано;
4. ~~возрастных ограничений~~ — согласовано;
5. ~~поведения удаления и публикации вложенных сущностей~~ — согласовано.

Полный состав моделей и полей подтверждён 22.08.2026, перенесён в
`apps/api/prisma/schema.prisma` и проверен командой `prisma validate`. Миграция
`20260822112243_services_v2` дополнена восемью `CHECK`-ограничениями, применена и
проверена через `prisma migrate status` и системный каталог PostgreSQL. Общие enum
и DTO обновлены, `CourseDto` удалён, shared-пакет собран. Demo-seed дважды проверен
без дубликатов. Следующий шаг — CRUD `src/modules/services/`.

### Редактируемое содержимое — очищенный HTML

Решение подтверждено 22.08.2026:

- длинное содержимое `Service` и `ServiceOffer` хранится как HTML, созданный
  визуальным редактором админки;
- backend очищает HTML **до сохранения в БД** по списку разрешённых тегов и атрибутов;
- скрипты, inline-обработчики событий, опасные URL, произвольные стили и неизвестные
  элементы запрещены;
- frontend выводит только уже очищенное содержимое и оформляет его стилями приложения;
- изображения не встраиваются в HTML как `base64` или произвольные внешние URL:
  обложка и галерея управляются отдельными полями и сущностями;
- цены, расписания и возрастные ограничения не записываются внутрь HTML, потому что
  должны фильтроваться, валидироваться и редактироваться структурированно.

Так сотрудник получает привычный WYSIWYG-редактор, но админка не превращается
в конструктор сетки: расположение блоков и компоненты остаются в коде.

### Цена предложения

Решение подтверждено 22.08.2026. У `ServiceOffer` используются:

```text
priceType: FIXED | FROM | FREE | INCLUDED | ON_REQUEST
amount: Int | null
priceUnit: String | null
priceNote: String | null
```

- `amount` хранится в **копейках**, админка принимает и показывает рубли;
- `FIXED` — точная цена, `FROM` — цена «от»;
- `FREE` — бесплатно, `INCLUDED` — входит в стоимость;
- `ON_REQUEST` — цена рассчитывается индивидуально;
- для `FIXED` и `FROM` сумма обязательна и должна быть положительной;
- для остальных типов `amount` обязан быть `null`;
- `priceUnit` — свободная короткая строка: «за час», «за ребёнка»,
  «до 10 человек», «за смену»;
- `priceNote` — дополнительные условия, не участвующие в вычислениях;
- валюта первой версии фиксирована как RUB и отдельным полем не хранится.

Копейки исключают дробную арифметику и позволяют позже подключить платёжный шлюз
без миграции денежных значений.

### Расписание услуги

Решение подтверждено 22.08.2026:

```text
scheduleType: RECURRING | ON_REQUEST
daysOfWeek: DayOfWeek[]
startTime: String | null
endTime: String | null
validFrom: Date | null
validUntil: Date | null
label: String | null
sortOrder: Int
isPublished: Boolean
```

- `RECURRING` описывает регулярные занятия; список дней и обе границы времени
  обязательны;
- `ON_REQUEST` описывает «по согласованию»: дни и время отсутствуют, публичная
  формулировка хранится в `label`;
- несколько дней с одинаковым временем находятся в одной записи;
- разные интервалы времени создаются отдельными записями;
- `validFrom` и `validUntil` ограничивают сезонное расписание и сохраняются как
  PostgreSQL `date`, без времени и часового пояса;
- `startTime` и `endTime` хранят локальное повторяющееся время в формате `HH:mm`;
  использовать `DateTime` с фиктивной датой для них нельзя;
- backend проверяет `startTime < endTime`, непустые дни у `RECURRING` и отсутствие
  несовместимых полей у `ON_REQUEST`;
- разовые мероприятия остаются новостями/анонсами, отдельный тип `ONE_TIME`
  в первой версии не нужен.

Рабочий часовой пояс центра — `Europe/Moscow`; он применяется при формировании
календарных представлений, но не дублируется в каждой записи расписания.

### Возрастные ограничения

Решение подтверждено 22.08.2026. Возраст хранится в полных месяцах, чтобы без
дробных чисел описывать «1,5 года» и «1 год 8 месяцев».

```text
Service:
ageFromMonths: Int | null
ageToMonths: Int | null
ageNote: String | null

ServiceOffer:
ageMode: INHERIT | CUSTOM | NONE
ageFromMonths: Int | null
ageToMonths: Int | null
ageNote: String | null
```

- админка принимает годы и месяцы отдельными полями и преобразует их в общее
  количество месяцев;
- frontend формирует человекочитаемую русскую строку;
- `INHERIT` использует диапазон основной услуги;
- `CUSTOM` задаёт собственный диапазон предложения;
- `NONE` явно снимает возрастное ограничение;
- `ageNote` добавляет пояснение, но не заменяет структурированные границы;
- допустимый диапазон — 0–1440 месяцев;
- для `CUSTOM` обязательна хотя бы одна граница;
- нижняя граница не может превышать верхнюю;
- при `INHERIT` и `NONE` собственные границы предложения обязаны быть `null`.

### Публикация, архивирование и удаление

Решение подтверждено 22.08.2026.

`Service` содержит `isPublished` и nullable `archivedAt`:

- неопубликованная услуга — черновик или временно скрытая запись;
- архивная услуга исключается из публичной части и активных списков админки,
  но сохраняет содержимое, связи и заявки;
- архивирование одновременно снимает публикацию;
- восстановленная услуга остаётся черновиком до отдельной публикации;
- уникальный `slug` остаётся занятым в архиве;
- обычный `DELETE /services/:id` выполняет архивирование;
- безвозвратное удаление `Service` в API первой версии отсутствует;
- `Lead.serviceId` сохраняется при архивировании; для возможного физического
  удаления на уровне обслуживания БД остаётся `onDelete: SetNull`.

`ServiceOfferGroup`, `ServiceOffer` и `ServiceSchedule` имеют собственный
`isPublished`. Публичная вложенная запись видна только при публикации всей цепочки
родителей и отсутствии архива у услуги.

Вложенные записи не имеют самостоятельных внешних URL и не используются заявками,
поэтому могут удаляться физически. При физическом удалении родителя для них
применяется `Cascade`.

Удаление записи изображения и удаление файла из хранилища — разные операции.
Физический файл нельзя удалять каскадно без проверки других ссылок и явного
подтверждения пользователя.

### Подтверждённый состав полей

```text
Service
├── id
├── slug
├── title
├── summary
├── contentHtml
├── ageFromMonths
├── ageToMonths
├── ageNote
├── coverUrl
├── seoTitle
├── seoDescription
├── isPublished
├── archivedAt
├── sortOrder
├── createdAt
├── updatedAt
├── offerGroups: ServiceOfferGroup[]
├── schedules: ServiceSchedule[]
├── teachers: Teacher[]
├── gallery: GalleryItem[]
└── leads: Lead[]

ServiceOfferGroup
├── id
├── serviceId
├── title
├── descriptionHtml
├── isPublished
├── sortOrder
├── createdAt
├── updatedAt
└── offers: ServiceOffer[]

ServiceOffer
├── id
├── groupId
├── title
├── descriptionHtml
├── imageUrl
├── priceType
├── amount
├── priceUnit
├── priceNote
├── durationMinutes
├── ageMode
├── ageFromMonths
├── ageToMonths
├── ageNote
├── isPublished
├── sortOrder
├── createdAt
└── updatedAt

ServiceSchedule
├── id
├── serviceId
├── scheduleType
├── daysOfWeek
├── startTime
├── endTime
├── validFrom
├── validUntil
├── label
├── isPublished
├── sortOrder
├── createdAt
└── updatedAt
```

Дополнительные изменения:

- `Teacher.courses` заменяется на `Teacher.services`;
- `Lead.courseId` и `Lead.course` заменяются на `serviceId` и `service`;
- `GalleryItem` получает `serviceId`, `service`, `caption`, `isPublished` и
  `updatedAt`: подпись и публикация редактируются через админку, поэтому время
  последнего изменения должно сохраняться;
- `GalleryItem` может принадлежать новости, услуге либо общей галерее, но не новости
  и услуге одновременно; правило обеспечивается в API и `CHECK`-ограничением SQL;
- добавляются enum `PriceType`, `ScheduleType`, `DayOfWeek`, `AgeMode`;
- `DayOfWeek` использует английские значения `MONDAY`–`SUNDAY` в ISO-порядке;
- `GalleryItem.service` использует `onDelete: Cascade`: удаляется строка метаданных,
  но не физический файл в хранилище;
- `summary`, `coverUrl`, SEO-поля и уточняющие тексты допускают `null`;
- `contentHtml` проходит серверную очистку до записи;
- `durationMinutes`, денежные суммы и возрастные границы валидируются как
  положительные целые значения в соответствующих режимах.

---

## Историческая модель v1 — не использовать

Ниже сохранено описание исходной модели `Course` до аудита действующего сайта.
Оно нужно только для истории принятых решений. **Копировать этот код в
`apps/api/prisma/schema.prisma` нельзя**: актуальный источник истины — сам файл схемы
и раздел «Модель услуг v2» выше.

---

### Исторический полный текст `schema.prisma` с `Course`

```prisma
// Клиент Prisma — генерируется в node_modules/@prisma/client
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// Перечисления
// ============================================================

enum Role {
  ADMIN   // полный доступ
  MANAGER // работа с заявками и контентом
  USER    // обычный пользователь
}

enum LeadStatus {
  NEW         // новая заявка
  IN_PROGRESS // менеджер связался
  CONFIRMED   // записан на занятие
  REJECTED    // отказ
}

// ============================================================
// Пользователи
// ============================================================

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String // хеш argon2, никогда не отдаётся клиенту
  name         String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([role])
}

// ============================================================
// Контент сайта
// ============================================================

/// Направление / программа детского центра
model Course {
  id          String   @id @default(cuid())
  slug        String   @unique // ЧПУ: /courses/razvivayushchie-zanyatiya
  title       String
  description String
  ageFrom     Int // возраст от, лет
  ageTo       Int // возраст до, лет
  price       Int // рубли, целое число
  imageUrl    String?
  isPublished Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  teachers Teacher[] // неявная many-to-many
  leads    Lead[] // обратная сторона Lead.course

  @@index([isPublished, sortOrder])
}

/// Педагог центра
model Teacher {
  id          String   @id @default(cuid())
  slug        String   @unique
  fullName    String
  position    String // «педагог-психолог»
  bio         String?
  photoUrl    String?
  isPublished Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  courses Course[] // обратная сторона Course.teachers

  @@index([isPublished, sortOrder])
}

/// Новость центра
model Post {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String? // краткий анонс для карточки в списке
  content     String
  coverUrl    String?
  isPublished Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  gallery GalleryItem[] // фото к новости

  @@index([isPublished, publishedAt])
}

/// Фотография: либо привязана к новости, либо лежит в общей галерее
model GalleryItem {
  id        String   @id @default(cuid())
  url       String
  alt       String? // alt-текст: SEO и доступность
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  postId String?
  post   Post?   @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, sortOrder])
}

// ============================================================
// Заявки
// ============================================================

/// Заявка на пробное занятие с формы на сайте
model Lead {
  id        String     @id @default(cuid())
  name      String // имя родителя
  phone     String
  childName String?
  childAge  Int?
  comment   String?
  status    LeadStatus @default(NEW)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  courseId String?
  course   Course? @relation(fields: [courseId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@index([courseId])
}
```

---

## Разбор решений

### Идентификаторы: `cuid()`, а не автоинкремент

Автоинкремент раскрывает количество записей в БД (`/courses/1` → понятно, что курс первый)
и мешает сливать данные из разных источников. `cuid()` — collision-resistant unique id,
генерируется на стороне Prisma, сортируется по времени создания.

### Связи и обратные поля

В Prisma **каждая связь описывается с двух сторон**. Если объявить только `Lead.course`,
но забыть `Course.leads` — `prisma validate` упадёт с ошибкой
«The relation field `course` on model `Lead` is missing an opposite relation field».

Связи в схеме:

| Связь | Тип | Стороны |
|---|---|---|
| `Course` ↔ `Teacher` | many-to-many (неявная) | `Course.teachers` / `Teacher.courses` |
| `Post` → `GalleryItem` | one-to-many | `Post.gallery` / `GalleryItem.post` + `postId` |
| `Course` → `Lead` | one-to-many, опциональная | `Course.leads` / `Lead.course` + `courseId` |

### Поведение при удалении (`onDelete`)

| Связь | Правило | Почему |
|---|---|---|
| `GalleryItem.post` | `Cascade` | Удалили новость — её фотографии не нужны |
| `Lead.course` | `SetNull` | Удалили направление — **заявка должна остаться**, это история обращений. Поле просто обнулится |

### Неявная many-to-many `Course` ↔ `Teacher`

Prisma сама создаст служебную таблицу `_CourseToTeacher` с двумя колонками.
Писать её в схеме не нужно, работать с ней — через `connect` / `disconnect`.

> ⚠️ **Ограничение.** В неявную связь **нельзя добавить поля**.
> Если позже понадобится, например, «основной педагог курса» или порядок педагогов
> внутри курса — придётся мигрировать на явную связующую модель:
>
> ```prisma
> model CourseTeacher {
>   courseId  String
>   teacherId String
>   isPrimary Boolean @default(false)
>   course    Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
>   teacher   Teacher @relation(fields: [teacherId], references: [id], onDelete: Cascade)
>   @@id([courseId, teacherId])
> }
> ```
>
> Это миграция с переносом данных, не бесплатная. Пока полей в связи не предвидится —
> начинаем с неявной.

### Индексы

Индексы стоят под **реальные запросы сайта**, а не «на всякий случай»:

| Индекс | Какой запрос обслуживает |
|---|---|
| `Course @@index([isPublished, sortOrder])` | Список направлений на публичной странице: фильтр по опубликованным + сортировка |
| `Teacher @@index([isPublished, sortOrder])` | То же для педагогов |
| `Post @@index([isPublished, publishedAt])` | Лента новостей: опубликованные, свежие сверху |
| `GalleryItem @@index([postId, sortOrder])` | Фотографии конкретной новости в заданном порядке |
| `Lead @@index([status, createdAt])` | Админка: новые заявки сверху, фильтр по статусу |
| `Lead @@index([courseId])` | Заявки по конкретному направлению |
| `User @@index([role])` | Список администраторов/менеджеров |

Поля с `@unique` (`slug`, `email`) индексируются автоматически — отдельный `@@index` не нужен.

### `isPublished` вместо удаления

Контент центра редактируют неспециалисты. Снятие с публикации безопаснее удаления:
случайный клик не уничтожает данные, откат — один переключатель.

### `sortOrder`

Порядок вывода направлений и педагогов задаётся вручную из админки,
а не только по дате создания — на сайте важна витрина, а не хронология.

### Обязательные `updatedAt`

Есть у всех моделей, которые редактируются, включая `Lead` — статус заявки меняется
по ходу обработки, и знать время последнего изменения нужно.
В исторической модели у `GalleryItem` не было `updatedAt`, потому что фото только
добавлялись и удалялись. В модели услуг v2 появились редактируемые `caption` и
`isPublished`, поэтому актуальная модель хранит время последнего изменения.

---

## Соотношение с `packages/shared`

**Решение:** `packages/shared` **не зависит** от `@prisma/client`.

Если бы shared реэкспортировал Prisma-типы, эту зависимость потянул бы и frontend —
тяжёлый пакет с движком БД в клиентском бандле.

Поэтому в `packages/shared/src/enums.ts` лежат собственные определения:

```ts
export const ROLE = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const LEAD_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
```

**Как ловится рассинхрон.** На бэкенде, где доступны оба типа, ставится проверка
времени компиляции — если в `schema.prisma` добавят роль, а в shared забудут,
`pnpm typecheck` упадёт:

```ts
// apps/api/src/common/enum-parity.ts
import type { Role as PrismaRole } from '@prisma/client';
import type { Role as SharedRole } from '@minimishki/shared';

// Обе строки не дают коду собраться при расхождении наборов значений
const _roleParityForward: PrismaRole = null as unknown as SharedRole;
const _roleParityBackward: SharedRole = null as unknown as PrismaRole;
```

Frontend при этом импортирует только `@minimishki/shared` и ничего не знает о Prisma.

---

### Исторические требования к seed шага 19

- **Администратор** — email и пароль берутся из env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`)
  с dev-значениями по умолчанию. Пароль хешируется тем же `argon2`, что и в `AuthService`.
- **2–3 направления** с разными возрастными группами, все `isPublished: true`.
- **2 педагога**, привязанные к направлениям через `connect`.
- **2 новости**, одна с парой фотографий в галерее.
- Использовать `upsert` по `slug` / `email`, чтобы повторный запуск seed
  не создавал дубликаты и не падал на уникальных полях.
