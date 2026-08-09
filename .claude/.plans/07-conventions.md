# Соглашения по коду

Чтобы код, написанный в разных сессиях, выглядел как написанный одним человеком.

---

## Backend (Nest.js)

### Именование файлов

| Файл | Шаблон | Пример |
|---|---|---|
| Модуль | `<имя>.module.ts` | `courses.module.ts` |
| Сервис | `<имя>.service.ts` | `courses.service.ts` |
| Контроллер | `<имя>.controller.ts` | `courses.controller.ts` |
| DTO | `<действие>-<сущность>.dto.ts` | `create-course.dto.ts` |
| Guard | `<имя>.guard.ts` | `jwt-auth.guard.ts` |
| Стратегия | `<имя>.strategy.ts` | `jwt.strategy.ts` |
| Декоратор | `<имя>.decorator.ts` | `current-user.decorator.ts` |

Имена папок модулей — **множественное число, kebab-case**: `courses/`, `gallery-items/`.
Имена классов — **PascalCase**: `CoursesService`, `CreateCourseDto`.

### Анатомия доменного модуля

```
courses/
├── courses.module.ts
├── courses.service.ts        # вся работа с Prisma и бизнес-логика
├── courses.controller.ts     # только HTTP: маршруты, коды, делегирование в сервис
└── dto/
    ├── create-course.dto.ts
    └── update-course.dto.ts  # extends PartialType(CreateCourseDto)
```

**Разделение обязанностей:**

- **Контроллер** не содержит логики. Его дело — принять запрос, отдать результат сервиса.
  Ни одного обращения к `PrismaService` напрямую.
- **Сервис** не знает про HTTP. Он не принимает `Request`, не устанавливает статус-коды.
  Бросает доменные исключения (`NotFoundException`, `ConflictException`) — Nest сам
  превратит их в ответы.

### DTO и валидация

- `CreateXxxDto` — все обязательные поля с декораторами `class-validator`.
- `UpdateXxxDto extends PartialType(CreateXxxDto)` — не дублировать поля вручную.
- Глобальный `ValidationPipe({ whitelist: true, transform: true })`:
  - `whitelist` — поля, которых нет в DTO, **отрезаются** от запроса.
    Защита от подмешивания лишнего (`{ role: 'ADMIN' }` в форме регистрации).
  - `transform` — приводит типы из строк запроса (`?page=2` → `number`),
    для этого в DTO нужен `@Type(() => Number)`.

### Что никогда не уходит клиенту

- **`passwordHash`** — ни в одном ответе, ни в каком виде.
  В сервисе явно указывать `select` вместо возврата всей модели:

```ts
const user = await this.prisma.user.findUnique({
  where: { id },
  select: { id: true, email: true, name: true, role: true, createdAt: true },
});
```

Это надёжнее, чем удалять поле после запроса — новое чувствительное поле в схеме
не утечёт автоматически.

### Формат ответов API

**Успешный ответ** — сам объект или массив, без обёртки:

```json
{ "id": "clx...", "title": "Развивающие занятия" }
```

**Список с пагинацией** — единая обёртка для всех коллекций:

```json
{
  "items": [],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

Параметры запроса: `?page=1&pageSize=20`. Значения по умолчанию — `page=1`, `pageSize=20`,
максимум `pageSize=100` (валидируется в DTO).

**Ошибка** — стандартный формат Nest, не изобретаем свой:

```json
{
  "statusCode": 404,
  "message": "Course not found",
  "error": "Not Found"
}
```

### Коды ответов

| Ситуация | Код |
|---|---|
| Успешное чтение | `200` |
| Успешное создание | `201` (Nest ставит сам для `@Post`) |
| Успешное удаление | `204` (`@HttpCode(204)`) |
| Не прошла валидация | `400` (ValidationPipe сам) |
| Нет токена / протух | `401` |
| Токен есть, роли не хватает | `403` |
| Сущность не найдена | `404` (`NotFoundException`) |
| Нарушено уникальное поле (`slug`) | `409` (`ConflictException`) |

### Доступ к роутам

Глобальный `JwtAuthGuard` закрывает **всё по умолчанию**. Открываем явно:

```ts
@Public()                        // публичный роут, токен не нужен
@Roles(ROLE.ADMIN)               // только администратор
@Roles(ROLE.ADMIN, ROLE.MANAGER) // администратор или менеджер
```

Типовое распределение для доменных модулей:

| Роут | Доступ |
|---|---|
| `GET /api/courses`, `GET /api/courses/:slug` | `@Public()` — витрина сайта |
| `POST/PATCH/DELETE /api/courses` | `@Roles(ADMIN)` |
| `POST /api/leads` | `@Public()` — форма заявки с сайта |
| `GET/PATCH /api/leads` | `@Roles(ADMIN, MANAGER)` |

### Именование в БД

Prisma по умолчанию использует имена моделей и полей как есть — camelCase в PostgreSQL.
**Оставляем так**: `@map` / `@@map` не используем, пока нет требования от DBA.
Единообразие «как в коде — так в базе» упрощает отладку через Prisma Studio.

---

## Frontend (Next.js)

### Структура `src/components/`

```
components/
├── ui/            # shadcn/ui — не редактируем вручную без нужды
├── layout/        # Header, Footer, Container
├── sections/      # блоки главной: Hero, CoursesPreview, TeachersPreview
└── forms/         # LeadForm и прочие формы (всегда клиентские)
```

### Server vs Client Components

**По умолчанию — серверный компонент.** `'use client'` добавляем только когда нужно:

- состояние (`useState`, `useReducer`)
- эффекты (`useEffect`)
- обработчики событий (`onClick`, `onChange`)
- браузерные API (`window`, `localStorage`)
- хуки TanStack Query

Практическое правило: `'use client'` ставится **как можно ниже по дереву**.
Страница остаётся серверной, клиентской делается только интерактивная часть —
так в бандл уезжает минимум.

### Загрузка данных

| Что | Как |
|---|---|
| Публичные страницы (направления, педагоги, новости) | `fetch` в Server Component через `src/lib/api.ts` |
| Мутации из форм | Server Actions или `useMutation` |
| Админка, интерактивные списки | TanStack Query |

### Ключи TanStack Query

Иерархические массивы, от общего к частному:

```ts
['courses']                       // весь список
['courses', { page: 1 }]          // страница списка
['courses', slug]                 // конкретный курс
['leads', { status: 'NEW' }]      // отфильтрованный список
```

Так `invalidateQueries({ queryKey: ['courses'] })` сбрасывает и список, и карточки.

### Импорты

Алиас `@/` → `src/`. Порядок импортов:

1. React / Next
2. внешние библиотеки
3. `@minimishki/shared`
4. `@/` — внутренние модули
5. относительные (`./`)
6. стили

### Типы

- Типы данных из API берём из `@minimishki/shared`, не переопределяем локально.
- Пропсы компонента — `type Props = { ... }` рядом с компонентом, экспортируем
  только если используются снаружи.

---

## Общее

### Комментарии

На русском. Комментируем **почему**, а не **что** — «что» видно из кода.

```ts
// ✅ SetNull, а не Cascade: заявка — история обращений, она должна пережить удаление курса
// ❌ устанавливаем поведение при удалении
```

### Git

Ветка `main`. Коммиты — в свободной форме на русском, но осмысленные
(`добавлен модуль заявок`, а не `фикс`). Conventional Commits не подключаем —
см. отложенное в [`01-stack.md`](./01-stack.md).
