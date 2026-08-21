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
- Скрипты через `turbo run`: `dev`, `build`, `lint`, `typecheck`
  (`format` идёт мимо turbo — см. шаг 5)
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

### Шаг 5. Prettier и нормализация переводов строк
`.prettierrc`, `.prettierignore`, `.gitattributes` + правка корневого `package.json`.

- **`.prettierrc`** — `printWidth: 100`, `singleQuote: true` / `jsxSingleQuote: false`,
  `trailingComma: "all"`, `endOfLine: "lf"`, override для `*.md` с `proseWrap: "preserve"`.
  Плагин `prettier-plugin-tailwindcss` здесь **не подключается** — см. шаг 22.
- **`.prettierignore`** — отдельно от `.gitignore`: Prettier читает `.gitignore` только
  с флагом `--ignore-path`. Списки расходятся намеренно: `pnpm-lock.yaml`
  и `prisma/migrations/` коммитятся, но не форматируются. Также исключены `.Codex/`
  и `AGENTS.md` — Prettier выравнивал бы Markdown-таблицы пробелами и давал дифф
  на сотни строк в документации при каждом `pnpm format`.
- **Корневой `package.json`** — `"format": "prettier --write ."`,
  `"format:check": "prettier --check ."`, `prettier` в `devDependencies`.

> ⚠️ Форматирование **не** заводится как turbo-задача. У него нет графа зависимостей
> и нечего кешировать, а turbo-вариант потребовал бы дублировать `prettier`
> и скрипт `format` в каждом пакете. `turbo.json` на этом шаге не меняется.

- **`.gitattributes`** — `* text=auto eol=lf`, исключение `eol=crlf`
  для `*.bat` / `*.cmd` / `*.ps1`, пометки `binary` для изображений и шрифтов,
  `pnpm-lock.yaml -diff linguist-generated=true`.

> ⚠️ Без `.gitattributes` глобальный `core.autocrlf=true` (дефолт Git for Windows)
> подменяет LF на CRLF при checkout, и `pnpm format:check` с `endOfLine: "lf"` падает
> **всегда** — при зелёном CI на Linux.

**После вставки:**

```bash
git add --renormalize .
git check-attr text eol -- package.json   # ожидаем text: auto, eol: lf
```

**Проверить полностью** — на КТ-1: `pnpm format` → `pnpm format:check` проходит
без замечаний, `pnpm-lock.yaml` в выводе не появляется.

---

## Этап B. Общие пакеты

### Шаг 6. `packages/tsconfig`
`base.json`, `nextjs.json`, `nestjs.json` + `package.json`.

Объяснить: почему конфиги вынесены в отдельный пакет, как работает `extends`
на пакет из node_modules.

### Шаг 7. `packages/eslint-config`
`base.js`, `next.js`, `nest.js` + `package.json` (flat config).

> ⚠️ Правило `import/no-restricted-paths` **не работает без `eslint-import-resolver-typescript`**
> и настройки `settings['import/resolver'].typescript`: неразрешённые импорты оно молча
> пропускает, а стандартный резолвер не находит `.ts` без расширения.
>
> В `next.js` — правило **`import/no-restricted-paths`** с зонами по слоям FSD:
> слой может импортировать только слои строго ниже себя
> (`_app` → `_pages` → `widgets` → `features` → `entities` → `shared`).
> Так архитектура проверяется на `pnpm lint`, а не держится на дисциплине.
> Раскладка слоёв — в [`02-structure.md`](./02-structure.md#почему-фронтенд-на-fsd).

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

> ⚠️ **`rootDir: "./src"` задавать нельзя**, если `prisma/seed.ts` входит в тот же проект:
> компилятор выдаёт `TS6059: File ... is not under rootDir`. Проверено на шаге 7.
> Варианты: не указывать `rootDir` вовсе (TypeScript выведет его сам) либо завести
> для сида отдельный `tsconfig`. Здесь же задаётся `outDir: "./dist"` — в общем пакете
> `@minimishki/tsconfig` его нет, потому что относительные пути резолвятся
> относительно объявляющего файла.

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
`src/auth/auth.module.ts`, `auth.service.ts`, `auth.controller.ts`, `dto/login.dto.ts`.

- сверка хеша пароля через `argon2` (хеширование при записи уже делает `UsersService`)
- `validateUser` — сверка пароля с хешем
- выдача JWT
- `POST /api/auth/login`

Объяснить: почему пароли хешируют, а не шифруют; чем argon2 лучше bcrypt;
что такое соль и почему она внутри хеша.

### Шаг 18. Аутентификация, часть 2
`strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`, `guards/roles.guard.ts`,
`decorators/public.decorator.ts`, `roles.decorator.ts`, `current-user.decorator.ts`.

- `JwtAuthGuard` регистрируется **глобально** через `APP_GUARD`
- `@Public()` — на базе `SetMetadata` + `Reflector`
- `RolesGuard` + `@Roles(Role.ADMIN)`
- `GET /api/auth/me` на базе JWT-стратегии и `@CurrentUser()`

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

> Этап G — **подробные** пояснения: он целиком про Next.js, Tailwind, shadcn/ui и FSD,
> а это технологии из списка «опыта мало» (п.6 глобального `AGENTS.md`).
> Кратко — только там, где код сводится к обычному React и TypeScript.

> **Весь этап G — по Feature-Sliced Design.** Роутинг Next.js лежит в `apps/web/app/`
> (в корне приложения), архитектура — в `apps/web/src/`. Слои `app` и `pages`
> переименованы в `_app` и `_pages`, иначе конфликт с App Router.
> Раскладка — [`02-structure.md`](./02-structure.md#почему-фронтенд-на-fsd),
> правила — [`07-conventions.md`](./07-conventions.md#архитектура--feature-sliced-design).

### Шаг 21. Конфиги `apps/web`
`package.json` (**Next.js 16**) + `tsconfig.json` + `next.config.ts` + `eslint.config.mjs`.

В `tsconfig.json` алиас `@/*` → `./src/*`.

> ⚠️ Папку `src/app/` **не создаём** — Next.js принял бы её за App Router.
> Роутинг живёт в `apps/web/app/`, слой инициализации — в `apps/web/src/_app/`.

### 🔧 КТ-4. Установка зависимостей frontend

```bash
pnpm install
```

### Шаг 22. Tailwind v4
`postcss.config.mjs` + `src/_app/styles/globals.css`.

Tailwind v4 настраивается **через CSS**, без `tailwind.config.ts`:
`@import "tailwindcss"` + блок `@theme` с палитрой детского центра
(тёплые, яркие цвета) и радиусами.

**Здесь же подключается `prettier-plugin-tailwindcss`** (отложен с шага 5 —
до появления `globals.css` плагин падал бы на каждом запуске). В корневой
`package.json` добавляется `prettier-plugin-tailwindcss@^0.8.1`, в `.prettierrc`:

```json
"plugins": ["prettier-plugin-tailwindcss"],
"tailwindStylesheet": "./apps/web/src/_app/styles/globals.css"
```

Опция `tailwindStylesheet` обязательна для v4: конфига `tailwind.config.ts` больше нет,
и порядок классов плагин выясняет из самого CSS-файла с директивой `@theme`.

### Шаг 23. shadcn/ui
`components.json` (стиль `new-york`) + `src/shared/lib/cn.ts` (`cn()` — clsx + tailwind-merge).

Алиасы направлены в слой `shared`, иначе CLI разложит компоненты
в `src/components/ui` мимо архитектуры:

```json
"aliases": {
  "components": "@/shared/ui",
  "ui": "@/shared/ui",
  "lib": "@/shared/lib",
  "utils": "@/shared/lib/cn",
  "hooks": "@/shared/lib/hooks"
}
```

**Проверить:**
```bash
cd apps/web && pnpm dlx shadcn@latest add button && cd ../..
```
Компонент появился в `apps/web/src/shared/ui/button.tsx`.

> Если `pnpm dlx` в git bash не находит бинарник — запустить через
> `node ./node_modules/.bin/shadcn add button`.

### Шаг 24. API-клиент
`src/shared/api/` — обёртка над `fetch`: базовый URL из `NEXT_PUBLIC_API_URL`,
дженерик-возврат, обработка не-2xx. Плюс `index.ts` — публичный API сегмента.
Используется и в Server Components, и в TanStack Query.

### Шаг 25. Провайдеры
`src/_app/providers.tsx` — `'use client'`, `QueryClient` создаётся в `useState`,
чтобы не шарился между запросами.

### Шаг 26. Root layout
`app/layout.tsx` — `lang="ru"`, метаданные (`title: "Минимишки — детский центр"`),
подключение шрифтов. Импортирует `globals.css` и `Providers` из `src/_app`.

### Шаг 27. Главная страница
Слайс `src/_pages/home/` — `ui/HomePage.tsx` запрашивает `GET /api/health`
через Server Component и выводит статус, `index.ts` реэкспортирует компонент.

`app/page.tsx` остаётся тонким:

```tsx
export { HomePage as default } from '@/_pages/home';
```

Так сразу проверяется и связка web ↔ api, и что слои разложены верно.

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
