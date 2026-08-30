# Пошаговый план реализации

33 шага (29 основных + 4 контрольные точки), сгруппированных в 8 этапов.
Каждый пункт = **один шаг выдачи кода**. Пользователь вставляет код, подтверждает, идём дальше
(см. [`00-process.md`](./00-process.md)).

После завершения этих шагов предусмотрен отдельный обязательный постплановый пункт.
Она не входит в текущую реализацию и не увеличивает число основных шагов.

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
- `globalEnv`: `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`, `API_URL`,
  `NEXT_PUBLIC_API_URL`

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

Типы технических ответов тоже считаются сетевым контрактом. Перед frontend-этапом
в пакет добавляется `HealthDto`, чтобы `GET /api/health` не описывался отдельно
в Nest и Next.js.

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
почему `.env` в `.gitignore`, а `.env.example` — нет. Для API предусматривается
`WEB_ORIGIN`; для web — отдельные `API_URL` и `NEXT_PUBLIC_API_URL`.

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
импорт `PrismaClient` и модели `User`, `Service` и т.д. не будут существовать,
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
- CORS для origin из валидированной переменной `WEB_ORIGIN`
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
- для неизвестного email — `argon2.verify` с фиктивным валидным хешем, чтобы время
  ответа не выдавало существование аккаунта
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
- `RolesGuard` + `@Roles(ROLE.ADMIN)`
- `GET /api/auth/me` на базе JWT-стратегии и `@CurrentUser()`
- `JwtAuthGuard.handleRequest()` нормализует `401` под общий `ApiErrorDto`

Объяснить: устройство JWT (header.payload.signature, что подписывается и что нет,
почему в токен нельзя класть секреты); что такое guard и стратегия Passport;
почему «закрыто по умолчанию, открыто явно» безопаснее обратного.

**Проверить:** health и login без токена → `200`; users и auth/me без токена → `401`
с полями `statusCode`, `message`, `error`; users с JWT `ADMIN` → `200`, с JWT `USER` → `403`;
испорченный и просроченный JWT → `401`.

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

- **Шаг 20.1** — `src/modules/services/` (первый — с самым подробным разбором,
  дальше по образцу)
- **Шаг 20.2** — `src/modules/teachers/`
- **Шаг 20.3** — `src/modules/leads/` (публичный `POST` через `@Public()`,
  остальное — только для `ADMIN`/`MANAGER`)
- **Шаг 20.4** — `src/modules/posts/`
- **Шаг 20.5** — `src/modules/gallery/`

**Проверить после каждого:** `GET /api/<модуль>` возвращает `200` и пустой список
(или демо-данные из seed).

### Шаг 20.6. Интеграционный контракт frontend ↔ backend

Перед началом `apps/web` закрыть интеграционные долги, выявленные после реализации API:

- добавить `HealthDto` в `packages/shared/src/dto/health.dto.ts`, экспортировать его
  поимённо и перевести `HealthService` / `HealthController` на общий тип;
- добавить `WEB_ORIGIN` в `apps/api/.env.example`, zod-валидацию и конфигурацию Nest;
  `main.ts` передаёт в `enableCors()` провалидированный origin вместо жёсткого
  `http://localhost:3000`;
- добавить серверный `API_URL` в `apps/web/.env.example` и локальный `.env.local`;
- добавить `API_URL` и `WEB_ORIGIN` в `turbo.json#globalEnv`, потому что изменение
  окружения должно инвалидировать соответствующий кеш сборки;
- синхронизировать реальные `.env` локально и проверить успешный preflight с
  `Origin: http://localhost:3000` и отказ для постороннего origin.

`API_URL` — серверный runtime-адрес Nest для Server Components. `NEXT_PUBLIC_API_URL`
— публичный адрес для браузера, встраиваемый во время `next build`. Локально они
одинаковы, но это разные переменные с разным жизненным циклом.

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

В `package.json` обязательны workspace-зависимость
`@minimishki/shared: "workspace:*"` и маркер `server-only` для серверного API-входа.
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

Для Next.js и Tailwind v4 в `components.json` явно задаются `rsc: true`, `tsx: true`,
`tailwind.config: ""`, путь `tailwind.css` к `src/_app/styles/globals.css` и
`cssVariables: true`.

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
`src/shared/api/` содержит только универсальный HTTP-транспорт, не бизнес-методы:

- `apiRequest<T>()` принимает путь и `RequestInit`;
- серверный вход использует `API_URL` и помечается `server-only`;
- универсальный браузерный вход использует `NEXT_PUBLIC_API_URL`;
- обе переменные проверяются с понятной ошибкой до первого запроса;
- query-параметры собираются через `URLSearchParams` без ручной конкатенации;
- успешный `204 No Content` возвращает `undefined` и не вызывает `response.json()`;
- не-2xx JSON преобразуется в типизированный `ApiError` на базе `ApiErrorDto`;
- массив `message` сохраняется, чтобы UI мог показать ошибки отдельных полей;
- сетевые и не-JSON ошибки отличаются от HTTP-ошибок;
- generic описывает ожидаемый контракт TypeScript, но не выдаётся за runtime-валидацию.

Публичный API `shared/api/index.ts` экспортирует только браузеробезопасные части;
серверный транспорт экспортируется через `index.server.ts`. Функции конкретных
endpoint размещаются рядом с потребителем: в `_pages/<page>/api`,
`entities/<entity>/api` или `features/<action>/api`.

### Шаг 25. Провайдеры
`src/_app/providers.tsx` — `'use client'`, но `QueryClient` **не** создаётся через
`useState`. Используется `makeQueryClient()` и `getQueryClient()`:

- на сервере — новый экземпляр для каждого запроса;
- в браузере — один сохранённый экземпляр, который не теряется при Suspense;
- для SSR задаётся ненулевой `staleTime`, чтобы гидратированный запрос не
  перезапрашивался сразу после загрузки.

На публичных RSC-страницах данные по умолчанию загружаются средствами Next.js.
TanStack Query применяется там, где действительно нужен клиентский кеш:
интерактивные списки и мутации админки.

### Шаг 26. Root layout
`app/layout.tsx` — `lang="ru"`, метаданные (`title: "Минимишки — детский центр"`),
подключение шрифтов. Импортирует `globals.css` и `Providers` из `src/_app`.

### Шаг 27. Главная страница
Слайс `src/_pages/home/` — `ui/HomePage.tsx` запрашивает `GET /api/health`
через Server Component и выводит статус. Запрос выполняется серверным API-входом
с `cache: 'no-store'`, потому что health — текущее состояние, а не контент для кеша.
Тип ответа — общий `HealthDto` из `@minimishki/shared`.

Недоступность Nest, PostgreSQL, ответ `503` и сетевая ошибка не роняют всю главную:
диагностический блок показывает состояние «API недоступен». Для каркаса также
создаются маршрутные `app/loading.tsx`, `app/error.tsx` и `app/not-found.tsx`;
`error.tsx` является минимальной клиентской границей.

`HomePage` — серверный модуль, поэтому экспортируется через `index.server.ts`,
а не через общий `index.ts`.

`app/page.tsx` остаётся тонким:

```tsx
export { HomePage as default } from '@/_pages/home/index.server';
```

Так сразу проверяется и связка web ↔ api, и что слои разложены верно.

---

## Этап H. Финал

### Шаг 28. `README.md`
Описание проекта, быстрый старт, требования к окружению.

### Шаг 29. Сквозная проверка
Полный прогон по [`05-verification.md`](./05-verification.md).

---

## После основного плана. Обязательное напоминание о геймификации

Этот пункт **не входит в шаги 1–29 и не реализуется в рамках текущего плана**.

После того как пользователь подтвердит завершение основной части проекта по шагу 29,
ассистент обязан напомнить о согласованной дополнительной возможности и предложить
отдельно обсудить её требования, место в продуктовом бэклоге и новый план реализации.
Не начинать проектирование или разработку геймификации без отдельного подтверждения
пользователя.

Согласованный состав MVP геймификации:

1. **Игровой подбор услуги «Подбери приключение».** Родитель вместе с ребёнком
   отвечает на несколько визуальных вопросов о возрасте, интересах и формате занятий,
   после чего получает подходящие услуги и переход к заявке.
2. **Бумажный «Паспорт Минимишек».** Ребёнок собирает тематические отметки за реальные
   посещения. Первая версия намеренно не требует личного кабинета и цифрового учёта;
   возможность цифрового паспорта рассматривается только как последующее развитие.
3. **Ежемесячное семейное задание.** Центр публикует одно домашнее творческое,
   познавательное или доброе задание. В первой версии не предусматривать публичную
   загрузку фотографий детей; способ подтверждения и награда согласуются при
   отдельном проектировании.

Общие ограничения MVP:

- механики предназначены для совместного участия родителя и ребёнка;
- не создавать публичные рейтинги детей и соревнование, зависящее от количества
  оплаченных посещений;
- не собирать персональные данные ребёнка без доказанной необходимости;
- контент, сроки активности и награды должны по возможности управляться через админку,
  но конкретная модель данных определяется только в отдельном плане;
- бонусные баллы, цифровые достижения, кабинет родителя и учёт посещений не входят
  в этот MVP и могут обсуждаться как дальнейшее развитие.

---

## Сводка контрольных точек

| Точка | Когда | Команда | Зачем |
|---|---|---|---|
| **КТ-1** | после шага 8 | `pnpm install` | Появились типы Nest/Prisma для backend-кода |
| **КТ-2** | после шага 12 | `pnpm db:generate` + `pnpm db:migrate` | Без Prisma-клиента шаги 13–20 не типизируются |
| **КТ-3** | после шага 15 | `pnpm --filter api dev` | Первая проверка, что backend поднимается |
| **КТ-4** | после шага 21 | `pnpm install` | Зависимости frontend |
