#!/bin/bash
set -e

# Script de inicialização do PostgreSQL para criar múltiplos bancos de dados
# Este script será executado quando o container PostgreSQL for criado pela primeira vez

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Criar banco de dados para o serviço de login
    CREATE DATABASE mg_login_db;
    CREATE USER login_user WITH ENCRYPTED PASSWORD 'login_password';
    GRANT ALL PRIVILEGES ON DATABASE mg_login_db TO login_user;
    
    -- Criar banco de dados para o serviço de auditoria
    CREATE DATABASE mg_audit_db;
    CREATE USER audit_user WITH ENCRYPTED PASSWORD 'audit_password';
    GRANT ALL PRIVILEGES ON DATABASE mg_audit_db TO audit_user;
    
    -- Conectar ao banco de login e configurar permissões
    \c mg_login_db;
    GRANT ALL ON SCHEMA public TO login_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO login_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO login_user;
    
    -- Conectar ao banco de auditoria e configurar permissões
    \c mg_audit_db;
    GRANT ALL ON SCHEMA public TO audit_user;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO audit_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO audit_user;
    
    -- Voltar ao banco principal
    \c mg_gateway_db;
    
    -- Criar extensões úteis
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
