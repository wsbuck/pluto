FROM node:12-alpine
WORKDIR /
COPY . .
RUN yarn install
RUN yarn build
EXPOSE 8000
CMD ["node", "build/index.js"]

