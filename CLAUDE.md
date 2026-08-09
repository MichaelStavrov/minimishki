# Минимишки — сайт детского центра

Монорепозиторий: **frontend на Next.js**, **backend на Nest.js**, база — **PostgreSQL + Prisma**.
Проект создаётся с нуля, текущий этап — заготовка структуры и конфигов.

## Стек

pnpm 10 workspaces + Turborepo 2 · **Next.js 16** (App Router) · TypeScript · Tailwind CSS v4 ·
shadcn/ui · TanStack Query · Nest.js 11 · Prisma · PostgreSQL 16 · JWT + Passport ·
ESLint + Prettier · docker-compose для БД.

## Структура

```
apps/web      — Next.js (порт 3000)
apps/api      — Nest.js (порт 3001)
packages/     — shared, eslint-config, tsconfig
```

---

## ⚠️ Правила работы

Общие правила (русский язык, порционная выдача кода, глубина пояснений, «не додумывать»)
находятся в глобальном `C:\Users\mihal\.claude\CLAUDE.md` и действуют во всех проектах.
Здесь они не дублируются.

**Специфика этого проекта:**

- Ассистент сам редактирует только `CLAUDE.md` и `.claude/.plans/` —
  всё остальное выдаётся кодом в чат.
- После каждого шага обновляется журнал прогресса.
- Решения из таблицы «Принятые решения» не меняются без согласования.

Подробности → [`.claude/.plans/00-process.md`](.claude/.plans/00-process.md)

---

## 📍 Где остановились

Актуальный шаг и чек-лист → **[`.claude/.plans/06-progress.md`](.claude/.plans/06-progress.md)**

---

## Документация проекта

Детали вынесены в [`.claude/.plans/`](.claude/.plans/README.md):

| Файл | Содержание |
|---|---|
| [`00-process.md`](.claude/.plans/00-process.md) | Требования к процессу работы |
| [`01-stack.md`](.claude/.plans/01-stack.md) | Стек, обоснование выборов, окружение, переменные окружения |
| [`02-structure.md`](.claude/.plans/02-structure.md) | Целевая структура монорепозитория |
| [`03-steps.md`](.claude/.plans/03-steps.md) | Пошаговый план (29 шагов, 8 этапов) |
| [`04-domain-model.md`](.claude/.plans/04-domain-model.md) | Готовый `schema.prisma`, связи, индексы |
| [`05-verification.md`](.claude/.plans/05-verification.md) | Проверки по этапам, типовые проблемы |
| [`06-progress.md`](.claude/.plans/06-progress.md) | Журнал прогресса |
| [`07-conventions.md`](.claude/.plans/07-conventions.md) | Соглашения по коду: нейминг, формат API, правила фронтенда |
| [`08-backlog.md`](.claude/.plans/08-backlog.md) | Что делаем после заготовки |

## Окружение

Windows 11 · **git bash** · Node v22.22.3 (nvm-windows) · Git · Docker Desktop · pnpm через corepack.
Подробности → [`01-stack.md`](.claude/.plans/01-stack.md)
