# syntax=docker/dockerfile:1.7

# ---- Install dev deps (used to build) ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# ---- Build the React Router app ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Install production-only deps ----
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Final runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json .npmrc ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build

USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
