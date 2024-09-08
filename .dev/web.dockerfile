FROM node:alpine AS build

WORKDIR /app

ADD web/package.json /app/package.json
ADD web/package-lock.json /app/package-lock.json

RUN npm ci

ADD web /app
RUN rm -rf /app/src

FROM node:alpine

WORKDIR /app

COPY --from=build /app /app

CMD ["npm", "run", "dev"]
