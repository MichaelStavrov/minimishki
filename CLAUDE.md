# План разработки: сайт детского центра «Минимишки»

Файл-контекст для всех сессий работы над проектом. Читать **в первую очередь**.

---

## 1. Контекст проекта

Разрабатывается сайт детского центра **«Минимишки»** — монорепозиторий с frontend на Next.js
и backend на Nest.js. Проект создаётся с нуля в `D:\programming\minimishki`.

Цель текущего этапа — **заготовка проекта**: полная структура папок, все конфиги,
стартовый код и инфраструктура. Зависимости не устанавливаются автоматически —
`package.json` пишутся вручную с явными версиями, чтобы разработчик сам запустил `pnpm install`.

---

## 2. ⚠️ Требования к процессу работы (ОБЯЗАТЕЛЬНО СОБЛЮДАТЬ)

Эти правила действуют во **всех** сессиях работы над проектом:

1. **Пользователь — middle frontend разработчик.** Бэкенд и devops он не знает,
   но хочет их изучать в процессе.

2. **Код вставляет пользователь сам, вручную.** Ассистент **НЕ** создаёт и **НЕ** редактирует
   файлы проекта самостоятельно (кроме `CLAUDE.md` и файлов плана).
   Задача ассистента — **выводить код в терминал** блоками, которые пользователь копирует к себе.

3. **Код выдаётся порционно, небольшими шагами.** Один шаг = один файл или одна логически
   завершённая часть файла. Не вываливать сразу десяток файлов.
   Всегда указывать **полный путь к файлу**, куда вставлять код.

4. **К каждому шагу — пояснение:**
   - **Frontend** (Next.js, React, Tailwind, shadcn/ui, TanStack Query) — **краткое**
     пояснение: что делает код, зачем он нужен. Пользователь в этом разбирается.
   - **Backend и DevOps** (Nest.js, Prisma, PostgreSQL, JWT, Docker, конфиги монорепо) —
     **развёрнутое** пояснение: что делает код, зачем нужна каждая сущность,
     как это работает под капотом, какие есть альтернативы. Цель — обучение.

5. **После каждого шага — пауза.** Дождаться подтверждения пользователя, что код вставлен,
   прежде чем переходить к следующему шагу.

6. **Язык.** Все ответы, комментарии в коде и `.md`-файлы — **на русском языке**.

---

## 3. Окружение разработчика

Проверено и установлено:

| Инструмент | Версия / путь |
|---|---|
| Node.js | **v22.22.3** (через nvm-windows, симлинк `C:\nvm4w\nodejs`) |
| npm | 10.9.8 |
| Git | `C:\Program Files\Git\cmd` |
| Docker Desktop | `C:\Users\mihal\AppData\Local\Programs\DockerDesktop\resources\bin` |
| pnpm | **ещё не активирован** → выполнить `corepack enable pnpm` |

ОС: Windows 11, оболочка PowerShell.

> Примечание: Node ставится через nvm-windows, поэтому в `PATH` фигурируют
> `%NVM_HOME%` и `%NVM_SYMLINK%`. Если в терминале `node` не находится —
> перезапустить терминал, чтобы подхватился обновлённый `PATH`.

---

## 4. Согласованный стек

| Слой | Решение |
|---|---|
| Монорепо | pnpm workspaces + Turborepo |
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Слой данных | Server Components + `fetch` для публичных страниц; TanStack Query для интерактива |
| Backend | Nest.js 11, ValidationPipe (class-validator), ConfigModule с zod-валидацией env |
| Аутентификация | JWT + Passport, guards, роли `ADMIN` / `MANAGER` / `USER` |
| БД / ORM | PostgreSQL 16 / Prisma |
| Инфраструктура | docker-compose только для БД (postgres + pgadmin), приложения запускаются локально |
| Качество кода | ESLint + Prettier (общие конфиги в `packages/`) |

Осознанно **не включаем** (решение пользователя): Swagger, husky/lint-staged, commitlint, Jest.
При необходимости добавим позже.

---

## 5. Целевая структура проекта

```
minimishki/
├── apps/
│   ├── web/                          # Next.js
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # root layout: шрифты, метаданные, Providers
│   │   │   │   ├── page.tsx          # главная-заглушка
│   │   │   │   ├── providers.tsx     # QueryClientProvider ('use client')
│   │   │   │   └── globals.css       # @import "tailwindcss" + токены темы
│   │   │   ├── components/ui/        # .gitkeep, сюда ставится shadcn/ui
│   │   │   ├── lib/
│   │   │   │   ├── api.ts            # типизированный fetch-клиент к NEXT_PUBLIC_API_URL
│   │   │   │   └── utils.ts          # cn() — clsx + tailwind-merge (нужен shadcn/ui)
│   │   │   └── types/
│   │   ├── public/
│   │   ├── components.json           # конфиг shadcn/ui
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs        # @tailwindcss/postcss
│   │   ├── eslint.config.mjs
│   │   ├── tsconfig.json             # extends @minimishki/tsconfig/nextjs.json
│   │   ├── .env.example
│   │   └── package.json
│   └── api/                          # Nest.js
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── src/
│       │   ├── main.ts               # ValidationPipe, CORS, префикс /api
│       │   ├── app.module.ts
│       │   ├── config/
│       │   │   ├── env.validation.ts # zod-схема переменных окружения
│       │   │   └── configuration.ts
│       │   ├── prisma/               # PrismaModule (@Global) + PrismaService
│       │   ├── auth/                 # AuthModule/Service/Controller, jwt.strategy,
│       │   │                         # guards/, decorators/ (@Public, @Roles, @CurrentUser)
│       │   ├── users/                # UsersModule/Service/Controller + dto/
│       │   └── modules/              # courses/, teachers/, leads/, posts/, gallery/
│       ├── nest-cli.json
│       ├── eslint.config.mjs
│       ├── tsconfig.json
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── shared/                       # @minimishki/shared — общие типы, enum'ы, константы
│   ├── eslint-config/                # @minimishki/eslint-config (base / next / nest)
│   └── tsconfig/                     # @minimishki/tsconfig (base / nextjs / nestjs)
├── docker-compose.yml                # postgres:16-alpine + pgadmin
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                      # корневые скрипты
├── .npmrc
├── .gitignore
├── .prettierrc / .prettierignore
├── .editorconfig
├── .nvmrc                            # 22
├── CLAUDE.md                         # этот план
└── README.md
```

---

## 6. Пошаговый план реализации

Каждый пункт = один шаг выдачи кода. Пользователь вставляет код, подтверждает, идём дальше.

### Этап A. Каркас монорепозитория (devops — подробные пояснения)

1. `.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc` — базовая гигиена репозитория.
2. Корневой `package.json` — `private: true`, `packageManager: "pnpm@9.x"`,
   `engines.node: ">=22"`. Скрипты: `dev`, `build`, `lint`, `format`, `typecheck` через `turbo run`;
   `db:migrate`, `db:generate`, `db:studio`, `db:seed` — проксирование в `apps/api` через `--filter`.
3. `pnpm-workspace.yaml` — пакеты `apps/*`, `packages/*`. Объяснить, что такое workspace
   и как работает протокол `workspace:*`.
4. `turbo.json` — пайплайн: `build` (`dependsOn: ["^build"]`, outputs `.next/**`, `dist/**`),
   `dev` (`cache: false`, `persistent: true`), `lint`, `typecheck`.
   `globalEnv`: `DATABASE_URL`, `NEXT_PUBLIC_API_URL`, `JWT_SECRET`.
   Объяснить механику кеширования задач и графа зависимостей.
5. `.prettierrc`, `.prettierignore` — единое форматирование.

### Этап B. Общие пакеты

6. `packages/tsconfig` — `base.json`, `nextjs.json`, `nestjs.json` + `package.json`.
7. `packages/eslint-config` — `base.js`, `next.js`, `nest.js` + `package.json` (flat config).
8. `packages/shared` — `package.json`, `tsconfig.json`, `src/index.ts`
   (enum `Role`, `LeadStatus`, DTO-интерфейсы публичного API, поле `exports`).

### Этап C. Инфраструктура (devops — подробные пояснения)

9. `docker-compose.yml` — `postgres:16-alpine` (порт 5432, `POSTGRES_DB=minimishki`,
   именованный volume, `healthcheck`) + `dpage/pgadmin4` (порт 5050, профиль `tools`).
   Объяснить: что такое сервис, volume, healthcheck, зачем нужен профиль.
10. `.env.example` для `apps/api` и `apps/web`. Объяснить разницу между серверными
    переменными и `NEXT_PUBLIC_*`.

### Этап D. Backend — база (подробные пояснения)

11. `apps/api/package.json` + `tsconfig.json` + `nest-cli.json` + `eslint.config.mjs`.
    Объяснить структуру Nest-приложения и роль каждого конфига.
12. `prisma/schema.prisma` — доменная модель (см. раздел 7). Объяснить, что такое ORM,
    как Prisma генерирует клиент, что такое миграции.
13. `src/config/env.validation.ts` + `configuration.ts` — zod-схема env,
    `ConfigModule.forRoot({ isGlobal: true, validate })`. Объяснить, зачем валидировать env
    и почему падение на старте лучше ошибки в рантайме.
14. `src/prisma/prisma.service.ts` + `prisma.module.ts` —
    `PrismaService extends PrismaClient implements OnModuleInit`, `@Global()` модуль.
    Объяснить DI-контейнер Nest и жизненный цикл модулей.
15. `src/main.ts` + `src/app.module.ts` — глобальный префикс `api`,
    `ValidationPipe({ whitelist: true, transform: true })`, CORS для `http://localhost:3000`,
    порт из `ConfigService` (по умолчанию 3001), health-эндпоинт.
    Объяснить пайплайн запроса в Nest: middleware → guard → interceptor → pipe → handler.

### Этап E. Backend — аутентификация (подробные пояснения)

16. `src/users/` — модуль, сервис, контроллер, DTO.
17. `src/auth/` часть 1 — `AuthService` (хеширование пароля через `argon2`, `validateUser`,
    выдача JWT), `AuthController` (`POST /api/auth/login`, `GET /api/auth/me`), DTO.
18. `src/auth/` часть 2 — `JwtStrategy`, `JwtAuthGuard` (регистрируется глобально через `APP_GUARD`),
    декоратор `@Public()` на базе `SetMetadata` + `Reflector`, `RolesGuard` + `@Roles(Role.ADMIN)`,
    `@CurrentUser()`. Объяснить, как устроен JWT, что такое guard и стратегия Passport.
19. `prisma/seed.ts` — создание администратора и демо-данных.

### Этап F. Backend — доменные модули

20. `src/modules/courses/`, `teachers/`, `leads/`, `posts/`, `gallery/` — каркас
    module/controller/service с CRUD-заглушками. Выдаётся по одному модулю за шаг.

### Этап G. Frontend (краткие пояснения)

21. `apps/web/package.json` + `tsconfig.json` + `next.config.ts` + `eslint.config.mjs`.
22. `postcss.config.mjs` + `src/app/globals.css` — Tailwind v4 настраивается **через CSS**,
    без `tailwind.config.ts`: `@import "tailwindcss"` + блок `@theme` с палитрой детского центра
    (тёплые, яркие цвета) и радиусами.
23. `components.json` (стиль `new-york`, алиасы `@/components`, `@/lib/utils`) +
    `src/lib/utils.ts` (`cn()` — clsx + tailwind-merge). После этого
    `pnpm dlx shadcn@latest add button` работает из коробки.
24. `src/lib/api.ts` — тонкая обёртка над `fetch`: базовый URL из `NEXT_PUBLIC_API_URL`,
    дженерик-возврат, обработка не-2xx. Используется и в Server Components, и в TanStack Query.
25. `src/app/providers.tsx` — `'use client'`, `QueryClient` создаётся в `useState`,
    чтобы не шарился между запросами.
26. `src/app/layout.tsx` — `lang="ru"`, метаданные (`title: "Минимишки — детский центр"`),
    подключение шрифтов и `Providers`.
27. `src/app/page.tsx` — главная-заглушка.

### Этап H. Финал

28. `README.md` — описание проекта, быстрый старт, требования к окружению.
29. Прогон проверки (раздел 9).

---

## 7. Доменная модель (`prisma/schema.prisma`)

Согласованный стартовый набор:

- `enum Role { ADMIN MANAGER USER }`
- `enum LeadStatus { NEW IN_PROGRESS CONFIRMED REJECTED }`
- **`User`** — `id` (cuid), `email` (unique), `passwordHash`, `name`, `role`, `createdAt`, `updatedAt`
- **`Course`** — направление: `slug` (unique), `title`, `description`, `ageFrom`, `ageTo`,
  `price`, `imageUrl`, `isPublished`, `sortOrder`; связь many-to-many с `Teacher`
- **`Teacher`** — педагог: `slug`, `fullName`, `position`, `bio`, `photoUrl`, `isPublished`, `sortOrder`
- **`Lead`** — заявка с сайта: `name`, `phone`, `childName`, `childAge`, `comment`,
  `status`, `courseId?`, `createdAt`
- **`Post`** — новость: `slug` (unique), `title`, `excerpt`, `content`, `coverUrl`,
  `isPublished`, `publishedAt`
- **`GalleryItem`** — фото: `url`, `alt`, `postId?`, `sortOrder`, `createdAt`

---

## 8. Переменные окружения

**`apps/api/.env`:**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minimishki?schema=public"
JWT_SECRET="<сгенерировать>"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

**`apps/web/.env.local`:**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 9. Проверка результата

Выполняется после того, как весь код вставлен:

1. `corepack enable pnpm` (однократно) → `pnpm --version` должен отработать.
2. `cd D:\programming\minimishki` → `pnpm install` — без ошибок разрешения workspace-зависимостей.
3. `docker compose up -d postgres` → контейнер в состоянии `healthy`.
4. Скопировать `.env.example` → `.env` в `apps/api` и `apps/web`.
5. `pnpm db:migrate` (создаёт первую миграцию) → `pnpm db:seed`.
6. `pnpm dev` → web на `http://localhost:3000` (главная рендерится),
   api на `http://localhost:3001/api`.
7. `curl http://localhost:3001/api/health` → `200`;
   `POST /api/auth/login` с данными из seed возвращает JWT.
8. `pnpm lint` и `pnpm typecheck` — без ошибок.

---

## 10. Журнал прогресса

Отмечать выполненные шаги, чтобы следующая сессия сразу поняла, где остановились.

### ▶️ ТЕКУЩЕЕ СОСТОЯНИЕ

**Следующий шаг: № 2 — корневой `package.json`** (этап A).
При старте новой сессии: прочитать раздел 2 (требования к процессу), затем сразу выдать код шага 2
с подробным devops-пояснением (скрипты, `turbo run`, механика `--filter`).

**Что уже есть в `D:\programming\minimishki`:**

```
.git/            # репозиторий инициализирован
.editorconfig
.gitignore
.npmrc
.nvmrc
CLAUDE.md
```

**Выполненные команды окружения:** `git init`, `corepack enable pnpm`.
`pnpm install` ещё **не** запускался — `node_modules` отсутствует, это нормально:
зависимости ставим только после того, как будут написаны все `package.json` (шаги 2, 6–8, 11, 21).

### Чек-лист этапов

- [x] Шаг 0 — создан `CLAUDE.md` с планом (09.08.2026)
- [ ] **Этап A — каркас монорепозитория (шаги 1–5)** ← в работе
  - [x] Шаг 1 — `.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc`
  - [ ] Шаг 2 — корневой `package.json`
  - [ ] Шаг 3 — `pnpm-workspace.yaml`
  - [ ] Шаг 4 — `turbo.json`
  - [ ] Шаг 5 — `.prettierrc`, `.prettierignore`
- [ ] Этап B — общие пакеты (шаги 6–8)
- [ ] Этап C — инфраструктура (шаги 9–10)
- [ ] Этап D — backend, база (шаги 11–15)
- [ ] Этап E — backend, аутентификация (шаги 16–19)
- [ ] Этап F — backend, доменные модули (шаг 20)
- [ ] Этап G — frontend (шаги 21–27)
- [ ] Этап H — финал (шаги 28–29)

### Принятые по ходу решения

- Версии пакетов в `package.json` пишем явно, «шапкой» (`^`), без установки на момент написания.
- В `.npmrc` осознанно **не** включён `shamefully-hoist` — сохраняем строгую изоляцию
  зависимостей pnpm, чтобы ловить неявные импорты.
- `strict-peer-dependencies=false` — иначе `pnpm install` падает на конфликтах
  peer-зависимостей React 19 / Nest 11.
