# Stage 1: Build Frontend
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend and Bundle
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY server.js ./

# Copy frontend build output to the client/dist folder in backend image
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port and start
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
