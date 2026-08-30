# Минимишки — новая версия действующего сайта детского центра

Монорепозиторий: **frontend на Next.js**, **backend на Nest.js**, база — **PostgreSQL + Prisma**.
Проект создаётся с нуля на **новом, пока не выбранном домене**. Действующий
[минимишки.рф](https://минимишки.рф/) задаёт обязательный набор разделов и услуг,
но новая версия получит новый дизайн и может получить новое наполнение. Изменяемая
информация хранится в базе и по возможности управляется через админку без участия
разработчика. Полная карта исходного сайта —
[`09-current-site-audit.md`](.Codex/plans/09-current-site-audit.md).

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
Подробности → [`02-structure.md`](.Codex/plans/02-structure.md#почему-фронтенд-на-fsd)

---

## ⚠️ Правила работы

Общие правила (русский язык, порционная выдача кода, глубина пояснений, «не додумывать»)
находятся в глобальном `C:\Users\mihal\.Codex\AGENTS.md` и действуют во всех проектах.
Здесь они не дублируются.

**Специфика этого проекта:**

- Ассистент сам редактирует только `AGENTS.md`, `.Codex/README.md` и `.Codex/plans/` —
  всё остальное выдаётся кодом в чат.
- **Исключение для код-ревью:** если пользователь явно просит провести ревью,
  ассистент сам исправляет все найденные замечания непосредственно в файлах
  ревьюируемой фичи, затем повторно проверяет весь diff. Дополнительное согласование
  каждой правки не требуется; правило не разрешает менять файлы вне области ревью
  и не разрешает создавать коммит без отдельной просьбы пользователя.
- После каждого шага обновляется журнал прогресса.
- После каждого завершённого шага ассистент предлагает сообщение коммита по Conventional Commits
  с описанием на русском; сам коммит не создаёт без явной просьбы пользователя.
- Решения из таблицы «Принятые решения» не меняются без согласования.
- Пользователь всегда запускает команды из корня `D:\programming\minimishki`.
  В блоках команд для терминала не выводить предварительный
  `cd /d/programming/minimishki`.

Подробности → [`.Codex/plans/00-process.md`](.Codex/plans/00-process.md)

---

## 📍 Где остановились

Актуальный шаг и чек-лист → **[`.Codex/plans/06-progress.md`](.Codex/plans/06-progress.md)**

---

## Документация проекта

Детали вынесены в [`.Codex/plans/`](.Codex/plans/README.md):

| Файл | Содержание |
|---|---|
| [`00-process.md`](.Codex/plans/00-process.md) | Требования к процессу работы |
| [`01-stack.md`](.Codex/plans/01-stack.md) | Стек, обоснование выборов, окружение, переменные окружения |
| [`02-structure.md`](.Codex/plans/02-structure.md) | Целевая структура монорепозитория |
| [`03-steps.md`](.Codex/plans/03-steps.md) | Пошаговый план (29 шагов, 8 этапов) |
| [`04-domain-model.md`](.Codex/plans/04-domain-model.md) | Готовый `schema.prisma`, связи, индексы |
| [`05-verification.md`](.Codex/plans/05-verification.md) | Проверки по этапам, типовые проблемы |
| [`06-progress.md`](.Codex/plans/06-progress.md) | Журнал прогресса |
| [`07-conventions.md`](.Codex/plans/07-conventions.md) | Соглашения по коду: нейминг, формат API, правила фронтенда |
| [`08-backlog.md`](.Codex/plans/08-backlog.md) | Что делаем после заготовки |
| [`09-current-site-audit.md`](.Codex/plans/09-current-site-audit.md) | Аудит действующего сайта и полный состав переноса |

## Окружение

Windows 11 · **git bash** · Node v22.22.3 (nvm-windows) · Git · Docker Desktop · pnpm через corepack.
Подробности → [`01-stack.md`](.Codex/plans/01-stack.md)
