ARG BASE_IMAGE=node:24-alpine
FROM ${BASE_IMAGE} AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM ${BASE_IMAGE}
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/app/data/stardew.db UPLOAD_DIR=/app/uploads
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
COPY design-system ./design-system
COPY scripts ./scripts
RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "src/server.js"]
