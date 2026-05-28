FROM node:20-alpine as fd-builder

COPY ./fd /app

WORKDIR /app

RUN npm install

RUN npm run build

FROM node:20-alpine

COPY ./bd /app

WORKDIR /app

RUN npm install

COPY --from=fd-builder /app/dist /app/public

CMD [ "node","server.js" ]