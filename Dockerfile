FROM node:18-alpine
# Built via GitHub Actions CI

WORKDIR /app

# 先复制依赖文件，利用 Docker 层缓存
COPY package*.json ./
RUN npm install --production

# 再复制应用代码（代码变更不会重新 npm install）
COPY server.js ./
COPY public/ ./public/

EXPOSE 3457

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3457/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
