FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json

COPY . .

# Значения NEXT_PUBLIC_* Next.js встраивает в клиентскую сборку.
ARG API_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_YANDEX_METRIKA_ID
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_YANDEX_METRIKA_ID=$NEXT_PUBLIC_YANDEX_METRIKA_ID

RUN pnpm install --frozen-lockfile --prod=false \
  && pnpm --filter @minimishki/shared build \
  && pnpm --filter web build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/web ./apps/web

USER node

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
