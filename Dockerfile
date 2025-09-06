    FROM node:22-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    COPY tsconfig*.json ./
    COPY prisma ./prisma/
    RUN npm install
    
    COPY . .
    RUN npm run build

    FROM node:22-alpine AS runner
    
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install --omit=dev
    
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/prisma ./prisma
    
    EXPOSE 3333
    
    CMD ["node", "dist/src/main.js"]
    