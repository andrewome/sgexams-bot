FROM node:14-alpine3.12 AS base
WORKDIR /usr/src/app

FROM base AS builder
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci

FROM base
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY . ./
ARG BUILD_MODE
RUN if [ "$BUILD_MODE" == "production" ]; \
    then { \
    npm run build; \
    } \
    fi
CMD ["npm", "run", "docker-dev"]
