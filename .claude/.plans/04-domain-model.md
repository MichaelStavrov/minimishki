# Доменная модель (`apps/api/prisma/schema.prisma`)

Готовый текст схемы для шага 12. Ниже — полный валидный файл, затем разбор решений.

---

## Полный текст `schema.prisma`

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
У `GalleryItem` его нет намеренно: фото не редактируют, только добавляют и удаляют.

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

## Seed-данные (`prisma/seed.ts`, шаг 19)

- **Администратор** — email и пароль берутся из env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`)
  с dev-значениями по умолчанию. Пароль хешируется тем же `argon2`, что и в `AuthService`.
- **2–3 направления** с разными возрастными группами, все `isPublished: true`.
- **2 педагога**, привязанные к направлениям через `connect`.
- **2 новости**, одна с парой фотографий в галерее.
- Использовать `upsert` по `slug` / `email`, чтобы повторный запуск seed
  не создавал дубликаты и не падал на уникальных полях.
