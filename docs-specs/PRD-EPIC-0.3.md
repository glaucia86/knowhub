# PRD — EPIC-0.3: Ambiente de Desenvolvimento Local

**KnowHub AI Assistant** · Glaucia Lemos
Versão 1.0 · Março 2026 · Projeto Open Source · Licença MIT

---

## Índice

1. [Contexto e Motivação](#1-contexto-e-motivação)
2. [Objetivo do Épico](#2-objetivo-do-épico)
3. [Conexão com a Visão do Produto](#3-conexão-com-a-visão-do-produto)
4. [Escopo](#4-escopo)
5. [Arquitetura do Ambiente Local](#5-arquitetura-do-ambiente-local)
6. [Histórias de Usuário e Critérios de Aceite](#6-histórias-de-usuário-e-critérios-de-aceite)
7. [Especificações Técnicas Detalhadas](#7-especificações-técnicas-detalhadas)
8. [Definição de Pronto (Definition of Done)](#8-definição-de-pronto-definition-of-done)
9. [Tarefas Técnicas](#9-tarefas-técnicas)
10. [Dependências](#10-dependências)
11. [Estratégia de Testes](#11-estratégia-de-testes)
12. [Riscos e Mitigações](#12-riscos-e-mitigações)
13. [Métricas de Sucesso](#13-métricas-de-sucesso)
14. [Estimativa e Priorização](#14-estimativa-e-priorização)
15. [Referências](#15-referências)

---

## 1. Contexto e Motivação

### 1.1 Por que este épico existe

O KnowHub AI Assistant é uma aplicação **local-first** — o seu diferencial central é que todo o processamento de IA, todo o armazenamento de conhecimento e toda a lógica de negócio rodam no dispositivo do usuário, sem dependência de servidores externos. Isso é uma promessa de produto, não apenas uma escolha técnica.

Para que esse compromisso seja cumprido **desde o primeiro dia de desenvolvimento**, o ambiente local precisa ser configurável de forma confiável, reproduzível e rápida — por qualquer desenvolvedor, em qualquer sistema operacional suportado, com o mínimo de fricção possível.

Sem um ambiente local bem estruturado:

- Novos contribuidores enfrentam um processo de onboarding doloroso e não documentado
- O desenvolvimento paralelo entre a API (NestJS), o frontend (Next.js) e os serviços de IA (Ollama) é fragmentado e inconsistente
- Bugs de ambiente "funciona na minha máquina" contaminam o processo de review
- A promessa local-first do produto não pode ser validada durante o desenvolvimento

Este épico entrega a **infraestrutura do ambiente de desenvolvimento** — o alicerce que todos os demais épicos funcionais precisam para operar.

### 1.2 O problema que este épico resolve

| Problema sem o épico                                                                   | Solução entregue pelo épico                                                         |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Novo desenvolvedor passa horas tentando descobrir quais serviços precisa instalar      | `make dev` ou `npm run dev` sobe tudo em menos de 10 minutos do zero                |
| Versões conflitantes de Redis, Ollama e SQLite entre devs causam bugs intermitentes    | Docker Compose garante versões fixas e idênticas para todos                         |
| Schema do banco precisa ser criado manualmente com SQL antes do primeiro `npm run dev` | DrizzleORM com auto-migrate no boot cria e atualiza o schema automaticamente        |
| Variáveis de ambiente são descobertas por tentativa e erro ao quebrar a aplicação      | `.env.example` documentado + script `env:setup` gera `.env` automaticamente         |
| Desenvolvedores sem experiência com Ollama bloqueiam o time                            | Documentação passo a passo com screenshots; Docker Compose encapsula a complexidade |
| Ambiente se comporta diferente em Windows, macOS e Linux                               | Testado e documentado nos três sistemas; `Makefile` abstrai diferenças de OS        |

### 1.3 Alinhamento com os princípios do produto

> **"Toda grande ideia começa no caos. Um segundo cérebro transforma esse caos em clareza."**
> — Especificação Não-Técnica, epígrafe

O ambiente de desenvolvimento local é o "segundo cérebro" do próprio projeto. Ele transforma o caos de "como eu faço isso rodar?" em um processo claro, documentado e automatizado. Um desenvolvedor que consegue ter o ambiente rodando em 10 minutos é um desenvolvedor que pode contribuir com código no mesmo dia.

> **"Contribuições são bem-vindas: o projeto é aberto a PRs, issues e discussões desde o primeiro dia."**
> — Especificação Não-Técnica, Seção 2 (Princípios Guia)

Contribuições só são genuinamente bem-vindas quando o processo de setup não é uma barreira de entrada. O EPIC-0.3 remove essa barreira.

---

## 2. Objetivo do Épico

> **Qualquer desenvolvedor consegue ter o ambiente completo do KnowHub AI Assistant rodando localmente em menos de 10 minutos com um único comando, independentemente do sistema operacional (Windows via WSL, macOS ou Linux), com banco de dados inicializado, serviços de infraestrutura ativos e variáveis de ambiente configuradas.**

Este épico entrega três sistemas independentes mas complementares:

1. **Docker Compose para serviços de infraestrutura** — Redis/Valkey e Ollama orquestrados, versionados e com health checks
2. **Schema do banco de dados e migrations** — DrizzleORM com schema TypeScript, migrations versionadas e seed script automatizado
3. **Variáveis de ambiente** — `.env.example` completo, script de setup automatizado e validação de startup

---

## 3. Conexão com a Visão do Produto

O KnowHub AI Assistant tem como missão:

> _"Democratizar o acesso a um gerenciador de conhecimento com IA, poderoso para desenvolvedores e acessível para qualquer pessoa."_

O princípio inegociável do produto é que **nenhum dado do usuário é enviado a servidores externos sem consentimento explícito**. Para que esse princípio seja implementado e validado durante o desenvolvimento, toda a stack precisa rodar localmente com fidelidade ao ambiente de produção.

O EPIC-0.3 garante que:

| Princípio do Produto               | Como o épico o sustenta                                                                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Local-first por padrão**         | Docker Compose garante que Redis e Ollama rodam no dispositivo do dev, não em cloud de desenvolvimento |
| **Privacidade inegociável**        | SQLite local sem conexão externa no ambiente de desenvolvimento; sem telemetria de serviços externos   |
| **Acessível para qualquer pessoa** | Setup de 10 minutos; documentação com screenshots; funciona em Windows, macOS e Linux                  |
| **Open Source e extensível**       | Configuração como código (Docker Compose, schema DrizzleORM); qualquer contribuidor pode replicar      |

A stack local completa inclui:

```
NestJS API  ←→  SQLite (local, via DrizzleORM)
    ↑               ↑
    └───────────────┤
                Redis/Valkey (Docker)
                Ollama (Docker ou nativo)
    ↓
Next.js (frontend dev server)
```

---

## 4. Escopo

### 4.1 Dentro do Escopo — MVP deste Épico

- `docker-compose.yml` na raiz com serviços `redis` (Valkey) e `ollama`
- Volumes persistentes para dados do Redis e modelos do Ollama
- Health checks para Redis e Ollama
- Schema completo em `apps/api/src/db/schema.ts` via DrizzleORM
- `drizzle.config.ts` configurado para SQLite local
- Migrations geradas por `drizzle-kit generate` e aplicadas no boot da API
- Seed script `npm run db:seed` com dados de exemplo para desenvolvimento
- `.env.example` em `apps/api` e `apps/web` com todas as variáveis documentadas
- Script `npm run env:setup` na raiz do monorepo
- Validação de variáveis obrigatórias no startup da API com mensagens claras
- `Makefile` na raiz com targets: `dev`, `db:reset`, `db:seed`, `ollama:pull`, `env:setup`
- Documentação completa no `README.md` com seção de setup passo a passo
- Guia dedicado ao Ollama: o que é, por que usamos, como configurar e verificar

### 4.2 Fora do Escopo — Este Épico

| Item                                                | Onde será tratado               |
| --------------------------------------------------- | ------------------------------- |
| Estrutura do monorepo e scripts de build/test       | EPIC-0.1                        |
| Pipelines de CI/CD                                  | EPIC-0.2                        |
| README completo e CONTRIBUTING.md                   | EPIC-0.4                        |
| Deploy em produção (PM2, cloud)                     | EPICs posteriores               |
| Configuração do PostgreSQL/Neon (modo cloud)        | Epic funcional relevante        |
| Integração com Telegram Bot                         | Épico funcional relevante       |
| Schema de migrations para produção (rollback plans) | Épico de infra de produção      |
| Configuração do BullMQ para filas de jobs           | EPIC funcional do IndexingAgent |

---

## 5. Arquitetura do Ambiente Local

### 5.1 Visão Geral dos Serviços

```
knowhub/ (raiz do monorepo)
├── docker-compose.yml          # Orquestração de serviços de infraestrutura
├── Makefile                    # Comandos de conveniência
├── .env.example                # Template de variáveis do monorepo
│
├── apps/
│   ├── api/
│   │   ├── .env.example        # Variáveis específicas da API
│   │   ├── drizzle.config.ts   # Configuração do DrizzleORM
│   │   └── src/
│   │       └── db/
│   │           ├── schema.ts   # Schema TypeScript (fonte de verdade)
│   │           ├── seed.ts     # Dados de exemplo para dev
│   │           └── migrations/ # SQL gerados pelo drizzle-kit
│   └── web/
│       └── .env.example        # Variáveis específicas do Next.js
│
└── scripts/
    └── env-setup.js            # Script de setup automatizado de .env
```

### 5.2 Fluxo de Inicialização do Ambiente

```
Developer executa: make dev
          │
          ▼
┌──────────────────────────────────┐
│   1. env:setup (se .env ausente) │
│   Copia .env.example → .env      │
│   Gera secrets aleatórios        │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   2. docker-compose up -d        │
│   Sobe Redis/Valkey              │
│   Sobe Ollama                    │
│   Aguarda health checks          │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   3. npm run dev (turbo)         │
│   API: drizzle migrate (boot)    │
│   API: NestJS inicia na :3001    │
│   Web: Next.js inicia na :3000   │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│   4. make ollama:pull (1x setup) │
│   Baixa gemma3:4b (~3.8 GB)      │
│   Baixa nomic-embed-text         │
└──────────────────────────────────┘
           │
           ▼
    ✅ Ambiente pronto em ~10 min
    http://localhost:3000  (Web)
    http://localhost:3001  (API)
    http://localhost:11434 (Ollama)
    redis://localhost:6379 (Redis)
```

### 5.3 Estratégia de Configuração Multi-OS

| Sistema Operacional       | Abordagem Docker              | Abordagem Ollama     | Notas                                                  |
| ------------------------- | ----------------------------- | -------------------- | ------------------------------------------------------ |
| **Linux**                 | Docker Engine nativo          | Docker ou nativo     | Ambiente de referência; menor fricção                  |
| **macOS (Apple Silicon)** | Docker Desktop (recomendado)  | Docker ou app nativo | Ollama nativo tem melhor performance com Metal         |
| **macOS (Intel)**         | Docker Desktop                | Docker (recomendado) | Ollama nativo funciona mas sem aceleração GPU          |
| **Windows (via WSL2)**    | Docker Desktop + WSL2 backend | Docker via WSL2      | `make` requer WSL2 ou Git Bash; alternativa: `npm run` |

> **Decisão de design:** O `Makefile` é uma camada de conveniência que encapsula os comandos mais verbosos. Em Windows sem WSL2, todos os targets do Makefile têm equivalentes via `npm run <script>` documentados no README.

---

## 6. Histórias de Usuário e Critérios de Aceite

---

### STORY-0.3.1 — Docker Compose para serviços de infraestrutura

> **Como desenvolvedor, quero iniciar todos os serviços de infraestrutura (Redis, Ollama) com um único comando para não depender de instalações manuais nem de versões inconsistentes entre máquinas.**

**Contexto:** O Redis é crítico para a performance do KnowHub. Como aplicação de conhecimento, o caching de embeddings calculados, de resultados de queries frequentes e de tokens de sessão via Valkey/Redis reduz o tempo de resposta de chamadas repetidas de segundos para milissegundos. O Ollama, por sua vez, é a peça de maior complexidade de setup — ele gerencia o download, a quantização e a execução de LLMs locais. Encapsular ambos em Docker Compose garante que todo desenvolvedor trabalhe com as mesmas versões e a mesma configuração, independentemente do que está instalado na máquina host.

A opção de usar LLMs via API externa (Azure OpenAI, OpenAI, Gemini) é suportada via variável `LLM_API_URL`, permitindo que desenvolvedores sem hardware adequado para Ollama possam contribuir sem bloquear.

**Critérios de Aceite:**

- [ ] `docker-compose.yml` criado na raiz do repositório com serviços `redis` e `ollama`
- [ ] `docker compose up -d` sobe os serviços sem erros em Linux, macOS e Windows (WSL2)
- [ ] Versões fixas declaradas: `valkey/valkey:8-alpine` para Redis, `ollama/ollama:latest` para Ollama (com pin de digest em produção)
- [ ] Volumes nomeados `ollama_data` e `redis_data` garantem que modelos e dados sobrevivem ao `docker compose down`
- [ ] Health checks configurados:
  - Redis: `redis-cli ping` a cada 10s, timeout 5s, 3 retries
  - Ollama: `curl -f http://localhost:11434/api/tags` a cada 15s, timeout 10s, 3 retries
- [ ] Porta `6379` (Redis) e `11434` (Ollama) expostas e documentadas
- [ ] `docker compose down` para os serviços sem remover volumes
- [ ] `docker compose down -v` remove completamente volumes e dados (documentado como "reset completo")
- [ ] Variável de ambiente `LLM_API_URL` funciona como escape hatch: se definida, a API usa o endpoint externo em vez do Ollama local
- [ ] Logs dos serviços são acessíveis via `docker compose logs -f redis` e `docker compose logs -f ollama`
- [ ] `docker-compose.yml` inclui comentários explicativos em cada serviço
- [ ] Seção "Serviços Docker" documentada no README com tabela de portas, propósito de cada serviço e comandos comuns

**Exemplo de saída esperada:**

```
$ docker compose up -d
[+] Running 3/3
 ✔ Network knowhub_default    Created
 ✔ Container knowhub-redis-1  Started
 ✔ Container knowhub-ollama-1 Started

$ docker compose ps
NAME               IMAGE                   STATUS
knowhub-redis-1    valkey/valkey:8-alpine  Up (healthy)
knowhub-ollama-1   ollama/ollama:latest    Up (healthy)
```

---

### STORY-0.3.2 — Schema do banco de dados e migrations

> **Como desenvolvedor, quero que o schema do banco de dados seja criado e atualizado automaticamente quando a API iniciar, sem precisar executar comandos SQL manuais ou migrations na mão.**

**Contexto:** O banco SQLite é o coração do armazenamento local do KnowHub. Ele armazena entradas de conhecimento, chunks vetorizados, configurações do usuário, conexões semânticas entre conteúdos e jobs de manutenção. Qualquer desenvolvedor que clonar o repositório e iniciar a API deve ter o banco pronto para uso sem etapas adicionais.

DrizzleORM foi escolhido como ORM (ADR-007) por sua leveza (~7.4KB), ausência de binário em runtime, suporte nativo a SQLite e geração de migrations em SQL puro e auditável. O `drizzle-kit` gera as migrations a partir do schema TypeScript e o `drizzle-kit migrate` as aplica de forma idempotente.

**Critérios de Aceite:**

- [ ] `apps/api/src/db/schema.ts` criado com schema DrizzleORM completo incluindo todas as tabelas: `users`, `user_settings`, `knowledge_entries`, `content_chunks`, `tags`, `connection_edges`, `maintenance_jobs`
- [ ] Índices declarados conforme especificação técnica:
  - `knowledge_user_created_idx` em `(user_id, created_at)`
  - `knowledge_status_idx` em `(status)`
  - `chunks_entry_idx` em `(entry_id)`
  - `tags_name_user_idx` (unique) em `(name, user_id)`
  - `edges_source_target_idx` (unique) em `(source_id, target_id)`
  - `edges_similarity_idx` em `(similarity)`
- [ ] `apps/api/drizzle.config.ts` configurado apontando para `./local.db` (SQLite local via `better-sqlite3`)
- [ ] `drizzle-kit generate` gera migrations SQL versionadas em `apps/api/src/db/migrations/`
- [ ] `drizzle-kit migrate` aplica todas as migrations pendentes de forma idempotente
- [ ] A API aplica migrations automaticamente no bootstrap (`onApplicationBootstrap` no `AppModule`)
- [ ] Seed script `apps/api/src/db/seed.ts` cria dados de exemplo realistas:
  - 1 usuário padrão com `user_settings` configuradas
  - Pelo menos 5 `knowledge_entries` de tipos variados (NOTE, LINK, PDF)
  - Tags associadas
  - Pelo menos 2 `connection_edges` entre entries existentes
- [ ] `npm run db:seed` executa o seed script a partir da raiz do monorepo
- [ ] `npm run db:reset` apaga o banco local e recria do zero com migrations + seed
- [ ] `npm run db:generate` atalho para `drizzle-kit generate` no workspace da API
- [ ] `npm run db:migrate` atalho para `drizzle-kit migrate` no workspace da API
- [ ] Arquivo `apps/api/local.db` está no `.gitignore` do workspace da API
- [ ] Migrations geradas são commitadas no repositório (são código auditável, não geradas em runtime)

**Schema esperado das tabelas principais:**

```
users               → id, name, email, created_at, updated_at
user_settings       → id, user_id, ai_provider, ai_model, embedding_model, privacy_mode, language, telegram_enabled, telegram_token
knowledge_entries   → id, user_id, type, title, content, source_url, file_path, summary, status, created_at, updated_at, accessed_at, archived_at
content_chunks      → id, entry_id, chunk_index, content, token_count, embedding
tags                → id, name, user_id
connection_edges    → id, source_id, target_id, similarity, type, created_at
maintenance_jobs    → id, type, status, payload, result, created_at, completed_at
```

**Fluxo de migration:**

```
schema.ts (source of truth)
      │
      │ drizzle-kit generate
      ▼
migrations/
  └── 0001_initial.sql        ← commitado no repo
  └── 0002_add_indexes.sql    ← commitado no repo
      │
      │ drizzle-kit migrate (no boot da API)
      ▼
local.db (SQLite local — no .gitignore)
```

---

### STORY-0.3.3 — Variáveis de ambiente

> **Como desenvolvedor, quero que todas as variáveis de ambiente necessárias para rodar o projeto localmente estejam documentadas com exemplos claros, que um script crie meu `.env` automaticamente e que a aplicação me diga exatamente o que está faltando se eu esquecer alguma.**

**Contexto:** Variáveis de ambiente são o ponto de configuração onde projetos locais mais frequentemente travam novos desenvolvedores. Descobrir por tentativa e erro que `REDIS_URL` é obrigatória só depois de ver um stack trace críptico é uma experiência frustrante. Este critério garante que a configuração seja explícita, documentada e automatizável.

A API usa `ConfigModule` do NestJS com validação via `Joi` ou `class-validator` para garantir que todas as variáveis obrigatórias estão presentes no bootstrap — falhando com mensagem clara antes de tentar conectar a qualquer serviço.

**Critérios de Aceite:**

- [ ] `.env.example` criado em `apps/api` com **todas** as variáveis da API documentadas com comentários em português
- [ ] `.env.example` criado em `apps/web` com todas as variáveis do frontend documentadas
- [ ] `.env.example` criado na raiz do monorepo para variáveis compartilhadas (se aplicável)
- [ ] Cada variável no `.env.example` inclui:
  - Comentário descrevendo o propósito
  - Indicação se é `REQUIRED` ou `OPTIONAL (default: X)`
  - Exemplo de valor válido
- [ ] Script `scripts/env-setup.js` (ou `env:setup` no `package.json` raiz):
  - Copia `.env.example` → `.env` em cada workspace que ainda não tem `.env`
  - Gera `JWT_SECRET` aleatório de 64 caracteres (hex)
  - Gera `SESSION_SECRET` aleatório de 32 caracteres (hex)
  - Não sobrescreve `.env` existente (idempotente)
  - Imprime um resumo das ações executadas
- [ ] `npm run env:setup` disponível no `package.json` raiz
- [ ] A API falha no bootstrap com mensagem clara se qualquer variável `REQUIRED` estiver ausente:
  ```
  [KnowHub] FATAL: Missing required environment variable: REDIS_URL
  Set it in apps/api/.env (see apps/api/.env.example for reference)
  ```
- [ ] Variáveis sensíveis (`JWT_SECRET`, `TELEGRAM_TOKEN`, `AZURE_OPENAI_API_KEY`) nunca têm valor padrão em `.env.example` — apenas placeholder `CHANGE_ME` ou similar
- [ ] `.env` e `.env.local` estão no `.gitignore` de todos os workspaces e da raiz
- [ ] Variável `LLM_API_URL` documentada com exemplos para Ollama local, Azure OpenAI e OpenAI
- [ ] Seção "Variáveis de Ambiente" no README lista todas as variáveis com links para os `.env.example`

**Exemplo de `.env.example` da API:**

```bash
# ═══════════════════════════════════════════════
# KnowHub AI Assistant — API Configuration
# ═══════════════════════════════════════════════
# Copie este arquivo para .env e ajuste os valores
# Execute: npm run env:setup (gera automaticamente)
# ═══════════════════════════════════════════════

# ── Servidor ─────────────────────────────────────
# REQUIRED | Porta em que a API escuta
PORT=3001

# REQUIRED | URL base para CORS (frontend)
FRONTEND_URL=http://localhost:3000

# ── Banco de Dados ────────────────────────────────
# OPTIONAL (default: ./local.db) | Caminho do arquivo SQLite
DATABASE_URL=./local.db

# ── Autenticação ──────────────────────────────────
# REQUIRED | Segredo para assinar JWTs (mínimo 32 chars)
# Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=CHANGE_ME

# OPTIONAL (default: 7d) | Expiração do token JWT
JWT_EXPIRES_IN=7d

# ── Redis / Cache ─────────────────────────────────
# REQUIRED | URL de conexão com Redis/Valkey
REDIS_URL=redis://localhost:6379

# ── Inteligência Artificial ───────────────────────
# OPTIONAL (default: http://localhost:11434) | URL do Ollama local
OLLAMA_BASE_URL=http://localhost:11434

# OPTIONAL (default: gemma3:4b) | Modelo LLM padrão
LLM_MODEL=gemma3:4b

# OPTIONAL (default: nomic-embed-text) | Modelo de embeddings
EMBEDDING_MODEL=nomic-embed-text

# OPTIONAL | URL de API LLM externa (substitui Ollama se definida)
# Exemplos:
#   Azure OpenAI: https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-02-01
#   OpenAI: https://api.openai.com/v1/chat/completions
# LLM_API_URL=

# OPTIONAL | API Key para LLM externa (obrigatória se LLM_API_URL definida)
# LLM_API_KEY=CHANGE_ME

# ── Integrações opcionais ─────────────────────────
# OPTIONAL | Token do Bot Telegram (necessário para STORY-1.x)
# TELEGRAM_BOT_TOKEN=CHANGE_ME
```

---

## 7. Especificações Técnicas Detalhadas

### 7.1 `docker-compose.yml` Completo

```yaml
# docker-compose.yml — Serviços de infraestrutura do KnowHub AI Assistant
# Sobe: Redis/Valkey (cache) + Ollama (LLMs locais)
# Uso: docker compose up -d
# Reset: docker compose down -v

services:
  redis:
    image: valkey/valkey:8-alpine
    container_name: knowhub-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: valkey-server --save 60 1 --loglevel warning
    healthcheck:
      test: ['CMD', 'valkey-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 5s
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: knowhub-ollama
    ports:
      - '11434:11434'
    volumes:
      - ollama_data:/root/.ollama
    healthcheck:
      test: ['CMD-SHELL', 'curl -sf http://localhost:11434/api/tags || exit 1']
      interval: 15s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped
    # Para suporte a GPU NVIDIA (opcional):
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]

volumes:
  redis_data:
    name: knowhub_redis_data
  ollama_data:
    name: knowhub_ollama_data
```

**Decisões de design do `docker-compose.yml`:**

| Decisão                                           | Justificativa                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `valkey/valkey:8-alpine` em vez de `redis:alpine` | Valkey é o fork open source do Redis mantido pela Linux Foundation; compatível com Redis CLI; versão 8 tem melhor performance em ARM |
| `restart: unless-stopped`                         | Garante que os serviços sobem automaticamente após reinicialização do sistema, sem precisar de `make dev` novamente                  |
| `--save 60 1` no Valkey                           | Persistência a cada 60s se houve pelo menos 1 write; suficiente para dev sem overhead de I/O constante                               |
| Volume nomeado com prefixo `knowhub_`             | Evita colisão com volumes de outros projetos no Docker Desktop                                                                       |
| Health check no Ollama com `start_period: 20s`    | O Ollama demora para inicializar; o `start_period` evita falsos negativos no health check nos primeiros segundos                     |
| GPU comentada (não habilitada por padrão)         | Habilitação de GPU requer NVIDIA Container Toolkit instalado; não é universal; devs com GPU podem descomentar                        |

### 7.2 Schema DrizzleORM Completo (`apps/api/src/db/schema.ts`)

```typescript
// apps/api/src/db/schema.ts
// Schema completo do KnowHub AI Assistant
// Fonte de verdade para o banco de dados SQLite local

import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Usuário (suporte futuro a multi-user) ──────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Configurações do usuário ────────────────────────────────────────────────
export const userSettings = sqliteTable('user_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  aiProvider: text('ai_provider').default('ollama'), // "ollama" | "azure" | "openai"
  aiModel: text('ai_model').default('gemma3:4b'),
  embeddingModel: text('embedding_model').default('nomic-embed-text'),
  privacyMode: text('privacy_mode').default('local'), // "local" | "hybrid"
  language: text('language').default('pt-BR'),
  telegramEnabled: integer('telegram_enabled', { mode: 'boolean' }).default(false),
  telegramToken: text('telegram_token'),
});

// ── Entrada de conhecimento (core entity) ──────────────────────────────────
export const knowledgeEntries = sqliteTable(
  'knowledge_entries',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    type: text('type', {
      enum: ['NOTE', 'TEXT', 'LINK', 'PDF', 'GITHUB_ISSUE', 'GITHUB_README'],
    }).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    sourceUrl: text('source_url'),
    filePath: text('file_path'),
    summary: text('summary'),
    status: text('status', {
      enum: ['PENDING', 'INDEXING', 'INDEXED', 'FAILED', 'ARCHIVED'],
    }).default('PENDING'),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
    accessedAt: text('accessed_at'),
    archivedAt: text('archived_at'),
  },
  (table) => ({
    userCreatedIdx: index('knowledge_user_created_idx').on(table.userId, table.createdAt),
    statusIdx: index('knowledge_status_idx').on(table.status),
  }),
);

// ── Chunks de conteúdo (para RAG) ──────────────────────────────────────────
export const contentChunks = sqliteTable(
  'content_chunks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    entryId: text('entry_id')
      .notNull()
      .references(() => knowledgeEntries.id),
    chunkIndex: integer('chunk_index').notNull(),
    content: text('content').notNull(),
    tokenCount: integer('token_count').notNull(),
    // Vetor serializado como JSON em SQLite
    // Em pgvector (cloud), usar tipo customizado `vector(1536)`
    embedding: text('embedding').notNull(),
  },
  (table) => ({
    entryIdx: index('chunks_entry_idx').on(table.entryId),
  }),
);

// ── Tags ────────────────────────────────────────────────────────────────────
export const tags = sqliteTable(
  'tags',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    userId: text('user_id').notNull(),
  },
  (table) => ({
    uniqueNameUser: uniqueIndex('tags_name_user_idx').on(table.name, table.userId),
  }),
);

// ── Grafo de conexões (edges) ──────────────────────────────────────────────
export const connectionEdges = sqliteTable(
  'connection_edges',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceId: text('source_id')
      .notNull()
      .references(() => knowledgeEntries.id),
    targetId: text('target_id')
      .notNull()
      .references(() => knowledgeEntries.id),
    similarity: real('similarity').notNull(),
    type: text('type').default('semantic'), // "semantic" | "manual"
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    uniqueEdge: uniqueIndex('edges_source_target_idx').on(table.sourceId, table.targetId),
    similarityIdx: index('edges_similarity_idx').on(table.similarity),
  }),
);

// ── Jobs de manutenção ─────────────────────────────────────────────────────
export const maintenanceJobs = sqliteTable('maintenance_jobs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text('type', {
    enum: ['REINDEX', 'CHECK_LINKS', 'DEDUPLICATE', 'GENERATE_CONNECTIONS', 'ARCHIVE_STALE'],
  }).notNull(),
  status: text('status', {
    enum: ['PENDING', 'RUNNING', 'DONE', 'FAILED'],
  }).default('PENDING'),
  payload: text('payload'), // JSON serializado
  result: text('result'), // JSON serializado
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
});
```

### 7.3 `drizzle.config.ts`

```typescript
// apps/api/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? './local.db',
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

### 7.4 Bootstrap de Migrations na API (`DatabaseModule`)

```typescript
// apps/api/src/db/database.module.ts
import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';

@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL', './local.db');
        const sqlite = new Database(url);
        sqlite.pragma('journal_mode = WAL');
        sqlite.pragma('foreign_keys = ON');
        return drizzle(sqlite, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(
    private readonly config: ConfigService,
    // Injetado via token customizado — omitido por brevidade
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Applying pending database migrations...');
    // migrate() é síncrono no better-sqlite3
    migrate(this.db, {
      migrationsFolder: path.join(__dirname, 'migrations'),
    });
    this.logger.log('Database migrations applied successfully.');
  }
}
```

> **Nota:** `journal_mode = WAL` (Write-Ahead Logging) é essencial para performance em SQLite com múltiplas leituras concorrentes — padrão de acesso típico quando API e agentes leem e escrevem simultaneamente.

### 7.5 Seed Script (`apps/api/src/db/seed.ts`)

O seed script cria um usuário de desenvolvimento com dados representativos que permitem testar todas as funcionalidades sem precisar criar dados manualmente:

```typescript
// apps/api/src/db/seed.ts
// Execução: npm run db:seed (da raiz do monorepo)

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

async function seed() {
  const sqlite = new Database(process.env.DATABASE_URL ?? './local.db');
  const db = drizzle(sqlite, { schema });

  console.log('🌱 Seeding development database...');

  // Usuário padrão de desenvolvimento
  const [devUser] = await db
    .insert(schema.users)
    .values({
      name: 'Dev User',
      email: 'dev@knowhub.local',
    })
    .returning();

  // Configurações padrão
  await db.insert(schema.userSettings).values({
    userId: devUser.id,
    aiProvider: 'ollama',
    aiModel: 'gemma3:4b',
    embeddingModel: 'nomic-embed-text',
    privacyMode: 'local',
    language: 'pt-BR',
  });

  // Entradas de conhecimento de exemplo
  const entries = await db
    .insert(schema.knowledgeEntries)
    .values([
      {
        userId: devUser.id,
        type: 'NOTE',
        title: 'Princípios do segundo cérebro (BASB)',
        content:
          'O conceito de Building a Second Brain de Tiago Forte propõe o método CODE: Capture, Organize, Distill, Express. A ideia central é que nosso cérebro é para ter ideias, não para armazená-las.',
        status: 'INDEXED',
        summary: 'Resumo do método CODE do livro Building a Second Brain.',
      },
      {
        userId: devUser.id,
        type: 'LINK',
        title: 'LangGraph — Multi-agent Orchestration',
        content:
          'LangGraph é uma biblioteca para construir agentes multi-step com estado explícito.',
        sourceUrl: 'https://langchain-ai.github.io/langgraphjs/',
        status: 'INDEXED',
      },
      {
        userId: devUser.id,
        type: 'NOTE',
        title: 'DrizzleORM vs Prisma — Decisão ADR-007',
        content:
          'DrizzleORM escolhido por ausência de binário em runtime (~7.4kb), suporte nativo SQLite e geração de SQL puro auditável. Prisma descartado por binário de ~30MB e ausência de suporte nativo sqlite-vss.',
        status: 'INDEXED',
      },
      {
        userId: devUser.id,
        type: 'NOTE',
        title: 'Ollama — Configuração e uso de modelos locais',
        content:
          'Ollama gerencia LLMs locais. Para KnowHub: gemma3:4b (~3.8GB, Q4) como modelo principal e nomic-embed-text para embeddings. Iniciar: docker compose up -d. Baixar modelos: make ollama:pull.',
        status: 'PENDING',
      },
      {
        userId: devUser.id,
        type: 'PDF',
        title: 'Architecture Decision Records — Template',
        content:
          'Template para ADRs do KnowHub seguindo o formato: Contexto, Decisão, Consequências.',
        filePath: './docs/adr-template.pdf',
        status: 'FAILED',
      },
    ])
    .returning();

  // Tags
  const [tagAI, tagDev, tagProductivity] = await db
    .insert(schema.tags)
    .values([
      { name: 'ia', userId: devUser.id },
      { name: 'desenvolvimento', userId: devUser.id },
      { name: 'produtividade', userId: devUser.id },
    ])
    .returning();

  // Conexões semânticas entre entries
  await db.insert(schema.connectionEdges).values([
    {
      sourceId: entries[0].id, // BASB
      targetId: entries[2].id, // DrizzleORM (ambos são notas de decisão técnica)
      similarity: 0.72,
      type: 'semantic',
    },
    {
      sourceId: entries[1].id, // LangGraph
      targetId: entries[2].id, // DrizzleORM
      similarity: 0.81,
      type: 'semantic',
    },
  ]);

  console.log(`✅ Seed completed:`);
  console.log(`   - 1 user: ${devUser.email}`);
  console.log(`   - ${entries.length} knowledge entries`);
  console.log(`   - 3 tags`);
  console.log(`   - 2 connection edges`);
  sqlite.close();
}

seed().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
```

### 7.6 `Makefile` Completo

```makefile
# Makefile — Comandos de conveniência para o KnowHub AI Assistant
# Requer: make, Docker, Node.js 22+
# Windows: usar via WSL2 ou Git Bash
# Alternativa sem make: npm run <script> equivalente documentado abaixo

.PHONY: dev env db-reset db-seed db-generate db-migrate ollama-pull ollama-run down clean help

# ── Desenvolvimento ────────────────────────────────────────────────────────
dev: env ## Sobe infraestrutura e inicia todos os serviços em modo dev
	docker compose up -d
	npm run dev

env: ## Cria .env a partir de .env.example (não sobrescreve existentes)
	npm run env:setup

# ── Banco de Dados ─────────────────────────────────────────────────────────
db-reset: ## Apaga banco local e recria com migrations + seed
	npm run db:reset

db-seed: ## Popula banco com dados de exemplo
	npm run db:seed

db-generate: ## Gera migrations SQL a partir do schema TypeScript
	npm run db:generate

db-migrate: ## Aplica migrations pendentes
	npm run db:migrate

# ── Ollama ─────────────────────────────────────────────────────────────────
ollama-pull: ## Baixa os modelos necessários (gemma3:4b + nomic-embed-text)
	docker compose exec ollama ollama pull gemma3:4b
	docker compose exec ollama ollama pull nomic-embed-text
	@echo "✅ Models ready. Test: curl http://localhost:11434/api/tags"

ollama-run: ## Abre shell interativo no container Ollama para executar modelos
	docker compose exec -it ollama ollama run gemma3:4b

# ── Infraestrutura ─────────────────────────────────────────────────────────
down: ## Para os containers Docker (preserva volumes)
	docker compose down

clean: ## Para containers E remove volumes (reset total)
	docker compose down -v
	@echo "⚠️  Volumes removed. Run 'make dev' to start fresh."

# ── Utilitários ────────────────────────────────────────────────────────────
help: ## Exibe esta mensagem de ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
```

### 7.7 Scripts no `package.json` Raiz

```json
{
  "scripts": {
    "dev": "turbo run dev --filter=!web",
    "dev:web": "turbo run dev --filter=web",
    "dev:all": "turbo run dev",
    "build": "turbo run build --filter=!web",
    "build:all": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "env:setup": "node scripts/env-setup.js",
    "db:generate": "npm run --workspace=apps/api db:generate",
    "db:migrate": "npm run --workspace=apps/api db:migrate",
    "db:seed": "npm run --workspace=apps/api db:seed",
    "db:reset": "npm run --workspace=apps/api db:reset"
  }
}
```

### 7.8 Guia do Ollama — O que é e Por que Usamos

> Esta seção deve ser incluída na documentação do README como uma introdução acessível para desenvolvedores sem experiência prévia com LLMs locais.

**O que é o Ollama?**

Ollama é uma ferramenta que permite rodar Modelos de Linguagem de Grande Escala (LLMs) diretamente no seu computador, sem enviar nenhum dado para a internet. Ele funciona como um servidor HTTP local que recebe perguntas e retorna respostas geradas pelo modelo de IA instalado localmente.

**Por que o KnowHub usa Ollama?**

O KnowHub tem um princípio inegociável: seus dados pessoais nunca saem do seu dispositivo sem seu consentimento explícito. Para que a IA do KnowHub analise suas notas, responda perguntas sobre seu conhecimento e descubra conexões entre seus conteúdos, ela precisa processar seus dados — e o Ollama garante que esse processamento acontece 100% localmente.

**Qual modelo usamos e por quê?**

| Modelo             | Tamanho      | Uso           | Por quê                                                        |
| ------------------ | ------------ | ------------- | -------------------------------------------------------------- |
| `gemma3:4b`        | ~3.8 GB (Q4) | LLM principal | Multimodal, roda em 4GB RAM, desenvolvido pelo Google DeepMind |
| `nomic-embed-text` | ~274 MB      | Embeddings    | Gera vetores de alta qualidade para busca semântica            |

**Configuração passo a passo:**

```bash
# 1. Sobe o Ollama via Docker
docker compose up -d ollama

# 2. Aguarda o health check (status: healthy)
docker compose ps

# 3. Baixa os modelos necessários
make ollama-pull
# (ou: docker compose exec ollama ollama pull gemma3:4b)
# (e:  docker compose exec ollama ollama pull nomic-embed-text)

# 4. Verifica que os modelos estão disponíveis
curl http://localhost:11434/api/tags
# Deve retornar JSON com "gemma3:4b" e "nomic-embed-text" na lista

# 5. Testa o modelo interativamente (opcional)
make ollama-run
# (ou: docker compose exec -it ollama ollama run gemma3:4b)
# Digite uma pergunta e pressione Enter
# Ctrl+D para sair
```

**Usando API externa em vez do Ollama:**

Se você não tem hardware adequado para rodar o Ollama (mínimo 4GB RAM disponível para o modelo), você pode usar uma API de LLM externa configurando:

```bash
# apps/api/.env
LLM_API_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=sk-...

# Ou Azure OpenAI:
LLM_API_URL=https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-02-01
LLM_API_KEY=<azure-key>
```

Neste caso, seus dados **serão enviados** para o provedor externo. O KnowHub mostrará um aviso visível quando o modo cloud estiver ativo.

---

## 8. Definição de Pronto (Definition of Done)

Este épico é considerado **DONE** quando todos os itens abaixo estiverem verificados:

### Entregáveis Obrigatórios

- [ ] `docker-compose.yml` na raiz com serviços `redis` e `ollama` funcionando
- [ ] `docker compose up -d` testado em pelo menos 2 dos 3 sistemas operacionais (Linux/macOS/Windows WSL2)
- [ ] Health checks de Redis e Ollama passando com `docker compose ps`
- [ ] `apps/api/src/db/schema.ts` com todas as 7 tabelas declaradas em DrizzleORM
- [ ] `apps/api/src/db/migrations/` com pelo menos a migration inicial gerada e commitada
- [ ] `drizzle.config.ts` configurado e funcional
- [ ] `apps/api/src/db/seed.ts` executando sem erros, criando dados realistas
- [ ] `npm run db:seed` funcional a partir da raiz
- [ ] `npm run db:reset` funcional a partir da raiz
- [ ] `apps/api/.env.example` com todas as variáveis documentadas
- [ ] `apps/web/.env.example` com todas as variáveis documentadas
- [ ] `scripts/env-setup.js` funcional e testado
- [ ] `npm run env:setup` funcional a partir da raiz
- [ ] API falha com mensagem clara se variável obrigatória ausente
- [ ] `.env` em `.gitignore` de todos os workspaces
- [ ] `Makefile` na raiz com todos os targets documentados
- [ ] `make dev` testado do zero (sem `.env`, sem volumes) em ambiente limpo

### Validações Funcionais

- [ ] Clonar o repositório em máquina limpa, rodar `make dev` (ou equivalentes npm) e ter ambiente funcional em < 10 minutos
- [ ] `docker compose up -d` → `docker compose ps` mostra ambos os serviços como `(healthy)`
- [ ] `npm run dev` (após Docker up) inicia API e web sem erros
- [ ] `curl http://localhost:3001/health` retorna `{"status":"ok"}`
- [ ] `curl http://localhost:11434/api/tags` lista os modelos baixados
- [ ] `redis-cli -h localhost ping` retorna `PONG`
- [ ] Apagar `.env` → rodar `npm run env:setup` → `.env` recriado com secrets novos
- [ ] Iniciar API sem variável obrigatória → mensagem de erro clara no console
- [ ] `npm run db:seed` → seed executado sem erros
- [ ] `npm run db:reset` → banco resetado e reseedado corretamente

### Documentação

- [ ] Seção "Quick Start" no README com `make dev` como comando principal
- [ ] Seção "Serviços Docker" com tabela de portas e comandos comuns
- [ ] Seção "Banco de Dados" com diagrama de tabelas e comandos Drizzle
- [ ] Seção "Variáveis de Ambiente" com links para `.env.example` de cada workspace
- [ ] Guia do Ollama completo com: o que é, por que usamos, passo a passo de instalação, troubleshooting, e instrução sobre uso de API externa como alternativa
- [ ] Seção "Windows / macOS / Linux" com notas específicas de cada OS

---

## 9. Tarefas Técnicas

### 9.1 Docker Compose e Infraestrutura

| #   | Tarefa                                                       | Estimativa | Responsável |
| --- | ------------------------------------------------------------ | ---------- | ----------- |
| T1  | Criar `docker-compose.yml` com serviços `redis` e `ollama`   | 1h         | Dev         |
| T2  | Configurar health checks para Redis e Ollama                 | 30min      | Dev         |
| T3  | Configurar volumes persistentes `redis_data` e `ollama_data` | 30min      | Dev         |
| T4  | Testar `docker compose up -d` em Linux/macOS/Windows WSL2    | 2h         | Dev         |
| T5  | Documentar seção "Serviços Docker" no README                 | 1h         | Dev         |

### 9.2 Schema e Migrations

| #   | Tarefa                                                                                        | Estimativa | Responsável |
| --- | --------------------------------------------------------------------------------------------- | ---------- | ----------- |
| T6  | Criar `apps/api/src/db/schema.ts` com todas as 7 tabelas                                      | 2h         | Dev         |
| T7  | Configurar `apps/api/drizzle.config.ts`                                                       | 30min      | Dev         |
| T8  | Instalar dependências: `drizzle-orm`, `drizzle-kit`, `better-sqlite3`                         | 30min      | Dev         |
| T9  | Executar `drizzle-kit generate` e commitar migrations iniciais                                | 30min      | Dev         |
| T10 | Implementar `DatabaseModule` com auto-migrate no boot (NestJS)                                | 2h         | Dev         |
| T11 | Criar `apps/api/src/db/seed.ts` com dados de exemplo realistas                                | 2h         | Dev         |
| T12 | Adicionar scripts `db:seed`, `db:reset`, `db:generate`, `db:migrate` ao `package.json` da API | 30min      | Dev         |
| T13 | Adicionar scripts `db:*` ao `package.json` raiz (delegação para workspace)                    | 30min      | Dev         |
| T14 | Adicionar `local.db` ao `.gitignore` da API                                                   | 15min      | Dev         |

### 9.3 Variáveis de Ambiente

| #   | Tarefa                                                                                    | Estimativa | Responsável |
| --- | ----------------------------------------------------------------------------------------- | ---------- | ----------- |
| T15 | Criar `apps/api/.env.example` com todas as variáveis documentadas                         | 1h         | Dev         |
| T16 | Criar `apps/web/.env.example` com variáveis do Next.js                                    | 30min      | Dev         |
| T17 | Criar `scripts/env-setup.js` com geração de secrets aleatórios                            | 1h         | Dev         |
| T18 | Adicionar `env:setup` ao `package.json` raiz                                              | 15min      | Dev         |
| T19 | Implementar validação de variáveis obrigatórias no `ConfigModule` da API (via Joi schema) | 1h         | Dev         |
| T20 | Adicionar `.env` e `.env.local` ao `.gitignore` de todos os workspaces                    | 15min      | Dev         |

### 9.4 Makefile e Scripts

| #   | Tarefa                                                     | Estimativa | Responsável |
| --- | ---------------------------------------------------------- | ---------- | ----------- |
| T21 | Criar `Makefile` na raiz com todos os targets documentados | 1h         | Dev         |
| T22 | Testar todos os targets do Makefile em ambiente limpo      | 1h         | Dev         |

### 9.5 Documentação

| #   | Tarefa                                                                                     | Estimativa | Responsável |
| --- | ------------------------------------------------------------------------------------------ | ---------- | ----------- |
| T23 | Escrever seção "Quick Start" no README (com screenshots)                                   | 2h         | Dev         |
| T24 | Escrever guia completo do Ollama (o que é, por que usamos, passo a passo, troubleshooting) | 3h         | Dev         |
| T25 | Escrever seção "Banco de Dados" no README com diagrama de tabelas                          | 1h         | Dev         |
| T26 | Escrever seção "Variáveis de Ambiente" no README                                           | 1h         | Dev         |
| T27 | Documentar seção específica por OS (Windows WSL2, macOS, Linux)                            | 1h         | Dev         |

---

## 10. Dependências

### 10.1 Dependências Internas

| Épico                       | O que é necessário                                                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **EPIC-0.1** _(bloqueante)_ | Estrutura do monorepo com `apps/api` e `apps/web` criados e scripts `dev`, `build`, `test` funcionando. O `DatabaseModule` precisa ser integrado ao `AppModule` do NestJS, que deve existir. |

**Ordem de implementação recomendada:**

```
EPIC-0.1: monorepo + NestJS base ── deve estar completo ──▶ EPIC-0.3: ambiente local
```

> O EPIC-0.3 pode ter partes implementadas em paralelo com o EPIC-0.1 (Docker Compose, scripts de env), mas a integração do `DatabaseModule` com o bootstrap da API requer que a estrutura básica do NestJS exista.

### 10.2 Dependências de Packages npm

| Package                 | Workspace  | Propósito                                               | Tipo       |
| ----------------------- | ---------- | ------------------------------------------------------- | ---------- |
| `drizzle-orm`           | `apps/api` | ORM principal com suporte a SQLite                      | production |
| `drizzle-kit`           | `apps/api` | CLI para geração e aplicação de migrations              | dev        |
| `better-sqlite3`        | `apps/api` | Driver SQLite para Node.js (síncrono, alta performance) | production |
| `@types/better-sqlite3` | `apps/api` | Tipos TypeScript para better-sqlite3                    | dev        |
| `joi`                   | `apps/api` | Validação do schema de variáveis de ambiente            | production |

### 10.3 Dependências de Sistema (Ambiente Local)

| Ferramenta                     | Versão mínima          | Necessário para               | Instalação                                             |
| ------------------------------ | ---------------------- | ----------------------------- | ------------------------------------------------------ |
| Docker Engine / Docker Desktop | 24+                    | `docker compose up`           | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Docker Compose                 | v2+ (plugin integrado) | `docker compose`              | Incluído no Docker Desktop                             |
| Node.js                        | 22.x LTS               | `npm run *`, API, Web         | [nodejs.org](https://nodejs.org/)                      |
| make                           | qualquer               | `make dev` (opcional)         | Linux/macOS: nativo; Windows: via WSL2 ou Chocolatey   |
| curl                           | qualquer               | Health check manual do Ollama | Linux/macOS: nativo; Windows: disponível no WSL2       |

---

## 11. Estratégia de Testes

### 11.1 Abordagem

O EPIC-0.3 é testado **manualmente nos três sistemas operacionais suportados**, seguindo um checklist de validação que simula o fluxo de um desenvolvedor novo clonando o repositório pela primeira vez.

Não há testes automatizados para configuração de ambiente — a validação é feita pelo CI do EPIC-0.2 que executa `npm run build` e `npm run test`, e pelo smoke test de startup da API que valida as migrations e variáveis de ambiente.

### 11.2 Checklist de Testes por OS

#### Linux (Ubuntu 22.04+)

| Cenário           | Como testar                                  | Resultado esperado                                  |
| ----------------- | -------------------------------------------- | --------------------------------------------------- |
| Setup do zero     | Clonar repo limpo, rodar `make dev`          | Ambiente funcional em < 10 min                      |
| Docker Compose up | `docker compose up -d` + `docker compose ps` | Ambos os serviços `(healthy)`                       |
| Auto-migrate      | Iniciar API sem `local.db`                   | Banco criado e migrations aplicadas automaticamente |
| Seed              | `npm run db:seed` em banco vazio             | 5 entries criados sem erros                         |
| Reset             | `npm run db:reset`                           | Banco apagado e reseedado                           |
| Env setup         | Apagar `.env`, rodar `npm run env:setup`     | `.env` recriado com secrets únicos                  |
| Validação de env  | Remover `JWT_SECRET` do `.env`               | Mensagem clara de erro no startup da API            |
| Ollama pull       | `make ollama-pull`                           | Modelos baixados e disponíveis em `GET /api/tags`   |

#### macOS (Apple Silicon + Intel)

| Cenário            | Como testar                              | Resultado esperado                        |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| Docker Desktop     | Garantir que Docker Desktop está rodando | `docker info` sem erros                   |
| Redis health       | `redis-cli -h localhost ping`            | `PONG`                                    |
| Ollama health      | `curl http://localhost:11434/api/tags`   | JSON com lista de modelos                 |
| Performance Ollama | `make ollama-run` (query simples)        | Resposta em < 5s no M1/M2; < 15s no Intel |

#### Windows (WSL2 + Docker Desktop)

| Cenário         | Como testar                                     | Resultado esperado                    |
| --------------- | ----------------------------------------------- | ------------------------------------- |
| Docker via WSL2 | `docker compose up -d` no terminal WSL2         | Containers sobem sem erros            |
| make via WSL2   | `make dev` no terminal WSL2                     | Funciona idêntico ao Linux            |
| Alternativa npm | `npm run env:setup && npm run dev` (PowerShell) | Funciona sem make                     |
| Paths Windows   | API cria `local.db` no caminho correto          | Arquivo criado em `apps/api/local.db` |

### 11.3 Testes de Regressão do Schema

Após qualquer alteração no `schema.ts`:

```bash
# 1. Gerar nova migration
npm run db:generate

# 2. Verificar o SQL gerado (revisão manual obrigatória)
cat apps/api/src/db/migrations/<timestamp>_<name>.sql

# 3. Aplicar em banco de dev e verificar
npm run db:migrate

# 4. Verificar que seed ainda funciona após migration
npm run db:reset
```

---

## 12. Riscos e Mitigações

| Risco                                                                    | Probabilidade           | Impacto | Mitigação                                                                                                                        |
| ------------------------------------------------------------------------ | ----------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Ollama consome muita RAM e tranca a máquina do dev                       | Alta (hardware variado) | Alto    | Documentar requisitos mínimos (8GB RAM recomendado); `LLM_API_URL` como escape hatch para hardware limitado                      |
| Download do modelo `gemma3:4b` (~3.8 GB) falha por timeout ou rede lenta | Média                   | Médio   | `make ollama-pull` tem retry automático do Ollama; documentar como verificar progresso do download                               |
| Docker Desktop não está instalado em Windows (sem WSL2)                  | Média                   | Alto    | Documentar instalação do Docker Desktop como pré-requisito; alternativa: Ollama nativo em Windows                                |
| Conflito de porta 6379 (Redis já instalado localmente)                   | Média                   | Médio   | Documentar como mapear para porta alternativa (`REDIS_PORT=6380`); flag `REDIS_URL` no `.env`                                    |
| `better-sqlite3` falha em build no Windows (requer compilação nativa)    | Média                   | Alto    | Documentar dependência do `node-gyp`; alternativa: usar `ws` (WASM-based sqlite) como fallback                                   |
| Migration automática no boot quebra em schema com dados existentes       | Baixa                   | Alto    | DrizzleORM migrations são idempotentes; não executam SQL já aplicado; `strict: true` no config garante detecção de conflitos     |
| `.env` com secrets commitado acidentalmente                              | Baixa                   | Crítico | `.env` no `.gitignore` de todos os workspaces; `pre-commit` hook via `husky` bloqueia commit de `.env`                           |
| `make` não disponível em Windows sem WSL2                                | Alta                    | Médio   | Todos os targets do Makefile têm equivalentes `npm run *` documentados; make é opcional                                          |
| Ollama no Docker sem GPU tem performance inaceitável                     | Média                   | Médio   | Documentar modo de uso com GPU (NVIDIA); documentar uso do Ollama nativo para melhor performance; `LLM_API_URL` como alternativa |

---

## 13. Métricas de Sucesso

### 13.1 Métricas Quantitativas

| Métrica                                                | Meta                                               | Como medir                                                   |
| ------------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| Tempo do zero ao ambiente funcional                    | < 10 minutos (excluindo download do modelo Ollama) | Cronometrado manualmente em 3 OS diferentes                  |
| Tempo do zero ao ambiente funcional (incluindo Ollama) | < 30 minutos em conexão de 100Mbps                 | Download de ~4GB a 100Mbps ≈ 5min; setup ≈ 5min              |
| Número de sistemas operacionais validados              | 3 (Linux, macOS, Windows WSL2)                     | Checklist de testes manual                                   |
| Variáveis de ambiente não documentadas                 | 0                                                  | Revisão manual do `.env.example` vs uso no código            |
| Tabelas do schema não declaradas no DrizzleORM         | 0 (todas as 7 tabelas presentes)                   | Revisão manual do schema vs especificação técnica            |
| Scripts npm faltando para operações de banco           | 0                                                  | Verificar `db:seed`, `db:reset`, `db:generate`, `db:migrate` |

### 13.2 Métricas Qualitativas

- Novo desenvolvedor sem conhecimento prévio de Ollama consegue fazer `make ollama-pull` e executar o primeiro modelo com sucesso seguindo apenas o README
- O erro de variável de ambiente ausente é claro o suficiente para que o desenvolvedor saiba exatamente o que configurar sem precisar ler o código-fonte
- O processo de `db:reset` é confiável o suficiente para ser usado como base de dados "limpa" entre sessões de desenvolvimento

### 13.3 Benchmark de Performance

| Operação                                        | Meta          | Ambiente de Referência     |
| ----------------------------------------------- | ------------- | -------------------------- |
| `docker compose up -d` (sem download de imagem) | < 10 segundos | Ubuntu 22.04, Docker 24+   |
| `npm run dev` (API + Web) até primeira resposta | < 30 segundos | Node.js 22 LTS, SSD        |
| Auto-migrate no boot da API                     | < 1 segundo   | SQLite com < 10 migrations |
| `npm run db:seed`                               | < 5 segundos  | Banco vazio, 5 entries     |
| `npm run env:setup`                             | < 2 segundos  | Qualquer OS                |

---

## 14. Estimativa e Priorização

### 14.1 Estimativa Global

**Estimativa total: M (3–5 dias úteis)**

Detalhamento por componente:

| Componente                                        | Estimativa  | Sequência                         |
| ------------------------------------------------- | ----------- | --------------------------------- |
| Docker Compose + health checks + testes multi-OS  | 1 dia       | Primeiro (paralelo com EPIC-0.1)  |
| Schema DrizzleORM + migrations + DatabaseModule   | 1,5 dias    | Segundo (requer estrutura NestJS) |
| Seed script + scripts npm + db:reset              | 0,5 dia     | Terceiro                          |
| `.env.example` + `env:setup` + validação Joi      | 1 dia       | Paralelo ao schema                |
| Makefile + README + guia Ollama (com screenshots) | 1 dia       | Último                            |
| **Total**                                         | **~5 dias** |                                   |

### 14.2 Ordem de Implementação Recomendada

```
Fase 1 (Independente de EPIC-0.1):
  docker-compose.yml ──── pode ser criado imediatamente
  .env.example ─────────── pode ser criado imediatamente
  Makefile (estrutura) ─── pode ser criado imediatamente

Fase 2 (Requer estrutura NestJS do EPIC-0.1):
  schema.ts ──────────── requer apps/api criado
  drizzle.config.ts ───── requer apps/api criado
  DatabaseModule ──────── requer AppModule do NestJS

Fase 3 (Requer Fase 2):
  migrations geradas ─── requer schema.ts
  seed.ts ─────────────── requer schema.ts e migrations
  scripts npm ─────────── requer db:* funcionando

Fase 4 (Polimento):
  README ─────── requer todo o ambiente testado e validado
  screenshots ── requer README escrito
```

### 14.3 Priorização das Stories

| Story                               | Prioridade   | Justificativa                                                                                                                            |
| ----------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| STORY-0.3.1 (Docker Compose)        | P0 — Crítico | Redis e Ollama são dependências de runtime para qualquer funcionalidade de IA; sem Docker Compose, cada dev configura de forma diferente |
| STORY-0.3.2 (Schema + Migrations)   | P0 — Crítico | A API não pode iniciar sem banco de dados; todas as funcionalidades dependem do schema                                                   |
| STORY-0.3.3 (Variáveis de Ambiente) | P1 — Alto    | Sem `.env` documentado, a experiência de onboarding é travada; validação de startup previne horas de debug                               |

---

## 15. Referências

### Documentação Oficial

- [DrizzleORM — SQLite Getting Started](https://orm.drizzle.team/docs/get-started-sqlite)
- [drizzle-kit — Migrations](https://orm.drizzle.team/kit-docs/overview)
- [Ollama — Docker Hub](https://hub.docker.com/r/ollama/ollama)
- [Ollama — REST API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [Valkey — Docker Hub](https://hub.docker.com/r/valkey/valkey)
- [Docker Compose — Healthcheck](https://docs.docker.com/compose/compose-file/05-services/#healthcheck)
- [NestJS — ConfigModule](https://docs.nestjs.com/techniques/configuration)
- [better-sqlite3 — API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Building a Second Brain (BASB)](https://www.buildingasecondbrain.com/book) — Tiago Forte

### Arquivos do Repositório

- [`AGENTS.md`](../AGENTS.md) — Regras e comandos do monorepo
- [`docs-specs/epicos.md`](./epicos.md) — Definição do EPIC-0.3
- [`docs-specs/spec-tecnica.md`](./spec-tecnica.md) — Especificação técnica completa (Seções 3 e 4)
- [`docs-specs/spec-nao-tecnica.md`](./spec-nao-tecnica.md) — Especificação não-técnica (princípios do produto)
- [`docs-specs/PRD-EPIC-0.1.md`](./PRD-EPIC-0.1.md) — PRD do Setup do Monorepo (dependência)
- [`docs/agent/workflows.md`](../docs/agent/workflows.md) — Fluxos de build e dev
- [`docs/agent/architecture.md`](../docs/agent/architecture.md) — Fronteiras dos workspaces

### ADRs Relevantes

- **ADR-001** — NestJS como framework de backend (`spec-tecnica.md`)
- **ADR-003** — SQLite + sqlite-vss para armazenamento local (`spec-tecnica.md`)
- **ADR-006** — Estratégia híbrida de modelos de IA (Ollama + Azure OpenAI) (`spec-tecnica.md`)
- **ADR-007** — DrizzleORM como ORM/migration tool (`spec-tecnica.md`)
- **ADR-010** — PM2 como process manager local (`spec-tecnica.md`)

---

## 16. Checklist Final de Aceite do Épico (Consolidação - 2026-03-01)

### 16.1 Status Geral

- [x] Phase 1 (Setup) concluída
- [x] Phase 2 (Foundational) concluída
- [x] US1 concluída e validada manualmente
- [x] US2 concluída e validada manualmente
- [x] US3 concluída e validada manualmente
- [x] Contrato OpenAPI atualizado para refletir payloads implementados
- [x] Consistência entre `plan.md`, `tasks.md` e `quickstart.md` revisada
- [x] Quality gate de lint executado com sucesso

### 16.2 Evidências de Validação Manual

- [x] `GET /health` retorna `status=ok`
- [x] `GET /dev/environment/status` retorna status do ambiente e aviso quando fallback externo está ativo
- [x] `GET /dev/database/schema-version` retorna `currentVersion` e `pendingMigrations`
- [x] `POST /dev/database/seed` retorna dataset esperado de desenvolvimento
- [x] `POST /dev/environment/reset` com `confirm=true` retorna `status=accepted`
- [x] `GET /dev/environment/variables` retorna catálogo de variáveis por workspace
- [x] `POST /dev/environment/variables/validate` retorna `pass|fail` com detalhes acionáveis

### 16.3 Observações Operacionais

- [x] Fluxo de banco local compatível com ambiente Windows/OneDrive sem dependência de `drizzle-kit migrate` em runtime
- [x] Setup de variáveis permanece idempotente e preserva valores existentes
- [x] Fallback externo de IA permanece explícito e desabilitado por padrão (`ENABLE_EXTERNAL_AI=false`)
