##
# Build
#

FROM node:20 AS builder
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

RUN apk add --no-cache nodejs poppler-utils weasyprint ttf-dejavu

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs


RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/reflect-metadata ./node_modules/reflect-metadata

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# https://github.com/vercel/next.js/discussions/46805
ENV NODE_OPTIONS="--require reflect-metadata"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD [ "node", "server.js" ]
