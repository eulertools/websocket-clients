FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install pm2@latest -g

RUN npm install

COPY . .

RUN npm run compile

CMD [ "pm2-runtime", "ecosystem.config.js" ]
