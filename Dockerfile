FROM node:9.11-jessie

RUN mkdir -p /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV} DEBUG=* DEBUG_COLORS=false

RUN npm i npm@latest -g

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
COPY . /app

CMD ["npm", "run", "run:linux"]