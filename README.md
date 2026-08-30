# Минимишки

Новая версия сайта детского центра «Минимишки». Проект построен как монорепозиторий: публичный frontend на Next.js, API на Nest.js и PostgreSQL как основная база данных.

Текущая версия — техническая заготовка проекта. В ней уже есть авторизация, базовые доменные API-модули, главная страница со статусом API и инфраструктура для дальнейшей разработки публичного сайта и админки.

## Стек

- Node.js 22+
- pnpm 10
- Turborepo 2
- Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- Nest.js 11, Prisma 6, PostgreSQL 16
- JWT и Passport для аутентификации
- ESLint и Prettier
- Docker Compose для локальной PostgreSQL

## Структура

```text
apps/
  web/           # Next.js-приложение, порт 3000
  api/           # Nest.js API, порт 3001
packages/
  shared/        # Общие TypeScript-типы и DTO
  eslint-config/ # Общая конфигурация ESLint
  tsconfig/      # Общие конфигурации TypeScript
```

Frontend использует Feature-Sliced Design. Маршруты Next.js находятся в `apps/web/app/`, а архитектурные слои — в `apps/web/src/`.

## Требования

Перед запуском установи:

- [Node.js](https://nodejs.org/) версии 22 или новее;
- [Docker Desktop](https://www.docker.com/products/docker-desktop/);
- Git;
- pnpm через Corepack.

Проверь версии:

```bash
node --version
corepack enable pnpm
pnpm --version
docker --version
```

## Быстрый старт

Все команды выполняются из корня проекта:

```text
D:\programming\minimishki
```

### 1. Установить зависимости

```bash
corepack enable pnpm
pnpm install
```

pnpm распознаёт папки `apps/*` и `packages/*` как workspace-пакеты. Общие пакеты подключаются локально, без публикации в npm.

### 2. Запустить PostgreSQL

```bash
docker compose up -d postgres
docker compose ps
```

Дождись статуса `healthy` у контейнера `minimishki-postgres`.

Если порт `5432` уже занят локальным PostgreSQL, измени порт на хосте в `docker-compose.yml`, например на `5433:5432`, и укажи тот же порт в `DATABASE_URL` файла `apps/api/.env`.

### 3. Создать локальные файлы окружения

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Сгенерируй секрет для JWT:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Вставь результат в `JWT_SECRET` в файле `apps/api/.env`.

Файлы `.env` и `.env.local` не попадают в Git: в них могут находиться секреты и локальные адреса.

### 4. Применить миграции и добавить demo-данные

```bash
pnpm db:migrate
pnpm db:seed
```

Seed создаёт администратора и демонстрационные данные. Для локальной разработки используются значения `SEED_ADMIN_EMAIL` и `SEED_ADMIN_PASSWORD` из `apps/api/.env`.

### 5. Запустить frontend и API

```bash
pnpm dev
```

Turborepo запустит оба приложения:

- frontend: http://localhost:3000
- API: http://localhost:3001/api
- health-проверка API: http://localhost:3001/api/health

Главная страница показывает состояние API. Если API или база временно недоступны, страница остаётся доступной и выводит диагностическое сообщение.

## Основные команды

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm format:check
pnpm format

pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

`pnpm db:studio` запускает Prisma Studio — локальный интерфейс для просмотра и редактирования данных базы.

## Переменные окружения

### `apps/api/.env`

| Переменная            | Назначение                                                 |
| --------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`        | Строка подключения Prisma к PostgreSQL                     |
| `JWT_SECRET`          | Секрет подписи JWT; обязателен и должен быть уникальным    |
| `JWT_EXPIRES_IN`      | Срок действия JWT, например `30d`                          |
| `SEED_ADMIN_EMAIL`    | Email администратора для локального demo-seed              |
| `SEED_ADMIN_PASSWORD` | Пароль администратора для локального demo-seed             |
| `WEB_ORIGIN`          | Origin frontend для CORS, локально `http://localhost:3000` |
| `PORT`                | Порт API, локально `3001`                                  |
| `NODE_ENV`            | Окружение: `development`, `production` или `test`          |

### `apps/web/.env.local`

| Переменная            | Назначение                                |
| --------------------- | ----------------------------------------- |
| `API_URL`             | Серверный адрес API для Server Components |
| `NEXT_PUBLIC_API_URL` | Публичный адрес API для браузерного кода  |

`API_URL` не должен попадать в клиентский бандл. Значения с префиксом `NEXT_PUBLIC_`, напротив, встраиваются Next.js в браузерную сборку, поэтому секреты в них хранить нельзя.

## Проверка API

Проверить доступность API:

```bash
curl http://localhost:3001/api/health
```

Получить JWT администратора:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ЗНАЧЕНИЕ_SEED_ADMIN_EMAIL","password":"ЗНАЧЕНИЕ_SEED_ADMIN_PASSWORD"}'
```

Для запросов к защищённым маршрутам передавай токен в заголовке:

```bash
curl -H 'Authorization: Bearer ВАШ_JWT' \
  http://localhost:3001/api/auth/me
```

## Документация

Подробные технические решения, порядок разработки и журнал прогресса находятся в [.Codex/plans](./.Codex/plans/README.md).

## Лицензия

Проект является внутренней разработкой детского центра «Минимишки».
