# Стек и окружение

## Согласованный стек

| Слой | Решение |
|---|---|
| Монорепо | pnpm 10.x workspaces + Turborepo 2.x |
| Язык | **TypeScript 6.x** — общие конфиги в `packages/tsconfig` (`base` / `nextjs` / `nestjs`) |
| Frontend | **Next.js 16** (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| Архитектура frontend | **Feature-Sliced Design** — см. [`02-structure.md`](./02-structure.md#почему-фронтенд-на-fsd) |
| Слой данных | Server Components + `fetch` для публичных страниц; TanStack Query v5 для интерактива |
| Backend | Nest.js 11, ValidationPipe (class-validator), ConfigModule с zod-валидацией env |
| Аутентификация | JWT + Passport, guards, роли `ADMIN` / `MANAGER` / `USER` |
| БД / ORM | PostgreSQL 16 / Prisma |
| Инфраструктура | docker-compose только для БД (postgres + pgadmin), приложения запускаются локально |
| Качество кода | ESLint + Prettier (общие конфиги в `packages/`) |

> **Про TypeScript 6, а не 7.** В npm `latest` — TypeScript 7.0.2: компилятор,
> переписанный на Go, примерно вдесятеро быстрее (GA 08.07.2026). Взять его нельзя:
> у 7.0 **нет программного API компилятора**, а через этот API работают `nest build`,
> `ts-node` (нужен для `prisma/seed.ts`), `ts-jest` и type-aware правила
> `typescript-eslint` — последний прямо объявляет peer `typescript >=4.8.4 <6.1.0`.
> Ветка 6.x — последняя на JS-компиляторе, весь тулинг с ней работает.
> Возврат к 7.x — в [`08-backlog.md`](./08-backlog.md), после выхода 7.1 с этим API.
>
> Практическое следствие для конфигов: `baseUrl`, `moduleResolution: "node"`
> и `target: "es5"` в TS 6 объявлены **устаревшими** и в 7 будут удалены — в проекте
> их нет. Примеры из статей двухлетней давности копировать нельзя.

> **Про Next.js 16.** Изначально в плане была 15-я версия, но её поддержка
> (Maintenance LTS) заканчивается **21.10.2026** — security-патчи перестанут выходить.
> Next.js 16 — текущий Active LTS до октября 2027, стабилен с октября 2025.
> Для проекта, который стартует в августе 2026, брать 15-ю ветку смысла нет.

### Осознанно не включаем

Решение пользователя — при необходимости добавим позже (см. [`08-backlog.md`](./08-backlog.md)):

- Swagger / OpenAPI
- husky + lint-staged
- commitlint (Conventional Commits)
- Jest / тесты
- **Steiger** — официальный линтер FSD. Правила импортов между слоями закрыты
  через `import/no-restricted-paths` в общем ESLint-конфиге; отдельный инструмент
  со своей командой пока избыточен

### Обоснование ключевых выборов

- **pnpm + Turborepo** — pnpm экономит место через общий store и даёт строгую изоляцию
  зависимостей; Turborepo добавляет кеширование задач и граф зависимостей между пакетами.
- **Server Components + TanStack Query** — публичные страницы рендерятся на сервере
  (важно для SEO детского центра), интерактивные части (админка, формы) работают
  через React Query.
- **Prisma** — типобезопасный доступ к БД, схема как единый источник правды,
  автогенерация TypeScript-типов из моделей.
- **`packages/shared` без зависимости от Prisma** — если бы shared реэкспортировал
  `@prisma/client`, эту зависимость потянул бы и frontend. Поэтому в shared лежат
  собственные `as const`-объекты и типы, а на бэкенде их соответствие Prisma-типам
  проверяется компилятором. Детали — в [`04-domain-model.md`](./04-domain-model.md).

---

## Политика версий

| Правило | Пояснение |
|---|---|
| **Мажор фиксируем в плане** | TypeScript 6, Next.js 16, Nest 11, Tailwind 4, Prisma 6+, pnpm 10 — эти числа влияют на синтаксис конфигов и должны быть согласованы между всеми файлами планов |
| **TypeScript — только `^6.x`** | Единственный пакет, где `latest` брать **нельзя**: в реестре это 7.x, несовместимый с тулингом (см. врезку выше). Проверять командой `pnpm view typescript@6 version` |
| **В `package.json` — «шапка» `^`** | Минорные и патчи подтягиваются автоматически, `pnpm-lock.yaml` фиксирует точные версии для воспроизводимости |
| **Проверять перед написанием** | Перед каждым `package.json` выполнить `pnpm view <pkg> version` — не брать версию по памяти |
| **`packageManager` — точная версия** | В корневом `package.json` указывается конкретная версия pnpm (например `pnpm@10.15.0`), без `^`. Corepack по ней подтягивает ровно этот менеджер |

Скрипты в `package.json` пишутся **кроссплатформенно**: прямые слеши в путях,
без `&&` внутри одной команды там, где можно обойтись `turbo run`.
Так они работают и в git bash, и в CI на Linux.

> ⚠️ **Turborepo 2.x:** корневой ключ в `turbo.json` называется **`tasks`**.
> Ключ `pipeline` из Turborepo 1.x **устарел** — конфиг с ним не запустится.

---

## Окружение разработчика

**ОС:** Windows 11, терминал — **git bash**.

| Инструмент | Версия / путь |
|---|---|
| Node.js | **v22.22.3** (через nvm-windows, симлинк `C:\nvm4w\nodejs`) |
| npm | 10.9.8 |
| Git | `C:\Program Files\Git\cmd` |
| Docker Desktop | `C:\Users\mihal\AppData\Local\Programs\DockerDesktop\resources\bin` |
| pnpm | 10.x, активирован через `corepack enable pnpm` ✅ |

> **Примечание про nvm-windows.** Node установлен через nvm-windows, поэтому в `PATH`
> фигурируют `%NVM_HOME%` и `%NVM_SYMLINK%`. Если в терминале `node` не находится —
> перезапустить терминал, чтобы подхватился обновлённый `PATH`.

> **Примечание про corepack.** Это встроенный в Node менеджер пакетных менеджеров.
> Он не «устанавливает pnpm», а создаёт shim-скрипт, который читает поле `packageManager`
> из `package.json` и подтягивает ровно ту версию pnpm, которая там указана.
> Так у всех участников проекта одинаковая версия менеджера — расхождение версий pnpm
> ломает lock-файл монорепозитория.

> **Примечание про git bash.** Обычный набор Unix-утилит доступен (`&&`, `curl`, `grep`,
> `head`, пайпы). Основные грабли на Windows: MSYS-преобразование путей
> (аргумент со слеша может превратиться в `C:/Program Files/Git/...` — лечится
> удвоением слеша или `MSYS_NO_PATHCONV=1`) и необходимость `winpty`
> для интерактивных программ вроде `docker exec -it` и `psql`.
> Полный список — в глобальном `C:\Users\mihal\.Codex\AGENTS.md`, п. 10.

---

## Переменные окружения

### Какие файлы где лежат

| Файл | Коммитится в git | Назначение |
|---|---|---|
| `apps/api/.env.example` | ✅ да | Шаблон с пустыми значениями |
| `apps/api/.env` | ❌ нет | Реальные значения, создаётся копированием из `.env.example` |
| `apps/web/.env.example` | ✅ да | Шаблон |
| `apps/web/.env.local` | ❌ нет | Реальные значения. **Именно `.env.local`** — это конвенция Next.js для локальных переопределений |

### `apps/api/.env`

```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/minimishki?schema=public"
JWT_SECRET="<сгенерировать>"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
```

Сгенерировать секрет:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### `apps/web/.env.local`

```ini
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

> **Разница между переменными.** Всё, что **не** начинается с `NEXT_PUBLIC_`, доступно
> только на сервере. Переменные с префиксом `NEXT_PUBLIC_` Next.js **встраивает в бандл
> на этапе сборки** — их видно в исходниках страницы в браузере, поэтому секреты
> туда класть нельзя. `NEXT_PUBLIC_API_URL` — адрес публичного API, это не секрет.
