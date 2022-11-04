FROM node:16-alpine

WORKDIR /usr/server/app

COPY ./package.json ./
RUN npm install

COPY ./ .
RUN npm run build
ENV NODE_ENV=production

RUN apk add sqlite3

CMD ["npm", "run", "start"]