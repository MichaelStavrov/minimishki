# Проверка результата

Все команды — для **git bash**.

> Пути внутри команд — в bash-стиле: `/d/programming/minimishki`.
> Заголовки шагов при выдаче файлов — в Windows-стиле, чтобы вставлять в проводник.

---

## Промежуточные проверки

Ошибки дешевле ловить по ходу, а не в конце. Каждая проверка привязана
к контрольной точке из [`03-steps.md`](./03-steps.md).

### После этапа B (КТ-1) — монорепо собирается

```bash
cd /d/programming/minimishki
pnpm install
pnpm -r list --depth -1
```

**Ожидаем:** установка без ошибок; в списке видны `@minimishki/shared`,
`@minimishki/eslint-config`, `@minimishki/tsconfig`; создан `pnpm-lock.yaml`.

Проверить, что локальные пакеты подключены симлинками, а не скачаны из реестра:

```bash
ls -la apps/api/node_modules/@minimishki/
```

**Ожидаем:** в выводе стрелка `->` на `../../../../packages/shared`.

### После шага 9 — база поднимается

```bash
docker compose up -d postgres
docker compose ps
```

**Ожидаем:** сервис `postgres` в состоянии `healthy` (не просто `running`).

pgAdmin поднимается **отдельно**, он в профиле `tools`:

```bash
docker compose --profile tools up -d
```

Затем `http://localhost:5050`.

Подключиться к базе напрямую (интерактивные программы в git bash требуют `winpty`):

```bash
winpty docker compose exec postgres psql -U postgres -d minimishki
```

### После шага 12 (КТ-2) — схема валидна, миграция создана

```bash
pnpm --filter api exec prisma validate
pnpm db:generate
pnpm db:migrate
```

**Ожидаем:** `validate` → «The schema at prisma/schema.prisma is valid»;
появилась папка `apps/api/prisma/migrations/<timestamp>_init/`.

Посмотреть таблицы:

```bash
pnpm db:studio      # Prisma Studio на localhost:5555
```

### После шага 15 (КТ-3) — API отвечает

```bash
pnpm --filter api dev
```

В отдельном терминале:

```bash
curl http://localhost:3001/api/health
```

**Ожидаем:** JSON-ответ. С кодом ответа:

```bash
curl -i http://localhost:3001/api/health
```

### После шага 18 — авторизация работает

```bash
curl -i http://localhost:3001/api/users
```

**Ожидаем:** `HTTP/1.1 401 Unauthorized` — глобальный `JwtAuthGuard` закрывает роут.

### После этапа F — доменные роуты живы

```bash
curl http://localhost:3001/api/courses
curl http://localhost:3001/api/teachers
curl http://localhost:3001/api/posts
```

**Ожидаем:** `200` и список (пустой или с данными из seed).

---

## Финальная сквозная проверка (шаг 29)

Прогоняется на чистой машине / после `git clone`, чтобы убедиться,
что проект поднимается с нуля.

### 1. Активировать pnpm

```bash
corepack enable pnpm
pnpm --version
```

### 2. Установить зависимости

```bash
cd /d/programming/minimishki
pnpm install
```

### 3. Поднять базу

```bash
docker compose up -d postgres
docker compose ps
```

Ожидаем `healthy`.

### 4. Создать файлы окружения

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

> Для web — именно **`.env.local`**, это конвенция Next.js для локальных значений.

Сгенерировать `JWT_SECRET` и вписать в `apps/api/.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Миграции и seed

```bash
pnpm db:migrate && pnpm db:seed
```

### 6. Запустить оба приложения

```bash
pnpm dev
```

**Ожидаем:** Turborepo поднял обе задачи параллельно —
web на `http://localhost:3000`, api на `http://localhost:3001/api`.

### 7. Проверить API

```bash
curl http://localhost:3001/api/health

curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@minimishki.ru","password":"admin"}'
```

**Ожидаем:** health → `200`; login → объект с `accessToken`.

Проверить закрытые маршруты без действительного JWT:

```bash
curl -i http://localhost:3001/api/auth/me
curl -i http://localhost:3001/api/users
curl -i -H 'Authorization: Bearer invalid' http://localhost:3001/api/auth/me
```

**Ожидаем:** три ответа `401`; каждый содержит `statusCode`, `message` и `error`.

Запрос с токеном:

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@minimishki.ru","password":"admin"}' \
  | node -pe "JSON.parse(require('fs').readFileSync(0)).accessToken")

curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
```

**Ожидаем:** `200` и актуальный `UserDto` без `passwordHash`.

### 8. Проверить качество кода

```bash
pnpm lint && pnpm typecheck
```

**Ожидаем:** без ошибок.

### 9. Проверить сборку

```bash
pnpm build
```

**Ожидаем:** обе задачи собрались; повторный запуск отрабатывает из кеша Turborepo
(`FULL TURBO`).

---

## Что считается успешным результатом

- [ ] `pnpm install` проходит без ошибок, локальные пакеты — симлинками
- [ ] Контейнер postgres `healthy`
- [ ] `prisma validate` проходит, миграция создана, таблицы в БД есть
- [ ] Seed отработал, администратор в БД, повторный запуск seed не падает
- [ ] `http://localhost:3000` открывается, главная рендерится и показывает статус API
- [ ] `GET /api/health` → 200
- [ ] `GET /api/users` без токена → 401
- [ ] `POST /api/auth/login` возвращает JWT
- [ ] `pnpm lint` и `pnpm typecheck` — чисто
- [ ] `pnpm build` собирает оба приложения

---

## Возможные проблемы

### Специфичные для git bash на Windows

| Симптом | Причина / решение |
|---|---|
| Путь в аргументе превратился в `C:/Program Files/Git/...` | MSYS-преобразование путей. Удвоить слеш (`//api/health`) или добавить префикс `MSYS_NO_PATHCONV=1` перед командой |
| `docker exec -it` / `psql` зависают без вывода | Интерактивным программам нужен `winpty`: `winpty docker compose exec postgres psql -U postgres` |
| `pnpm dlx` / `npx` не находит бинарник | Запустить напрямую: `node ./node_modules/.bin/<cmd>` |
| Скрипт из `package.json` падает на путях с `\` | В скриптах использовать прямые слеши — они работают и в bash, и в cmd |

### Общие

| Симптом | Причина / решение |
|---|---|
| `node` / `pnpm` не найден | nvm-windows обновил `PATH` — перезапустить терминал |
| `pnpm install` падает на peer-зависимостях | проверить `strict-peer-dependencies=false` в `.npmrc` |
| `EPERM: operation not permitted, symlink` | pnpm не может создать симлинк на Windows. Включить «Режим разработчика» в параметрах Windows либо запустить терминал от администратора |
| `turbo: command not found` / задачи не запускаются | не выполнен `pnpm install`, либо в `turbo.json` использован устаревший ключ `pipeline` вместо **`tasks`** (Turborepo 2.x) |
| `Cannot find module '@prisma/client'` или нет типов моделей | не выполнен `pnpm db:generate` (КТ-2). Клиент генерируется из схемы, он не приходит с установкой пакета |
| `PrismaClientInitializationError: Can't reach database` | контейнер ещё не `healthy`, либо `DATABASE_URL` указывает не на 5432, либо `.env` не создан из `.env.example` |
| Порт 5432 занят | локально уже установлен PostgreSQL — сменить порт в `docker-compose.yml` (например `5433:5432`) и в `DATABASE_URL` |
| Порт 3000 или 3001 занят | `netstat -ano \| grep :3000`, затем `taskkill //PID <pid> //F` (двойной слеш — защита от MSYS-преобразования) |
| CORS-ошибка в браузере | в `main.ts` проверить, что разрешён origin `http://localhost:3000` |
| Next.js не видит переменную окружения | для web файл должен называться **`.env.local`**, а не `.env`; переменная должна начинаться с `NEXT_PUBLIC_`; после изменения — перезапустить dev-сервер |
