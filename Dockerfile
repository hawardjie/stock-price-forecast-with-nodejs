FROM node:23-alpine

WORKDIR /home/haward/jie/gitprojects/stock-price-forecast-with-nodejs

COPY ./package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]