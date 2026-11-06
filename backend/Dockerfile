FROM node:18-alpine

# Install OpenSSL and necessary compatibility libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies first (for caching layer optimization)
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Push Prisma schema to DB then start the server
CMD ["sh", "-c", "npx prisma db push && node dist/server.js"]