
##
# Build
#

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Next runs code to identify imports at build time, so we need to set this runtime env var
# https://github.com/vercel/next.js/discussions/46805
ENV NODE_OPTIONS="--require reflect-metadata"

RUN npm run build

##
# Release
#

FROM alpine AS runner
WORKDIR /app

RUN apk add --no-cache \
  ca-certificates \
  chromium \
  freetype \
  harfbuzz \
  nodejs \
  nss \
  poppler-utils \
  ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# https://github.com/vercel/next.js/discussions/46805
ENV NODE_OPTIONS="--require reflect-metadata"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD [ "node", "server.js" ]
