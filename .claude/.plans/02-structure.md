# Целевая структура проекта

```
minimishki/
├── apps/
│   ├── web/                          # Next.js 16 (порт 3000)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx        # root layout: шрифты, метаданные, Providers
│   │   │   │   ├── page.tsx          # главная-заглушка
│   │   │   │   ├── providers.tsx     # QueryClientProvider ('use client')
│   │   │   │   └── globals.css       # @import "tailwindcss" + токены темы
│   │   │   ├── components/
│   │   │   │   └── ui/               # .gitkeep, сюда ставится shadcn/ui
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
│       │       ├── courses/
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
├── .claude/
│   └── .plans/                       # детальные планы (этот каталог), коммитится в git
├── docker-compose.yml                # postgres:16-alpine + pgadmin (профиль tools)
├── pnpm-workspace.yaml
├── turbo.json                        # ключ tasks (Turborepo 2.x), не pipeline!
├── package.json                      # корневые скрипты
├── .npmrc
├── .gitignore
├── .prettierrc / .prettierignore
├── .editorconfig
├── .nvmrc                            # 22
├── CLAUDE.md                         # краткий контекст проекта
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

### Почему `auth/` и `users/` не лежат в `modules/`

Внутри `apps/api/src/` два вида модулей, и они разнесены намеренно:

| Тип | Где лежит | Признак |
|---|---|---|
| **Инфраструктурные** | `src/` напрямую — `config/`, `prisma/`, `health/`, `auth/`, `users/` | Пересекают все домены. `auth` защищает любой контроллер, `prisma` даёт доступ к БД отовсюду, `users` — фундамент аутентификации |
| **Доменные** | `src/modules/` — `courses/`, `teachers/`, `leads/`, `posts/`, `gallery/` | Отражают конкретные сущности детского центра. Их можно добавлять и удалять, не трогая остальную систему |

Практическое следствие: **новую сущность сайта** (например, «Расписание») заводим
в `src/modules/`, **новый сквозной механизм** (например, загрузку файлов) — в `src/`.

### Анатомия доменного модуля

Каждая папка в `src/modules/` устроена одинаково — подробности в
[`07-conventions.md`](./07-conventions.md):

```
courses/
├── courses.module.ts
├── courses.service.ts       # работа с Prisma
├── courses.controller.ts    # HTTP-роуты
└── dto/
    ├── create-course.dto.ts
    └── update-course.dto.ts # PartialType(CreateCourseDto)
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

- ✅ `.claude/.plans/` — планы проекта, нужны в каждой сессии
- ✅ `CLAUDE.md`, `README.md`
- ✅ `.env.example` в обоих приложениях (разыгнорирован через `!.env.example`)
- ✅ `pnpm-lock.yaml` — фиксирует точные версии зависимостей
- ❌ `.env`, `.env.local` — секреты
- ❌ `node_modules/`, `.next/`, `dist/`, `.turbo/`
