FROM node:18-alpine as builder
RUN mkdir /app
COPY . /app

RUN cd /app && npm install && \
  echo "VITE_API_URL=http://localhost:8080" > /app/.env && \
  npm run build

FROM node:18-alpine AS deploy-node
RUN mkdir /app
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package-lock.json /app/

RUN cd /app && npm install --omit=dev

WORKDIR /app
CMD ["node", "build/index.js"]
