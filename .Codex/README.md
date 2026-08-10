# Минимишки — сайт детского центра

Монорепозиторий: **frontend на Next.js**, **backend на Nest.js**, база — **PostgreSQL + Prisma**.
Проект создаётся с нуля, текущий этап — заготовка структуры и конфигов.

## Стек

pnpm 10 workspaces + Turborepo 2 · **Next.js 16** (App Router) · TypeScript · Tailwind CSS v4 ·
shadcn/ui · TanStack Query · Nest.js 11 · Prisma · PostgreSQL 16 · JWT + Passport ·
ESLint + Prettier · docker-compose для БД.

## Структура

```
apps/web      — Next.js (порт 3000), архитектура — Feature-Sliced Design
apps/api      — Nest.js (порт 3001)
packages/     — shared, eslint-config, tsconfig
```

Во `apps/web` роутинг Next.js лежит в `app/` (в корне приложения), слои FSD — в `src/`,
слои `app` и `pages` переименованы в `_app` и `_pages`.
Подробности → [`02-structure.md`](./plans/02-structure.md#почему-фронтенд-на-fsd)

---

## ⚠️ Правила работы

Общие правила (русский язык, порционная выдача кода, глубина пояснений, «не додумывать»)
находятся в глобальном `C:\Users\mihal\.Codex\AGENTS.md` и действуют во всех проектах.
Здесь они не дублируются.

**Специфика этого проекта:**

- Ассистент сам редактирует только `AGENTS.md`, `.Codex/README.md` и `.Codex/plans/` —
  всё остальное выдаётся кодом в чат.
- После каждого шага обновляется журнал прогресса.
- Решения из таблицы «Принятые решения» не меняются без согласования.

Подробности → [`plans/00-process.md`](./plans/00-process.md)

---

## 📍 Где остановились

Актуальный шаг и чек-лист → **[`plans/06-progress.md`](./plans/06-progress.md)**

---

## Документация проекта

Детали вынесены в [`plans/`](./plans/README.md):

| Файл | Содержание |
|---|---|
| [`00-process.md`](./plans/00-process.md) | Требования к процессу работы |
| [`01-stack.md`](./plans/01-stack.md) | Стек, обоснование выборов, окружение, переменные окружения |
| [`02-structure.md`](./plans/02-structure.md) | Целевая структура монорепозитория |
| [`03-steps.md`](./plans/03-steps.md) | Пошаговый план (29 шагов, 8 этапов) |
| [`04-domain-model.md`](./plans/04-domain-model.md) | Готовый `schema.prisma`, связи, индексы |
| [`05-verification.md`](./plans/05-verification.md) | Проверки по этапам, типовые проблемы |
| [`06-progress.md`](./plans/06-progress.md) | Журнал прогресса |
| [`07-conventions.md`](./plans/07-conventions.md) | Соглашения по коду: нейминг, формат API, правила фронтенда |
| [`08-backlog.md`](./plans/08-backlog.md) | Что делаем после заготовки |

## Окружение

Windows 11 · **git bash** · Node v22.22.3 (nvm-windows) · Git · Docker Desktop · pnpm через corepack.
Подробности → [`01-stack.md`](./plans/01-stack.md)
