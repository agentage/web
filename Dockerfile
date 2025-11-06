# Multi-stage build for backend + frontend
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Dependencies
FROM base AS deps
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/
COPY tsconfig.base.json ./
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
RUN npm ci && npm cache clean --force

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=@agentage/shared
RUN npm run build --workspace=@agentage/backend
RUN npm run build --workspace=@agentage/frontend

# Backend production
FROM node:20-alpine AS backend
WORKDIR /app
RUN apk add --no-cache libc6-compat wget
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/
EXPOSE 3001
CMD ["node", "packages/backend/dist/index.js"]

# Frontend production
FROM node:20-alpine AS frontend
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/shared/package*.json ./packages/shared/
RUN npm install --omit=dev && npm cache clean --force
COPY --from=build /app/packages/frontend/.next/standalone ./
COPY --from=build /app/packages/frontend/.next/static ./packages/frontend/.next/static
COPY --from=build /app/packages/frontend/public ./packages/frontend/public
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "packages/frontend/server.js"]
