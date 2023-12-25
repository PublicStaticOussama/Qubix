
FROM node:alpine

WORKDIR /broker-queue

COPY package*.json ./

COPY --chown=node:node . .

RUN npm install

EXPOSE 8123

CMD ["npm", "run", "dev"]
