FROM node:20-slim AS base
WORKDIR /usr/src/app

FROM base AS builder
RUN apt-get update && \
  apt-get install -y --no-install-recommends python3 make g++ && \
  rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci

FROM base
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . ./
ARG BUILD_MODE
RUN if [ "$BUILD_MODE" = "production" ]; \
    then { \
    npm run build; \
    } \
    fi
CMD ["npm", "run", "docker-dev"]
