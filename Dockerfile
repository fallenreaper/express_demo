FROM node:24.0.0

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
RUN chown -R node:node .
USER node
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
