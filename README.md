# Mini Gateway - Audit Service 🔍

Serviço de auditoria centralizado para o Mini Gateway, responsável por coletar, armazenar e disponibilizar logs de todas as ações realizadas nos microserviços do sistema.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript com tipagem estática
- **Express.js** - Framework web minimalista
- **routing-controllers** - Decoradores para criação de APIs REST

### Banco de Dados
- **PostgreSQL 15** - Banco de dados relacional principal
- **TypeORM** - ORM para TypeScript/JavaScript
- **PgAdmin** - Interface web para administração do PostgreSQL

### Mensageria
- **RabbitMQ** - Message broker para comunicação assíncrona
- **amqplib** - Cliente AMQP para Node.js

### Utilitários
- **class-validator** - Validação de dados com decoradores
- **class-transformer** - Transformação de objetos
- **dotenv** - Gerenciamento de variáveis de ambiente
- **cors** - Middleware para CORS
- **module-alias** - Aliases para importações

### DevOps
- **Docker** - Containerização da aplicação
- **Docker Compose** - Orquestração de containers

## 🎯 Funcionalidades

### API REST
- **POST /audit/logs** - Criação manual de logs de auditoria
- **GET /audit/logs** - Listagem de logs com filtros avançados e paginação
- **GET /audit/logs/:id** - Busca de log específico por UUID
- **GET /audit/health** - Health check do serviço

### Consumer RabbitMQ
- **Consumo automático** de eventos de auditoria de outros serviços
- **Processamento assíncrono** com acknowledgment manual
- **Retry automático** para falhas de processamento
- **TTL configurável** para mensagens

### Persistência
- **Armazenamento automático** no PostgreSQL
- **Índices otimizados** para consultas por usuário, ação e data
- **Metadados JSONB** para flexibilidade na estrutura de dados

## Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL
- RabbitMQ

## 📁 Estrutura do Projeto

```
src/
├── controllers/
│   └── auditController.ts     # Controller REST com decoradores (@JsonController)
├── database/
│   ├── data-source.ts         # Configuração do TypeORM e conexão PostgreSQL
│   └── migrations/            # Migrations automáticas do banco
├── entities/
│   └── AuditLog.ts           # Entidade TypeORM com índices otimizados
├── repositories/
│   └── AuditLogRepository.ts  # Repository pattern para acesso a dados
├── services/
│   ├── auditLogService.ts     # Lógica de negócio para auditoria
│   ├── jwtService.ts          # Validação e processamento de JWT
│   └── rabbitmqService.ts     # Consumer RabbitMQ e processamento de eventos
├── types/
│   ├── audit.ts               # Interfaces TypeScript para auditoria
│   └── rabbitmq.ts            # Tipos para eventos e mensageria
├── alias.ts                   # Configuração de aliases de módulos
└── index.ts                   # Bootstrap da aplicação e middlewares

docker/
├── postgres/
│   └── init-scripts/          # Scripts de inicialização do PostgreSQL
└── rabbitmq/
    ├── definitions.json       # Configurações pré-definidas do RabbitMQ
    └── rabbitmq.conf         # Configurações do broker

scripts/
└── docker/                   # Scripts de automação Docker
    ├── build-and-run.sh
    ├── cleanup.sh
    └── dev.sh
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` com as seguintes variáveis:

```env
# 🌐 Servidor
PORT=3002
NODE_ENV=development

# 🗄️ Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=audit_user
DB_PASSWORD=audit_password
DB_NAME=mg_audit_db

# 🐰 RabbitMQ
RABBITMQ_URL=amqp://rabbitmq_user:rabbitmq_password@localhost:5672
AUDIT_EXCHANGE=audit.exchange
AUDIT_QUEUE=audit.logs
AUDIT_ROUTING_KEY=audit.*
```

### Docker Compose

O projeto inclui configurações Docker completas:

- **docker-compose.yml** - Ambiente de produção
- **docker-compose.dev.yml** - Ambiente de desenvolvimento
- **PgAdmin** disponível na porta 8080 (perfil dev)
- **RabbitMQ Management** disponível na porta 15672

## 🚀 Instalação e Execução

### Desenvolvimento Local

```bash
# Instalar dependências
yarn install

# Executar migrations
yarn migration:run

# Executar em modo desenvolvimento (com hot reload)
yarn dev

# Build para produção
yarn build

# Executar versão compilada
yarn start
```

### Docker

```bash
# Ambiente de desenvolvimento
yarn docker:dev

# Ambiente de produção
yarn docker:run

# Parar containers
yarn docker:stop

# Limpeza completa
yarn docker:clean
```

## 📚 API Endpoints

### 📝 Criar Log de Auditoria
**POST** `/audit/logs`

Cria um novo log de auditoria manualmente.

```http
POST /audit/logs
Content-Type: application/json

{
  "userId": "user-123",
  "action": "user.login",
  "service": "mg-auth-service",
  "metadata": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "loginMethod": "email",
    "success": true
  }
}
```

**Resposta (201):**
```json
{
  "success": true,
  "message": "Audit log created successfully",
  "data": {
    "id": "uuid-generated",
    "userId": "user-123",
    "action": "user.login",
    "service": "mg-auth-service",
    "metadata": {
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "loginMethod": "email",
      "success": true,
      "requestId": "req-123",
      "timestamp": "2025-07-14T10:30:00.000Z"
    },
    "createdAt": "2025-07-14T10:30:00.000Z"
  }
}
```

### 📋 Listar Logs de Auditoria
**GET** `/audit/logs`

Lista logs de auditoria com filtros avançados e paginação.

```http
GET /audit/logs?userId=user-123&action=user.login&service=mg-auth-service&page=1&limit=20&startDate=2025-07-01&endDate=2025-07-14
```

**Parâmetros de Query:**
- `userId` - ID do usuário (opcional)
- `action` - Ação realizada (opcional)
- `service` - Serviço que gerou o log (opcional)
- `startDate` - Data inicial em ISO 8601 (opcional)
- `endDate` - Data final em ISO 8601 (opcional)
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 50, máximo: 100)

**Resposta (200):**
```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "userId": "user-123",
      "action": "user.login",
      "service": "mg-auth-service",
      "metadata": { ... },
      "createdAt": "2025-07-14T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### 🔍 Buscar Log Específico
**GET** `/audit/logs/{id}`

Busca um log de auditoria específico pelo UUID.

```http
GET /audit/logs/550e8400-e29b-41d4-a716-446655440000
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Audit log retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "action": "user.login",
    "service": "mg-auth-service",
    "metadata": { ... },
    "createdAt": "2025-07-14T10:30:00.000Z"
  }
}
```

### ✅ Health Check
**GET** `/audit/health`

Verifica o status do serviço.

```http
GET /audit/health
```

**Resposta (200):**
```json
{
  "success": true,
  "message": "Audit Service is healthy",
  "timestamp": "2025-07-14T10:30:00.000Z",
  "service": "mg-audit-service"
}
```

## 🗄️ Modelo de Dados

### Entidade AuditLog

A entidade `AuditLog` é otimizada para consultas frequentes com índices compostos.

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| **id** | UUID | Identificador único do log | Primary Key, Generated |
| **userId** | String | ID do usuário que realizou a ação | Nullable, Indexed |
| **action** | String | Ação realizada (ex: user.login, user.logout) | Required, Indexed |
| **service** | String | Serviço que originou o evento | Required, Indexed |
| **metadata** | JSONB | Metadados adicionais em formato JSON | Nullable, Flexible |
| **createdAt** | Timestamp | Data e hora da criação do log | Auto-generated, Indexed |

### Índices do Banco de Dados

```sql
-- Índice composto para consultas por usuário e ação
CREATE INDEX idx_audit_logs_user_action_date ON audit_logs (userId, action, createdAt);

-- Índice composto para consultas por serviço
CREATE INDEX idx_audit_logs_service_date ON audit_logs (service, createdAt);
```

### Estrutura da Metadata

O campo `metadata` é do tipo JSONB e pode conter qualquer estrutura JSON:

```json
{
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "loginMethod": "email",
  "success": true,
  "requestId": "req-uuid-123",
  "timestamp": "2025-07-14T10:30:00.000Z",
  "originalTimestamp": "2025-07-14T10:29:58.000Z",
  "processedAt": "2025-07-14T10:30:01.000Z"
}
```

## 🐰 Integração com RabbitMQ

### Consumer Automático

O serviço atua como **consumer RabbitMQ**, processando eventos de auditoria de outros microserviços automaticamente.

### Configuração do Consumer

| Parâmetro | Valor Padrão | Descrição |
|-----------|--------------|-----------|
| **Exchange** | `audit.exchange` | Exchange do tipo `direct` e durável |
| **Queue** | `audit.logs` | Fila durável com TTL configurável |
| **Routing Key** | `audit.*` | Padrão para capturar todos os eventos de auditoria |
| **Prefetch** | `1` | Processa uma mensagem por vez |
| **Acknowledgment** | Manual | Confirma apenas após salvar no banco |
| **Retry** | `3 tentativas` | Requeue automático em caso de falha |
| **TTL** | `60 segundos` | Tempo de vida das mensagens |

### Formato dos Eventos

Os eventos devem seguir a interface `EventPayload<AuditEvent>`:

```typescript
interface EventPayload {
  action: string;           // Ação realizada (ex: "user.login")
  timestamp: string;        // ISO 8601 timestamp
  service: string;          // Serviço que originou o evento
  metadata: {               // Metadados específicos do evento
    userId?: string;        // ID do usuário (opcional)
    [key: string]: any;     // Campos adicionais flexíveis
  };
}
```

### Exemplo de Evento

```json
{
  "action": "user.login",
  "timestamp": "2025-07-14T10:30:00.000Z",
  "service": "mg-auth-service",
  "metadata": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "loginMethod": "email",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "success": true,
    "sessionId": "sess-123"
  }
}
```

### Processamento de Eventos

1. **Recebimento**: Evento recebido do RabbitMQ
2. **Validação**: Verificação da estrutura JSON
3. **Enriquecimento**: Adição de timestamps de processamento
4. **Persistência**: Salvamento no PostgreSQL
5. **Acknowledgment**: Confirmação do processamento

### Tratamento de Erros

- **JSON Inválido**: Mensagem rejeitada permanentemente
- **Erro de Processamento**: Mensagem reenfileirada para retry
- **Falha no Banco**: Retry automático até 3 tentativas
- **Timeout**: Mensagem retornada para a fila após TTL

## 🛠️ Scripts Disponíveis

### Desenvolvimento
```bash
yarn dev                    # Executa em modo desenvolvimento com hot reload
yarn build                  # Compila TypeScript para JavaScript
yarn build:watch           # Compila em modo watch
yarn start                  # Executa versão compilada
```

### Banco de Dados
```bash
yarn migration:generate    # Gera nova migration baseada nas mudanças das entidades
yarn migration:run         # Executa migrations pendentes
yarn migration:revert      # Reverte a última migration executada
yarn typeorm               # Acesso direto ao CLI do TypeORM
```

### Docker
```bash
yarn docker:build          # Constrói a imagem Docker
yarn docker:run            # Executa com docker-compose (produção)
yarn docker:dev            # Executa ambiente de desenvolvimento
yarn docker:stop           # Para todos os containers
yarn docker:clean          # Remove containers, volumes e imagens
```

### Scripts Auxiliares
```bash
./scripts/docker/dev.sh            # Script de desenvolvimento completo
./scripts/docker/build-and-run.sh  # Build e execução automatizada
./scripts/docker/cleanup.sh        # Limpeza completa do ambiente
```

## 🏗️ Arquitetura

O serviço segue os princípios de **Clean Architecture** e **Domain-Driven Design**:

### Camadas da Aplicação

```
┌─────────────────────────────────────────┐
│              Controllers                │  ← Camada de Apresentação
│        (HTTP REST Endpoints)           │
├─────────────────────────────────────────┤
│               Services                  │  ← Camada de Aplicação
│          (Lógica de Negócio)           │
├─────────────────────────────────────────┤
│             Repositories                │  ← Camada de Infraestrutura
│         (Acesso a Dados)               │
├─────────────────────────────────────────┤
│              Entities                   │  ← Camada de Domínio
│          (Modelos de Dados)            │
└─────────────────────────────────────────┘
```

### Responsabilidades

- **Controllers**: Recebem requisições HTTP, validam dados e delegam para services
- **Services**: Contêm a lógica de negócio e orquestram operações
- **Repositories**: Abstraem o acesso ao banco de dados usando TypeORM
- **Entities**: Definem a estrutura dos dados e regras de domínio
- **Types/Interfaces**: Contratos TypeScript para type safety

### Padrões Implementados

- **Repository Pattern**: Abstração da camada de dados
- **Dependency Injection**: Inversão de dependências com decoradores
- **DTO Pattern**: Data Transfer Objects para validação
- **Event-Driven**: Processamento assíncrono via RabbitMQ
- **CQRS**: Separação entre commands e queries

## 📊 Monitoramento e Observabilidade

### Health Check
- **Endpoint**: `GET /audit/health`
- **Verificações**: Status do serviço e timestamp
- **Uso**: Load balancers e ferramentas de monitoramento

### Logs Estruturados
- **Formato**: JSON estruturado para melhor parsing
- **Níveis**: Info, warn, error com contexto detalhado
- **Correlação**: Request IDs para rastreamento de requisições

### Métricas de Performance
- **Processamento RabbitMQ**: Tempo de processamento de mensagens
- **Queries**: Performance das consultas ao banco
- **API**: Tempo de resposta dos endpoints

### Tratamento de Erros
- **Graceful Shutdown**: Finalização controlada de conexões
- **Circuit Breaker**: Proteção contra falhas em cascata
- **Retry Logic**: Tentativas automáticas para operações críticas

### Docker Health Checks
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3002/audit/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

## 🚦 Considerações de Performance

### Banco de Dados
- **Índices compostos** para consultas frequentes
- **Paginação** para evitar sobrecarga em consultas grandes
- **Connection pooling** otimizado pelo TypeORM

### RabbitMQ
- **Prefetch de 1** para garantir processamento sequencial
- **Acknowledgment manual** para garantir consistência
- **TTL configurável** para evitar acúmulo de mensagens

### API
- **Validação eficiente** com class-validator
- **Serialização otimizada** com class-transformer
- **CORS configurado** para integração com frontends

## 🔒 Segurança

### Autenticação
- **JWT validation** (quando necessário)
- **Request ID tracking** para auditoria de requisições

### Dados Sensíveis
- **Metadata flexível** permite controle fino sobre dados expostos
- **Logs sanitizados** para evitar vazamento de informações

### Network Security
- **CORS policy** configurada
- **Docker network isolation** entre serviços

## 🔗 URLs de Acesso

### Aplicação
- **API Base**: `http://localhost:3002`
- **Health Check**: `http://localhost:3002/audit/health`
- **Swagger/Docs**: `http://localhost:3002/docs` (se configurado)

### Ferramentas de Desenvolvimento
- **PgAdmin**: `http://localhost:8080`
  - Email: `admin@example.com`
  - Senha: `admin123`
- **RabbitMQ Management**: `http://localhost:15672`
  - Usuário: `rabbitmq_user`
  - Senha: `rabbitmq_password`

### Banco de Dados
- **PostgreSQL**: `localhost:5432`
  - Database: `mg_audit_db`
  - Usuário: `audit_user`
  - Senha: `audit_password`

## 📝 Exemplos de Uso

### 1. Criando um Log via API
```bash
curl -X POST http://localhost:3002/audit/logs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "action": "user.login",
    "service": "mg-auth-service",
    "metadata": {
      "ip": "192.168.1.1",
      "success": true
    }
  }'
```

### 2. Consultando Logs com Filtros
```bash
curl "http://localhost:3002/audit/logs?userId=user-123&action=user.login&limit=10"
```

### 3. Publicando Evento no RabbitMQ
```javascript
// Em outro microserviço
const auditEvent = {
  action: "user.logout",
  timestamp: new Date().toISOString(),
  service: "mg-auth-service",
  metadata: {
    userId: "user-123",
    sessionDuration: 3600
  }
};

await channel.publish('audit.exchange', 'audit.logout', Buffer.from(JSON.stringify(auditEvent)));
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📜 Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

---

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@minigateway.com
- 📖 Documentação: [docs.minigateway.com](https://docs.minigateway.com)
- 🐛 Issues: [GitHub Issues](https://github.com/minigateway/mg-audit-service/issues)
