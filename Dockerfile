
FROM node:alpine

WORKDIR /Qubix

COPY package*.json ./

COPY --chown=node:node . .

RUN npm install

EXPOSE 8123

CMD ["npm", "run", "dev"]
