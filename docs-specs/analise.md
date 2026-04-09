# Análise Técnica Crítica — KnowHub AI Assistant

**Glaucia Lemos** · Fevereiro 2026 · Revisão pré-v0.1

> Este documento consolida pesquisas realizadas sobre cada ponto levantado para revisão da `spec-tecnica.md`. Cada seção apresenta os achados factuais, uma análise crítica e uma recomendação concreta. **Não altere a spec antes de validar este documento.**

---

## Índice

1. [LangChain.js: Versão Atual e Breaking Changes](#1-langchainjs-versão-atual-e-breaking-changes)
2. [ORM: Prisma vs Alternativas](#2-orm-prisma-vs-alternativas)
3. [Modelos de IA: Depreciações e Substitutos](#3-modelos-de-ia-depreciações-e-substitutos)
4. [TanStack AI: Análise do Framework](#4-tanstack-ai-análise-do-framework)
5. [OpenClaw Skills.md: Adoção da Estratégia](#5-openclaw-skillsmd-adoção-da-estratégia)
6. [Telegram e WhatsApp: Integração de Bots](#6-telegram-e-whatsapp-integração-de-bots)
7. [Instalação Local (Next.js + NestJS no dispositivo)](#7-instalação-local-nextjs--nestjs-no-dispositivo)
8. [WebSocket: Gestão da Fila de Eventos](#8-websocket-gestão-da-fila-de-eventos)
9. [Arquitetura Cloud: Diagrama e Detalhamento Ausentes](#9-arquitetura-cloud-diagrama-e-detalhamento-ausentes)
10. [Estratégia de Testes: Gaps Identificados](#10-estratégia-de-testes-gaps-identificados)
11. [Tabela Consolidada de Versões Atualizadas](#11-tabela-consolidada-de-versões-atualizadas)

---

## 1. LangChain.js: Versão Atual e Breaking Changes

### Achados

| Pacote                 | Versão citada na spec | Versão atual (fev/2026) |
| ---------------------- | --------------------- | ----------------------- |
| `langchain`            | `^0.3.x`              | `1.2.25`                |
| `@langchain/core`      | implícito             | `1.1.26`                |
| `@langchain/openai`    | implícito             | `1.2.8`                 |
| `@langchain/ollama`    | implícito             | `1.2.3`                 |
| `@langchain/langgraph` | **não listado**       | `1.1.5`                 |

### Breaking Changes Críticos da v1.x

A mudança mais **impactante** da v1.x é **arquitetural**: o `AgentExecutor` (usado em 0.x para criar agentes) está **deprecado**. A nova abordagem é:

```ts
// ANTES — v0.3.x (padrão antigo, DEPRECADO)
import { AgentExecutor, createReActAgent } from "langchain/agents";
const executor = AgentExecutor.fromAgentAndTools({ agent, tools });

// AGORA — v1.x com LangGraph (abordagem atual)
import { createReactAgent } from "langchain"; // ou @langchain/langgraph
import { ChatAnthropic } from "@langchain/anthropic";

const agent = createReactAgent({
  llm: model,
  tools: [searchTool],
});
const result = await agent.invoke({ messages: [...] });
```

A arquitetura de agentes na v1.x usa **LangGraph** como base (grafo de estados). Isso impacta diretamente o design dos três agentes do KnowHub (`IndexingAgent`, `QueryAgent`, `MaintenanceAgent`).

#### Outros Breaking Changes Relevantes

- **Imports reestruturados**: o pacote `langchain` agora é um "aggregator". Integrações devem ser importadas direto dos pacotes de provider (`@langchain/openai`, `@langchain/ollama`, etc.).
- **Streaming**: A API de streaming foi unificada. Tokens são consumidos via `for await (const chunk of stream)`.
- **Error hierarchy**: novo sistema de erros com `LangChainError` base class e `ContextOverflowError` (relevante para controle do tamanho do context no RAG).
- **`RetrievalQAChain`**: deprecado. O RAG agora deve ser construído com `createRetrievalChain` + LangGraph ou manualmente.

### Análise Crítica

A spec referencia padrões do ecossistema v0.3.x que já não são os padrões canônicos. Construir o `QueryAgent` com `RetrievalQA` ou o `IndexingAgent` com `AgentExecutor` gerará dívida técnica imediata e incompatibilidade com a documentação oficial.

**LangGraph** não é apenas a nova API de agentes — ele habilita:

- **Controle de fluxo explícito** entre os três agentes via grafos de estado
- **Human-in-the-loop** nativo (exigência do MaintenanceAgent: "usuário sempre no controle")
- **Persistência de estado** entre steps (checkpointing)
- **Multi-agent supervisor** com roteamento declarativo

### Recomendação

**Substituir a referência a `langchain ^0.3.x` por:**

```json
{
  "langchain": "^1.2.x",
  "@langchain/core": "^1.1.x",
  "@langchain/langgraph": "^1.1.x",
  "@langchain/openai": "^1.2.x",
  "@langchain/ollama": "^1.2.x",
  "@langchain/community": "^0.3.x"
}
```

Redesenhar os três agentes como **LangGraph State Graphs** em vez de chains sequenciais. Isso aumenta a capacidade de controle e rastreabilidade.

---

## 2. ORM: Prisma vs Alternativas

### Achados

#### Problemas Conhecidos do Prisma em Escala

| Problema                                             | Impacto no KnowHub                                         |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| **Runtime pesado** (~30MB de binário gerado)         | Relevante no modo local (dispositivo do usuário)           |
| **Prisma Data Proxy** obrigatório em edge/serverless | Latência extra e custo em modo cloud                       |
| **N+1 invisível** em relational queries              | `KnowledgeEntry → chunks → tags → connections`: risco real |
| **Cold start** em serverless (Railway/Lambda)        | Impacto no modo hosted                                     |
| **Não suporta `vector()` nativo no SQLite**          | Problemas com `ContentChunk.embedding` em SQLite           |
| **Casting de tipos em SQLite**                       | `embedding` precisaria ser `String` no schema (gambiarra)  |

#### DrizzleORM — Estado Atual

- **32.8k stars**, 147k projetos usando em produção
- Versão: `drizzle-orm` estável (kit: `drizzle-kit@0.31.9`), com v1.0 RC disponível
- **~7.4kb** minified+gzipped, **0 dependências externas**
- Suporta nativamente: SQLite (better-sqlite3, Turso), PostgreSQL (Neon, node-postgres), e todos os drivers principais
- API SQL-like: `db.select().from(table).where(eq(table.id, id))` — sem abstração leaky
- **ORM relacional** também disponível: `db.query.users.findMany({ with: { posts: true } })`
- Drizzle sempre emite **exatamente 1 query SQL** (sem N+1 implícito)
- Suporte a tipos customizados (extensível para `vector` e `json`)

#### TypeORM — Descartado

TypeORM tem histórico de manutenção inconsistente, não tem suporte a SQLite vetorial e é mais pesado que Drizzle sem benefícios equivalentes.

### Análise Crítica

O Prisma é excelente para onboarding rápido e DX de migrations. Mas para o KnowHub, há três problemas estruturais:

1. **`ContentChunk.embedding`** precisa armazenar vetores. No schema atual, isso usa `String` (gambiarra de JSON serializado). Com DrizzleORM, você declara um tipo customizado e tem controle total.

2. **SQLite + sqlite-vss**: O Prisma não tem suporte nativo à extensão `sqlite-vss`. Toda operação vetorial precisaria ser raw SQL (`$queryRaw`), quebrando a abstração do Prisma.

3. **Resiliência em modo cloud**: O Prisma Data Proxy adiciona um hop de rede em deployments serverless. DrizzleORM conecta direto ao driver sem proxy.

### Recomendação

**Migrar de Prisma para DrizzleORM.** A curva de aprendizado é menor do que parece — quem sabe SQL se adapta em horas. O ganho em performance, controle sobre operações vetoriais e ausência de peso em runtime é substancial para um projeto local-first.

**Plano de migração:**

```
Fase 0 (Fundação): Usar Drizzle do zero — sem migração.
- Schema declarado em TypeScript (drizzle-kit generate para migrations SQL)
- Tipo customizado para embedding: jsonb (PostgreSQL) / text (SQLite)
- Raw SQL para sqlite-vss via Drizzle's sql template tag
```

**Decisão alternativa menos disruptiva**: manter Prisma apenas para migrations e usar `Prisma.$executeRawUnsafe` para queries vetoriais. **Não recomendado** — cria duas APIs de banco coexistentes.

---

## 3. Modelos de IA: Depreciações e Substitutos

### Achados — Azure OpenAI (fonte: Microsoft Docs, jan/2026)

| Modelo                      | Status                     | Retirement (Standard) | Substituto Recomendado |
| --------------------------- | -------------------------- | --------------------- | ---------------------- |
| `gpt-4o` (2024-05-13)       | GA                         | **2026-03-31**        | `gpt-5.1`              |
| `gpt-4o` (2024-08-06)       | GA                         | **2026-03-31**        | `gpt-5.1`              |
| `gpt-4o-mini` (2024-07-18)  | GA                         | **2026-03-31**        | `gpt-4.1-mini`         |
| `gpt-4.1` (2025-04-14)      | **GA disponível**          | 2026-10-14            | `gpt-5`                |
| `gpt-4.1-mini` (2025-04-14) | **GA disponível**          | 2026-10-14            | `gpt-5-mini`           |
| `gpt-5.1` (2025-11-13)      | **GA atual — RECOMENDADO** | 2027-05-15            | —                      |
| `gpt-5` (2025-08-07)        | **GA atual**               | 2027-02-06            | —                      |

> **Confirmado**: `gpt-4o` com auto-upgrade do Standard deployment a partir de 2026-03-09, retire completo em 2026-03-31. Usar GPT-4o na spec é um erro em fevereiro de 2026.

### Achados — Embeddings

| Modelo                   | Status                                 | Substituto                                          |
| ------------------------ | -------------------------------------- | --------------------------------------------------- |
| `text-embedding-ada-002` | Não deprecado ainda, mas desatualizado | `text-embedding-3-small` / `text-embedding-3-large` |

### Modelos Locais (Ollama) — Atualização

| RAM          | Modelo spec v0.1 | Modelo atualizado             | Observação                              |
| ------------ | ---------------- | ----------------------------- | --------------------------------------- |
| 4 GB         | `gemma2:2b`      | `gemma3:4b` (quantizado Q4)   | Gemma 3 4B roda em ~3.8GB, multimodal   |
| 8 GB         | `phi3:mini`      | `phi4-mini` ou `gemma3:4b`    | Phi-4 mini: melhor raciocínio que Phi-3 |
| 16 GB+       | `llama3.1:8b`    | `llama3.3:8b` ou `gemma3:12b` | Llama 3.3 tem melhor benchmark em PT    |
| Cloud opt-in | `gpt-4o`         | `gpt-5.1`                     | Ver tabela Azure acima                  |

### Recomendação

Substituir na tabela e nos exemplos de código:

- `gpt-4o` → `gpt-5.1` (cloud opt-in)
- `text-embedding-ada-002` → `text-embedding-3-small`
- `gemma2:2b` → `gemma3:4b`
- `phi3:mini` → `phi4-mini`

Adicionar nota de que a seleção de modelos locais é gerida via `Ollama`, que tem lista de modelos em https://ollama.com/library, e o `AIProviderFactory` deve consultar dinamicamente os modelos disponíveis localmente em vez de hardcodar nomes.

---

## 4. TanStack AI: Análise do Framework

### Achados

**TanStack AI** — Versão atual: `@tanstack/ai-react@0.5.4` (fev/2026)

Características:

- Provider-agnostic adapters: `openaiText`, `anthropicText`, `geminiText`, `ollamaText`, etc.
- **Tree-shakeable** — importa só o adapter que usar
- Suporte multimodal (imagens, áudio, vídeo)
- **Headless chat state management** para React/Vue/Svelte
- Streaming token-by-token
- **Isomorphic tools** com execução server/client
- Observability events estruturados
- Integração com TanStack Start
- 2.3k stars, 47 contribuidores, ~197 releases

### Análise Crítica

O TanStack AI é um **SDK de frontend** para construir UIs de chat com AI. Ele **não compete com LangChain/LangGraph** — eles atuam em camadas diferentes:

```
Frontend (Next.js)          Backend (NestJS)
──────────────────          ────────────────
@tanstack/ai-react          @langchain/langgraph
  - Chat state              - RAG pipeline
  - Streaming SSE           - Agent orchestration
  - UI components           - Vector store
  - Token counting          - Prompt management
```

**Onde TanStack AI agrega:**

- Substitui o gerenciamento manual de estado do chat no Next.js (`useState`, `useEffect`, manual SSE parsing)
- Fornece hooks type-safe para streaming: `useGenerate`, `useStream`
- Elimina a necessidade de SWR/TanStack Query customizado para o chat
- Melhor DX para a interface de query do usuário

**Onde NÃO substitui nada:**

- NÃO faz RAG, NÃO gerencia vector stores, NÃO orquestra agentes
- Não tem conceito de pipeline ou chain

**Limitação importante**: O projeto está em `v0.5.x` — pré-1.0. API pode mudar. Isso é risco aceitável pois o backend permanece em LangGraph independentemente.

### Recomendação

**Adotar TanStack AI no frontend (apps/web)** especificamente para o componente de chat e streaming. É um acréscimo, não uma substituição.

```ts
// apps/web/components/chat/ChatInterface.tsx
import { useGenerate } from '@tanstack/ai-react';
import { openaiText } from '@tanstack/ai-openai/adapters';
// ou criar um adapter customizado que aponta para o NestJS WS/SSE

const { stream, generate, isStreaming } = useGenerate({
  adapter: knowhubAdapter, // adapter customizado → NestJS SSE endpoint
});
```

No NestJS, expor um endpoint SSE (`/api/v1/query/ask/stream`) que faz o streaming da resposta do LangGraph. O TanStack AI consome esse stream.

---

## 5. OpenClaw Skills.md: Adoção da Estratégia

### Achados

O OpenClaw (208k stars, 38k forks, 683 contribuidores) usa um sistema de skills baseado em arquivos Markdown com frontmatter YAML. O sistema é compatível com a especificação **AgentSkills** (`agentskills.io`).

**Estrutura de arquivos relevante:**

```
~/.openclaw/workspace/
├── AGENTS.md       # instruções gerais do agente
├── SOUL.md         # personalidade, valores, vibe do assistente
├── TOOLS.md        # ferramentas disponíveis e como usá-las
├── IDENTITY.md     # identidade e contexto do usuário
└── skills/
    ├── notion/
    │   └── SKILL.md
    ├── summarize/
    │   └── SKILL.md
    └── <custom>/
        └── SKILL.md
```

**SOUL.md — conceito central:**

> "Você não é um chatbot. Você está se tornando alguém."

O SOUL.md define tom, valores, limites e vibe do assistente. Exemplos:

- "Tenha opiniões. Você pode discordar, ter preferências, achar coisas divertidas."
- "Seja útil de verdade, não performaticamente útil. Pule o 'Ótima pergunta!'."
- "Seja o assistente que você gostaria de ter."

**SKILL.md — formato:**

```markdown
---
name: nome-da-skill
description: O que essa skill faz em 1 linha
metadata: { 'openclaw': { 'requires': { 'bins': ['npx'] }, 'emoji': '🧠' } }
---

## Quando usar

Descreva os cenários onde o LLM deve invocar esta skill.

## Como usar

Passo a passo para o modelo executar a skill.

## Exemplos

...
```

### Análise Crítica

Esta estratégia é **altamente aplicável ao KnowHub** por razões específicas:

1. **Personalidade do assistente**: KnowHub é um assistente _pessoal_. O SOUL.md definiria que ele conhece o acervo do usuário, antecipa conexões, sugere proativamente. Isso é comportamento treinável via prompt injection estruturado.

2. **Skills modulares vs prompt monolítico**: Em vez de um system prompt gigante e frágil, cada capacidade (indexar, resumir, buscar, sugerir conexões) seria um SKILL.md separado, fácil de manter e evoluir.

3. **Extensibilidade**: Usuários e desenvolvedores podem criar skills customizadas (integração com Notion, Obsidian, etc.) sem alterar o core do sistema — alinhado com o Plugin System da spec.

4. **Diferencial competitivo**: Criar uma identidade consistente para o KnowHub AI o diferencia de uma UI genérica de RAG. Um assistente que "lembra de você" e tem personalidade consistente tem retição muito maior.

**Limitações/riscos:**

- Aumenta o consumo de tokens (cada skill injeta ~100-200 chars no system prompt)
- Para modelos locais pequenos (Gemma 3 4B), o context window fica mais pressionado
- Exige uma camada de carregamento/parsing das skills no `QueryAgent`

### Recomendação

**Adotar a estratégia de Skills.md** com as seguintes adaptações:

```
apps/api/src/skills/
├── SOUL.md           # personalidade do KnowHub AI
├── AGENTS.md         # instruções gerais
└── skills/
    ├── knowledge-rag/
    │   └── SKILL.md  # Como fazer RAG no acervo do usuário
    ├── connections/
    │   └── SKILL.md  # Como identificar conexões entre entradas
    ├── maintenance/
    │   └── SKILL.md  # Como sugerir manutenção (nunca agir sozinho)
    └── summarize/
        └── SKILL.md  # Como resumir entradas
```

O `QueryAgent` lê e injeta as skills relevantes no system prompt dinamicamente. Skills são filtradas por contexto (modo local vs cloud, hardware disponível).

---

## 6. Telegram e WhatsApp: Integração de Bots

### Telegram — Achados

**Funciona perfeitamente para o KnowHub.** O fluxo de linking do usuário ao bot é trivial:

1. Desenvolvedor cria o bot via `@BotFather` e obtém um `TELEGRAM_BOT_TOKEN`
2. O bot recebe um username (ex: `@meuknowhubot`)
3. Usuário abre `https://t.me/meuknowhubot` ou pesquisa o username no Telegram
4. Usuário clica **Start** → bot recebe `/start` e inicia o fluxo de pareamento
5. Deep linking: `https://t.me/meuknowhubot?start=linkcode_abc123` para vincular com a conta local

**Bibliotecas:**

- `Telegraf ^4.x` (citada na spec) — ainda ativa, versão atual: `4.16.x`
- Alternativa moderna: `grammY` (usada pelo OpenClaw) — mais TypeScript-first, melhor DX

### WhatsApp — Achados Críticos

**A spec original não menciona WhatsApp explicitamente**, mas a questão foi levantada. Aqui estão os fatos:

| Via                                            | Viabilidade para KnowHub  | Limitações                                                                                          |
| ---------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------- |
| **WhatsApp Cloud API (oficial)**               | Baixa para uso pessoal    | Exige conta Business Meta, número comercial, aprovação, aprovação de templates. Custo por mensagem. |
| **Baileys (informal)**                         | Alta, usada pelo OpenClaw | **Viola ToS do WhatsApp**. Meta pode banir o número. Risco legal para open source público.          |
| **WhatsApp Business API via Twilio/360dialog** | Média                     | Custo por mensagem, complexidade de setup para usuário final.                                       |

**Conclusão sobre WhatsApp**: Para um projeto **open source** com foco em privacidade e instalação local, usar Baileys (biblioteca não-oficial que emula o cliente web do WhatsApp) é um **risco inaceitável de ToS e legal**. O OpenClaw o usa consciente desse risco e o documenta explicitamente.

### Recomendação

1. **Telegram**: manter na spec, é o canal ideal. Considerar substituir `Telegraf` por `grammY` para melhor DX TypeScript.
2. **WhatsApp**: **não incluir no escopo oficial v1**. Documentar como canal "experimental/não suportado" com aviso de risco. Usuários podem instalar via plugin de terceiros sob própria responsabilidade.
3. **Adicionar Discord como canal alternativo**: API oficial robusta, muito usada por desenvolvedores (público-alvo do KnowHub), sem restrições de ToS para bots.

---

## 7. Instalação Local (Next.js + NestJS no dispositivo)

### O Problema

A spec menciona `npx knowhub-ai setup` mas não detalha como duas aplicações Node.js (NestJS na porta 3001 + Next.js na porta 3000 + Ollama + Redis) ficam rodando continuamente em background no dispositivo do usuário como um produto, não como um ambiente de dev.

### Opções Pesquisadas

#### Opção A — Electron Shell (mais madura)

```
KnowHub.app (Electron)
├── Main Process
│   ├── Spawna NestJS como child process
│   ├── Spawna Next.js (next start) como child process
│   └── Controla Ollama e Redis
└── Renderer (system tray icon + status)
```

- **Prós**: UX de app desktop nativa, auto-start no boot, tray icon, notificações OS
- **Contras**: +120MB de overhead Electron, mais complexo de build/distribute

#### Opção B — PM2 como Process Manager (mais simples)

```bash
# Setup instala PM2 globalmente e registra os serviços
npx knowhub setup
# → instala dependências
# → cria ~/.knowhub/ecosystem.config.js
# → pm2 start ecosystem.config.js
# → pm2 save && pm2 startup  # auto-start no boot
```

- **Prós**: muito mais leve, sem overhead Electron, suporte Windows/Mac/Linux
- **Contras**: UX menos polida (sem tray icon nativo no Electron), PM2 é uma dependência

#### Opção C — Tauri + Sidecar (moderno, mais leve que Electron)

- Tauri pode rodar sidecars (processos externos) como NestJS e Next.js
- **Prós**: ~600KB de overhead (vs 120MB Electron), UX nativa por plataforma
- **Contras**: requer toolchain Rust, mais complexo de setup inicial

#### Opção D — Script shell + launchd/systemd (mais bare-bones)

- Script que registra serviços no sistema operacional
- **Prós**: sem dependências extras
- **Contras**: experiência diferente por OS, difícil de debugar para usuário não-técnico

### Análise sobre Next.js em Modo Local

O Next.js não foi projetado para rodar como processo em background no dispositivo do usuário. Alternativas:

- `next build && next export` → gera HTML estático → servido pelo próprio NestJS (via `@nestjs/serve-static`). **Elimina a necessidade do servidor Next.js em produção local.**
- Next.js com `output: 'standalone'` → gera bundle mínimo (~50MB) que roda sem `node_modules` instalados

### Recomendação

**Estratégia de dois serviços com PM2 + Next.js Standalone:**

```
~/.knowhub/
├── config.json
├── data/ (SQLite, uploads)
├── logs/
└── apps/
    ├── api/          ← NestJS standalone
    └── web/          ← Next.js standalone (next build --output standalone)

~/.knowhub/ecosystem.config.js ← PM2 config
```

O setup wizard (`npx knowhub setup`):

1. Detecta OS e hardware
2. Instala Ollama + modelo adequado
3. Instala Redis (ou usa Valkey, que é fork OSS do Redis)
4. Faz `next build --output standalone`
5. Registra ambos os serviços no PM2
6. Configura PM2 startup para auto-start no boot
7. Abre `http://localhost:3000`

Para usuários Windows: PM2 funciona com `pm2-windows-startup`. Para macOS: launchd via `pm2 startup`.

---

## 8. WebSocket: Gestão da Fila de Eventos

### O Problema Identificado

A spec define os eventos WebSocket mas não detalha:

1. **Desconexão e reconexão**: se o cliente desconectar durante uma indexação longa, como recebe os eventos perdidos ao reconectar?
2. **Múltiplos clientes**: e se o usuário abrir a web + a CLI ao mesmo tempo?
3. **Backpressure**: se o LLM gera tokens rápido mas o cliente está lento, como prevenir perda?
4. **Durabilidade**: eventos de `entry.indexed` precisam ser entregues mesmo após reconexão

### Análise

O BullMQ (já na stack) resolve o problema de **persistência de jobs** — um job de indexação não se perde se o servidor reinicia. Mas os **eventos WebSocket** são efêmeros.

| Solução                                  | Prós                                        | Contras                                         |
| ---------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| **Redis Streams**                        | Persistente, replay, consumer groups        | Mais complexidade, Redis já está na stack       |
| **In-memory queue com timestamp**        | Simples, sem dependência extra              | Não persiste entre reinicializações do servidor |
| **Server-Sent Events (SSE) com cursor**  | Stateless no servidor, native browser retry | Unidirecional (só servidor → cliente)           |
| **@nestjs/event-emitter + Redis PubSub** | NestJS nativo + distribuído                 | Sem replay por padrão                           |

### Recomendação

**Arquitetura de dois canais:**

1. **Redis Streams** para eventos de longa duração (indexação, manutenção): permitem replay com `XREAD COUNT 100 STREAMS key >`. O cliente ao reconectar envia o último `event-id` recebido e recebe os eventos perdidos.

2. **WebSocket puro (sem persistência)** para streaming de tokens (`query.streaming`): esses eventos são efêmeros por natureza — se o cliente desconectou, o usuário precisa refazer a query.

```
BullMQ Job (IndexingAgent)
    │
    ▼
Redis Stream: "events:userId"
    │
    ├──────────────────────────────────────────┐
    │                                           │
    ▼                                           ▼
WebSocket Gateway                     Reconexão do cliente
(emite em tempo real)                 (XREAD desde lastEventId)
```

**Schema de evento do Redis Stream:**

```ts
interface StreamEvent {
  id: string; // Redis stream ID (auto-gerado, timestamp-based)
  userId: string;
  type: string; // "entry.indexed" | "agent.suggestion" | etc.
  payload: string; // JSON serializado
  timestamp: number;
}
```

---

## 9. Arquitetura Cloud: Diagrama e Detalhamento Ausentes

### O Gap Identificado

A spec cobre o modo local com alto nível de detalhe. O modo cloud (Seção 11.2) apenas lista serviços e custos, sem:

- Diagrama de arquitetura cloud
- Como o NestJS escala horizontalmente
- Como os WebSockets funcionam com múltiplas instâncias (sem estado compartilhado)
- Estratégia de CDN para assets do frontend
- Estratégia de backup do banco de dados

### Arquitetura Cloud Proposta

```
┌──────────────────────────────────────────────────────────────────────┐
│                          MODO CLOUD (opt-in)                         │
│                                                                      │
│  ┌────────────────────────────────────────┐                          │
│  │           Vercel (Edge Network)        │                          │
│  │   Next.js 15 — App Router + ISR        │                          │
│  │   Static assets → CDN global           │                          │
│  └────────────────────┬───────────────────┘                          │
│                       │ REST + SSE                                    │
│                       ▼                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Railway (NestJS API)                        │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │   │  Instance 1 │  │  Instance 2 │  │    Instance N       │  │  │
│  │   │  (auto-scale│  │             │  │                     │  │  │
│  │   └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │  │
│  │          └────────────────┼─────────────────────┘             │  │
│  │                           │                                   │  │
│  │          ┌────────────────┼────────────────────────────────┐  │  │
│  │     Redis │               │ Neon PostgreSQL                 │  │  │
│  │  (Upstash)│            pgvector                             │  │  │
│  │  ┌────────▼──────┐  ┌────▼─────────────────────────────┐  │  │  │
│  │  │ BullMQ Queues │  │  KnowledgeEntry, ContentChunk,   │  │  │  │
│  │  │ Redis Streams │  │  Tags, ConnectionEdge, Users...  │  │  │  │
│  │  └───────────────┘  └──────────────────────────────────┘  │  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌────────────────────────────────────┐                              │
│  │        Cloudflare R2 (PDFs)        │                              │
│  │  Assets uploaded → signed URL      │                              │
│  └────────────────────────────────────┘                              │
│                                                                      │
│  ┌────────────────────────────────────┐                              │
│  │      Azure OpenAI (opt-in LLM)     │                              │
│  │  gpt-5.1 + text-embedding-3-small  │                              │
│  └────────────────────────────────────┘                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Desafio do WebSocket com Múltiplas Instâncias

Com múltiplas instâncias do NestJS no Railway, cada cliente WebSocket conecta a uma instância diferente. Eventos emitidos pela instância A não chegam a clientes conectados na instância B.

**Solução**: Redis PubSub + `@socket.io/redis-adapter`:

```ts
// apps/api/src/main.ts
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));
```

Isso garante que eventos emitidos em qualquer instância chegam a todos os clientes conectados, independente da instância.

### Estratégia de Backup Proposta

| Componente      | Estratégia                                       | Frequência |
| --------------- | ------------------------------------------------ | ---------- |
| Neon PostgreSQL | Neon built-in branching + pg_dump automático     | Diário     |
| Cloudflare R2   | R2 Object Replication                            | Contínuo   |
| Redis Streams   | Sem persistência longa necessária, TTL de 7 dias | Via TTL    |

---

## 10. Estratégia de Testes: Gaps Identificados

### Gaps na Spec Atual

A seção 12 é boa em estrutura mas faltam:

1. **Teste do pipeline de embeddings**: A spec menciona "mock LLM" mas não detalha como mockar o `OllamaEmbeddings` sem chamar a API real. Isso é crítico — rodar Ollama em CI é custoso.

2. **Contrato de API (Contract Testing)**: Não há menção a Pact ou similar para garantir que frontend e backend honram os mesmos DTOs. A spec define os contratos mas não testa que eles são respeitados ao longo do tempo.

3. **Teste de performance do RAG**: Não há benchmark de latência do pipeline de query. Para o usuário final, a percepção é: "quanto tempo até receber a primeira resposta?"

4. **Teste de resiliência**: E se o Ollama estiver down? E se o Redis cair? O graceful degradation da spec precisa ser testado.

5. **Snapshot testing para os prompts**: Os prompt templates mudam frequentemente. Sem um registro do output esperado, qualquer mudança no sistema prompt pode quebrar o comportamento sem nenhum alarme.

### Complementos Sugeridos

```ts
// Exemplo: mock de embeddings para testes unitários
export class MockEmbeddingModel implements Embeddings {
  async embedDocuments(texts: string[]): Promise<number[][]> {
    // Retorna vetores determinísticos derivados do hash do texto
    return texts.map((text) => deterministicVector(text, 1536));
  }
  async embedQuery(text: string): Promise<number[]> {
    return deterministicVector(text, 1536);
  }
}
```

| Tipo de Teste     | Ferramenta         | O que adicionar                                                 |
| ----------------- | ------------------ | --------------------------------------------------------------- |
| Unit (agents)     | Jest + ts-jest     | Mock de embeddings, mock de LLM via LangSmith playback          |
| Integration (API) | Jest + Supertest   | SQLite em memória (:memory:) para cada suite                    |
| Contract          | Pact.js            | Contratos DTO frontend ↔ backend                                |
| RAG benchmark     | Script Node.js     | Mede latência P50/P95 do `QueryAgent` com dataset fixo          |
| Smoke (cloud)     | Playwright         | Health-check do deployment antes de marcar release como estável |
| Prompt regression | Vitest + snapshots | Salva output dos prompts para detectar regressões               |

---

## 11. Tabela Consolidada de Versões Atualizadas

| Camada             | Tecnologia                 | Versão Spec v0.1 | Versão Atualizada                       | Mudança                      |
| ------------------ | -------------------------- | ---------------- | --------------------------------------- | ---------------------------- |
| Backend API        | NestJS + TypeScript        | ^10.x            | ^10.x                                   | Sem mudança                  |
| Frontend           | Next.js + TypeScript       | ^15.x            | ^15.x                                   | Sem mudança                  |
| Orquestração AI    | LangChain.js               | **^0.3.x**       | **^1.2.x**                              | ⚠️ Breaking changes          |
| Multi-agent        | —                          | **não listado**  | **@langchain/langgraph ^1.1.x**         | ✨ Novo                      |
| Chat UI (frontend) | —                          | **não listado**  | **@tanstack/ai-react ^0.5.x**           | ✨ Novo (opcional)           |
| DB Local           | SQLite + sqlite-vss        | latest           | latest + **better-sqlite3** driver      | Detalhe                      |
| ORM                | **Prisma**                 | **^5.x**         | **DrizzleORM (latest stable)**          | ⚠️ Mudança recomendada       |
| DB Cloud           | Neon PostgreSQL            | latest           | latest                                  | Sem mudança                  |
| Modelos AI local   | Ollama + **gemma2:2b**     | latest           | **gemma3:4b / phi4-mini**               | ⚠️ Modelos atualizados       |
| Modelos AI cloud   | **Azure GPT-4o**           | latest           | **Azure gpt-5.1**                       | ⚠️ GPT-4o retira em mar/2026 |
| Embeddings cloud   | **text-embedding-ada-002** | latest           | **text-embedding-3-small**              | ⚠️ Versão desatualizada      |
| Telegram bot       | Telegraf                   | ^4.x             | ^4.x ou **grammY**                      | Opcional                     |
| Process manager    | —                          | **não listado**  | **PM2 ^5.x**                            | ✨ Novo (instalação local)   |
| Redis              | BullMQ + Redis             | ^5.x             | BullMQ + **Valkey** (fork OSS) ou Redis | ✨ Considera Valkey          |
| Testes unit        | Jest + ts-jest             | ^29.x            | ^29.x                                   | Sem mudança                  |
| Testes E2E         | Playwright                 | ^1.x             | ^1.x                                    | Sem mudança                  |

---

## Sumário Executivo das Recomendações

| #   | Recomendação                                                                | Prioridade  | Impacto                      |
| --- | --------------------------------------------------------------------------- | ----------- | ---------------------------- |
| 1   | Atualizar LangChain.js para v1.2.x + adotar LangGraph para 3 agentes        | **CRÍTICO** | Arquitetural                 |
| 2   | Substituir GPT-4o por gpt-5.1 nas referências cloud                         | **CRÍTICO** | Retire em mar/2026           |
| 3   | Substituir Prisma por DrizzleORM                                            | **ALTO**    | Performance + SQLite vectors |
| 4   | Atualizar modelos Ollama locais                                             | **ALTO**    | Quality do produto           |
| 5   | Detalhar instalação local com PM2 + Next.js standalone                      | **ALTO**    | Usabilidade                  |
| 6   | Adicionar arquitetura cloud com Redis PubSub para WebSocket multi-instância | **ALTO**    | Escalabilidade               |
| 7   | Adotar estratégia Skills.md + SOUL.md                                       | **MÉDIO**   | Diferencial do produto       |
| 8   | Adotar TanStack AI no frontend para chat/streaming                          | **MÉDIO**   | DX do frontend               |
| 9   | Remover WhatsApp oficial do escopo v1                                       | **MÉDIO**   | Risco legal/ToS              |
| 10  | Adicionar Redis Streams para replay de eventos WebSocket                    | **MÉDIO**   | Resiliência                  |
| 11  | Complementar estratégia de testes                                           | **MÉDIO**   | Qualidade                    |
| 12  | Atualizar embeddings para text-embedding-3-small                            | **BAIXO**   | Custo/performance            |

---

_Análise elaborada por GitHub Copilot (Claude Sonnet 4.6) · Fevereiro 2026 · Para uso exclusivo na revisão da spec-tecnica.md do projeto KnowHub AI Assistant_
