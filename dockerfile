FROM node:20-alpine

COPY ./bd .

RUN npm install

CMD [ "node","server.js" ]