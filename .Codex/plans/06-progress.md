# Журнал прогресса

> Обновлять после **каждого** выполненного шага.

## ▶️ Текущее состояние

**Следующий шаг: № 13 — валидация окружения** (этап D, backend и база).
Шаг 12 закрыт, 🔧 **КТ-2 пройдена**: база развёрнута, клиент Prisma сгенерирован.

При старте новой сессии:
1. Прочитать [`00-process.md`](./00-process.md) — требования к процессу работы.
2. Выдать код шага 13 — описание в [`03-steps.md`](./03-steps.md):
   `src/config/env.validation.ts` + `src/config/configuration.ts`,
   `ConfigModule.forRoot({ isGlobal: true, validate })`.
   ⚠️ В проекте стоит **zod 4** (`^4.4.3`), а не 3.x: у неё другой API верхнеуровневых
   валидаторов (`z.email()` вместо `z.string().email()` и т.п.). Примеры из статей
   про zod 3 копировать нельзя — сверяться с установленной версией.
3. Перед написанием версий пакетов проверять актуальные через `pnpm view <пакет> version`.
   ⚠️ Два пакета, где `latest` брать **нельзя**: `typescript` (нужна ветка **6.x**)
   и `eslint` (нужна ветка **9.x**) — см. решения в таблице ниже.

### Что уже есть в `D:\programming\minimishki`

```
.git/                    # репозиторий инициализирован, remote → GitHub
.Codex/                  # контекст и планы проекта
apps/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │       ├── 20260815191636_init/migration.sql
│   │       └── migration_lock.toml
│   ├── package.json     # имя пакета — api (под pnpm --filter api)
│   ├── tsconfig.json    # rootDir ./src, outDir ./dist, prisma/ исключён
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   ├── .env.example     # в git
│   └── .env             # локальный, в git не идёт
└── web/
    ├── .env.example     # в git
    └── .env.local       # локальный, в git не идёт
packages/
├── tsconfig/            # @minimishki/tsconfig
│   ├── base.json
│   ├── nextjs.json
│   ├── nestjs.json
│   └── package.json
├── eslint-config/       # @minimishki/eslint-config
│   ├── base.js
│   ├── next.js
│   ├── nest.js
│   └── package.json
└── shared/              # @minimishki/shared
    ├── src/
    │   ├── index.ts
    │   ├── enums.ts
    │   └── dto/
    │       ├── common.dto.ts
    │       ├── user.dto.ts
    │       ├── course.dto.ts
    │       ├── teacher.dto.ts
    │       ├── post.dto.ts
    │       ├── gallery.dto.ts
    │       └── lead.dto.ts
    ├── tsconfig.json
    └── package.json
.editorconfig
.gitattributes
.gitignore
.npmrc
.nvmrc
.prettierignore
.prettierrc
AGENTS.md
docker-compose.yml
package.json
pnpm-workspace.yaml
turbo.json
```

### Состояние окружения

- ✅ `git init` выполнен
- ✅ `corepack enable pnpm` выполнен
- ✅ `pnpm install` выполнен на КТ-1 *(15.08.2026)* — создан `pnpm-lock.yaml`,
  три локальных пакета подключены симлинками
- ✅ `pnpm --filter @minimishki/shared build` — `dist/` собирается
- ✅ `pnpm format:check` — `All matched files use Prettier code style`
- ✅ **Расширение Prisma для VS Code откачено до `6.19.0`** *(15.08.2026)*, автообновление
  ему отключено. Версии расширения совпадали с версиями Prisma до 7.0.0 (19.11.2025),
  дальше пошла собственная нумерация 31.x — она несёт языковой сервер 7-й ветки
  и подчёркивает `url` в `datasource` как ошибку, хотя для Prisma 6 это норма
- ✅ Docker Desktop работает через WSL 2 *(15.08.2026)* — движок 29.7.2,
  Compose v5.3.1. Понадобилась установка WSL 2 (`wsl --install --no-distribution`)
  и перезагрузка: Windows 11 Домашняя не даёт Docker бэкенд Hyper-V
- ✅ `docker compose up -d postgres` — контейнер `minimishki-postgres` в состоянии
  `healthy`, volume `minimishki_pgdata` создан, `psql` отвечает: PostgreSQL 16.15,
  база `minimishki`, пользователь `postgres`

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

### Этап B — общие пакеты ✅

- [x] Шаг 6 — `packages/tsconfig` *(15.08.2026)*
- [x] Шаг 7 — `packages/eslint-config` *(15.08.2026)*
- [x] Шаг 8 — `packages/shared` (без зависимости от Prisma) *(15.08.2026)*
- [x] 🔧 **КТ-1** — `pnpm install` *(15.08.2026)*

### Этап C — инфраструктура ✅

- [x] Шаг 9 — `docker-compose.yml` *(15.08.2026)*
- [x] Шаг 10 — `.env.example` + создание `.env` / `.env.local` *(15.08.2026)*

### Этап D — backend, база ← **текущий**

- [x] Шаг 11 — конфиги `apps/api` + правка `turbo.json` *(15.08.2026)*
- [x] Шаг 12 — `prisma/schema.prisma` *(15.08.2026)*
- [x] 🔧 **КТ-2** — миграция `20260815191636_init`, клиент сгенерирован *(15.08.2026)*
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
| **Prisma 6.19.3**, а не 7.x | Решение пользователя из двух предложенных вариантов. В npm `latest` — 7.9.1, и она устроена иначе: генератор `prisma-client` вместо `prisma-client-js`, обязательный `output` (клиент генерируется в исходники проекта, а не в `node_modules`), строка подключения убрана из схемы в отдельный `prisma.config.ts` плюс зависимость `dotenv`. Проверено запуском `prisma@7.9.1 init` в песочнице. Взяли 6-ю ветку: схема из [`04-domain-model.md`](./04-domain-model.md) идёт без правок, клиент импортируется привычно из `@prisma/client`, материалы в сети — про неё же. Переход на 7 — в [`08-backlog.md`](./08-backlog.md) |
| **`"dependsOn": ["^build"]` у задачи `dev`** в `turbo.json` | Решение пользователя, закрывает открытый вопрос сессии 5. Крышка — «в зависимостях пакета», то есть перед `dev` собирается `@minimishki/shared`, иначе на чистом репозитории API падает на `Cannot find module '@minimishki/shared'`. Ограничение turbo не нарушено: зависеть **от** persistent-задач нельзя, а `build` — обычная. Побочный плюс: у `shared` есть свой `dev` (`tsc --watch`), поэтому правки общих типов теперь подхватываются без ручной пересборки |
| **Имя пакета бэкенда — `api`**, без области `@minimishki/` | В корневом `package.json` уже записаны `pnpm --filter api db:migrate` и ещё три команды `db:*`. Фильтр сопоставляется с полем `name` — с `@minimishki/api` все они перестали бы находить пакет |
| **`rootDir: "./src"` в `apps/api/tsconfig.json`** + отдельный `tsconfig` для сида | Из двух вариантов, записанных на шаге 7, выбран второй. `rootDir` фиксирует форму вывода: `src/main.ts` → `dist/main.js`, и `entryFile: "main"` в `nest-cli.json` попадает в цель. Без него корень вычисляется как общий предок включённых файлов — добавление `prisma/seed.ts` молча переехало бы в `dist/src/main.js`. Сид получит собственный `prisma/tsconfig.json` на шаге 19; он нужен ещё и линтеру: `projectService` ищет ближайший вверх по дереву `tsconfig.json`, а корневой конфиг приложения сид исключает |
| **`@types/node` из ветки 22.x**, а не `latest` | В `latest` — 26.2.0, но в `.nvmrc` записан Node 22. С типами от Node 26 компилятор разрешил бы вызвать API, которых в рантайме нет |
| **`pnpm.onlyBuiltDependencies`: `@prisma/client`, `@prisma/engines`, `argon2`, `prisma`** | pnpm 10 блокирует `postinstall` зависимостей. Этим четырём он нужен по делу: `@prisma/engines` скачивает бинарные движки (~100 МБ, без них не работают `migrate` и `generate`), `argon2` — нативный модуль, без своего `.node` не грузится вовсе. Записано декларативно в `package.json`, а не через интерактивный `pnpm approve-builds`: настройка едет вместе с репозиторием. `unrs-resolver` остаётся в `ignoredBuiltDependencies` — ему скрипт не нужен |
| **Ветки вливаются через PR на GitHub** | С 15.08.2026 у проекта есть удалённый репозиторий `MichaelStavrov/minimishki`. Прежняя оговорка «PR технически невозможен, сливаем локальным merge-коммитом» (сессии 4–5) больше не действует — работаем по GitHub Flow из глобальных правил в полном виде. `gh` не установлен: PR создаётся через веб-интерфейс, ветка после слияния удаляется кнопкой **Delete branch** либо командой `git push origin --delete <ветка>` |
| **Терминал — git bash**, не PowerShell | Решение пользователя. Все команды в планах — в bash-синтаксисе. Пути: в заголовках шагов Windows-стиль (`D:\...`), внутри команд bash-стиль (`/d/...`) |
| **Общие правила — в глобальном `AGENTS.md`** | `C:\Users\mihal\.Codex\AGENTS.md` действует во всех проектах. Проектные файлы содержат только специфику «Минимишек», без дублирования |
| **ESLint 9.x** (`^9.39.5`), а не 10.x | Проверено запуском: `eslint-config-next@16.3.1` на ESLint 10.8.1 падает — `TypeError: contextOrFilename.getFilename is not a function` в `eslint-plugin-react@7.37.5`. ESLint 10 убрал legacy-API правил, а Next тянет `eslint-plugin-react`, `eslint-plugin-import` и `eslint-plugin-jsx-a11y` с peer до `^9`. Установка проходит (у нас `strict-peer-dependencies=false`), ошибка вылезает только на запуске. На 9.39.5 та же связка отрабатывает штатно |
| **`types: ["node"]` обязателен в `base.json`** | **TypeScript 6 больше не подключает `@types/*` автоматически.** Проверено на одном и том же конфиге и `node_modules`: TS 5.9.3 → `exit 0`, TS 6.0.3 → `TS2584: Cannot find name 'console'`. Ни родительский `node_modules`, ни `typeRoots` не помогают — только явное перечисление. Без этого бэкенд не компилируется вовсе (`process`, `console`, `Buffer`) |
| **`eslint-import-resolver-typescript` обязателен** | Без него `import/no-restricted-paths` **молча не работает**: правило пропускает импорты, которые не смогло разрешить, а стандартный резолвер не находит `.ts` без расширения. Проверено — на заведомом нарушении FSD линтер отчитывался «0 проблем». С резолвером ловится и относительный путь, и алиас `@/_pages/home` |
| **`eslint-plugin-import`, а не форк `import-x`** | Форк активнее поддерживается и знает про ESLint 10, но требует префикса `import-x/`, расходясь с записанным в планах `import/`. К тому же оригинал всё равно приходит транзитивно через `eslint-config-next` — были бы оба в дереве |
| **`eslint-config-next/core-web-vitals`**, а не базовый вход | Витринный сайт находят через поиск, Core Web Vitals влияют на ранжирование. Правила ловят `<img>` вместо `next/image` и `<a>` вместо `next/link`. Откат — правка одной строки импорта |
| **Type-aware правила включены везде** | `recommendedTypeChecked` через `projectService: true`. Ради `no-floating-promises`: забытый `await` в сервисе Nest молча теряет запись в БД, контроллер при этом отдаёт `201`. Цена — `pnpm lint` строит полную программу TS и заметно медленнее |
| **`tsconfigRootDir: process.cwd()`** в общем ESLint-конфиге | `import.meta.dirname` указывал бы на `packages/eslint-config/`, а нужна папка проверяемого приложения. Следствие: `eslint` запускается **из папки приложения** — так и делает `turbo run lint` |
| **TypeScript 6.x** (`^6.0.3`), а не 7.x | В npm `latest` — TS 7.0.2, нативный компилятор на Go (GA 08.07.2026). У него **нет программного API компилятора**, а на нём держатся `nest build`, `ts-node` (нужен для `prisma/seed.ts`), `ts-jest` и type-aware правила `typescript-eslint`. Проверено: `typescript-eslint@8.67.0` объявляет peer `typescript >=4.8.4 <6.1.0`. Возврат к 7.x — в [`08-backlog.md`](./08-backlog.md), после выхода 7.1 с программным API |
| **В конфигах TS нет `baseUrl`, `moduleResolution: "node"`, `target: "es5"`** | Все три объявлены устаревшими в TS 6 и будут удалены в 7. Замена: `paths` без `baseUrl`, разрешение модулей — `NodeNext` (бэкенд) и `Bundler` (фронтенд) |
| **В общем пакете `tsconfig` — только флаги, без путей** | Относительные пути (`outDir`, `rootDir`, `paths`, `include`, `exclude`) TypeScript резолвит относительно файла, где они **объявлены**, а не наследующего. `"outDir": "./dist"` в `packages/tsconfig/nestjs.json` собирал бы бэкенд внутрь пакета конфигов. Пути живут в `apps/*/tsconfig.json` |
| **`strictPropertyInitialization: false`** только в `nestjs.json` | DTO для class-validator объявляют поля без инициализатора (`name: string`) — заполняет их `ValidationPipe` уже после создания объекта. При полном `strict` это `TS2564` на каждом поле в нескольких десятках DTO. Альтернатива (`name!: string` везде) отклонена как шум. Остальные строгие проверки сохранены, на `apps/web` послабление не распространяется |
| **`verbatimModuleSyntax` на бэкенде не включаем** | Он подталкивает писать `import type` для классов, используемых только в аннотациях, — а именно эти аннотации `emitDecoratorMetadata` превращает в `design:paramtypes`. Стёртый импорт ломает DI, причём только в рантайме |
| **Пакет `@minimishki/tsconfig` без поля `exports`** | С `exports` доступны только явно перечисленные подпути — пришлось бы вести список вручную. Без него `extends: "@minimishki/tsconfig/base.json"` резолвится обычным путём по файловой системе |
| **Next.js 16**, а не 15 | У 15-й ветки Maintenance LTS до 21.10.2026 — через 2 месяца перестанут выходить security-патчи. 16 — Active LTS до октября 2027 |
| **`packages/shared` не зависит от Prisma** | Иначе `@prisma/client` попал бы в клиентский бандл. В shared — свои `as const`-объекты, рассинхрон ловится проверкой типов на бэкенде |
| **`shared` — компилируемый пакет с `dist/`**, а не source-only с `exports` на `src/*.ts` | Вариант «без сборки» (JIT-пакет, который рекомендует Vercel для Turborepo) удобнее в разработке, но ломает бэкенд: `nest build` через `tsc` не эмитит `.ts` из `node_modules`, файлы вне `rootDir` в вывод не попадают, и в рантайме `require('@minimishki/shared')` упирается в `.ts`. Обход потребовал бы `paths` в `apps/api` и сломал бы структуру `dist`. Цена решения: перед первым `pnpm dev` нужен `pnpm build`, при правке shared — пересборка или `pnpm --filter @minimishki/shared dev` (`tsc --watch`) |
| **`"types": []` в `packages/shared/tsconfig.json`** | В `base.json` стоит `types: ["node"]`, но `@types/node` в зависимостях `shared` нет, а pnpm держит строгую изоляцию — `tsc` упал бы на `TS2688: Cannot find type definition file for 'node'` ещё до проверки кода. Добавлять `@types/node` ради неиспользуемых типов не стали: пакет уезжает в браузерный бандл, и пустой список заодно не даёт случайно дёрнуть `process.env` |
| **В `shared/dto/` — только типы ответов API**, без типов тел запросов | Решение пользователя из двух предложенных вариантов. Валидация всё равно живёт в DTO-классах Nest с декораторами `class-validator`, которые на фронтенде неприменимы; общий тип запроса дублировал бы их и разъезжался с ними |
| **Даты в DTO — `string`, а не `Date`** | По сети данные едут через `JSON.stringify` (дата → строка ISO 8601), а `JSON.parse` обратно в `Date` не разворачивает. С типом `Date` компилятор разрешил бы `createdAt.getFullYear()` на строке — падение в рантайме при зелёной сборке |
| **`\| null` для nullable-полей, `?` — только для связей** | Необязательное поле Prisma (`imageUrl String?`) приходит как `null`, а не отсутствует. Знак `?` зарезервирован под другой случай: связи (`teachers`, `gallery`, `course`) приходят только при запросе с `include`, то есть одна сущность приезжает в двух формах |
| **Суффикс `Dto` в именах типов** (`CourseDto`, а не `Course`) | На бэкенде в одном файле окажутся и модель Prisma `Course`, и тип ответа. Одинаковые имена там гарантируют путаницу |
| **`pnpm.ignoredBuiltDependencies: ["unrs-resolver"]`** в корневом `package.json` | pnpm 10 по умолчанию не выполняет `postinstall` зависимостей (защита цепочки поставки) и предупреждает об этом при каждой установке. Разрешать сборку не нужно: нативный бинарник резольвера приезжает через `optionalDependencies` (`@unrs/resolver-binding-win32-x64-msvc`), а `postinstall` — лишь запасной путь. Проверено загрузкой модуля: `ResolverFactory` и остальной API поднимаются. Поле гасит предупреждение и фиксирует решение в репозитории |
| **Поимённые реэкспорты в `shared/src/index.ts`**, без `export *` | Файл читается как оглавление публичного API пакета, и новый тип не протекает наружу просто потому, что кто-то создал файл в `src/dto/`. Тот же принцип, что у публичного API слайса в FSD |
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
- Выполнен шаг 7: создан пакет `packages/eslint-config` — `package.json`, `base.js`,
  `next.js`, `nest.js` (flat config, ESM).
- **Конфиги проверены вживую**, а не только написаны. В песочнице собран стенд
  на тех же версиях пакетов (`eslint@9.39.5`, `typescript@6.0.3`,
  `eslint-config-next@16.3.1`, `typescript-eslint@8.67.0`) с раскладкой FSD и
  типовыми формами кода Nest. Результаты — четыре находки, все занесены в решения:
  1. **ESLint 10 не работает** с `eslint-config-next` — падает на `eslint-plugin-react`.
     Перешли на ветку 9.x.
  2. **`import/no-restricted-paths` без TS-резолвера молча бездействует** —
     на заведомом нарушении слоёв выдавал «0 проблем».
  3. **TypeScript 6 не подключает `@types/*` автоматически** — понадобилась правка
     `base.json` из шага 6 (добавлен `types: ["node"]`).
  4. Конфликта плагинов между нашим конфигом и `eslint-config-next` **нет** —
     опасение про «Cannot redefine plugin» не подтвердилось.
- Проверено, что срабатывают: зоны FSD (в том числе через алиас `@/`),
  `no-floating-promises` на TypeScript 6, исключение `no-console` для `prisma/seed.ts`.
  Типовой код Nest (пустой класс модуля, конструктор с параметрами-свойствами,
  DTO без инициализатора) проходит `recommendedTypeChecked` без замечаний —
  отключать `no-extraneous-class` и `no-empty-function` не понадобилось.
- **Находка для шага 11:** `rootDir: "./src"` в `apps/api/tsconfig.json` несовместим
  с включением `prisma/seed.ts` — `TS6059: File is not under rootDir`. Решать
  отсутствием `rootDir` либо отдельным `tsconfig` для сида.
- Код-ревью шага пользователь не запрашивал.

### Сессия 5 — 15.08.2026

- Выполнен шаг 8: создан пакет `packages/shared` — `package.json`, `tsconfig.json`,
  `src/enums.ts`, `src/index.ts` и семь файлов в `src/dto/`. **Этап B закрыт.**
- **Две развилки вынесены пользователю** (обе занесены в таблицу решений):
  способ поставки пакета — компилируемый `dist/` против source-only,
  и объём `dto/` — только ответы против ответов вместе с типами запросов.
  Выбраны первый и первый.
- Версия проверена командой: в ветке 6.x последняя — `typescript@6.0.3`
  (в npm `latest` по-прежнему 7.0.2, берём не его).
- `ROLE` и `LEAD_STATUS` — `as const`-объекты вместо `enum` TypeScript: `enum` —
  единственная конструкция TS, которая не стирается при компиляции, а разворачивается
  в объект с двусторонним отображением. В пакете, уезжающем в браузер, это лишний рантайм.
- Циклическая ссылка `course.dto.ts` ↔ `teacher.dto.ts` безопасна: импорты помечены
  `import type` и стираются, в JavaScript цикла не остаётся.
- Проверено, что правило `dist/` в `.gitignore` действует на любом уровне вложенности —
  `packages/shared/dist/` в коммит не попадёт, отдельная запись не нужна.
- **Открытый вопрос для шага 11:** задача `dev` в `turbo.json` не имеет `dependsOn`,
  поэтому на чистом репозитории API стартует раньше, чем соберётся `shared`,
  и падает на `Cannot find module '@minimishki/shared'`. Варианты: разовый `pnpm build`
  перед первым `pnpm dev` либо `"dependsOn": ["^build"]` в задаче `dev`.
  Правка `turbo.json` меняет принятое решение — выносится пользователю на шаге 11.
- Компиляция пакета **не проверена**: `tsc` в проекте пока нет. Проверка —
  на КТ-1 командой `pnpm --filter @minimishki/shared build`.
- Код-ревью шага пользователь не запрашивал.
- Ветка `chore/shared-package`, слияние локальным merge-коммитом:
  удалённого репозитория у проекта нет, PR технически невозможен.

#### КТ-1 пройдена — и вскрыла две ошибки

`pnpm install` прошёл штатно, три пакета видны монорепозиторию. Дальше — находки.

- **Предупреждение `Ignored build scripts: unrs-resolver`** — разобрано, это штатное
  поведение pnpm 10, а не проблема. Решение занесено в таблицу.
- 🐞 **`packages/eslint-config/base.js` содержал текст `packages/tsconfig/base.json`.**
  Вскрыл `pnpm format:check`: Prettier разбирал `.js` как JavaScript и падал на
  `"$schema":`. По `git show 5d908e4` файл был закоммичен таким **ещё на шаге 7** —
  в прошлой сессии в него уехало содержимое соседнего файла, и пакет ESLint-конфигов
  всё это время был нерабочим. Корректной версии в истории git **нет**, поэтому файл
  написан заново по решениям из таблицы, а не восстановлен.
  **Проверен запуском** на подопытном файле в одноразовом стенде: `no-floating-promises`
  срабатывает (значит, `projectService` строит полную программу TypeScript),
  исключение `^_` в `no-unused-vars` работает, `no-console` предупреждает на `console.log`
  и молчит на `console.error` из списка `allow`.
  Отличие от прежней версии, которое стоит знать: `base.js` **не регистрирует**
  плагин `import`, только задаёт `settings['import/resolver'].typescript`. Сам плагин
  на фронтенде приходит из `eslint-config-next`, а на бэкенде правил `import/*` нет.
  Так исключается риск `Cannot redefine plugin` при двойной регистрации.
- 🐞 **В `packages/shared/src/` не было `index.ts`.** Файл был выдан в чат, но не вставлен,
  а ассистент закоммитил шаг, не сверив список файлов. `tsc` при этом отработал без
  ошибок — собирать было что, — но `dist/index.js`, на который указывает `main`,
  отсутствовал, и `import ... from '@minimishki/shared'` упал бы с `Cannot find module`.
  Файл добавлен, сборка перезапущена, точка входа проверена: `require('./packages/shared')`
  отдаёт `ROLE` и `LEAD_STATUS`, ровно два экспорта — типы стёрты, как и ожидалось.
- **Вывод на будущее:** после каждого шага сверять `git status` со списком выданных
  файлов **до** коммита. Обе ошибки — пропущенная вставка, и обе прошли бы дальше,
  если бы не проверки контрольной точки.

### Сессия 6 — 15.08.2026

- Выдан код шага 9 — `docker-compose.yml`: `postgres:16-alpine` (порт 5432, база
  `minimishki`, именованный volume `pgdata`, healthcheck через `pg_isready`) и
  `dpage/pgadmin4:9` (порт 5050→80, профиль `tools`, `depends_on` с условием
  `service_healthy`). Задано имя проекта Compose `name: minimishki`, чтобы volume
  назывался предсказуемо и не терялся при переименовании каталога.
- **Предположения, озвученные явно** (в планах их не было): логин/пароль Postgres —
  `postgres` / `postgres` (взято из `DATABASE_URL` в `01-stack.md`); вход в pgAdmin —
  `admin@minimishki.local` / `admin`; тег pgAdmin пинуется по мажору (`:9`, актуальный
  релиз на дату — 9.17), по аналогии с `postgres:16-alpine`.
- Именованный volume вместо bind-mount — принципиально для Windows: bind-mount идёт
  через прослойку между Windows и Linux-VM, которая не даёт Postgres нужных POSIX-прав
  и семантики `fsync`.
- 🚧 **Проверка шага сорвалась: Docker Desktop не запустился** — «Virtualization
  support not detected». Диагностика показала, что дело **не** в UEFI:
  `HypervisorPresent: True`, VBS (Device Guard) в состоянии `2` — running, то есть
  VT-x включён. Причина другая — `wsl --status` отвечал «Подсистема Windows для Linux
  не установлена». Windows 11 **Домашняя** (build 26200): Hyper-V как бэкенд там
  недоступен, Docker Desktop умеет работать только через WSL 2.
  Выдана команда `wsl --install --no-distribution` (из PowerShell с правами
  администратора) + перезагрузка. Флаг `--no-distribution` — потому что Docker Desktop
  разворачивает собственные дистрибутивы `docker-desktop` / `docker-desktop-data`,
  Ubuntu ему не нужна.
  ⚠️ Значение `VirtualizationFirmwareEnabled: False` в `Win32_Processor` — **ложный
  сигнал**: когда система сама работает под гипервизором, WMI не может опросить
  firmware. Смотреть надо на `HypervisorPresent`.
- Сессия прервана перезагрузкой. Коммит не предлагался, код-ревью не запрашивалось.

### Сессия 7 — 15.08.2026

- **Шаг 9 закрыт.** После установки WSL 2 и перезагрузки Docker Desktop поднялся:
  движок `29.7.2`, Compose `v5.3.1`. Файл `docker-compose.yml` из сессии 6 вставлен
  пользователем без изменений.
- Проверка по плану пройдена: `docker compose ps` показывает `minimishki-postgres`
  в состоянии `Up (healthy)` с пробросом `0.0.0.0:5432->5432/tcp`, то есть healthcheck
  `pg_isready` отработал. Создан volume `minimishki_pgdata` — префикс `minimishki_`
  подтверждает, что ключ `name:` в compose-файле действует.
- Дополнительно проверено соединение с базой изнутри контейнера:
  `psql -U postgres -d minimishki` отдаёт `minimishki | postgres | 16.15`.
  То есть переменные `POSTGRES_DB` / `POSTGRES_USER` применились при инициализации
  кластера, а не остались декларацией.
- pgAdmin **не проверялся**: сервис под профилем `tools` и по умолчанию не поднимается.
  Отдельная проверка — при первой реальной надобности заглянуть в базу.
- **Появился удалённый репозиторий** — https://github.com/MichaelStavrov/minimishki.
  Вся история (шаги 1–8, КТ-1) опубликована, шаг 9 влит через **PR #1** — впервые
  по-настоящему, а не локальным merge-коммитом, как в сессиях 4–5.
  `gh` (CLI GitHub) на машине нет, PR создавался через веб-интерфейс.
- Выполнен шаг 10: `apps/api/.env.example` и `apps/web/.env.example`, из них скопированы
  реальные `apps/api/.env` и `apps/web/.env.local`. Набор переменных — ровно как
  в [`01-stack.md`](./01-stack.md), ничего не добавлялось.
- Проверено, что правило `!.env.example` в `.gitignore` работает как задумано:
  `git status` показывает только два шаблона, а `git check-ignore -v` подтверждает,
  что реальные файлы скрыты строками 18 (`.env`) и 19 (`.env.local`).
  `JWT_SECRET` в `apps/api/.env` — 64 hex-символа, то есть сгенерирован командой,
  а не оставлен пустым, как в шаблоне.
- Папки `apps/api` и `apps/web` пока содержат **только файлы окружения** — это нормально,
  остальное появится на шагах 11 и 21.
- Выполнен шаг 11: `apps/api/package.json`, `tsconfig.json`, `nest-cli.json`,
  `eslint.config.mjs` + правка корневого `turbo.json`. Nest — 11.2.1 (в npm это `latest`,
  12-я ветка пока в альфе), внутри `@nestjs/platform-express` едет **Express 5**,
  поэтому типы взяты `@types/express@^5`.
- **Две развилки вынесены пользователю** (обе в таблице решений): версия Prisma —
  6 против 7, и открытый вопрос сессии 5 про `dependsOn` у задачи `dev`.
  Выбраны Prisma 6.19.3 и добавление `"dependsOn": ["^build"]`.
- 🚧 **`pnpm install` завис на 8 минут.** Диагностика по системе, а не по догадкам:
  CPU процесса `node` стоял на 16.6 с и не рос, store на `D:\.pnpm-store` не менялся
  (17 353 файла, 278 МБ), при этом девять TCP-соединений к `104.16.11.34:443`
  (Cloudflare перед `registry.npmjs.org`), открытых в момент старта, висели
  в состоянии `Established`. Прямая проверка реестра из другого процесса —
  `200` за 2 секунды. Вывод: сокеты «мёртвые», ответа по ним не пришло, а таймаут
  pnpm не сработал. Лечится `Ctrl+C` и повторным запуском — прогресс лежит в store.
  Запасной вариант на будущее: `pnpm install --network-concurrency=4` (по умолчанию
  pnpm открывает до 16 соединений сразу).
- 🐞 **`Ignored build scripts: @prisma/client, @prisma/engines, argon2, prisma`** —
  в отличие от прошлого случая с `unrs-resolver`, здесь скрипты нужны: без них
  не скачиваются движки Prisma и нативный бинарник argon2. Добавлено поле
  `pnpm.onlyBuiltDependencies` в корневой `package.json`, установка повторена.
- Проверки после установки: `tsc --version` → `6.0.3`, `prisma --version` →
  CLI и клиент `6.19.3`, `require('argon2')` → грузится, `prettier --check .` →
  `All matched files use Prettier code style!`. Движки на месте:
  `query_engine-windows.dll.node`, `schema-engine-windows.exe`.
  `pnpm build` / `lint` / `typecheck` не запускались осознанно —
  в `apps/api/src/` ещё нет ни одного файла, `tsc` упал бы на `TS18003`.
- Выполнен шаг 12: `apps/api/prisma/schema.prisma` вставлен без правок — текст
  из [`04-domain-model.md`](./04-domain-model.md) валиден для Prisma 6 как есть.
- 🐞 **Ложная ошибка от редактора.** VS Code подчёркивал `url` в `datasource`:
  «The datasource property `url` is no longer supported in schema files».
  Это правило **Prisma 7**, а у нас 6.19.3 — локальный CLI на той же схеме отвечал
  `The schema at prisma\schema.prisma is valid 🚀`. Источник нашёлся по составу
  расширения: `prisma.prisma-31.11.0` тянет внутри пакеты 7.x. Лечение — откат
  расширения до 6.19.0 (см. «Состояние окружения»). Вывод: при расхождении верить
  CLI из `node_modules`, а не языковому серверу редактора — они версионируются
  независимо.
- 🔧 **КТ-2 пройдена.** `prisma migrate dev --name init` создала миграцию
  `20260815191636_init` и накатила её на базу в контейнере. Проверено:
  `migrate status` → `Database schema is up to date!`; в базе восемь таблиц
  (шесть моделей + служебные `_CourseToTeacher` и `_prisma_migrations`);
  enum-типы `Role` и `LeadStatus` созданы; сгенерированный клиент знает
  ровно шесть моделей — `User, Course, Teacher, Post, GalleryItem, Lead`.
- Команда запускалась в форме `pnpm --filter api exec prisma migrate dev --name init`,
  а не корневым `pnpm db:migrate`: без `--name` команда интерактивна (спрашивает имя
  миграции), а интерактивные программы в git bash без `winpty` виснут. Прокидывать
  флаг через два слоя скриптов — лишний риск.
- ⚠️ **Хвост на шаг 19.** Prisma предупреждает: `package.json#prisma` (там лежит
  команда сида) объявлено устаревшим и в Prisma 7 будет удалено, замена —
  `prisma.config.ts`. В 6-й ветке поле работает, предупреждение косметическое,
  но всплывает при каждой команде `prisma`. Решить вместе с `prisma/seed.ts`.
