FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4173

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server.mjs ./

EXPOSE 4173

USER node

CMD ["npm", "start"]