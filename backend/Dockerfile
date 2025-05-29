# Dockerfile para Easy Gift Search Backend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Copia o .env se existir (ou use variáveis no ambiente de produção)
# COPY backend/.env .

EXPOSE 3000

CMD ["node", "server.js"]
