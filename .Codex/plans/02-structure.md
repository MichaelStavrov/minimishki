# Целевая структура проекта

```
minimishki/
├── apps/
│   ├── web/                          # Next.js 16 (порт 3000), архитектура — FSD
│   │   ├── app/                      # ⚠️ роутинг Next.js — в КОРНЕ, не в src/
│   │   │   ├── layout.tsx            # root layout: шрифты, метаданные, Providers
│   │   │   ├── page.tsx              # тонкий реэкспорт серверного HomePage
│   │   │   ├── loading.tsx           # маршрутное состояние загрузки
│   │   │   ├── error.tsx             # клиентская граница ошибок
│   │   │   └── not-found.tsx         # общий 404
│   │   ├── src/                      # ── слои FSD ──
│   │   │   ├── _app/                 # инициализация приложения
│   │   │   │   ├── providers.tsx     # QueryClientProvider ('use client')
│   │   │   │   └── styles/
│   │   │   │       └── globals.css   # @import "tailwindcss" + токены темы
│   │   │   ├── _pages/               # сборка страниц из нижних слоёв
│   │   │   │   └── home/
│   │   │   │       ├── ui/HomePage.tsx
│   │   │   │       └── index.server.ts # серверный публичный API слайса
│   │   │   ├── widgets/              # появится вместе с Header / Footer
│   │   │   ├── features/             # по потребности
│   │   │   ├── entities/             # по потребности
│   │   │   └── shared/
│   │   │       ├── api/              # универсальный HTTP-транспорт
│   │   │       │   ├── index.ts      # браузеробезопасный публичный API
│   │   │       │   └── index.server.ts # вход с API_URL + server-only
│   │   │       ├── config/           # проверка публичного окружения
│   │   │       ├── lib/
│   │   │       │   └── cn.ts         # clsx + tailwind-merge (нужен shadcn/ui)
│   │   │       └── ui/               # сюда ставится shadcn/ui
│   │   ├── public/
│   │   ├── components.json           # конфиг shadcn/ui (алиасы — на src/shared)
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs        # @tailwindcss/postcss
│   │   ├── eslint.config.mjs
│   │   ├── tsconfig.json             # extends @minimishki/tsconfig/nextjs.json
│   │   ├── .env.example
│   │   └── package.json
│   └── api/                          # Nest.js 11 (порт 3001)
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── seed.ts
│       │   └── migrations/
│       ├── src/
│       │   ├── main.ts               # bootstrap: ValidationPipe, CORS, префикс /api
│       │   ├── app.module.ts         # корневой модуль
│       │   │
│       │   ├── config/               # ── инфраструктура ──
│       │   │   ├── env.validation.ts # zod-схема переменных окружения
│       │   │   └── configuration.ts
│       │   ├── prisma/
│       │   │   ├── prisma.module.ts  # @Global()
│       │   │   └── prisma.service.ts
│       │   ├── health/
│       │   │   ├── health.module.ts
│       │   │   └── health.controller.ts   # GET /api/health
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.controller.ts
│       │   │   ├── strategies/jwt.strategy.ts
│       │   │   ├── guards/            # jwt-auth.guard.ts, roles.guard.ts
│       │   │   ├── decorators/        # public.decorator.ts, roles.decorator.ts,
│       │   │   │                      # current-user.decorator.ts
│       │   │   └── dto/
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── users.service.ts
│       │   │   ├── users.controller.ts
│       │   │   └── dto/
│       │   │
│       │   └── modules/              # ── доменные модули ──
│       │       ├── services/
│       │       ├── teachers/
│       │       ├── leads/
│       │       ├── posts/
│       │       └── gallery/
│       ├── nest-cli.json
│       ├── eslint.config.mjs
│       ├── tsconfig.json
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── shared/                       # @minimishki/shared
│   │   ├── src/
│   │   │   ├── index.ts              # реэкспорт
│   │   │   ├── enums.ts              # Role, LeadStatus как as const (без Prisma!)
│   │   │   └── dto/                  # интерфейсы ответов публичного API
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── eslint-config/                # @minimishki/eslint-config
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── nest.js
│   │   └── package.json
│   └── tsconfig/                     # @minimishki/tsconfig
│       ├── base.json
│       ├── nextjs.json
│       ├── nestjs.json
│       └── package.json
├── .Codex/
│   └── plans/                        # детальные планы (этот каталог), коммитится в git
├── docker-compose.yml                # postgres:16-alpine + pgadmin (профиль tools)
├── pnpm-workspace.yaml
├── turbo.json                        # ключ tasks (Turborepo 2.x), не pipeline!
├── package.json                      # корневые скрипты
├── .npmrc
├── .gitignore
├── .prettierrc / .prettierignore
├── .editorconfig
├── .nvmrc                            # 22
├── AGENTS.md                          # правила для Codex
└── README.md
```

---

## Логика разделения

### `apps/` vs `packages/`

- **`apps/`** — запускаемые приложения. Каждое имеет свой `package.json`, свои зависимости
  и свою команду `dev`.
- **`packages/`** — переиспользуемые пакеты, которые не запускаются сами по себе:
  общие типы (`shared`) и общие конфиги (`eslint-config`, `tsconfig`).
  Подключаются через протокол `workspace:*` — pnpm создаст симлинк на локальную папку
  вместо загрузки из npm-реестра.
- **Корень** — оркестрация: скрипты `turbo run`, настройки монорепо, инфраструктура.

### Почему фронтенд на FSD

`apps/web` строится по **Feature-Sliced Design**. Плоская `components/` за несколько
месяцев превращается в свалку, где непонятно, что можно переиспользовать, а что
привязано к одной странице. FSD задаёт это структурой, а не договорённостью.

**Слои — сверху вниз.** Каждый слой видит только слои **строго ниже** себя:

| Слой | Что внутри | Пример из «Минимишек» |
|---|---|---|
| `_app` | Инициализация: провайдеры, глобальные стили | `providers.tsx`, `globals.css` |
| `_pages` | Сборка страницы из нижних слоёв, своей логики почти нет | `home/`, `services/`, `service-detail/` |
| `widgets` | Самостоятельные блоки страницы | `header/`, `footer/`, `services-preview/` |
| `features` | Действия пользователя, меняющие состояние системы | `submit-lead/`, `change-lead-status/` |
| `entities` | Бизнес-сущности и их представление | `service/`, `teacher/`, `lead/` |
| `shared` | Переиспользуемое, не привязанное к домену | `ui/` (shadcn), `api/`, `lib/cn.ts` |

Внутри бизнес-слоя — **слайсы** (папки по домену), внутри слайса — **сегменты**
(`ui`, `model`, `api`, `lib`, `config`). Наружу слайс отдаёт только то,
что реэкспортировал в своём `index.ts`; серверный код отделяется через
`index.server.ts`. Слои `_app` и `shared` не делятся на бизнес-слайсы.

**Почему `app/` вынесен из `src/`.** Next.js трактует `src/app` как App Router — положить
туда одноимённый слой FSD нельзя, роутер сломается. Поэтому служебные папки Next
(`app/`, при необходимости `middleware.ts`, `instrumentation.ts`) лежат в корне
`apps/web`, а `src/` целиком отдан под архитектуру. Сами слои `app` и `pages`
переименованы в **`_app`** и **`_pages`** — это официальная рекомендация FSD
для проектов на Next.js.

Файлы в `app/` остаются **тонкими**: маршрут импортирует готовую страницу из `_pages`
и больше ничего не делает.

```tsx
// app/services/page.tsx
export { ServicesPage as default } from '@/_pages/services/index.server';
```

**Слои заводятся по мере надобности.** Обязателен только `shared`; пустых папок
с `.gitkeep` не создаём. На старте наполняются `_app`, `_pages`, `shared`.
`widgets` появится вместе с Header и Footer, `entities` и `features` — когда
у слайса возникнет второй потребитель.

Направление зависимостей между слоями закрыто `import/no-restricted-paths`
в `packages/eslint-config/next.js` и падает на `pnpm lint`. Изоляция соседних
слайсов и импорт через публичный API остаются обязательными правилами ревью:
текущая конфигурация ESLint их автоматически не доказывает.
Подробности по раскладке кода — в [`07-conventions.md`](./07-conventions.md).

### Почему `auth/` и `users/` не лежат в `modules/`

Внутри `apps/api/src/` два вида модулей, и они разнесены намеренно:

| Тип | Где лежит | Признак |
|---|---|---|
| **Инфраструктурные** | `src/` напрямую — `config/`, `prisma/`, `health/`, `auth/`, `users/` | Пересекают все домены. `auth` защищает любой контроллер, `prisma` даёт доступ к БД отовсюду, `users` — фундамент аутентификации |
| **Доменные** | `src/modules/` — `services/`, `teachers/`, `leads/`, `posts/`, `gallery/` | Отражают конкретные сущности детского центра. Их можно добавлять и удалять, не трогая остальную систему |

Практическое следствие: **новую сущность сайта** (например, «Расписание») заводим
в `src/modules/`, **новый сквозной механизм** (например, загрузку файлов) — в `src/`.

### Анатомия доменного модуля

Каждая папка в `src/modules/` устроена одинаково — подробности в
[`07-conventions.md`](./07-conventions.md):

```
services/
├── services.module.ts
├── services.service.ts       # работа с Prisma
├── services.controller.ts    # HTTP-роуты
└── dto/
    ├── create-service.dto.ts
    └── update-service.dto.ts # PartialType(CreateServiceDto)
```

---

## Порты

| Сервис | Порт | Запуск |
|---|---|---|
| `apps/web` (Next.js) | 3000 | `pnpm dev` |
| `apps/api` (Nest.js) | 3001 | `pnpm dev` |
| PostgreSQL (Docker) | 5432 | `docker compose up -d postgres` |
| pgAdmin (Docker) | 5050 | `docker compose --profile tools up -d` |

---

## Что коммитится в git

- ✅ `.Codex/plans/` — планы проекта, нужны в каждой сессии
- ✅ `AGENTS.md`, `README.md`
- ✅ `.env.example` в обоих приложениях (разыгнорирован через `!.env.example`)
- ✅ `pnpm-lock.yaml` — фиксирует точные версии зависимостей
- ❌ `.env`, `.env.local` — секреты
- ❌ `node_modules/`, `.next/`, `dist/`, `.turbo/`
