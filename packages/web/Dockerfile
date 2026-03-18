FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/shared/package.json packages/shared/
COPY packages/web/package.json packages/web/

RUN bun install --frozen-lockfile

COPY packages/shared packages/shared
COPY packages/web packages/web

EXPOSE 5173
CMD ["bun", "run", "--filter", "web", "dev"]
