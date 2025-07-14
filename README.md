# Mini Gateway - Audit Service

Serviço de auditoria para o Mini Gateway, construído com Node.js, Express, TypeScript e TypeORM.

## Funcionalidades

- **Endpoint POST /audit/logs**: Cria logs de auditoria
- **Endpoint GET /audit/logs**: Lista logs de auditoria com filtros
- **Endpoint GET /audit/logs/:id**: Busca log específico por ID
- **Endpoint GET /audit/health**: Health check do serviço
- **Consumer RabbitMQ**: Consome eventos de auditoria de outros serviços automaticamente
- **Persistência automática**: Salva logs de auditoria no banco PostgreSQL
- **TypeORM**: ORM para gerenciamento do banco de dados PostgreSQL

## Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL
- RabbitMQ

## Estrutura do Projeto

```
src/
├── controllers/
│   └── auditController.ts     # Endpoints REST para auditoria
├── database/
│   ├── data-source.ts         # Configuração do TypeORM
│   └── migrations/            # Migrations do banco
├── entities/
│   └── AuditLog.ts           # Entidade de log de auditoria
├── repositories/
│   └── AuditLogRepository.ts  # Repository para logs
├── services/
│   ├── auditLogService.ts     # Lógica de negócio
│   ├── jwtService.ts          # Validação de JWT
│   └── rabbitmqService.ts     # Integração RabbitMQ
├── types/
│   ├── audit.ts               # Tipos para auditoria
│   └── rabbitmq.ts            # Tipos para mensageria
└── index.ts                   # Arquivo principal
```

## Configuração

Crie um arquivo `.env` com as seguintes variáveis:

```env
# Servidor
PORT=3002
NODE_ENV=development

# Banco de dados
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=
DB_PASSWORD=
DB_NAME=mg_audit_db

# RabbitMQ
RABBITMQ_URL=amqp://localhost
AUDIT_EXCHANGE=audit.exchange
AUDIT_QUEUE=audit.logs
AUDIT_ROUTING_KEY=audit.*
```

## Instalação

```bash
# Instalar dependências
yarn install

# Executar migrations
yarn migration:run

# Executar em desenvolvimento
yarn dev

# Build para produção
yarn build

# Executar em produção
yarn start
```

## API Endpoints

### Criar Log de Auditoria
```http
POST /audit/logs
Content-Type: application/json

{
  "action": "login",
  "service": "mg-login-service",
  "metadata": {
    "ip": "192.168.1.1",
    "browser": "Chrome"
  },
}
```

### Listar Logs de Auditoria
```http
GET /audit/logs?userId=user-123&action=login&page=1&limit=50
Authorization: Bearer <token>
```

Filtros disponíveis:
- `userId`: ID do usuário
- `action`: Ação realizada
- `service`: Serviço que gerou o log
- `startDate`: Data inicial (ISO 8601)
- `endDate`: Data final (ISO 8601)
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 50)

### Buscar Log Específico
```http
GET /audit/logs/{id}
Authorization: Bearer <token>
```

### Health Check
```http
GET /audit/health
```

## Modelo de Dados

### AuditLog

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| userId | String | ID do usuário (opcional) |
| action | String | Ação realizada |
| service | String | Serviço que gerou o log |
| metadata | JSONB | Metadados adicionais |
| createdAt | Timestamp | Data de criação |

## Integração com RabbitMQ

O serviço consome eventos de auditoria do exchange `audit.exchange` com routing key `audit.*`.

### Formato dos Eventos

```json
{
  "action": "login",
  "timestamp": "2025-01-13T10:30:00Z",
  "service": "mg-login-service",
  "data": {
    "userId": "user-123",
    "metadata": {
      "ip": "192.168.1.1",
      "success": true
    }
  }
}
```

## RabbitMQ Consumer

O serviço atua como consumer RabbitMQ, consumindo eventos de auditoria de outros serviços do Mini Gateway automaticamente.

### Configuração do Consumer

O consumer é configurado para:
- **Exchange**: `audit.exchange` (configurável via `AUDIT_EXCHANGE`)
- **Queue**: `audit.logs` (configurável via `AUDIT_QUEUE`)
- **Routing Key**: `audit.*` (configurável via `AUDIT_ROUTING_KEY`)
- **Prefetch**: 1 mensagem por vez para garantir processamento sequencial
- **Durabilidade**: Queue e mensagens são duráveis
- **Acknowledgment**: Manual, só confirma após salvar no banco

### Formato dos Eventos

Os eventos devem seguir o formato:

```json
{
  "action": "user.login",
  "timestamp": "2025-07-13T10:30:00.000Z",
  "service": "mg-auth-service",
  "data": {
    "userId": "uuid-do-usuario",
    "metadata": {
      "loginMethod": "email",
      "device": "web"
    },
  }
}
```

## Scripts Disponíveis

- `yarn dev`: Executa em modo desenvolvimento com hot reload
- `yarn build`: Compila o TypeScript
- `yarn start`: Executa a versão compilada
- `yarn migration:generate`: Gera nova migration
- `yarn migration:run`: Executa migrations pendentes
- `yarn migration:revert`: Reverte última migration

## Arquitetura

O serviço segue os princípios de Clean Architecture:

- **Controllers**: Camada de apresentação (HTTP)
- **Services**: Lógica de negócio
- **Repositories**: Camada de acesso a dados
- **Entities**: Modelos de domínio
- **Types**: Interfaces e tipos TypeScript

## Monitoramento

O serviço inclui:

- Health check endpoint
- Logs estruturados
- Tratamento de erros
- Graceful shutdown

## Licença

MIT
