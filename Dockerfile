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

FROM debian AS runner
WORKDIR /app

RUN apt update && apt install --yes \
  nodejs \
  poppler-utils \
  python3-venv \
  python3-pip \
  python3-cffi \
  python3-brotli \
  libpango-1.0-0 \
  libharfbuzz0b \
  libpangoft2-1.0-0

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip3 install weasyprint

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

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
