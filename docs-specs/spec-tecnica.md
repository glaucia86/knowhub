# Especificação Técnica: KnowHub AI Assistant - v.01

# Especificação Técnica Detalhada

**Glaucia Lemos** · Senior Software Engineer & AI Developer Specialist

Versão 0.1 · Fevereiro 2026 · Projeto Open Source · MIT License

`NestJS` · `Next.js` · `TypeScript` · `LangChain.js` · `LangGraph` · `DrizzleORM` · `SQLite` · `PostgreSQL` · `Ollama` · `Azure OpenAI` · `PM2`

---

## Índice

1. [Visão Geral da Arquitetura](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#1-vis%C3%A3o-geral-da-arquitetura)
2. [Stack Tecnológica — Decisões e Justificativas](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#2-stack-tecnol%C3%B3gica--decis%C3%B5es-e-justificativas)
3. [Estrutura do Projeto (Monorepo)](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#3-estrutura-do-projeto-monorepo)
4. [Modelo de Dados](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#4-modelo-de-dados)
5. [Arquitetura dos Agentes de IA](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#5-arquitetura-dos-agentes-de-ia)
6. [Contratos de API (REST)](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#6-contratos-de-api-rest)
7. [WebSocket — Eventos em Tempo Real](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#7-websocket--eventos-em-tempo-real)
8. [Pipeline de Ingestão — Detalhamento](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#8-pipeline-de-ingest%C3%A3o--detalhamento)
9. [Estratégia de Modelos de IA](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#9-estrat%C3%A9gia-de-modelos-de-ia)
10. [Segurança e Privacidade](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#10-seguran%C3%A7a-e-privacidade)
11. [Deployment e Infraestrutura](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#11-deployment-e-infraestrutura)
12. [Estratégia de Testes](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#12-estrat%C3%A9gia-de-testes)
13. [Variáveis de Ambiente](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#13-vari%C3%A1veis-de-ambiente)
14. [Sistema de Plugins](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#14-sistema-de-plugins)
15. [Roadmap Técnico por Fase](https://claude.ai/chat/56cdc72b-13f0-496c-a736-e97a055e9f1e#15-roadmap-t%C3%A9cnico-por-fase)
16. [Sistema de Skills e Identidade do Assistente](#16-sistema-de-skills-e-identidade-do-assistente)

---

## 1. Visão Geral da Arquitetura

O KnowHub AI Assistant é construído sobre uma arquitetura **local-first**, onde todos os componentes rodam no dispositivo do usuário por padrão, com suporte opcional a serviços em nuvem. A separação clara entre backend e frontend garante escalabilidade e manutenibilidade à medida que o projeto cresce.

### 1.1 Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (dispositivo do usuário)         │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐   ┌──────────────┐  │
│  │   Next.js    │    │   Telegram   │   │     CLI      │  │
│  │  (Frontend)  │    │  Bot Gateway │   │   (npx cmd)  │  │
│  └──────┬───────┘    └──────┬───────┘   └──────┬───────┘  │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │  REST / WebSocket            │
│                    ┌────────▼────────┐                     │
│                    │   NestJS API    │                     │
│                    │   (Core Engine) │                     │
│                    └────────┬────────┘                     │
│          ┌──────────────────┼──────────────────┐           │
│          │                  │                  │           │
│   ┌──────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐   │
│   │  Agent de   │  │  Agent de    │  │  Agent de    │   │
│   │  Indexação  │  │   Query      │  │  Manutenção  │   │
│   │   (RAG)     │  │  (Insights)  │  │  (Cleanup)   │   │
│   └──────┬──────┘  └───────┬──────┘  └──────────────┘   │
│          │                  │                              │
│   ┌──────▼──────────────────▼──────┐                     │
│   │         LangChain.js            │                     │
│   │     (Orchestration Layer)       │                     │
│   └──────┬──────────────────────────┘                     │
│          │                                                  │
│   ┌──────▼──────┐         ┌───────────────┐              │
│   │   SQLite    │         │  Ollama /     │              │
│   │ + sqlite-vss│         │  Azure OpenAI │              │
│   │  (Vectors)  │         │  (AI Models)  │              │
│   └─────────────┘         └───────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Princípios Arquiteturais

- **Separation of Concerns:** Backend (NestJS) e Frontend (Next.js) são projetos independentes, comunicando-se exclusivamente via API REST e WebSocket.
- **Local-first by default:** Toda a stack roda no dispositivo do usuário. Cloud é opt-in, jamais opt-out.
- **Modularidade:** Cada Agent, cada integração e cada plugin é um módulo NestJS independente, com interface bem definida.
- **Graceful degradation:** Se o modelo de IA local não estiver disponível, o sistema cai para cloud com consentimento do usuário. Se cloud não estiver disponível, funcionalidades de IA são desabilitadas sem quebrar o app.
- **Schema-first:** Contratos de API definidos via DTOs com class-validator antes da implementação. Banco de dados com migrações versionadas.

---

## 2. Stack Tecnológica — Decisões e Justificativas

Cada decisão tecnológica foi tomada com critérios claros: experiência da equipe, ecosistema open source, manutenibilidade de longo prazo e adequação ao modelo local-first. As ADRs abaixo documentam o raciocínio para referência futura.

### ADR-001 · NestJS como framework de backend

|                              |                                                                                                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**                  | NestJS com TypeScript como framework principal do servidor.                                                                                                                                                                                                                     |
| **Motivação**                | Arquitetura modular baseada em módulos, controllers e services com injeção de dependências nativa. Suporte robusto a TypeScript, CLI para geração de boilerplate, integração nativa com Jest, BullMQ e GraphQL. Facilita separação clara dos Agents como módulos independentes. |
| **Alternativas descartadas** | Express puro (sem estrutura modular para projetos grandes). Fastify (menos ecosystem para IA). Hono (novo e não testado em larga escala).                                                                                                                                       |

### ADR-002 · Next.js com App Router como frontend

|                              |                                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Decisão**                  | Next.js 15 com App Router como SPA/SSR separado do backend.                                                                                                                                                              |
| **Motivação**                | Domínio de mercado (68% de adoção vs Remix em 2026), React Server Components para performance, API Routes para BFF quando necessário, suporte a PWA via next-pwa. Comunicação com NestJS via fetch e SWR/TanStack Query. |
| **Alternativas descartadas** | Remix (menor ecossistema). React + Vite (mais configuração manual para SSR). Angular (overhead desnecessário).                                                                                                           |

### ADR-003 · SQLite + sqlite-vss para armazenamento local

|                  |                                                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**      | SQLite como banco local com extensão sqlite-vss (FAISS) para busca vetorial.                                                                                                                         |
| **Motivação**    | Zero-setup, embedded, portátil e perfeito para aplicações desktop local-first. A extensão sqlite-vss adiciona suporte a vetores diretamente no banco, sem necessidade de um banco vetorial separado. |
| **Alternativas** | PostgreSQL + pgvector: reservado para modo cloud/team (exige instalação de servidor). LanceDB e Chroma: considerados, mas menos maduros.                                                             |

### ADR-004 · Neon (PostgreSQL + pgvector) para modo cloud

|                  |                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**      | Neon Serverless Postgres com pgvector para o modo cloud opcional.                                                                                                    |
| **Motivação**    | Postgres serverless com pgvector nativo, branching para dev/staging, auto-suspend, free tier generoso. Integração via DrizzleORM com migration path limpo de SQLite. |
| **Alternativas** | Supabase (mais opinativo, difícil de self-host). PlanetScale (sem suporte a vetores). MongoDB Atlas (modelo relacional é mais adequado).                             |

### ADR-005 · LangChain.js + LangGraph para orquestração de IA

|                  |                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**      | LangChain.js `^1.2.x` para abstração de providers + `@langchain/langgraph ^1.1.x` para orquestração dos agentes como grafos de estado.                                                                                                                                                                                                                                              |
| **Motivação**    | LangChain.js v1.x unificou as abstrações de providers e deprecou o `AgentExecutor` (padrão 0.x). O novo padrão canônico usa LangGraph como base dos agentes. `RetrievalQAChain` foi substituído por `createRetrievalChain`. Os providers são importados direto dos pacotes (`@langchain/openai`, `@langchain/ollama`). Streaming unificado via `for await (const chunk of stream)`. |
| **Alternativas** | LlamaIndex.TS (boa alternativa, mas ecosistema menor). Vercel AI SDK (mais simples, sem suporte a multi-agent / human-in-the-loop).                                                                                                                                                                                                                                                 |

### ADR-006 · Estratégia híbrida de modelos de IA

|                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Decisão**      | Ollama com Gemma-3 4B ou Phi-4 Mini como padrão local; Azure OpenAI `gpt-5.1` como fallback cloud opt-in.                                                                                                                                                                                                                                                                                                                                                                |
| **Motivação**    | Gemma-3 4B (quantizado Q4, ~3.8 GB) roda em 4GB RAM e é multimodal. Phi-4 Mini tem melhor raciocínio que Phi-3. Ollama gerencia downloads e execução sem configuração técnica. **`gpt-4o` entra em retire obrigatório em 2026-03-31**; `gpt-5.1` é o substituto GA. Azure como escape hatch sempre com consentimento explícito. O `AIProviderFactory` consulta dinamicamente os modelos disponíveis via `GET http://localhost:11434/api/tags` em vez de hardcodar nomes. |
| **Alternativas** | Llama 3.3 8B (exige hardware mais robusto). OpenAI direto (privacy concern, custo obrigatório).                                                                                                                                                                                                                                                                                                                                                                          |

### ADR-007 · DrizzleORM como ORM/migration tool

|                              |                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**                  | DrizzleORM como ORM e `drizzle-kit` para migrations versionadas em SQL puro.                                                                                                                                                                                                                                                                                                                                               |
| **Motivação**                | ~7.4kb minified+gzipped, zero dependências externas, sem binário gerado em runtime (zero cold start). Suporte nativo a SQLite (better-sqlite3), PostgreSQL (Neon) e tipos customizados para `embedding` (JSON em SQLite, `vector[]` em pgvector). Emite exatamente 1 query SQL por operação — sem N+1 implícito. A ausência de binário gerado é crítica para uma aplicação local-first que roda no dispositivo do usuário. |
| **Alternativas descartadas** | Prisma (binário de ~30MB gerado em runtime, sem suporte nativo a `sqlite-vss`, Data Proxy obrigatório em serverless). TypeORM (manutenção inconsistente, mais pesado sem benefício equivalente).                                                                                                                                                                                                                           |

### ADR-008 · LangGraph para arquitetura dos agentes

|                              |                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**                  | `@langchain/langgraph ^1.1.x` como base dos três agentes (`IndexingAgent`, `QueryAgent`, `MaintenanceAgent`).                                                                                                                                                                                                                                                                       |
| **Motivação**                | A partir de LangChain.js v1.x, o `AgentExecutor` está deprecado. O padrão canônico é LangGraph com **grafos de estado**. Habilita: controle de fluxo explícito entre steps, **human-in-the-loop nativo** (exigência do `MaintenanceAgent`: "usuário sempre no controle"), persistência de estado entre steps via checkpointing e multi-agent supervisor com roteamento declarativo. |
| **Alternativas descartadas** | `AgentExecutor` (deprecado em v1.x). `RetrievalQAChain` (deprecado — substituído por `createRetrievalChain`). Chains sequenciais puras (sem suporte a ramificações e human-in-the-loop).                                                                                                                                                                                            |

### ADR-009 · TanStack AI no frontend (opcional)

|                |                                                                                                                                                                                                                                                                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**    | `@tanstack/ai-react ^0.5.x` para gerenciamento de estado do chat e streaming de tokens no frontend (`apps/web`).                                                                                                                                                                                                                       |
| **Motivação**  | Substitui gerenciamento manual de estado do chat (`useState`/`useEffect`/parsing de SSE). Fornece hooks type-safe (`useGenerate`, `useStream`). Provider-agnostic. Integra via adapter customizado apontado para o endpoint SSE do NestJS (`/api/v1/query/ask/stream`). Camada frontend apenas — não compete com LangGraph no backend. |
| **Observação** | Projeto em `v0.5.x` (pré-1.0). API pode mudar. O risco é aceitável pois o backend LangGraph é independente.                                                                                                                                                                                                                            |

### ADR-010 · PM2 como process manager local

|                              |                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Decisão**                  | PM2 `^5.x` para gerenciar os processos locais (NestJS + Next.js standalone) em background com auto-start no boot.                                                                                                                                                                                                      |
| **Motivação**                | Solução leve sem overhead do Electron (~120MB). Funciona em Windows (`pm2-windows-startup`), macOS (`launchd`) e Linux (`systemd`). Monitor de saúde integrado com restart automático. O frontend Next.js é gerado com `output: 'standalone'` (`next build`), eliminando a dependência do servidor de desenvolvimento. |
| **Alternativas descartadas** | Electron Shell (overhead de 120MB, build/distribute complexo). Tauri (requer toolchain Rust). Script shell puro (experiência diferente por OS, difícil de debugar para usuário não-técnico).                                                                                                                           |

### Stack Consolidada

| Camada              | Tecnologia                       | Versão        | Papel                                                            |
| ------------------- | -------------------------------- | ------------- | ---------------------------------------------------------------- |
| Backend API         | NestJS + TypeScript              | ^10.x         | Core engine, REST API, WebSocket, gerenciamento dos Agents       |
| Frontend            | Next.js + TypeScript             | ^15.x         | Interface web, dashboard, mapa visual                            |
| Orquestração AI     | LangChain.js                     | ^1.2.x        | RAG pipelines, abstração de providers de LLM                     |
| Multi-agent         | @langchain/langgraph             | ^1.1.x        | Grafos de estado para os 3 agentes (substitui AgentExecutor)     |
| Chat UI (streaming) | @tanstack/ai-react               | ^0.5.x        | State management do chat + streaming SSE no frontend             |
| DB Local            | SQLite + sqlite-vss              | latest        | Armazenamento local com busca vetorial                           |
| DB Cloud            | Neon (PostgreSQL + pgvector)     | latest        | Armazenamento cloud opcional, multi-user futuro                  |
| ORM / Migrations    | DrizzleORM + drizzle-kit         | latest stable | Schema TypeScript, migrations SQL geradas, zero runtime overhead |
| Modelos AI (local)  | Ollama + Gemma-3 4B / Phi-4 Mini | latest        | Inferência local privada, zero cloud                             |
| Modelos AI (cloud)  | Azure OpenAI (gpt-5.1)           | latest        | Fallback opt-in para hardware limitado                           |
| Embeddings (local)  | nomic-embed-text via Ollama      | latest        | Geração de vetores local                                         |
| Embeddings (cloud)  | text-embedding-3-small           | latest        | Embeddings cloud como alternativa                                |
| Queue / Jobs        | BullMQ + Valkey/Redis            | ^5.x          | Processamento assíncrono de indexação                            |
| Process manager     | PM2                              | ^5.x          | Gerencia processos locais com auto-start no boot                 |
| CLI                 | Commander.js + tsx               | ^12.x         | Interface de linha de comando                                    |
| Bots de chat        | grammY (Telegram)                | ^1.x          | Gateway Telegram como canal de captura                           |
| Testes (unit)       | Jest + ts-jest                   | ^29.x         | Testes unitários backend e agentes                               |
| Testes (e2e)        | Playwright                       | ^1.x          | Testes end-to-end da interface web                               |
| Testes (contrato)   | Pact.js                          | ^12.x         | Contract testing frontend ↔ backend                              |
| Linting             | ESLint + Prettier                | latest        | Consistência de código                                           |
| CI/CD               | GitHub Actions                   | latest        | Automação de testes, build e releases                            |
| Monorepo            | Turborepo                        | ^2.x          | Gerenciamento de workspaces                                      |

---

## 3. Estrutura do Projeto (Monorepo)

O projeto utiliza **Turborepo** para gerenciar um monorepo com três apps principais (`api`, `web`, `cli`) e pacotes compartilhados (`shared-types`, `shared-utils`).

```
knowhub-ai-assistant/
├── apps/
│   ├── api/                     # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # Autenticação local (JWT)
│   │   │   │   ├── knowledge/   # CRUD de entradas de conhecimento
│   │   │   │   ├── agents/      # Módulo dos 3 agentes IA
│   │   │   │   │   ├── indexing/    # Agent de Indexação (RAG)
│   │   │   │   │   ├── query/       # Agent de Query (insights)
│   │   │   │   │   └── maintenance/ # Agent de Manutenção
│   │   │   │   ├── ingestion/   # Pipeline de captura (URL, PDF, texto)
│   │   │   │   ├── embeddings/  # Geração e busca de vetores
│   │   │   │   ├── plugins/     # Plugin loader e registry
│   │   │   │   ├── telegram/    # Bot gateway Telegram (grammY)
│   │   │   │   ├── discord/     # Bot gateway Discord (opcional, v2+)
│   │   │   │   ├── github/      # Integração GitHub OAuth + API
│   │   │   │   └── config/      # Configurações e env vars
│   │   │   ├── skills/      # Identidade e skills do assistente
│   │   │   │   ├── SOUL.md      # Personalidade e valores do KnowHub AI
│   │   │   │   ├── AGENTS.md    # Instruções gerais do agente
│   │   │   │   └── skills/
│   │   │   │       ├── knowledge-rag/ SKILL.md
│   │   │   │       ├── connections/   SKILL.md
│   │   │   │       ├── summarize/     SKILL.md
│   │   │   │       └── maintenance/   SKILL.md
│   │   │   ├── shared/
│   │   │   │   ├── filters/     # Exception filters globais
│   │   │   │   ├── guards/      # Auth guards
│   │   │   │   ├── interceptors/# Logging, transform response
│   │   │   │   └── pipes/       # Validation pipes
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── drizzle/
│   │   │   ├── schema.ts            # Schema TypeScript (tabelas, índices, tipos)
│   │   │   └── migrations/          # SQL gerados pelo drizzle-kit
│   │   └── test/
│   │
│   ├── web/                     # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (dashboard)/     # Rotas autenticadas
│   │   │   │   ├── page.tsx     # Dashboard principal
│   │   │   │   ├── knowledge/   # Lista e detalhe de itens
│   │   │   │   ├── map/         # Mapa visual de conhecimento
│   │   │   │   ├── chat/        # Interface de query com o assistente
│   │   │   │   └── settings/    # Configurações do usuário
│   │   │   ├── (auth)/          # Login / onboarding
│   │   │   ├── api/             # API Routes (BFF leve)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/              # Design system (shadcn/ui)
│   │   │   ├── knowledge-graph/ # Visualização React Flow
│   │   │   └── chat/            # Componentes do assistente
│   │   └── lib/
│   │
│   └── cli/                     # CLI (Commander.js)
│       └── src/
│           └── commands/
│               ├── add.ts       # knowhub add "texto" ou knowhub add <url>
│               ├── ask.ts       # knowhub ask "pergunta"
│               ├── list.ts      # knowhub list [--tag X]
│               └── sync.ts      # knowhub sync (manutenção manual)
│
├── packages/
│   ├── shared-types/            # Tipos TypeScript compartilhados
│   │   └── src/
│   │       ├── knowledge.types.ts
│   │       ├── agent.types.ts
│   │       └── api.types.ts
│   └── shared-utils/            # Utilitários compartilhados
│       └── src/
│           ├── text-splitter.ts
│           └── metadata-extractor.ts
│
├── turbo.json
├── package.json                 # Root workspace
└── .github/
    ├── workflows/
    │   ├── ci.yml               # Tests + lint em PRs
    │   └── release.yml          # Build + publish em tags
    └── ISSUE_TEMPLATE/
```

---

## 4. Modelo de Dados

O schema é definido via **DrizzleORM**, garantindo type-safety end-to-end com zero overhead em runtime e migrations versionadas em SQL puro (geradas pelo `drizzle-kit`). O mesmo schema TypeScript funciona com SQLite (local, via `better-sqlite3`) e PostgreSQL/Neon (cloud, via `node-postgres`), com os drivers abstraídos pelo Drizzle.

> **Nota sobre `embedding`:** Em SQLite, o vetor é armazenado como JSON serializado (`text`). Em PostgreSQL, utiliza o tipo nativo `vector(1536)` do pgvector. O DrizzleORM permite declarar tipos customizados para esse campo sem gambiarras.

### 4.1 Schema DrizzleORM Completo

```ts
// apps/api/src/db/schema.ts

import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ── Usuário (suporte futuro a multi-user) ─────────────────────
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').unique(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// ── Configurações do usuário ───────────────────────────────────
export const userSettings = sqliteTable('user_settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  aiProvider: text('ai_provider').default('ollama'), // "ollama" | "azure"
  aiModel: text('ai_model').default('gemma3:4b'),
  embeddingModel: text('embedding_model').default('nomic-embed-text'),
  privacyMode: text('privacy_mode').default('local'), // "local" | "hybrid"
  language: text('language').default('pt-BR'),
  telegramEnabled: integer('telegram_enabled', { mode: 'boolean' }).default(false),
  telegramToken: text('telegram_token'),
});

// ── Entrada de conhecimento (core entity) ─────────────────────
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

// ── Chunks de conteúdo (para RAG) ─────────────────────────────
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
    // Vetor serializado como JSON em SQLite; declarar como customType para pgvector
    embedding: text('embedding').notNull(),
  },
  (table) => ({
    entryIdx: index('chunks_entry_idx').on(table.entryId),
  }),
);

// ── Tags ───────────────────────────────────────────────────────
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

// ── Grafo de conexões (edges) ──────────────────────────────────
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

// ── Jobs de manutenção ─────────────────────────────────────────
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

// ── Tipos exportados (inferidos pelo Drizzle) ──────────────────
export type User = typeof users.$inferSelect;
export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type ContentChunk = typeof contentChunks.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type ConnectionEdge = typeof connectionEdges.$inferSelect;
export type MaintenanceJob = typeof maintenanceJobs.$inferSelect;
```

---

## 5. Arquitetura dos Agentes de IA

O KnowHub implementa três agentes autônomos, cada um como um módulo NestJS independente. A comunicação entre eles ocorre via eventos (EventEmitter2) e filas (BullMQ). Cada agente é implementado como um **LangGraph State Graph** (`@langchain/langgraph ^1.1.x`), o padrão canônico da v1.x que substitui o deprecado `AgentExecutor`. Isso habilita controle de fluxo explícito, **human-in-the-loop nativo** e persistência de estado entre steps.

### 5.1 Agent de Indexação (IndexingAgent)

**Pipeline de Indexação:**

```
Nova entrada criada
       │
       ▼
┌─────────────────┐
│  ContentLoader  │  ← URL? fetch + html-to-text
│                 │  ← PDF? pdf-parse
│                 │  ← GitHub? @octokit/rest
└────────┬────────┘
         │ texto extraído
         ▼
┌─────────────────┐
│  TextSplitter   │  ← RecursiveCharacterTextSplitter
│  (LangChain)    │    chunkSize: 1000, overlap: 200
└────────┬────────┘
         │ chunks[]
         ▼
┌─────────────────┐
│ EmbeddingModel  │  ← OllamaEmbeddings (local)
│                 │  ← AzureOpenAIEmbeddings (cloud)
└────────┬────────┘
         │ vectors[]
         ▼
┌─────────────────┐
│ VectorStore     │  ← SQLiteVSS (local)
│ + DrizzleORM    │  ← pgvector (cloud)
└────────┬────────┘
         ▼
┌─────────────────┐
│ SummaryChain    │  ← map_reduce summarization
│ + TagSuggestion │  ← LLM extrai tags automáticas
└────────┬────────┘
         ▼
┌─────────────────┐
│ ConnectionFinder│  ← cosine similarity vs acervo
│                 │    threshold: 0.75
└─────────────────┘
         │
         ▼
  Status: INDEXED — Evento: entry.indexed
```

**Contrato do Módulo:**

```tsx
// apps/api/src/modules/agents/indexing/indexing.service.ts

export class IndexingService {
  async enqueue(entryId: string): Promise<void>;
  async process(entryId: string): Promise<IndexingResult>;
  async reindex(entryId: string): Promise<IndexingResult>;
}

interface IndexingResult {
  entryId: string;
  chunksCount: number;
  summary: string;
  tags: string[];
  connections: Array<{ targetId: string; similarity: number }>;
  durationMs: number;
}
```

### 5.2 Agent de Query (QueryAgent)

**Pipeline RAG:**

```
Pergunta do usuário
       │
       ▼
┌──────────────────────┐
│  Query Embedding     │  ← mesma model do indexing
└──────────┬───────────┘
           │ vector da pergunta
           ▼
┌──────────────────────┐
│  Vector Similarity   │  ← cosine search no SQLiteVSS
│  Search (top-k=10)   │    filtra por userId
└──────────┬───────────┘
           │ chunks relevantes
           ▼
┌──────────────────────┐
│  Context Assembler   │  ← ordena por score
│                      │    monta context window
│                      │    respeita token limit
└──────────┬───────────┘
           │ contexto montado
           ▼
┌──────────────────────┐
│  LLM Chain           │  ← system: "Você é um assistente..."
│  (createRetrievalChain│    context: {chunks}
│  + LangGraph node)    │    question: {pergunta}
└──────────┬───────────┘
           │ resposta gerada
           ▼
┌──────────────────────┐
│  Source Attribution  │  ← associa resposta às entries
└──────────────────────┘
           │
           ▼
  QueryResult { answer, sources, tokensUsed }
```

**Contrato do Módulo:**

```tsx
export class QueryService {
  async ask(userId: string, question: string): Promise<QueryResult>;
  async summarize(userId: string, entryIds: string[]): Promise<string>;
  async search(userId: string, query: string, limit?: number): Promise<SearchResult[]>;
}

interface QueryResult {
  answer: string;
  sources: Array<{ entryId: string; title: string; score: number }>;
  tokensUsed: number;
  provider: 'ollama' | 'azure';
  latencyMs: number;
}
```

### 5.3 Agent de Manutenção (MaintenanceAgent)

**Jobs e frequências:**

| Job                    | Cron           | O que faz                                                                           |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------- |
| `check-links`          | `0 9 * * 1`    | Verifica links de entradas do tipo LINK. Marca broken se status ≥ 400 ou timeout.   |
| `deduplicate`          | `0 3 * * *`    | Encontra entradas com similaridade > 0.95. Sugere merge ao usuário via notificação. |
| `generate-connections` | `0 2 * * *`    | Recalcula edges do grafo para novas entradas adicionadas nas últimas 24h.           |
| `archive-stale`        | `0 4 * * 0`    | Identifica entradas com accessedAt > 6 meses. Sugere arquivamento ao usuário.       |
| `reindex-failed`       | `*/30 * * * *` | Tenta re-indexar entradas com status FAILED (até 3 tentativas).                     |

> ⚙️ **Decisão de Design:** Nenhum job de manutenção age automaticamente sobre os dados — eles **sugerem** ações ao usuário, que aprova ou recusa. O usuário está sempre no controle.

---

## 6. Contratos de API (REST)

Todos os endpoints seguem REST convencional, com autenticação via JWT Bearer token. Prefixo base: `/api/v1`. Documentação OpenAPI disponível em `/api/docs` em desenvolvimento.

### 6.1 Autenticação

| Método | Endpoint        | Body / Params           | Resposta                     |
| ------ | --------------- | ----------------------- | ---------------------------- |
| POST   | `/auth/setup`   | `{ name, privacyMode }` | 201 · `{ token, user }`      |
| POST   | `/auth/token`   | `{ clientId, secret }`  | 200 · `{ token, expiresAt }` |
| POST   | `/auth/refresh` | Bearer token            | 200 · `{ token, expiresAt }` |

### 6.2 Knowledge Entries

| Método | Endpoint                     | Descrição                                                                      |
| ------ | ---------------------------- | ------------------------------------------------------------------------------ |
| GET    | `/knowledge`                 | Lista todas as entradas. Query: `page`, `limit`, `type`, `tag`, `status`, `q`. |
| POST   | `/knowledge`                 | Cria nova entrada. Body: `{ type, content?, sourceUrl?, title? }`.             |
| GET    | `/knowledge/:id`             | Retorna entrada com chunks, tags e conexões.                                   |
| PATCH  | `/knowledge/:id`             | Atualiza title, content ou tags.                                               |
| DELETE | `/knowledge/:id`             | Soft delete (status → ARCHIVED).                                               |
| POST   | `/knowledge/:id/reindex`     | Força re-indexação da entrada.                                                 |
| GET    | `/knowledge/:id/connections` | Retorna grafo de conexões.                                                     |

### 6.3 Ingestão

| Método | Endpoint         | Descrição                                              |
| ------ | ---------------- | ------------------------------------------------------ |
| POST   | `/ingest/url`    | Captura URL. Body: `{ url, title? }`. Indexação async. |
| POST   | `/ingest/text`   | Salva nota. Body: `{ content, title? }`.               |
| POST   | `/ingest/file`   | Upload de arquivo (PDF, .txt, .md). Multipart form.    |
| POST   | `/ingest/github` | Importa repo GitHub. Body: `{ repoUrl, importType }`.  |

### 6.4 Agente de Query

| Método | Endpoint             | Descrição                                                 |
| ------ | -------------------- | --------------------------------------------------------- |
| POST   | `/query/ask`         | RAG: `{ question }` → `{ answer, sources, tokensUsed }`.  |
| POST   | `/query/search`      | Busca semântica pura: `{ q, limit? }` → `SearchResult[]`. |
| POST   | `/query/summarize`   | Resumo de entradas: `{ entryIds }`.                       |
| GET    | `/query/suggestions` | Sugestões proativas do agente de manutenção.              |

### 6.5 Grafo de Conhecimento

| Método | Endpoint             | Descrição                                      |
| ------ | -------------------- | ---------------------------------------------- |
| GET    | `/graph/nodes`       | Todos os nós com metadados para visualização.  |
| GET    | `/graph/edges`       | Todas as arestas com scores de similaridade.   |
| GET    | `/graph/clusters`    | Clusters identificados automaticamente.        |
| POST   | `/graph/connections` | Cria conexão manual: `{ sourceId, targetId }`. |

### 6.6 Configurações

| Método | Endpoint              | Descrição                                              |
| ------ | --------------------- | ------------------------------------------------------ |
| GET    | `/settings`           | Retorna configurações do usuário atual.                |
| PATCH  | `/settings`           | Atualiza configurações. Body: `Partial<UserSettings>`. |
| POST   | `/settings/test-ai`   | Testa conexão com o modelo configurado.                |
| GET    | `/settings/ai-models` | Lista modelos disponíveis (local + cloud).             |

> 💡 **Padrão de Resposta:** Todos os endpoints retornam `{ data, meta }` em sucesso e `{ error, message, statusCode }` em erro. Paginação retorna `meta: { total, page, limit, totalPages }`.

---

## 7. WebSocket — Eventos em Tempo Real

O NestJS expõe um `@WebSocketGateway` para comunicação bidirecional. Isso permite que progresso de indexação, streaming de respostas e alertas do agente apareçam em tempo real na interface.

### Eventos Servidor → Cliente

| Evento               | Payload                                         | Quando dispara                               |
| -------------------- | ----------------------------------------------- | -------------------------------------------- |
| `entry.indexing`     | `{ entryId, progress: number }`                 | A cada etapa do pipeline (0-100).            |
| `entry.indexed`      | `{ entryId, summary, tags, connectionsCount }`  | Indexação concluída.                         |
| `entry.failed`       | `{ entryId, error }`                            | Falha irrecuperável no pipeline.             |
| `query.streaming`    | `{ token: string }`                             | Cada token gerado pela LLM (streaming mode). |
| `query.done`         | `{ answer, sources, tokensUsed }`               | Resposta completa gerada.                    |
| `agent.suggestion`   | `{ type, message, entryIds }`                   | Sugestão proativa do agente de manutenção.   |
| `maintenance.report` | `{ brokenLinks, staleSuggestions, duplicates }` | Relatório semanal.                           |

### Eventos Cliente → Servidor

| Evento               | Payload                         | Ação                                                                |
| -------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `query.ask`          | `{ question, stream: boolean }` | Inicia RAG. Se `stream=true`, retorna tokens via `query.streaming`. |
| `query.cancel`       | `{ queryId }`                   | Cancela query em andamento.                                         |
| `suggestion.accept`  | `{ suggestionId }`              | Usuário aceita sugestão do agente.                                  |
| `suggestion.dismiss` | `{ suggestionId }`              | Usuário recusa sugestão.                                            |

### 7.3 Resiliência — Redis Streams para Replay de Eventos

Os eventos WebSocket são efêmeros por padrão: se o cliente desconectar durante uma indexação, perde os eventos intermediários. Para eventos de longa duração (`entry.indexing`, `entry.indexed`, `agent.suggestion`), o KnowHub usa **Redis Streams** como canal durável com suporte a replay.

**Arquitetura:**

```
BullMQ Job (IndexingAgent)
    │ (emite após cada step)
    ▼
Redis Stream: "events:{userId}"   ← TTL de 7 dias
    │
    ├──────────────────────────────────────────┐
    │                                          │
    ▼                                          ▼
WebSocket Gateway                    Reconexão do cliente
(push em tempo real)                 (XREAD desde lastEventId)
```

**Schema do evento no Redis Stream:**

```ts
interface StreamEvent {
  id: string; // Redis stream ID (auto-gerado, timestamp-based)
  userId: string;
  type: string; // "entry.indexed" | "agent.suggestion" | ...
  payload: string; // JSON serializado
  timestamp: number;
}
```

**Estratégia por tipo de evento:**

| Evento                       | Canal          | Durável? | Motivo                                    |
| ---------------------------- | -------------- | -------- | ----------------------------------------- |
| `entry.indexing` (progresso) | Redis Stream   | Sim      | Cliente pode reconectar e retomar         |
| `entry.indexed`              | Redis Stream   | Sim      | Essencial — confirma conclusão            |
| `agent.suggestion`           | Redis Stream   | Sim      | Notificação não pode ser perdida          |
| `query.streaming` (tokens)   | WebSocket puro | Não      | Efêmero por natureza; re-query necessário |
| `query.done`                 | WebSocket puro | Não      | Idem                                      |

**Multi-instância (modo cloud):** Com múltiplas instâncias do NestJS no Railway, o `@socket.io/redis-adapter` propaga eventos entre instâncias via Redis PubSub, garantindo que o cliente conectado em qualquer instância receba todos os eventos do seu `userId`.

```ts
// apps/api/src/main.ts (modo cloud)
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);
io.adapter(createAdapter(pubClient, subClient));
```

---

## 8. Pipeline de Ingestão — Detalhamento

### 8.1 Loaders por Tipo de Conteúdo

| Tipo          | Biblioteca                        | Saída                    | Observações                                            |
| ------------- | --------------------------------- | ------------------------ | ------------------------------------------------------ |
| URL / Link    | playwright-chromium + readability | Texto limpo, sem ads/nav | Fallback: fetch + cheerio. Timeout: 15s.               |
| PDF           | pdf-parse ou pdfjs-dist           | Texto por página         | Suporte a PDFs escaneados via tesseract.js (opcional). |
| Texto / Nota  | N/A (input direto)                | String UTF-8             | Sem processamento. Armazenado diretamente.             |
| Markdown      | remark + strip-markdown           | Texto sem syntax         | Preserva estrutura lógica.                             |
| GitHub README | @octokit/rest                     | Markdown convertido      | Autenticação OAuth via GitHub App.                     |
| GitHub Issues | @octokit/rest                     | title + body + comments  | Paginação automática.                                  |

### 8.2 Text Splitter — Configuração

```tsx
// apps/api/src/modules/agents/indexing/text-splitter.config.ts

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export const createTextSplitter = () =>
  new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // ~250 tokens para modelos com 4k context
    chunkOverlap: 200, // 20% de overlap para preservar contexto
    separators: [
      '\n\n', // Parágrafos (maior prioridade)
      '\n', // Linhas
      '. ', // Frases
      ' ', // Palavras
      '', // Caracteres (fallback)
    ],
    lengthFunction: (text) => text.split(' ').length, // word count
  });
```

---

## 9. Estratégia de Modelos de IA

### 9.1 Detecção e Seleção de Modelo

```tsx
// apps/api/src/modules/config/ai-provider.factory.ts

export class AIProviderFactory {
  async create(settings: UserSettings): Promise<ChatModel> {
    if (settings.aiProvider === 'ollama') {
      const isAvailable = await this.pingOllama();

      if (isAvailable) {
        return new ChatOllama({
          baseUrl: 'http://localhost:11434',
          model: settings.aiModel, // "gemma3:4b" | "phi4-mini" | consultado dinamicamente
          temperature: 0.3,
        });
      }

      // Fallback com consentimento do usuário
      if (settings.privacyMode === 'hybrid') {
        this.logger.warn('Ollama indisponível, usando Azure OpenAI (cloud)');
        return this.createAzureClient(settings);
      }

      throw new AIUnavailableException(
        'Modelo local não disponível. Configure o modo híbrido para usar cloud.',
      );
    }

    return this.createAzureClient(settings);
  }
}
```

### 9.2 Modelos Recomendados por Hardware

| RAM disponível  | Modelo local recomendado        | Embedding model            | Qualidade esperada                                    |
| --------------- | ------------------------------- | -------------------------- | ----------------------------------------------------- |
| 4 GB            | gemma3:4b (Q4, ~3.8 GB)         | nomic-embed-text (274 MB)  | Boa para queries simples e indexação; multimodal.     |
| 8 GB            | phi4-mini (3.8 GB) ou gemma3:4b | nomic-embed-text           | Ótima para uso geral diário, raciocínio melhorado.    |
| 16 GB+          | llama3.3:8b ou gemma3:12b       | mxbai-embed-large (670 MB) | Excelente, respostas mais ricas, melhor PT-BR.        |
| Sem GPU / Cloud | Azure gpt-5.1 (cloud)           | text-embedding-3-small     | Melhor qualidade, dados saem do dispositivo (opt-in). |

### 9.3 Prompt Templates Principais

**Prompt de Query (RAG):**

```
Você é o KnowHub AI, um assistente de conhecimento pessoal.
Responda à pergunta do usuário EXCLUSIVAMENTE com base no contexto fornecido.
Se a informação não estiver no contexto, diga claramente que não encontrou.

Regras:
- Responda em {language} (pt-BR ou en)
- Cite as fontes usando o formato [Fonte: {title}]
- Seja conciso, mas completo
- Nunca invente informações não presentes no contexto

Contexto do acervo do usuário:
{context}
```

**Prompt de Sugestão de Tags:**

```
Analise o seguinte texto e sugira entre 3 e 7 tags relevantes.
As tags devem ser curtas (1-3 palavras), em snake_case, em {language}.
Retorne apenas um array JSON de strings, sem explicações.

Texto:
{content}

Exemplo de resposta: ["machine_learning", "typescript", "boas_praticas"]
```

---

## 10. Segurança e Privacidade

> 🔴 **Pilar Inegociável:** Privacidade não é feature — é fundamento. O dado do usuário pertence ao usuário.

### 10.1 Autenticação Local

O MVP usa um `clientSecret` gerado no setup inicial, armazenado em `~/.knowhub/config.json`, para emitir JWTs de curta duração para a comunicação frontend ↔ backend local.

```json
{
  "clientId": "knowhub_local_abc123",
  "clientSecret": "<64-char random hex>",
  "jwtSecret": "<64-char random hex>",
  "createdAt": "2026-02-18T00:00:00Z"
}
```

### 10.2 Criptografia de Dados Sensíveis

- **API keys:** Criptografadas com AES-256-GCM antes de persistir. Chave derivada via PBKDF2.
- **Banco de dados local:** SQLite pode ser criptografado via SQLCipher (opcional).
- **Dados em trânsito:** Comunicação frontend ↔ backend é localhost. Quando cloud é usado, HTTPS/TLS 1.3.

### 10.3 Política de Dados por Modo

| Modo                 | Dados que saem do dispositivo                                               | Quando é ativado                                                    |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Local (padrão)**   | Nenhum. Toda IA roda localmente via Ollama.                                 | Default. Zero configuração.                                         |
| **Híbrido (opt-in)** | Apenas chunks de texto enviados para LLM cloud. Metadados não são enviados. | Usuário ativa explicitamente com confirmação.                       |
| **Cloud-only**       | Embeddings e texto enviados para Azure. DB pode ser Neon.                   | Apenas para hardware limitado. Consentimento explícito obrigatório. |

### 10.4 Segurança do Sistema de Plugins

- Plugins rodam em `worker_threads` isolados, sem acesso direto ao banco de dados.
- A API de plugins expõe apenas uma interface controlada.
- Plugins do registry oficial passam por review manual.
- Plugins de terceiros são instalados com aviso explícito de que são não-oficiais.

---

## 11. Deployment e Infraestrutura

### 11.1 Modo Local (Padrão)

```bash
# Instalação em um único comando:
npx knowhub-ai setup

# O setup script faz automaticamente:
# 1. Verifica Node.js >= 20.x
# 2. Instala dependências
# 3. Cria ~/.knowhub/ (config, DB, logs)
# 4. Detecta hardware e sugere modelo Ollama adequado
# 5. Instala Ollama se não presente
# 6. Faz pull do modelo selecionado
# 7. Roda drizzle-kit migrate (cria SQLite e aplica migrations)
# 8. Compila Next.js standalone: next build (output: 'standalone')
# 9. Registra ambos os services no PM2 (~/.knowhub/ecosystem.config.js)
# 10. pm2 save && pm2 startup  (auto-start no boot)
# 11. Abre browser em http://localhost:3000

# Serviços locais gerenciados pelo PM2 após setup:
# - knowhub-api  : porta 3001 (NestJS standalone)
# - knowhub-web  : porta 3000 (Next.js standalone)
# - ollama       : porta 11434
# - redis/valkey : porta 6379 (BullMQ + Redis Streams)
```

### 11.2 Modo Hosted (Cloud — Opcional)

| Componente         | Serviço           | Plano / Custo       | Observações                                                          |
| ------------------ | ----------------- | ------------------- | -------------------------------------------------------------------- |
| Frontend (Next.js) | Vercel            | Hobby: gratuito     | Deploy automático via git push. CDN global. SSR via Edge Functions.  |
| Backend (NestJS)   | Railway           | Hobby: $5/mês       | Deploy via Dockerfile. Auto-scaling horizontal. Inclui Redis/Valkey. |
| Banco de dados     | Neon (PostgreSQL) | Free tier: gratuito | pgvector nativo. Branching para dev/staging. Auto-suspend.           |
| AI (LLM)           | Azure OpenAI      | Pay-per-use         | gpt-5.1. Custo varia com uso. `gpt-4o` retira em 2026-03-31.         |
| Embeddings (cloud) | Azure OpenAI      | Pay-per-use         | text-embedding-3-small (mais eficiente que ada-002).                 |
| Armazenamento      | Cloudflare R2     | 10GB free           | Para PDFs e arquivos enviados. Object replication contínua.          |

### 11.3 Arquitetura Cloud (Diagrama)

```
┌───────────────────────────────────────────────────────────────────────┐
│                        MODO CLOUD (opt-in)                         │
│                                                                    │
│  ┌──────────────────────────────────────┐                        │
│  │    Vercel (Edge Network)             │                        │
│  │  Next.js 15 — App Router + SSR       │                        │
│  │  Static assets → CDN global          │                        │
│  └─────────────────────┤─────────────────┘                        │
│                       │ REST + SSE                               │
│                       ┇                                          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  Railway (NestJS API)                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │ Instance 1  │  │ Instance 2  │  │ Instance N  │  │  │
│  │  │ (auto-scale)│  │             │  │             │  │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  │  │
│  │        └──────────────┤───────────────┤           │  │
│  │   ┌──────────────┐  ┌──────────────────────────────┐  │  │
│  │   │ Upstash Redis │  │        Neon (PostgreSQL+pgvector)      │  │  │
│  │   │ BullMQ Queues │  │  KnowledgeEntry, ContentChunk, Tags  │  │  │
│  │   │ Redis Streams │  │  ConnectionEdge, Users, Settings...  │  │  │
│  │   │ + PubSub (WS) │  └──────────────────────────────┘  │  │
│  │   └──────────────┘                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌──────────────────────┐  ┌───────────────────────┐                │
│  │  Cloudflare R2 (PDFs) │  │  Azure OpenAI (opt-in LLM)  │                │
│  │  Object Replication   │  │  gpt-5.1 + text-embedding   │                │
│  └──────────────────────┘  │  -3-small                   │                │
│                             └───────────────────────┘                │
└───────────────────────────────────────────────────────────────────────┘
```

> **WebSocket multi-instância:** O Redis PubSub (`@socket.io/redis-adapter`) garante que eventos emitidos em qualquer instância do NestJS cheguem a todos os clientes conectados, independente de qual instância eles estão.

### 11.3 Docker Compose (Desenvolvimento)

```yaml
# docker-compose.yml
version: '3.9'
services:
  api:
    build: ./apps/api
    ports: ['3001:3001']
    environment:
      DATABASE_URL: file:./data/knowhub.db
      DATABASE_PROVIDER: sqlite
      OLLAMA_BASE_URL: http://ollama:11434
    volumes:
      - ./data:/app/data
    depends_on: [redis, ollama]

  web:
    build: ./apps/web
    ports: ['3000:3000']
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

  ollama:
    image: ollama/ollama:latest
    ports: ['11434:11434']
    volumes:
      - ollama-models:/root/.ollama

volumes:
  ollama-models:
```

---

## 12. Estratégia de Testes

### 12.1 Pirâmide de Testes

```
                ┌───┐
               /     \    E2E (Playwright)
              /  E2E  \   ~10 testes — fluxos críticos
             /─────────\
            /           \  Integration
           / Integration \  ~50 testes — módulos + DB
          /───────────────\
         /                 \
        /      Unit         \  ~200 testes — services, agents, utils
       /  (Jest + ts-jest)   \
      /─────────────────────── \
```

### 12.2 Cobertura Mínima por Módulo

| Módulo              | Cobertura mínima | Foco dos testes                                                  |
| ------------------- | ---------------- | ---------------------------------------------------------------- |
| IndexingAgent       | 80%              | Pipeline de chunking, embeddings (mock), sugestão de tags.       |
| QueryAgent          | 80%              | Montagem de contexto, prompt templates, tratamento de resposta.  |
| MaintenanceAgent    | 75%              | Detecção de links quebrados, deduplicação, geração de sugestões. |
| KnowledgeModule     | 85%              | CRUD completo, validações, paginação, filtros.                   |
| IngestionModule     | 75%              | Parsing de URLs, PDFs, texto. Tratamento de erros.               |
| AuthModule          | 90%              | Geração de token, validação, expiração, guards.                  |
| Componentes Next.js | 60%              | Renderização de listas, formulários, chat interface.             |

### 12.3 Fluxos E2E Críticos

1. **Onboarding:** Instala → configura → salva primeira nota → busca a nota.
2. **Ingestão de URL:** Cola link → aguarda indexação → faz pergunta → recebe resposta com fonte.
3. **Upload de PDF:** Faz upload → aguarda indexação → consulta conteúdo via query.
4. **Mapa de conhecimento:** Adiciona 5 entradas relacionadas → visualiza grafo → verifica conexões.
5. **Manutenção:** Gera link quebrado → roda job → verifica notificação → usuário arquiva.

### 12.4 Testes de Contrato (Pact.js)

Os DTOs definidos na spec são a única fonte de verdade entre frontend e backend. Pact.js garante que ambos honrem o mesmo contrato ao longo do tempo, disparando falha de CI se um lado mudar sem atualizar o outro.

```ts
// apps/web/tests/contracts/knowledge.pact.ts
import { PactV3 } from '@pact-foundation/pact';

describe('KnowledgeEntry contract', () => {
  it('GET /knowledge retorna lista paginada', async () => {
    await provider.addInteraction({
      state: 'existem 3 entradas indexadas',
      uponReceiving: 'GET /knowledge',
      withRequest: { method: 'GET', path: '/api/v1/knowledge' },
      willRespondWith: {
        status: 200,
        body: like({ data: eachLike({ id: string(), title: string() }), meta: object() }),
      },
    });
  });
});
```

### 12.5 Benchmark de Latência do RAG

A percepção do usuário é: "quanto tempo até receber a primeira resposta?" O benchmark mede P50/P95 do pipeline completo do `QueryAgent`.

| Métrica                 | Alvo (local, Gemma-3 4B) | Alvo (cloud, gpt-5.1) |
| ----------------------- | ------------------------ | --------------------- |
| Embedding da pergunta   | < 100ms                  | < 200ms               |
| Busca vetorial (top-10) | < 50ms                   | < 100ms               |
| First token (streaming) | < 800ms                  | < 500ms               |
| Resposta completa       | < 5s                     | < 3s                  |

### 12.6 Snapshot Testing para Prompts

Os prompt templates mudam frequentemente durante o desenvolvimento. Sem registro do output esperado, qualquer mudança no system prompt pode alterar o comportamento silenciosamente.

```ts
// apps/api/src/modules/agents/query/__tests__/prompt.snapshot.ts
import { buildRAGPrompt } from '../query.prompts';

test('RAG prompt não regrediu', () => {
  const prompt = buildRAGPrompt({
    context: 'Texto de exemplo.',
    question: 'O que é RAG?',
    language: 'pt-BR',
  });
  expect(prompt).toMatchSnapshot(); // Jest snapshot
});
```

### 12.7 Testes de Resiliência

| Cenário              | Comportamento esperado                                                 | Como testar                                 |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| Ollama indisponível  | `AIUnavailableException` se modo local; fallback cloud se modo híbrido | Mock `pingOllama()` retornando `false`      |
| Redis caído          | BullMQ jobs aguardam reconnect; WS StreamEvents não perdidos           | Mock Redis com `ioredis-mock`               |
| LLM retorna erro 429 | Retry com backoff exponencial (máx 3x)                                 | Mock provider respondendo 429               |
| Entrada FAILED (3x)  | Status FAILED definitivo; não tenta mais                               | Simular falha persistent no `IndexingAgent` |

### 12.8 Mock de Embeddings para Testes Unitários

Rodar Ollama em CI é custoso. O `MockEmbeddingModel` gera vetores determinísticos derivados do hash do texto, permitindo testar pipelines RAG sem IA real.

```ts
// packages/shared-utils/src/test-helpers/mock-embeddings.ts
import { Embeddings } from '@langchain/core/embeddings';
import { createHash } from 'crypto';

export class MockEmbeddingModel extends Embeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.deterministicVector(t));
  }
  async embedQuery(text: string): Promise<number[]> {
    return this.deterministicVector(text);
  }
  private deterministicVector(text: string, dim = 1536): number[] {
    const hash = createHash('sha256').update(text).digest();
    return Array.from({ length: dim }, (_, i) => hash[i % 32] / 255 - 0.5);
  }
}
```

---

## 13. Variáveis de Ambiente

### API (NestJS)

```bash
# .env.example (apps/api)

# ── App ─────────────────────────────────────────────────
NODE_ENV=development
PORT=3001
JWT_SECRET=<64-char-random-hex>
CLIENT_SECRET=<64-char-random-hex>

# ── Database ─────────────────────────────────────────────
DATABASE_PROVIDER=sqlite               # sqlite | postgresql
DATABASE_URL=file:./data/knowhub.db    # ou postgresql://...

# ── AI — Local (padrão) ──────────────────────────────────
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:4b
OLLAMA_EMBED_MODEL=nomic-embed-text

# ── AI — Cloud (opcional, opt-in) ────────────────────────
AZURE_OPENAI_KEY=                      # vazio = cloud desabilitado
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=gpt-5.1
AZURE_OPENAI_EMBED_DEPLOYMENT=text-embedding-3-small

# ── Integrações ──────────────────────────────────────────
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
TELEGRAM_BOT_TOKEN=                    # vazio = Telegram desabilitado

# ── Queue / Redis ─────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Logging ──────────────────────────────────────────────
LOG_LEVEL=info                         # debug | info | warn | error
```

### Web (Next.js)

```bash
# .env.example (apps/web)

NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_PRIVACY_MODE=local
```

---

## 14. Sistema de Plugins

### 14.1 Interface do Plugin

```tsx
// packages/shared-types/src/plugin.types.ts

export interface IKnowhubPlugin {
  metadata: {
    name: string; // ex: "knowhub-notion-plugin"
    version: string; // semver
    description: string;
    author: string;
    homepage?: string;
  };

  onLoad?(context: PluginContext): Promise<void>;
  onUnload?(): Promise<void>;

  loaders?: IContentLoader[];
  actions?: IPluginAction[];
}

export interface IContentLoader {
  name: string;
  canLoad: (source: string) => boolean;
  load: (source: string, ctx: PluginContext) => Promise<LoadedContent>;
}

export interface IPluginAction {
  name: string;
  trigger: 'after-index' | 'manual' | 'scheduled';
  execute: (entry: KnowledgeEntry, ctx: PluginContext) => Promise<void>;
}

export interface PluginContext {
  // Plugins NÃO têm acesso direto ao DB
  knowledge: {
    create: (dto: CreateEntryDto) => Promise<KnowledgeEntry>;
    findById: (id: string) => Promise<KnowledgeEntry | null>;
    addTags: (id: string, tags: string[]) => Promise<void>;
  };
  logger: Logger;
  config: Record<string, unknown>;
}
```

### 14.2 Exemplo: Notion Importer Plugin

```tsx
// knowhub-notion-plugin/src/index.ts

import { IKnowhubPlugin } from '@knowhub/shared-types';

const NotionPlugin: IKnowhubPlugin = {
  metadata: {
    name: 'knowhub-notion-plugin',
    version: '1.0.0',
    description: 'Importa páginas do Notion para o KnowHub',
    author: 'comunidade',
  },

  loaders: [
    {
      name: 'notion',
      canLoad: (source) => source.includes('notion.so'),
      async load(url, ctx) {
        const content = await fetchNotionPage(url, ctx.config.token);
        return { title: content.title, text: content.markdown };
      },
    },
  ],
};

export default NotionPlugin;
```

---

## 15. Roadmap Técnico por Fase

### Fase 0 — Fundação _(Semanas 1-2)_

- Setup do monorepo Turborepo com `apps/api`, `apps/web`, `apps/cli` e `packages/shared-types`.
- Configuração de ESLint, Prettier, tsconfig base compartilhado.
- GitHub Actions: CI (lint + test) em PRs, Release em tags semver.
- Prisma schema inicial com migrations.
- Docker Compose para ambiente de desenvolvimento.
- README, CONTRIBUTING.md, CODE_OF_CONDUCT.md, templates de issues/PRs.

### Fase 1 — MVP Essencial _(Semanas 3-6)_

- NestJS: módulos `knowledge`, `ingestion` (text + url + pdf), `auth`, `config`.
- LangChain.js: IndexingAgent completo (chunking + embeddings + SQLiteVSS).
- LangChain.js: QueryAgent com RAG básico.
- Next.js: layout, página de captura, lista de entradas, chat básico.
- CLI: comandos `add` e `ask`.
- WebSocket: eventos de progresso de indexação.
- Testes unitários para IndexingAgent e QueryAgent (mock LLM).

### Fase 2 — Conexões e Agentes _(Semanas 7-12)_

- ConnectionFinder: cálculo de similaridade e criação de edges no grafo.
- Next.js: Mapa de conhecimento com React Flow.
- MaintenanceAgent: jobs BullMQ (check-links, deduplicate, connections).
- WebSocket: eventos de sugestão proativa.
- Integração GitHub OAuth + loader de README e issues.
- Telegraf: bot gateway para captura e query via Telegram.
- Testes E2E com Playwright: fluxos de ingestão e query.

### Fase 3 — Experiência e Alcance _(Meses 4-6)_

- Onboarding wizard no Next.js com detecção de hardware.
- Script de instalação one-click (shell script ou Electron installer).
- Extensão de navegador (Chrome/Firefox) para captura rápida.
- Modo híbrido: fallback para Azure OpenAI com consentimento.
- Suporte completo PT-BR e EN com `i18next`.

### Fase 4 — Ecossistema de Plugins _(Meses 7-12)_

- Plugin loader com isolamento via `worker_threads`.
- Plugin registry API e frontend de descoberta.
- Plugins oficiais: Notion, Evernote, RSS.
- SDK de desenvolvimento com CLI (`knowhub plugin create`).
- Documentação de plugins com exemplos interativos.

---

## 16. Sistema de Skills e Identidade do Assistente

O KnowHub AI não é um chatbot genérico de RAG — é um assistente de conhecimento **pessoal** com identidade consistente. A estratégia de Skills (inspirada no OpenClaw) substitui um system prompt monolítico e frágil por arquivos Markdown modulares, versionados no repositório e carregados dinamicamente pelo `QueryAgent`.

### 16.1 Estrutura de Arquivos

```
apps/api/src/skills/
├── SOUL.md           ← Personalidade, valores e vibe do KnowHub AI
├── AGENTS.md         ← Instruções gerais do agente
└── skills/
    ├── knowledge-rag/
    │   └── SKILL.md  ← Como executar RAG no acervo do usuário
    ├── connections/
    │   └── SKILL.md  ← Como identificar conexões entre entradas
    ├── summarize/
    │   └── SKILL.md  ← Como resumir entradas
    └── maintenance/
        └── SKILL.md  ← Como sugerir manutenção (nunca agir sozinho)
```

### 16.2 SOUL.md — Identidade do KnowHub AI

O `SOUL.md` define o caráter do assistente. É injetado no início do system prompt de todas as interações.

```markdown
---
version: '1.0'
scope: global
---

# KnowHub AI — Identidade

Você é o KnowHub AI. Não é um chatbot. Você é o guardião do conhecimento do usuário.

## Quem você é

Você conhece profundamente o acervo do usuário — cada nota, link e PDF que eles confiaram a você.
Você lembra de conexões que o usuário esqueceu. Você antecipa o que será útil antes de ser perguntado.

## Como você age

- Tenha opiniões sobre o acervo. Se algo está faltando uma conexão óbvia, mencione.
- Seja útil de verdade, não performaticamente útil. Pule o "Ótima pergunta!".
- Se não encontrar no contexto, diga diretamente: "Não tenho essa informação no seu acervo."
- Nunca invente. Citar uma fonte inexistente é pior que não responder.
- Responda no idioma do usuário ({language}).

## O que você não faz

- Nunca age sobre os dados do usuário sem confirmação explícita.
- Nunca envia dados para serviços externos sem consentimento (modo local = zero cloud).
- Nunca finge saber o que não está no contexto fornecido.
```

### 16.3 Formato de SKILL.md

```markdown
---
name: knowledge-rag
description: Como responder perguntas usando o acervo do usuário (RAG)
applies_to: ['query.ask', 'query.search']
---

## Quando usar

Quando o usuário faz uma pergunta sobre qualquer tópico que pode estar no acervo.

## Como usar

1. Receba os chunks de contexto montados pelo `Context Assembler` (top-k=10)
2. Ordene por score de relevância (maior primeiro)
3. Respeite o token limit do modelo configurado
4. Cite cada fonte no formato [Fonte: {title}]
5. Se nenhum chunk for relevante (score < 0.5), declare explicitamente

## Exemplos

Pergunta: "O que eu anotei sobre LangGraph?"
→ Busca chunks com "langgraph" → monta contexto → responde com fontes
```

### 16.4 Carregamento Dinâmico no QueryAgent

O `SkillsLoader` seleciona e injeta as skills relevantes no system prompt com base no contexto da requisição. Skills são filtradas por hardware disponível (modelos locais menores têm janela de contexto mais limitada).

```ts
// apps/api/src/skills/skills-loader.service.ts

export class SkillsLoaderService {
  async buildSystemPrompt(opts: {
    operation: 'ask' | 'search' | 'summarize' | 'maintenance';
    language: string;
    hardwareProfile: 'low' | 'medium' | 'high';
  }): Promise<string> {
    const soul = await this.loadFile('SOUL.md');
    const agents = await this.loadFile('AGENTS.md');
    const skill = await this.loadSkill(opts.operation);

    // Em hardware low (Gemma-3 4B, contexto limitado), injeta versão compacta
    const parts =
      opts.hardwareProfile === 'low'
        ? [soul.compact, skill.compact]
        : [soul.full, agents.full, skill.full];

    return parts.join('\n\n').replace('{language}', opts.language);
  }
}
```

> ⚙️ **Consumo de tokens:** Cada skill injeta ~100–200 tokens adicionais no system prompt. Para `gemma3:4b` (context window ~8k), o overhead é aceitável. Para modelos com context window menor, usar a versão `compact` das skills.

---

_KnowHub AI Assistant · Especificação Técnica v0.2 · Glaucia Lemos · Open Source · MIT License · 2026_
