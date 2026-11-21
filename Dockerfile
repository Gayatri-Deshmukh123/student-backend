FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY src ./src
RUN mkdir -p /app/data

ENV NODE_ENV=production PORT=3000 DATA_FILE=/app/data/students.json
EXPOSE 3000
USER node

CMD ["node", "src/server.js"]
