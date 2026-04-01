FROM node:24.0.0 as builder

WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

FROM node:24.0.0 as final
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist .

# RUN chown -R node:node .
# USER node

EXPOSE 3000
CMD [ "node", "index.js" ]