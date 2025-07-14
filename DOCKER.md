# Docker Guide - Mini Gateway Audit Service

Este guia explica como usar Docker para executar o Mini Gateway Audit Service.

## 📋 Pré-requisitos

- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)
- `netcat` ou `nc` (para scripts de diagnóstico)

## 🚀 Execução Rápida

### Produção

```bash
# Build e execução em produção
./scripts/docker/build-and-run.sh

# Ou manualmente:
docker-compose up --build -d
```

### Desenvolvimento

```bash
# Desenvolvimento com hot reload
./scripts/docker/dev.sh

# Ou manualmente:
docker-compose -f docker-compose.dev.yml up --build
```

## 🔧 Scripts Utilitários

### Diagnóstico de Problemas

```bash
# Script completo de diagnóstico
./scripts/docker/diagnose.sh

# Verifica conectividade, logs e status dos serviços
```

### Outros Scripts

```bash
# Limpeza completa do ambiente
./scripts/docker/cleanup.sh

# Teste dos serviços
./scripts/docker/test.sh
```

## 🛠️ Comandos Úteis

### Build e Execução

```bash
# Build da imagem
docker build -t mg-audit-service .

# Executar apenas o banco e RabbitMQ
docker-compose up postgres rabbitmq -d

# Executar todos os serviços
docker-compose up -d

# Executar com logs
docker-compose up
```

### Logs e Monitoramento

```bash
# Ver logs do serviço de auditoria
docker-compose logs -f mg-audit-service

# Ver logs de todos os serviços
docker-compose logs -f

# Status dos containers
docker-compose ps

# Recursos utilizados
docker stats
```

### Manutenção

```bash
# Parar serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild completo
docker-compose build --no-cache

# Limpeza completa
./scripts/docker/cleanup.sh
```

## 🌐 URLs dos Serviços

Após iniciar os containers, os seguintes serviços estarão disponíveis:

- **Audit Service**: http://localhost:3002
- **Health Check**: http://localhost:3002/audit/health
- **RabbitMQ Management**: http://localhost:15672
  - Usuário: `rabbitmq_user`
  - Senha: `rabbitmq_password`
  - 💡 **Dica**: Se o login não funcionar, use o script: `./scripts/docker/rabbitmq-access.sh`
- **PgAdmin** (apenas desenvolvimento): http://localhost:8080
  - Email: `admin@example.com`
  - Senha: `admin123`

## 🔧 Configuração

### Variáveis de Ambiente

As principais variáveis de ambiente estão definidas no `docker-compose.yml`. Para personalizar:

1. Copie `.env.docker` para `.env`
2. Modifique as variáveis conforme necessário
3. Use: `docker-compose --env-file .env up`

### Volumes

- `postgres_data`: Dados do PostgreSQL
- `rabbitmq_data`: Dados do RabbitMQ
- `pgadmin_data`: Configurações do PgAdmin

### Rede

Todos os serviços estão na rede `mg-network` para comunicação interna.

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
docker-compose logs mg-audit-service

# Verificar saúde dos serviços
docker-compose ps
```

### Problemas de conectividade

```bash
# Verificar rede
docker network ls
docker network inspect mg-network

# Testar conectividade entre containers
docker-compose exec mg-audit-service ping postgres
docker-compose exec mg-audit-service ping rabbitmq
```

### Problemas de login no RabbitMQ

Se o RabbitMQ não aceitar o login:

```bash
# Use o script auxiliar
./scripts/docker/rabbitmq-access.sh

# Ou limpe o cache do browser e tente novamente
# Credenciais: rabbitmq_user / rabbitmq_password

# Verificar usuários criados
docker-compose exec rabbitmq rabbitmqctl list_users
```

### Resetar ambiente

```bash
# Parar tudo e limpar
docker-compose down -v
docker system prune -f

# Rebuild completo
docker-compose build --no-cache
docker-compose up -d
```

### Problemas de permissão

```bash
# Verificar usuário dentro do container
docker-compose exec mg-audit-service whoami

# Verificar permissões de arquivos
docker-compose exec mg-audit-service ls -la
```

## 📊 Monitoramento

### Health Checks

Todos os serviços têm health checks configurados:

```bash
# Status de saúde
docker-compose ps

# Detalhes do health check
docker inspect mg-audit-service | grep -A 20 Health
```

### Logs Estruturados

Os logs seguem formato estruturado para facilitar análise:

```bash
# Logs em tempo real
docker-compose logs -f --tail=100 mg-audit-service

# Logs específicos
docker-compose logs --since="1h" mg-audit-service
```

## 🔒 Segurança

### Produção

⚠️ **IMPORTANTE**: Antes de usar em produção:

1. Altere todas as senhas padrão
2. Configure `JWT_SECRET` com valor seguro
3. Use variáveis de ambiente ou secrets para credenciais
4. Configure rede isolada
5. Ative SSL/TLS

### Exemplo de configuração segura:

```yaml
environment:
  - JWT_SECRET_FILE=/run/secrets/jwt_secret
  - DB_PASSWORD_FILE=/run/secrets/db_password
secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  db_password:
    file: ./secrets/db_password.txt
```

## 📈 Performance

### Otimizações

1. **Multi-stage build**: Imagem otimizada para produção
2. **Health checks**: Monitoramento automático
3. **Resource limits**: Configure conforme necessário
4. **Volumes**: Dados persistentes

### Configuração de recursos:

```yaml
mg-audit-service:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 512M
      reservations:
        cpus: '0.5'
        memory: 256M
```
