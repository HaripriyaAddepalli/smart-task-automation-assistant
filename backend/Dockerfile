FROM node:20-alpine
WORKDIR /app

# Install ALL deps (including devDependencies for tsc)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

EXPOSE 5000
CMD ["node", "dist/index.js"]
