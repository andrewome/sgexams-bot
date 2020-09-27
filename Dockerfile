FROM node:14-alpine3.12 AS base
ARG BUILD_MODE
WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . ./
RUN if [ "$BUILD_MODE" == "production" ]; \
    then { \
    npm run build; \
    } \
    fi
CMD ["npm", "run", "docker-dev"]
