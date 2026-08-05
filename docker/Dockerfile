# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dependencies -----------------------------------------------------------
FROM base AS deps
# python3/make/g++ are required to build bcrypt's native addon on musl
# (Alpine), which has no prebuilt binary for this platform.
RUN apk add --no-cache python3 make g++
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# --- Build --------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm prisma generate
ENV DOCKER_BUILD=1
RUN pnpm build

# --- Migrator (used via `docker compose run --rm migrate`) ------------------
# Kept separate from the slim runner because it needs the full Prisma CLI
# (a devDependency, so it isn't in the standalone runtime bundle below).
FROM base AS migrator
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
CMD ["pnpm", "prisma", "migrate", "deploy"]

# --- Runtime -------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/lib/generated ./lib/generated

RUN mkdir -p ./public/uploads/contact ./public/uploads/careers \
  ./public/uploads/brand ./public/uploads/team ./public/uploads/services \
  ./public/uploads/products ./public/uploads/projects ./public/uploads/gallery \
  ./public/uploads/news ./public/uploads/testimonials ./public/uploads/partners \
  ./public/uploads/clients \
  && chown -R nextjs:nodejs ./public/uploads

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
