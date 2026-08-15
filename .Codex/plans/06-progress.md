# Журнал прогресса

> Обновлять после **каждого** выполненного шага.

## ▶️ Текущее состояние

**Следующий шаг: № 7 — `packages/eslint-config`** (этап B).

При старте новой сессии:
1. Прочитать [`00-process.md`](./00-process.md) — требования к процессу работы.
2. Выдать код шага 7: `packages/eslint-config` — `base.js`, `next.js`, `nest.js`
   и `package.json` пакета (flat config). В `next.js` — `import/no-restricted-paths`
   с зонами по слоям FSD.
3. Перед написанием версий пакетов проверять актуальные через `pnpm view <пакет> version`.
   ⚠️ Для `typescript` брать ветку **6.x** (`^6.0.3`), а не `latest` — см. решение в таблице ниже.

### Что уже есть в `D:\programming\minimishki`

```
.git/                    # репозиторий инициализирован
.Codex/                  # контекст и планы проекта
packages/
└── tsconfig/            # @minimishki/tsconfig
    ├── base.json
    ├── nextjs.json
    ├── nestjs.json
    └── package.json
.editorconfig
.gitattributes
.gitignore
.npmrc
.nvmrc
.prettierignore
.prettierrc
AGENTS.md
package.json
pnpm-workspace.yaml
turbo.json
```

### Состояние окружения

- ✅ `git init` выполнен
- ✅ `corepack enable pnpm` выполнен
- ⬜ `pnpm install` **не** запускался — первая установка запланирована
  на контрольную точку **КТ-1** (после шага 8), см. [`03-steps.md`](./03-steps.md)

---

## Чек-лист шагов

Нумерация синхронизирована с [`03-steps.md`](./03-steps.md).

### Этап A — каркас монорепозитория ✅

- [x] Шаг 1 — `.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc` *(09.08.2026)*
- [x] Шаг 2 — корневой `package.json` *(10.08.2026)*
- [x] Шаг 3 — `pnpm-workspace.yaml` *(10.08.2026)*
- [x] Шаг 4 — `turbo.json` (ключ `tasks`, не `pipeline`!) *(10.08.2026)*
- [x] Шаг 5 — `.prettierrc`, `.prettierignore`, `.gitattributes` + правка корневого
  `package.json` *(14.08.2026)*

### Этап B — общие пакеты ← **в работе**

- [x] Шаг 6 — `packages/tsconfig` *(15.08.2026)*
- [ ] Шаг 7 — `packages/eslint-config`
- [ ] Шаг 8 — `packages/shared` (без зависимости от Prisma)
- [ ] 🔧 **КТ-1** — `pnpm install`

### Этап C — инфраструктура

- [ ] Шаг 9 — `docker-compose.yml`
- [ ] Шаг 10 — `.env.example` + создание `.env` / `.env.local`

### Этап D — backend, база

- [ ] Шаг 11 — конфиги `apps/api`
- [ ] Шаг 12 — `prisma/schema.prisma`
- [ ] 🔧 **КТ-2** — `pnpm db:generate` + `pnpm db:migrate`
- [ ] Шаг 13 — валидация env (zod)
- [ ] Шаг 14 — `PrismaModule` / `PrismaService`
- [ ] Шаг 15 — `main.ts` + `app.module.ts` + `src/health/`
- [ ] 🔧 **КТ-3** — первый запуск API, `GET /api/health`

### Этап E — backend, аутентификация

- [ ] Шаг 16 — `src/users/`
- [ ] Шаг 17 — `src/auth/` часть 1 (сервис, контроллер, argon2)
- [ ] Шаг 18 — `src/auth/` часть 2 (стратегия, guards, декораторы)
- [ ] Шаг 19 — `prisma/seed.ts`

### Этап F — backend, доменные модули

- [ ] Шаг 20.1 — `modules/courses/`
- [ ] Шаг 20.2 — `modules/teachers/`
- [ ] Шаг 20.3 — `modules/leads/`
- [ ] Шаг 20.4 — `modules/posts/`
- [ ] Шаг 20.5 — `modules/gallery/`

### Этап G — frontend *(раскладка по FSD)*

- [ ] Шаг 21 — конфиги `apps/web` (Next.js 16), алиас `@/` → `src/`
- [ ] 🔧 **КТ-4** — `pnpm install`
- [ ] Шаг 22 — Tailwind v4 + `src/_app/styles/globals.css`
- [ ] Шаг 23 — `components.json` (алиасы на `shared`) + `src/shared/lib/cn.ts`
- [ ] Шаг 24 — `src/shared/api/`
- [ ] Шаг 25 — `src/_app/providers.tsx`
- [ ] Шаг 26 — `app/layout.tsx`
- [ ] Шаг 27 — слайс `src/_pages/home/` + тонкий `app/page.tsx`

### Этап H — финал

- [ ] Шаг 28 — `README.md`
- [ ] Шаг 29 — сквозная проверка по [`05-verification.md`](./05-verification.md)

---

## Принятые решения

| Решение | Обоснование |
|---|---|
| **Терминал — git bash**, не PowerShell | Решение пользователя. Все команды в планах — в bash-синтаксисе. Пути: в заголовках шагов Windows-стиль (`D:\...`), внутри команд bash-стиль (`/d/...`) |
| **Общие правила — в глобальном `AGENTS.md`** | `C:\Users\mihal\.Codex\AGENTS.md` действует во всех проектах. Проектные файлы содержат только специфику «Минимишек», без дублирования |
| **TypeScript 6.x** (`^6.0.3`), а не 7.x | В npm `latest` — TS 7.0.2, нативный компилятор на Go (GA 08.07.2026). У него **нет программного API компилятора**, а на нём держатся `nest build`, `ts-node` (нужен для `prisma/seed.ts`), `ts-jest` и type-aware правила `typescript-eslint`. Проверено: `typescript-eslint@8.67.0` объявляет peer `typescript >=4.8.4 <6.1.0`. Возврат к 7.x — в [`08-backlog.md`](./08-backlog.md), после выхода 7.1 с программным API |
| **В конфигах TS нет `baseUrl`, `moduleResolution: "node"`, `target: "es5"`** | Все три объявлены устаревшими в TS 6 и будут удалены в 7. Замена: `paths` без `baseUrl`, разрешение модулей — `NodeNext` (бэкенд) и `Bundler` (фронтенд) |
| **В общем пакете `tsconfig` — только флаги, без путей** | Относительные пути (`outDir`, `rootDir`, `paths`, `include`, `exclude`) TypeScript резолвит относительно файла, где они **объявлены**, а не наследующего. `"outDir": "./dist"` в `packages/tsconfig/nestjs.json` собирал бы бэкенд внутрь пакета конфигов. Пути живут в `apps/*/tsconfig.json` |
| **`strictPropertyInitialization: false`** только в `nestjs.json` | DTO для class-validator объявляют поля без инициализатора (`name: string`) — заполняет их `ValidationPipe` уже после создания объекта. При полном `strict` это `TS2564` на каждом поле в нескольких десятках DTO. Альтернатива (`name!: string` везде) отклонена как шум. Остальные строгие проверки сохранены, на `apps/web` послабление не распространяется |
| **`verbatimModuleSyntax` на бэкенде не включаем** | Он подталкивает писать `import type` для классов, используемых только в аннотациях, — а именно эти аннотации `emitDecoratorMetadata` превращает в `design:paramtypes`. Стёртый импорт ломает DI, причём только в рантайме |
| **Пакет `@minimishki/tsconfig` без поля `exports`** | С `exports` доступны только явно перечисленные подпути — пришлось бы вести список вручную. Без него `extends: "@minimishki/tsconfig/base.json"` резолвится обычным путём по файловой системе |
| **Next.js 16**, а не 15 | У 15-й ветки Maintenance LTS до 21.10.2026 — через 2 месяца перестанут выходить security-патчи. 16 — Active LTS до октября 2027 |
| **`packages/shared` не зависит от Prisma** | Иначе `@prisma/client` попал бы в клиентский бандл. В shared — свои `as const`-объекты, рассинхрон ловится проверкой типов на бэкенде |
| **pnpm 10.x**, точная версия в `packageManager` | Corepack по ней подтягивает ровно этот менеджер, lock-файл не расходится между машинами |
| **Turborepo 2.x — ключ `tasks`** | `pipeline` устарел с v2, конфиг с ним не запускается |
| **Контрольные точки установки (КТ-1…КТ-4)** | Backend-код шагов 13–20 без сгенерированного Prisma-клиента не типизируется — писать его вслепую нельзя |
| **Health-эндпоинт в отдельном модуле** `src/health/` | Не засоряем `app.controller.ts`; позже туда же добавится проверка доступности БД |
| **`auth/`, `users/` в `src/`, домены в `src/modules/`** | Инфраструктурные модули пересекают все домены, доменные — независимы и добавляются по одному |
| **Frontend по Feature-Sliced Design** | Решение пользователя. Принято на шаге 1 — `apps/web` ещё не создан, перекладывать нечего. Плоская `components/` со временем превращается в свалку; FSD задаёт границы структурой. Касается только `apps/web`, бэкенд остаётся на модулях Nest |
| **Слои FSD — `_app` и `_pages`**, роутинг Next в `apps/web/app/` | Next.js трактует `src/app` как App Router — одноимённый слой сломал бы роутинг. Подчёркивание — официальная рекомендация FSD, совместима с линтером Steiger |
| **Слои заводятся по мере надобности**, пустых папок нет | Обязателен только `shared`. Полный каркас из шести слоёв на витринном сайте провоцирует искусственные фичи вроде `features/toggle-mobile-menu/` |
| **Правила импортов — `import/no-restricted-paths`**, не Steiger | Ловится в общем `pnpm lint`, без новой зависимости и отдельной команды. Steiger — в отложенном (см. [`01-stack.md`](./01-stack.md)) |
| **`onDelete: SetNull` для `Lead.course`** | Заявка — история обращений, она должна пережить удаление направления |
| **`onDelete: Cascade` для `GalleryItem.post`** | Удалили новость — её фотографии не нужны |
| Версии пакетов «шапкой» (`^`), проверяются перед написанием | Точные версии фиксирует `pnpm-lock.yaml`; брать версии по памяти нельзя |
| **Prettier запускается из корня, без turbo** | Форматирование общерепозиторное: графа зависимостей нет, кешировать нечего, а выигрыш turbo не покрыл бы его же накладные расходы. Turbo-вариант потребовал бы дублировать `prettier` и скрипт `format` в каждом пакете. Скрипты: `format` → `prettier --write .`, `format:check` → `prettier --check .` (для CI, ненулевой код возврата). Задачи `format` в `turbo.json` **нет** |
| `printWidth: 100` в `.prettierrc` | Компромисс: сигнатура сервиса Nest и типовая строка JSX помещаются в строку, при этом два файла рядом читаются на 24" мониторе |
| **`prettier-plugin-tailwindcss` отложен до шага 22** | Плагину для Tailwind v4 нужна опция `tailwindStylesheet` с путём к `globals.css`. Файла пока нет — Prettier падал бы на каждом запуске |
| **`.gitattributes` с `* text=auto eol=lf`** | У пользователя глобально `core.autocrlf=true`: git подменял бы LF на CRLF при checkout, и `pnpm format:check` с `endOfLine: "lf"` падал бы **всегда**, даже сразу после `pnpm format`. Настройка уровня репозитория надёжнее настройки машины — приезжает вместе с `git clone` и перекрывает `core.autocrlf` |
| В `.npmrc` **не** включён `shamefully-hoist` | Сохраняем строгую изоляцию зависимостей pnpm, чтобы ловить неявные импорты |
| `strict-peer-dependencies=false` в `.npmrc` | Иначе `pnpm install` падает на конфликтах peer-зависимостей React 19 / Nest 11 |
| `end_of_line = lf` в `.editorconfig` | Windows по умолчанию CRLF, но Docker-контейнеры и Linux ожидают LF |
| `.env` в `.gitignore`, `!.env.example` разыгнорирован | Секреты не коммитим, шаблон — коммитим |

---

## История сессий

### Сессия 1 — 09.08.2026

- Согласован стек (см. [`01-stack.md`](./01-stack.md)).
- Создан `AGENTS.md` с полным планом.
- Выполнен шаг 1: `.gitignore`, `.editorconfig`, `.nvmrc`, `.npmrc`.
- `git init` + `corepack enable pnpm`.
- План разнесён из `AGENTS.md` по файлам в `.Codex/plans/`, в `AGENTS.md` осталась
  краткая справка со ссылками.
- **Аудит планов.** Найдено 14 проблем, из них 7 критических:
  отсутствующие relation-поля в схеме Prisma (схема не прошла бы `validate`),
  `curl` вместо `curl.exe` в PowerShell, `.env` вместо `.env.local` для Next.js,
  устаревший ключ `pipeline` в turbo, отсутствие контрольных точек установки,
  pnpm 9 вместо 10, Next.js 15 на исходе поддержки.
  Все исправлены. Добавлены `07-conventions.md` и `08-backlog.md`.
- **Правила разнесены по уровням.** Общие правила (язык, «не додумывать», порционная
  выдача кода, глубина пояснений, окружение) перенесены в глобальный
  `C:\Users\mihal\.Codex\AGENTS.md` — действуют во всех проектах.
  В проектных файлах осталась только специфика «Минимишек».
- **Переход на git bash.** Все команды в планах переведены с PowerShell на bash-синтаксис
  (`cp` вместо `Copy-Item`, `curl` вместо `curl.exe`, `&&` вместо `; if ($?) {}`).
  Добавлены грабли git bash на Windows: MSYS-преобразование путей, `winpty`
  для интерактивных программ.
- **Коммиты и ветвление — в глобальные правила.** В `C:\Users\mihal\.Codex\AGENTS.md`
  добавлены разделы 11 (Conventional Commits, описание на русском) и 12 (GitHub Flow:
  `main` всегда рабочий, задачи — в ветках `feat/…`, слияние через PR).
  В `07-conventions.md` снято прежнее «Conventional Commits не подключаем».
- **Фронтенд переведён на Feature-Sliced Design.** Решение принято до написания
  кода `apps/web`, поэтому обошлось правкой документации.
  Переписаны: раскладка `apps/web` в `02-structure.md` (+ раздел «Почему фронтенд
  на FSD»), фронтенд-раздел `07-conventions.md` (слайсы, сегменты, публичный API,
  антипаттерны, оговорка про RSC и `index.server.ts`), шаги 21–27 и шаг 7
  в `03-steps.md`. Ключевое: роутинг Next — в `apps/web/app/`, слои — в `src/`,
  `app`/`pages` переименованы в `_app`/`_pages`.

### Сессия 2 — 10.08.2026

- Выполнен шаг 2: создан и проверен корневой `package.json`.
  Версии совпадают: `pnpm@10.34.5`, `turbo@^2.10.9`.
- Выполнен шаг 3: создан `pnpm-workspace.yaml` для пакетов `apps/*` и `packages/*`.
- Выполнен шаг 4: создан `turbo.json` с ключом `tasks`, настройками кеша и `globalEnv`.
- Документация перенесена в `.Codex/`; проектный обзор находится в `.Codex/README.md`.
  Исходные папка планов и устаревший проектный обзор удалены.

### Сессия 3 — 14.08.2026

- Выполнен шаг 5 — этап A закрыт.
- Созданы `.prettierrc` (`printWidth: 100`, одинарные кавычки, `endOfLine: "lf"`,
  `proseWrap: "preserve"` для Markdown) и `.prettierignore`.
- **Найдена нестыковка в шаге 2.** Корневой `package.json` содержал
  `"format": "turbo run format"`, но задачи `format` в `turbo.json` не было и `prettier`
  нигде не был объявлен — `pnpm format` завершался бы ошибкой
  `Could not find task "format"`. Исправлено: Prettier запускается из корня напрямую,
  turbo.json не трогали.
- **Найдена вторая проблема — CRLF.** `git diff` предупреждал
  `LF will be replaced by CRLF`: глобальный `core.autocrlf=true` при отсутствующем
  `.gitattributes`. В связке с `endOfLine: "lf"` это давало бы вечно красный
  `pnpm format:check` на Windows при зелёном CI на Linux. Добавлен `.gitattributes`
  (`* text=auto eol=lf`, пометки `binary` для изображений и шрифтов,
  `pnpm-lock.yaml -diff linguist-generated=true`), выполнен `git add --renormalize .`.
  Проверено: `git check-attr text eol -- package.json` → `text: auto`, `eol: lf`,
  предупреждение исчезло.
- **Код-ревью шага.** Блокирующих замечаний нет. Закрыты два: `.Codex/` и `AGENTS.md`
  исключены из форматирования (Prettier выравнивал бы Markdown-таблицы и давал дифф
  на сотни строк в документации при каждом `pnpm format`); в `.gitattributes` добавлено
  исключение `eol=crlf` для `*.bat` / `*.cmd` / `*.ps1`. Осознанно оставлены как есть:
  дублирование `node_modules/*` в `.prettierignore` и явно прописанные опции
  `.prettierrc`, совпадающие с дефолтами Prettier 3 — страховка на случай мажорного
  обновления форматтера.
- Версия проверена командой: `prettier@3.9.6`.
- Полная проверка форматирования отложена до **КТ-1** — бинарника `prettier`
  в `node_modules` пока нет.

### Сессия 4 — 15.08.2026

- Выполнен шаг 6: создан пакет `packages/tsconfig` — `package.json`, `base.json`,
  `nextjs.json`, `nestjs.json`.
- **Развилка по версии TypeScript.** При проверке версий выяснилось, что `latest`
  в npm — TS 7.0.2 (нативный компилятор на Go, GA 08.07.2026), у которого нет
  программного API компилятора: `nest build`, `ts-node`, `ts-jest` и type-aware правила
  `typescript-eslint` на нём не работают. Проверено напрямую:
  `typescript-eslint@8.67.0` → peer `typescript >=4.8.4 <6.1.0`;
  `@nestjs/cli@11.0.24` тянет `typescript@5.9.3`. Решение: закрепить `typescript@^6.0.3`,
  переход на 7.x — в бэклоге.
- Уровень строгости выбран «строго без экзотики»: `strict: true` плюс `isolatedModules`,
  `skipLibCheck`, `forceConsistentCasingInFileNames`, `noFallthroughCasesInSwitch`,
  `esModuleInterop`. Без `noUncheckedIndexedAccess` и `exactOptionalPropertyTypes`.
- **Поймана ошибка в собственном плане шага.** В `nestjs.json` был запланирован
  `"outDir": "./dist"` — но относительные пути резолвятся относительно объявляющего
  файла, и сборка ушла бы в `packages/tsconfig/dist/`. Путь перенесён в шаг 11
  (`apps/api/tsconfig.json`). То же правило раньше уже применили к `paths` фронтенда.
- Работа впервые ведётся по GitHub Flow: ветка `chore/tsconfig-package`, слияние
  через PR (шаги 1–5 коммитились прямо в `main`).
- Код-ревью шага пользователь не запрашивал.
- Проверено: все четыре файла парсятся как JSON, `git status` видит `packages/`.
  Симлинк `node_modules/@minimishki/tsconfig` и `pnpm format:check` — на **КТ-1**.
