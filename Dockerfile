
##
# Build
#

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build

##
# Release
#

FROM alpine AS runner
WORKDIR /app

# Install dependencies
RUN apk add --no-cache \
  qt5-qtbase \
  fontconfig \
  libxrender \
  libxext \
  ca-certificates \
  curl \
  && update-ca-certificates

# Download wkhtmltopdf static binary
RUN curl -LO https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox-alpine-0.12.6-1_linux-alpine-amd64.tar.xz \
  && tar -xvf wkhtmltox-alpine-0.12.6-1_linux-alpine-amd64.tar.xz \
  && mv wkhtmltox/bin/wkhtmltopdf /usr/local/bin/ \
  && chmod +x /usr/local/bin/wkhtmltopdf \
  && rm -rf wkhtmltox* 

# Verify installation
RUN wkhtmltopdf --version

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

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD [ "node", "server.js" ]
