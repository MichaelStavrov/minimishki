FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable \
  && apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json

COPY . .

RUN pnpm install --frozen-lockfile --prod=false \
  && pnpm --filter @minimishki/shared build \
  && pnpm --filter api db:generate \
  && pnpm --filter api build

FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/tsconfig ./packages/tsconfig
COPY --from=build /app/apps/api ./apps/api

RUN mkdir -p /app/apps/api/uploads \
  && chown -R node:node /app/apps/api/uploads

USER node

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
