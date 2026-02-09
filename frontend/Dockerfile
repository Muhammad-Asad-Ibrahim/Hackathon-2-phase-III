# Multi-stage build for Next.js frontend using pnpm
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# enable corepack and prepare pnpm version declared in package.json
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# copy package and lockfile first for better caching
COPY package.json pnpm-lock.yaml* ./
COPY . .

# install dependencies and build
RUN pnpm install --frozen-lockfile --production=false
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

# copy build artifacts and production dependencies from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "start"]
