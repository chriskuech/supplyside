
##
# Build
#

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run lint
RUN npm run check

##
# Release
#

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache poppler-utils

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api

COPY --from=builder --chown=api:nodejs /app/tsconfig.json /app/package.json /app/package-lock.json* ./
COPY --from=builder --chown=api:nodejs /app/src ./src
RUN npm ci --include production

USER api

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

EXPOSE ${PORT}

CMD [ "npm", "start" ]
