FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/
COPY packages/web/package.json packages/web/

RUN bun install --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/server packages/server

EXPOSE 3000
CMD ["bun", "run", "--filter", "server", "dev"]
