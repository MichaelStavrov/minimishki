# Пошаговый план реализации

33 шага (29 основных + 4 контрольные точки), сгруппированных в 8 этапов.
Каждый пункт = **один шаг выдачи кода**. Пользователь вставляет код, подтверждает, идём дальше
(см. [`00-process.md`](./00-process.md)).

Актуальный прогресс — в [`06-progress.md`](./06-progress.md).

> 🔧 **Контрольные точки** (`КТ-1`…`КТ-4`) — это команды, которые выполняет пользователь,
> а не код для вставки. Пропускать их нельзя: без них следующие шаги пишутся вслепую
> (нет типов, IDE в ошибках, проверить нечего).

---

## Этап A. Каркас монорепозитория

> DevOps — **подробные** пояснения.

### Шаг 1. Гигиена репозитория
`.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc`

**Проверить:** `git status` показывает 4 новых файла; `.gitignore` содержит `!.env.example`.

### Шаг 2. Корневой `package.json`
- `private: true`, `packageManager: "pnpm@10.x"` (**точная версия**, без `^`),
  `engines.node: ">=22"`
- Скрипты через `turbo run`: `dev`, `build`, `lint`, `format`, `typecheck`
- Скрипты БД через `--filter`: `db:migrate`, `db:generate`, `db:studio`, `db:seed`

Объяснить: зачем `private`, что делает `--filter`, почему БД-скрипты проксируются в `apps/api`.

**Проверить:** `pnpm --version` совпадает с указанной в `packageManager`.

### Шаг 3. `pnpm-workspace.yaml`
Пакеты `apps/*`, `packages/*`.

Объяснить: что такое workspace, как работает протокол `workspace:*`,
почему pnpm делает симлинки вместо копий.

### Шаг 4. `turbo.json`
> ⚠️ **Turborepo 2.x** — корневой ключ **`tasks`**. Ключ `pipeline` устарел с v2,
> конфиг с ним не запустится.

- `build` — `dependsOn: ["^build"]`, outputs `.next/**`, `dist/**`
- `dev` — `cache: false`, `persistent: true`
- `lint`, `typecheck`
- `globalEnv`: `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `JWT_SECRET`

Объяснить: механика кеширования задач, что означает `^` в `dependsOn`,
зачем `globalEnv` (изменение переменной инвалидирует кеш).

### Шаг 5. Prettier
`.prettierrc`, `.prettierignore`

---

## Этап B. Общие пакеты

### Шаг 6. `packages/tsconfig`
`base.json`, `nextjs.json`, `nestjs.json` + `package.json`.

Объяснить: почему конфиги вынесены в отдельный пакет, как работает `extends`
на пакет из node_modules.

### Шаг 7. `packages/eslint-config`
`base.js`, `next.js`, `nest.js` + `package.json` (flat config).

### Шаг 8. `packages/shared`
`package.json`, `tsconfig.json`, `src/index.ts`, `src/enums.ts`, `src/dto/`.

> ⚠️ **Без зависимости от `@prisma/client`.** `Role` и `LeadStatus` — собственные
> `as const`-объекты, чтобы frontend не тянул Prisma в бандл.
> Подробности — в [`04-domain-model.md`](./04-domain-model.md#соотношение-с-packagesshared).

### 🔧 КТ-1. Первая установка зависимостей

```bash
cd /d/programming/minimishki
pnpm install
```

**Ожидаем:** установка проходит без ошибок; в `apps/`/`packages/` появились симлинки
на локальные пакеты; создан `pnpm-lock.yaml`.

**Зачем сейчас:** дальше пишется backend-код, которому нужны установленные типы Nest и Prisma.

---

## Этап C. Инфраструктура

> DevOps — **подробные** пояснения.

### Шаг 9. `docker-compose.yml`
- `postgres:16-alpine` — порт 5432, `POSTGRES_DB=minimishki`, именованный volume, `healthcheck`
- `dpage/pgadmin4` — порт 5050, профиль `tools`

Объяснить: что такое сервис, image, volume (и почему именованный, а не bind-mount),
healthcheck и зачем он нужен, что даёт профиль (сервис не поднимается по умолчанию).

**Проверить:**
```bash
docker compose up -d postgres
docker compose ps
```
Контейнер в состоянии `healthy`.

### Шаг 10. `.env.example`
Для `apps/api` и `apps/web`.

Объяснить: разницу между серверными переменными и `NEXT_PUBLIC_*`,
почему `.env` в `.gitignore`, а `.env.example` — нет.

**После вставки** создать реальные файлы:
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```
> Для web — именно **`.env.local`**, это конвенция Next.js.

---

## Этап D. Backend — база

> Backend — **подробные** пояснения.

### Шаг 11. Конфиги `apps/api`
`package.json` + `tsconfig.json` + `nest-cli.json` + `eslint.config.mjs`.

Объяснить: структуру Nest-приложения, роль каждого конфига, что делает `nest-cli.json`,
зачем Nest нужны `emitDecoratorMetadata` и `experimentalDecorators`.

**После вставки:** `pnpm install` (появились новые зависимости).

### Шаг 12. `prisma/schema.prisma`
Доменная модель — готовый текст в [`04-domain-model.md`](./04-domain-model.md).

Объяснить: что такое ORM, как Prisma генерирует клиент из схемы,
что такое миграции и чем `migrate dev` отличается от `db push`.

### 🔧 КТ-2. Генерация Prisma-клиента и первая миграция

```bash
pnpm db:generate          # генерирует типизированный клиент в node_modules
pnpm db:migrate           # создаёт и применяет первую миграцию
```

**Ожидаем:** появилась папка `apps/api/prisma/migrations/<timestamp>_init/`;
в БД созданы таблицы.

**Зачем сейчас:** без сгенерированного клиента шаги 13–20 не типизируются —
импорт `PrismaClient` и модели `User`, `Course` и т.д. не будут существовать,
IDE покажет ошибки на каждой строке.

**Проверить таблицы:**
```bash
pnpm db:studio            # откроется Prisma Studio на localhost:5555
```

### Шаг 13. Валидация окружения
`src/config/env.validation.ts` + `src/config/configuration.ts` — zod-схема,
`ConfigModule.forRoot({ isGlobal: true, validate })`.

Объяснить: зачем валидировать env, почему падение на старте лучше ошибки в рантайме,
что даёт `isGlobal`.

### Шаг 14. Prisma-модуль
`src/prisma/prisma.service.ts` + `src/prisma/prisma.module.ts` —
`PrismaService extends PrismaClient implements OnModuleInit`, `@Global()` модуль.

Объяснить: DI-контейнер Nest (что такое провайдер, как работает внедрение через конструктор),
жизненный цикл модулей и хуки (`OnModuleInit`, `OnModuleDestroy`),
почему один экземпляр `PrismaClient` на приложение, а не новый на запрос.

### Шаг 15. Bootstrap приложения
`src/main.ts` + `src/app.module.ts` + `src/health/` (модуль и контроллер).

- глобальный префикс `api`
- `ValidationPipe({ whitelist: true, transform: true })`
- CORS для `http://localhost:3000`
- порт из `ConfigService` (по умолчанию 3001)
- `GET /api/health` живёт в **отдельном модуле** `src/health/`, а не в `app.controller.ts`

Объяснить: пайплайн обработки запроса в Nest —
middleware → guard → interceptor → pipe → handler → interceptor → exception filter.
Что делают `whitelist` (отрезает лишние поля) и `transform` (приводит типы).

### 🔧 КТ-3. Первый запуск API

```bash
pnpm --filter api dev
```

В другом терминале:
```bash
curl http://localhost:3001/api/health
```

**Ожидаем:** `200` и JSON-ответ. Это первая точка, где backend реально работает.

---

## Этап E. Backend — аутентификация

> Backend — **подробные** пояснения.

### Шаг 16. Модуль пользователей
`src/users/` — `users.module.ts`, `users.service.ts`, `users.controller.ts`, `dto/`.

Объяснить: разделение controller/service, почему бизнес-логика в сервисе.
Обязательно — почему `passwordHash` никогда не уходит клиенту (`select` в Prisma).

### Шаг 17. Аутентификация, часть 1
`src/auth/auth.service.ts`, `auth.controller.ts`, `dto/login.dto.ts`.

- хеширование пароля через `argon2`
- `validateUser` — сверка пароля с хешем
- выдача JWT
- `POST /api/auth/login`, `GET /api/auth/me`

Объяснить: почему пароли хешируют, а не шифруют; чем argon2 лучше bcrypt;
что такое соль и почему она внутри хеша.

### Шаг 18. Аутентификация, часть 2
`strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`, `guards/roles.guard.ts`,
`decorators/public.decorator.ts`, `roles.decorator.ts`, `current-user.decorator.ts`.

- `JwtAuthGuard` регистрируется **глобально** через `APP_GUARD`
- `@Public()` — на базе `SetMetadata` + `Reflector`
- `RolesGuard` + `@Roles(Role.ADMIN)`

Объяснить: устройство JWT (header.payload.signature, что подписывается и что нет,
почему в токен нельзя класть секреты); что такое guard и стратегия Passport;
почему «закрыто по умолчанию, открыто явно» безопаснее обратного.

**Проверить:** `GET /api/users` без токена → `401`; с токеном из `/auth/login` → `200`.

### Шаг 19. Seed-данные
`prisma/seed.ts` — администратор и демо-данные.

**Проверить:**
```bash
pnpm db:seed
```
Затем логин админом через `POST /api/auth/login` возвращает JWT.

---

## Этап F. Backend — доменные модули

> Backend — **подробные** пояснения. Структура модулей — в [`07-conventions.md`](./07-conventions.md).

Каждый модуль = module + service + controller + dto, CRUD-заглушки.
**Выдаётся по одному модулю за шаг.**

- **Шаг 20.1** — `src/modules/courses/` (первый — с самым подробным разбором,
  дальше по образцу)
- **Шаг 20.2** — `src/modules/teachers/`
- **Шаг 20.3** — `src/modules/leads/` (публичный `POST` через `@Public()`,
  остальное — только для `ADMIN`/`MANAGER`)
- **Шаг 20.4** — `src/modules/posts/`
- **Шаг 20.5** — `src/modules/gallery/`

**Проверить после каждого:** `GET /api/<модуль>` возвращает `200` и пустой список
(или демо-данные из seed).

---

## Этап G. Frontend

> Frontend — **краткие** пояснения.

### Шаг 21. Конфиги `apps/web`
`package.json` (**Next.js 16**) + `tsconfig.json` + `next.config.ts` + `eslint.config.mjs`.

### 🔧 КТ-4. Установка зависимостей frontend

```bash
pnpm install
```

### Шаг 22. Tailwind v4
`postcss.config.mjs` + `src/app/globals.css`.

Tailwind v4 настраивается **через CSS**, без `tailwind.config.ts`:
`@import "tailwindcss"` + блок `@theme` с палитрой детского центра
(тёплые, яркие цвета) и радиусами.

### Шаг 23. shadcn/ui
`components.json` (стиль `new-york`, алиасы `@/components`, `@/lib/utils`) +
`src/lib/utils.ts` (`cn()` — clsx + tailwind-merge).

**Проверить:**
```bash
cd apps/web && pnpm dlx shadcn@latest add button && cd ../..
```
Компонент появился в `apps/web/src/components/ui/button.tsx`.

> Если `pnpm dlx` в git bash не находит бинарник — запустить через
> `node ./node_modules/.bin/shadcn add button`.

### Шаг 24. API-клиент
`src/lib/api.ts` — обёртка над `fetch`: базовый URL из `NEXT_PUBLIC_API_URL`,
дженерик-возврат, обработка не-2xx. Используется и в Server Components, и в TanStack Query.

### Шаг 25. Провайдеры
`src/app/providers.tsx` — `'use client'`, `QueryClient` создаётся в `useState`,
чтобы не шарился между запросами.

### Шаг 26. Root layout
`src/app/layout.tsx` — `lang="ru"`, метаданные (`title: "Минимишки — детский центр"`),
подключение шрифтов и `Providers`.

### Шаг 27. Главная страница
`src/app/page.tsx` — заглушка, которая запрашивает `GET /api/health`
через Server Component и выводит статус. Так сразу проверяется связка web ↔ api.

---

## Этап H. Финал

### Шаг 28. `README.md`
Описание проекта, быстрый старт, требования к окружению.

### Шаг 29. Сквозная проверка
Полный прогон по [`05-verification.md`](./05-verification.md).

---

## Сводка контрольных точек

| Точка | Когда | Команда | Зачем |
|---|---|---|---|
| **КТ-1** | после шага 8 | `pnpm install` | Появились типы Nest/Prisma для backend-кода |
| **КТ-2** | после шага 12 | `pnpm db:generate` + `pnpm db:migrate` | Без Prisma-клиента шаги 13–20 не типизируются |
| **КТ-3** | после шага 15 | `pnpm --filter api dev` | Первая проверка, что backend поднимается |
| **КТ-4** | после шага 21 | `pnpm install` | Зависимости frontend |
