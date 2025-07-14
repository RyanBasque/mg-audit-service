# Multi-stage build para otimizar o tamanho da imagem
FROM node:20-alpine AS builder

# Instalar dependências necessárias para compilação
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json yarn.lock* ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN yarn install --frozen-lockfile

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN yarn build

# Imagem final
FROM node:20-alpine AS production

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências para instalar apenas produção
COPY package.json yarn.lock* ./

# Instalar apenas dependências de produção
RUN yarn install --production --frozen-lockfile && \
    yarn cache clean

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/tsconfig.json ./tsconfig.json

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3002

# Definir variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/audit/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
