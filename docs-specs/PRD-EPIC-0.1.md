# PRD — EPIC-0.1: Setup do Monorepo e Tooling

**KnowHub AI Assistant** · Glaucia Lemos  
Versão 1.0 · Fevereiro 2026 · Projeto Open Source · Licença MIT

---

## Índice

1. [Contexto e Motivação](#1-contexto-e-motivação)
2. [Objetivo do Épico](#2-objetivo-do-épico)
3. [Conexão com a Visão do Produto](#3-conexão-com-a-visão-do-produto)
4. [Escopo](#4-escopo)
5. [Arquitetura do Monorepo](#5-arquitetura-do-monorepo)
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

O KnowHub AI Assistant é um sistema com múltiplas superfícies de interação: uma API backend (NestJS), uma interface web (Next.js), uma CLI (Commander.js) e pacotes compartilhados de tipos e utilitários. Sem uma estrutura de monorepo bem definida desde o início, cada aplicação evoluiria de forma isolada, gerando duplicação de código, versões divergentes de tipos compartilhados e configurações inconsistentes entre workspaces.

A decisão de usar **Turborepo** como gerenciador de monorepo, combinada com **npm workspaces**, estabelece a fundação sobre a qual todo o desenvolvimento posterior será construído. Projetos open source que não definem essa estrutura cedo pagam um custo alto de reestruturação posterior — e, mais crítico, afastam contribuidores externos.

### 1.2 O problema que resolve para o time

| Problema sem o épico                                                     | Solução entregue pelo épico                                      |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Tipos TypeScript duplicados entre `api`, `web` e `cli`                   | `packages/shared-types` compartilhado e auto-compilado           |
| Builds inconsistentes — funciona na máquina de um dev, falha na de outro | `turbo.json` com pipelines determinísticos e cache de build      |
| Código sem padrão de formatação entre contribuidores                     | ESLint + Prettier + Husky garantem estilo em todo commit         |
| Novo contribuidor leva horas para configurar o ambiente                  | `npm install && npm run dev` funciona em menos de 5 minutos      |
| Dívida técnica acumulada por falta de convenções                         | Configurações centralizadas em `packages/tsconfig` desde o dia 1 |

### 1.3 Alinhamento com os princípios do produto

> **"Open Source como cultura: documentação, código e roadmap são públicos e abertos a contribuições da comunidade."**
> — Especificação Não-Técnica, Seção 2 (Princípios Guia)

Um monorepo bem estruturado é o pré-requisito técnico para que o projeto seja genuinamente contribuível. Sem isso, o princípio de open source permanece apenas no README.

---

## 2. Objetivo do Épico

> **Ter a estrutura completa do monorepo funcionando com todos os workspaces configurados, dependências instaladas e scripts de build executando sem erros — de forma que qualquer contribuidor possa clonar o repositório e iniciar o desenvolvimento em menos de 5 minutos.**

Este épico não entrega nenhuma funcionalidade visível ao usuário final. Ele entrega a **infraestrutura de desenvolvimento** que torna possível construir todas as funcionalidades seguintes com velocidade e consistência.

---

## 3. Conexão com a Visão do Produto

O KnowHub AI Assistant tem como missão:

> _"Democratizar o acesso a um gerenciador de conhecimento com IA, poderoso para desenvolvedores e acessível para qualquer pessoa."_

Para que isso se realize como projeto open source sustentável, a base técnica precisa ser:

- **Acessível aos contribuidores:** ambiente configurável sem fricção.
- **Consistente:** mesmos padrões de código em todos os workspaces.
- **Escalável:** estrutura que suporta crescimento sem reestruturações custosas.
- **Testável:** automação de qualidade desde o primeiro commit.

O EPIC-0.1 é a fundação sobre a qual os EPICs 1.x a 4.x serão construídos. Atrasos ou estrutura inadequada nesta fase se propagam como dívida técnica exponencial nos meses seguintes.

---

## 4. Escopo

### 4.1 Dentro do Escopo — MVP deste Épico

- Estrutura de diretórios completa do monorepo
- Configuração do Turborepo com pipelines de build, dev, test e lint
- Workspaces npm para todos os apps e packages
- TypeScript compartilhado com strict mode e path aliases
- ESLint + Prettier configurados sem conflitos
- Husky + lint-staged para validação pré-commit
- Pacotes `shared-types` e `shared-utils` com exports iniciais
- `.editorconfig` padronizando indentação e fim de linha
- Sugestões de configuração do VSCode (`.vscode/settings.json`)
- `package.json` raiz com scripts npm funcionais

### 4.2 Fora do Escopo — Este Épico

| Item                                               | Onde será tratado   |
| -------------------------------------------------- | ------------------- |
| GitHub Actions CI/CD                               | EPIC-0.2            |
| Docker Compose para serviços de infraestrutura     | EPIC-0.3            |
| Schema do banco de dados e migrations              | EPIC-0.3            |
| Variáveis de ambiente e configurações              | EPIC-0.3            |
| README, CONTRIBUTING.md e documentação open source | EPIC-0.4            |
| Implementação de qualquer lógica de negócio        | EPICs 1.x em diante |

---

## 5. Arquitetura do Monorepo

### 5.1 Estrutura de Diretórios Completa

```
knowhub/
├── apps/
│   ├── api/                          # NestJS Backend (porta 3001)
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── tsconfig.json             # Estende packages/tsconfig/nestjs.json
│   │   ├── tsconfig.build.json
│   │   └── package.json
│   │
│   ├── web/                          # Next.js Frontend (porta 3000)
│   │   ├── app/
│   │   │   └── layout.tsx
│   │   ├── public/
│   │   ├── tsconfig.json             # Estende packages/tsconfig/nextjs.json
│   │   └── package.json
│   │
│   └── cli/                          # CLI Commander.js
│       ├── src/
│       │   └── index.ts
│       ├── tsconfig.json             # Estende packages/tsconfig/base.json
│       └── package.json
│
├── packages/
│   ├── shared-types/                 # Tipos TypeScript compartilhados
│   │   ├── src/
│   │   │   ├── knowledge.types.ts    # KnowledgeEntry, ContentChunk, Tag, etc.
│   │   │   ├── agent.types.ts        # IndexingResult, QueryResult, SearchResult
│   │   │   └── api.types.ts          # DTOs de request/response
│   │   ├── index.ts                  # Barrel export
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared-utils/                 # Utilitários compartilhados
│   │   ├── src/
│   │   │   ├── text-splitter.ts      # createTextSplitter()
│   │   │   └── metadata-extractor.ts # helpers de metadados
│   │   ├── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── tsconfig/                     # Configurações TypeScript base
│       ├── base.json
│       ├── nextjs.json
│       └── nestjs.json
│
├── turbo.json                        # Pipelines Turborepo
├── package.json                      # Root workspace (npm)
├── npm-workspace.yaml               # Declaração dos workspaces
├── .eslintrc.js                      # ESLint flat config (raiz)
├── .prettierrc                       # Prettier config
├── .editorconfig                     # Indentação e fim de linha
├── .gitignore
└── .vscode/
    └── settings.json                 # Configurações sugeridas
```

### 5.2 Diagrama de Dependências entre Workspaces

```
packages/tsconfig
    ├── base.json ──────────────────────┐
    ├── nestjs.json (extends base.json) │── apps/api/tsconfig.json
    ├── nextjs.json (extends base.json) │── apps/web/tsconfig.json
    └── base.json ──────────────────────┘── apps/cli/tsconfig.json
                                            packages/shared-types/tsconfig.json
                                            packages/shared-utils/tsconfig.json

packages/shared-types
    └── exporta tipos ──────────────────── apps/api   (import @knowhub/shared-types)
                                           apps/web   (import @knowhub/shared-types)
                                           apps/cli   (import @knowhub/shared-types)

packages/shared-utils
    └── exporta helpers ─────────────────- apps/api   (import @knowhub/shared-utils)

```

### 5.3 Configuração Turborepo (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:watch": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "lint:fix": {
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

> **Nota:** O operador `^build` em `dependsOn` garante que os packages dependentes (`shared-types`, `shared-utils`) sejam compilados _antes_ dos apps que os consomem. Isso é crítico para o funcionamento correto dos path aliases.

---

## 6. Histórias de Usuário e Critérios de Aceite

---

### STORY-0.1.1 — Estrutura do Monorepo

> **Como desenvolvedor contribuidor, quero clonar o repositório e executar `npm install` para ter todas as dependências instaladas e o projeto pronto para desenvolvimento.**

**Contexto:** O primeiro momento de um novo contribuidor é o clone + install. Qualquer fricção neste passo reduz drasticamente a chance de contribuição real. A meta de 5 minutos do zero ao ambiente funcionando é um SLA interno da equipe.

**Critérios de Aceite:**

- [ ] `npm install` na raiz instala dependências de **todos** os workspaces de uma vez
- [ ] `npm build` via Turborepo compila `api`, `web` e `cli` sem erros em ambiente limpo
- [ ] `npm dev` inicia `api` e `web` em paralelo com hot-reload (usando `turbo run dev`)
- [ ] `npm test` executa Jest em todos os workspaces com relatório consolidado no terminal
- [ ] `npm lint` executa ESLint em todos os workspaces com saída legível
- [ ] Cada workspace tem seu próprio `package.json` com scripts: `dev`, `build`, `test`, `lint`
- [ ] O arquivo `npm-workspace.yaml` declara corretamente todos os workspaces
- [ ] `npm -w` (flag de workspace raiz) funciona para adicionar dependências globais

**Testes de Validação:**

```bash
# Clone em ambiente limpo (sem cache)
git clone <repo-url> knowhub-test
cd knowhub-test
npm install        # deve finalizar sem erros
npm build          # todos os workspaces compilam
npm test -- --passWithNoTests  # sem erros de execução
npm lint           # sem erros de lint
```

---

### STORY-0.1.2 — Configuração de TypeScript Compartilhada

> **Como desenvolvedor, quero que todos os workspaces compartilhem uma configuração base de TypeScript para garantir consistência e evitar repetição de configuração.**

**Contexto:** Sem uma base compartilhada, cada workspace pode ter configurações de strict mode diferentes, levando a erros que aparecem apenas em certos workspaces. O `packages/tsconfig` resolve isso com uma única fonte de verdade.

**Critérios de Aceite:**

- [ ] `packages/tsconfig/base.json` contém as configurações base do projeto:
  - `strict: true` habilitado
  - `target: "ES2022"`
  - `module: "ESNext"` ou equivalente
  - `moduleResolution: "bundler"` ou `"node16"`
  - `declaration: true`
  - `declarationMap: true`
  - `sourceMap: true`
- [ ] `packages/tsconfig/nestjs.json` estende `base.json` e adiciona configurações específicas do NestJS:
  - `experimentalDecorators: true`
  - `emitDecoratorMetadata: true`
  - `module: "CommonJS"`
- [ ] `packages/tsconfig/nextjs.json` estende `base.json` e adiciona:
  - Suporte a JSX (`jsx: "preserve"`)
  - Plugins do servidor do Next.js
- [ ] Todos os `tsconfig.json` dos workspaces estendem o base correspondente via `"extends":`
- [ ] **Strict mode** habilitado em todos os workspaces sem exceções
- [ ] Path aliases configurados no `base.json` (ou em cada workspace):
  - `"@knowhub/shared-types": ["../../packages/shared-types/src"]`
  - `"@knowhub/shared-utils": ["../../packages/shared-utils/src"]`
- [ ] Tipos do `packages/shared-types` são reconhecidos nos IDEs sem `npm link` ou configuração adicional
- [ ] `tsc --noEmit` roda sem erros em todos os workspaces

**Exemplo de `base.json`:**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

### STORY-0.1.3 — Linting e Formatação

> **Como desenvolvedor, quero que o código seja automaticamente formatado e validado para manter consistência no projeto — sem que eu precise pensar em convenções de estilo a cada PR.**

**Contexto:** Discussões de estilo de código em code reviews são ruído. Ferramentas automatizadas eliminam essa fricção e garantem que todo código no repositório siga o mesmo padrão, independente do editor ou OS do contribuidor.

**Critérios de Aceite:**

- [ ] ESLint configurado na raiz com regras para TypeScript, cobrindo todos os workspaces
  - Usa `@typescript-eslint/eslint-plugin` e `@typescript-eslint/parser`
  - Regras obrigatórias: `no-explicit-any`, `no-unused-vars`, `prefer-const`
  - Regras React habilitadas apenas para workspace `web` (escopo por `files`)
  - Regras Node.js habilitadas apenas para workspaces `api` e `cli`
- [ ] Prettier configurado e integrado ao ESLint via `eslint-config-prettier` (sem conflitos)
  - `printWidth: 100`
  - `singleQuote: true`
  - `trailingComma: "all"`
  - `semi: true`
- [ ] `.editorconfig` na raiz define:
  - `indent_style = space`
  - `indent_size = 2`
  - `end_of_line = lf`
  - `charset = utf-8`
  - `trim_trailing_whitespace = true`
  - `insert_final_newline = true`
- [ ] `npm lint` executa ESLint em todos os workspaces e retorna saída legível
- [ ] `npm lint:fix` corrige problemas automaticamente quando possível (ESLint + Prettier)
- [ ] `npm format` aplica Prettier em todos os arquivos do repo
- [ ] `.vscode/settings.json` sugerido (não obrigatório) contém:
  - `"editor.formatOnSave": true`
  - `"editor.defaultFormatter": "esbenp.prettier-vscode"`
  - `"editor.codeActionsOnSave": { "source.fixAll.eslint": true }`
- [ ] Husky instalado e configurado no `package.json` raiz:
  - Hook `pre-commit` executa lint-staged
  - Apenas arquivos staged no commit passam pelo lint (não o projeto inteiro)
- [ ] lint-staged configurado para aplicar ESLint e Prettier apenas em:
  - `*.ts`, `*.tsx` → `eslint --fix` + `prettier --write`
  - `*.json`, `*.md`, `*.yml` → `prettier --write`
- [ ] Commit com código que falha no lint é **bloqueado** pelo Husky

**Exemplo de `.eslintrc.js` (flat config):**

```js
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'prettier', // deve vir por último
  ],
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
    },
    {
      files: ['apps/api/**/*.ts', 'apps/cli/**/*.ts'],
      extends: ['plugin:node/recommended'],
    },
  ],
};
```

---

### STORY-0.1.4 — Pacotes Compartilhados Iniciais

> **Como desenvolvedor, quero que os tipos TypeScript e utilitários sejam compartilhados entre todos os apps sem duplicação, de forma que uma mudança de tipo se propague automaticamente para todos os workspaces.**

**Contexto:** Esta é a story mais crítica do ponto de vista arquitetural. Os tipos definidos aqui serão a linguagem comum entre API, frontend e CLI. Qualquer inconsistência nos tipos cria divergências silenciosas que levam a bugs em produção. Os utilitários (text-splitter, metadata-extractor) também são reutilizados em múltiplos contextos (API pelos agentes, CLI pela captura offline).

#### 6.4.1 `packages/shared-types`

**Critérios de Aceite:**

- [ ] `packages/shared-types/src/knowledge.types.ts` exporta os seguintes tipos:

```typescript
// knowledge.types.ts

export type KnowledgeEntryType =
  | 'NOTE'
  | 'TEXT'
  | 'LINK'
  | 'PDF'
  | 'GITHUB_ISSUE'
  | 'GITHUB_README';

export type KnowledgeEntryStatus = 'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED' | 'ARCHIVED';

export interface KnowledgeEntry {
  id: string;
  userId: string;
  type: KnowledgeEntryType;
  title: string;
  content: string;
  sourceUrl?: string;
  filePath?: string;
  summary?: string;
  status: KnowledgeEntryStatus;
  createdAt: string;
  updatedAt: string;
  accessedAt?: string;
  archivedAt?: string;
}

export interface ContentChunk {
  id: string;
  entryId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  embedding: number[];
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
}

export interface ConnectionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  similarity: number;
  type: 'semantic' | 'manual';
  createdAt: string;
}

export type MaintenanceJobType =
  | 'REINDEX'
  | 'CHECK_LINKS'
  | 'DEDUPLICATE'
  | 'GENERATE_CONNECTIONS'
  | 'ARCHIVE_STALE';

export type MaintenanceJobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface MaintenanceJob {
  id: string;
  type: MaintenanceJobType;
  status: MaintenanceJobStatus;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  createdAt: string;
  completedAt?: string;
}
```

- [ ] `packages/shared-types/src/agent.types.ts` exporta os seguintes tipos:

```typescript
// agent.types.ts

export interface IndexingResult {
  entryId: string;
  chunksCount: number;
  summary: string;
  tags: string[];
  connections: Array<{ targetId: string; similarity: number }>;
  durationMs: number;
}

export interface QueryResult {
  answer: string;
  sources: Array<{
    entryId: string;
    title: string;
    score: number;
  }>;
  tokensUsed: number;
  provider: 'ollama' | 'azure';
  latencyMs: number;
}

export interface SearchResult {
  entryId: string;
  title: string;
  content: string;
  score: number;
  type: KnowledgeEntryType;
}
```

- [ ] `packages/shared-types/src/api.types.ts` exporta DTOs de request/response com JSDoc:

```typescript
// api.types.ts

/** DTO para criação de nova entrada de conhecimento */
export interface CreateKnowledgeEntryDto {
  type: KnowledgeEntryType;
  content?: string;
  sourceUrl?: string;
  title?: string;
  tags?: string[];
}

/** DTO para ingestão de URL */
export interface IngestUrlDto {
  url: string;
  title?: string;
}

/** DTO para query ao assistente */
export interface AskQueryDto {
  question: string;
  stream?: boolean;
}

/** Resposta paginada padrão */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/** Resposta de erro padrão da API */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

- [ ] `packages/shared-types/index.ts` reexporta todos os tipos via barrel:
  ```typescript
  export * from './src/knowledge.types';
  export * from './src/agent.types';
  export * from './src/api.types';
  ```
- [ ] `packages/shared-types/package.json` declara `"main"`, `"types"` e `"exports"` corretamente
- [ ] Mudanças em `shared-types` são **detectadas e recompiladas automaticamente** pelo Turborepo via cache invalidation

#### 6.4.2 `packages/shared-utils`

**Critérios de Aceite:**

- [ ] `packages/shared-utils/src/text-splitter.ts` exporta `createTextSplitter()`:

```typescript
// text-splitter.ts
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

/**
 * Cria um TextSplitter configurado para o KnowHub.
 * - chunkSize: 1000 (~250 tokens para modelos 4k context)
 * - chunkOverlap: 200 (20% de overlap para preservar contexto)
 */
export const createTextSplitter = (): RecursiveCharacterTextSplitter =>
  new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
    lengthFunction: (text) => text.split(' ').length,
  });
```

- [ ] `packages/shared-utils/src/metadata-extractor.ts` exporta helpers de extração de metadados:

```typescript
// metadata-extractor.ts

/**
 * Extrai título de uma string de conteúdo.
 * Tenta H1 markdown, primeira linha não-vazia ou trunca o conteúdo.
 */
export function extractTitle(content: string): string;

/**
 * Detecta o tipo de conteúdo a partir de uma URL.
 */
export function detectContentType(url: string): 'github' | 'pdf' | 'web';

/**
 * Estima o número de tokens a partir da contagem de palavras.
 * Aproximação: 1 token ≈ 0.75 palavras
 */
export function estimateTokenCount(text: string): number;
```

- [ ] `packages/shared-utils/index.ts` reexporta todos os utilitários
- [ ] Funções exportadas têm JSDoc descrevendo parâmetros e retorno
- [ ] `packages/shared-utils/package.json` declara `"main"`, `"types"` e `"exports"` corretamente

---

## 7. Especificações Técnicas Detalhadas

### 7.1 Versões de Ferramentas

| Ferramenta | Versão mínima | Motivo                                                       |
| ---------- | ------------- | ------------------------------------------------------------ |
| Node.js    | ≥ 20.x LTS    | Suporte nativo a ESModules, `crypto.randomUUID()` sem import |
| npm        | ≥ 9.x         | workspace protocol nativo, performance superior ao npm       |
| Turborepo  | ^2.x          | Pipelines declarativos, cache remoto, pruning de deps        |
| TypeScript | ^5.x          | Satisfies operator, const type params, verbatim modules      |
| ESLint     | ^9.x          | Flat config (novo formato, sem `.eslintrc.json` legado)      |
| Prettier   | ^3.x          | Formatting API estável                                       |

### 7.2 Configuração do `package.json` Raiz

```json
{
  "name": "knowhub",
  "version": "0.1.0",
  "private": true,
  "license": "MIT",
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "test:watch": "turbo run test:watch",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md,yml}\"",
    "clean": "turbo run clean && rm -rf node_modules",
    "prepare": "husky"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser": "^8.x",
    "eslint": "^9.x",
    "eslint-config-prettier": "^9.x",
    "husky": "^9.x",
    "lint-staged": "^15.x",
    "prettier": "^3.x",
    "prettier-plugin-organize-imports": "^4.x",
    "turbo": "^2.x",
    "typescript": "^5.x"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### 7.3 Configuração do `npm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 7.4 Path Aliases e Resolução de Tipos

Para que um import como `import { KnowledgeEntry } from "@knowhub/shared-types"` funcione em todos os workspaces sem `npm link`, cada workspace precisa de duas configurações alinhadas:

**1. `tsconfig.json` do workspace:**

```json
{
  "compilerOptions": {
    "paths": {
      "@knowhub/shared-types": ["../../packages/shared-types/src"],
      "@knowhub/shared-utils": ["../../packages/shared-utils/src"]
    }
  }
}
```

**2. `package.json` do workspace (dependência via workspace protocol):**

```json
{
  "dependencies": {
    "@knowhub/shared-types": "workspace:*",
    "@knowhub/shared-utils": "workspace:*"
  }
}
```

**3. `package.json` de cada package compartilhado:**

```json
{
  "name": "@knowhub/shared-types",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

> **Atenção:** O Turborepo garante que `packages/shared-types` seja compilado antes dos apps que o consomem, via o operador `"dependsOn": ["^build"]` no `turbo.json`. Sem isso, os tipos não estarão disponíveis durante o build dos apps.

### 7.5 Estrutura inicial dos Apps (Esqueleto Mínimo)

Cada app deve ter um esqueleto funcional — não necessariamente com lógica de negócio, mas compilável e executável:

**`apps/api` (NestJS):**

```typescript
// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';

@Module({ imports: [] })
export class AppModule {}

// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

**`apps/web` (Next.js):**

```typescript
// apps/web/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

**`apps/cli` (Commander.js):**

```typescript
// apps/cli/src/index.ts
import { Command } from 'commander';

const program = new Command();

program.name('knowhub').description('KnowHub AI Assistant CLI').version('0.1.0');

program.parse();
```

---

## 8. Definição de Pronto (Definition of Done)

Um item que satisfaz todos os critérios de aceite de suas histórias **E** os seguintes requisitos gerais é considerado **completo**:

### 8.1 Qualidade de Código

- [ ] Nenhum erro de TypeScript (`tsc --noEmit` passa em todos os workspaces)
- [ ] Nenhum erro de ESLint em nenhum arquivo do repo
- [ ] Todos os arquivos formatados com Prettier (sem diff)
- [ ] Nenhuma dependência instalada que não seja utilizada
- [ ] Nenhuma dependência duplicada entre workspace raiz e workspaces filhos sem justificativa

### 8.2 Funcionalidade

- [ ] `npm install` funciona em ambiente Node.js 20.x limpo (sem cache)
- [ ] `npm build` compila todos os workspaces sem erros
- [ ] `npm dev` inicia api e web com hot-reload funcionando
- [ ] `npm test -- --passWithNoTests` executa sem erros (sem testes ainda = OK)
- [ ] `npm lint` executa sem erros

### 8.3 Automação de Commits

- [ ] Husky instalado e hook `pre-commit` funcional
- [ ] Commit com arquivo TypeScript com erro de lint é **bloqueado**
- [ ] Commit com arquivo TypeScript correto é **permitido**
- [ ] lint-staged aplica apenas em arquivos staged (não no projeto inteiro)

### 8.4 Tipos Compartilhados

- [ ] Import de `@knowhub/shared-types` funciona em `apps/api` com autocomplete no IDE
- [ ] Import de `@knowhub/shared-types` funciona em `apps/web` com autocomplete no IDE
- [ ] Import de `@knowhub/shared-utils` funciona em `apps/api`
- [ ] Mudança nos tipos em `shared-types` é imediatamente visível nos consumidores (watch mode)

### 8.5 Documentação Mínima

- [ ] `README.md` na raiz tem uma seção **Quick Start** com os comandos mínimos para iniciar
- [ ] Cada `package.json` de workspace tem campo `"description"` preenchido
- [ ] `.env.example` existe em `apps/api` (mínimo: `PORT=3001`, `NODE_ENV=development`)
- [ ] `.env.example` existe em `apps/web` (mínimo: `NEXT_PUBLIC_API_URL=http://localhost:3001`)

---

## 9. Tarefas Técnicas

As tarefas estão ordenadas por dependência lógica. Itens marcados com `(paralelo)` podem ser executados simultaneamente.

### Fase A — Inicialização e Estrutura Base

| #    | Tarefa                                                                                               | Responsável | Estimativa |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------- | ---------- |
| T-01 | Inicializar repositório Git com `.gitignore` adequado para Node.js/npm/Turborepo                     | Dev         | 15 min     |
| T-02 | Criar `npm-workspace.yaml` com declaração dos workspaces                                             | Dev         | 10 min     |
| T-03 | Criar `package.json` raiz com scripts npm e devDependencies                                          | Dev         | 30 min     |
| T-04 | Criar estrutura de diretórios: `apps/{api,web,cli}`, `packages/{shared-types,shared-utils,tsconfig}` | Dev         | 15 min     |
| T-05 | Inicializar Turborepo: instalar `turbo` e criar `turbo.json` com pipelines                           | Dev         | 30 min     |

### Fase B — TypeScript e Packages (paralelo com Fase C)

| #    | Tarefa                                                                           | Responsável | Estimativa |
| ---- | -------------------------------------------------------------------------------- | ----------- | ---------- |
| T-06 | Criar `packages/tsconfig/base.json` com configuração base                        | Dev         | 20 min     |
| T-07 | Criar `packages/tsconfig/nestjs.json` estendendo base                            | Dev         | 15 min     |
| T-08 | Criar `packages/tsconfig/nextjs.json` estendendo base                            | Dev         | 15 min     |
| T-09 | Criar `packages/shared-types` com `package.json`, `tsconfig.json`, barrel export | Dev         | 30 min     |
| T-10 | Implementar `knowledge.types.ts` com todos os tipos definidos                    | Dev         | 45 min     |
| T-11 | Implementar `agent.types.ts` com todos os tipos definidos                        | Dev         | 30 min     |
| T-12 | Implementar `api.types.ts` com todos os DTOs + JSDoc                             | Dev         | 45 min     |
| T-13 | Criar `packages/shared-utils` com `package.json`, `tsconfig.json`, barrel export | Dev         | 20 min     |
| T-14 | Implementar `text-splitter.ts` com `createTextSplitter()`                        | Dev         | 30 min     |
| T-15 | Implementar `metadata-extractor.ts` com helpers de metadados                     | Dev         | 45 min     |

### Fase C — Scaffolding dos Apps (paralelo com Fase B)

| #    | Tarefa                                                                                 | Responsável | Estimativa |
| ---- | -------------------------------------------------------------------------------------- | ----------- | ---------- |
| T-16 | Inicializar `apps/api` com NestJS CLI: `nest new api --skip-git`                       | Dev         | 20 min     |
| T-17 | Configurar `apps/api/tsconfig.json` estendendo `packages/tsconfig/nestjs.json`         | Dev         | 15 min     |
| T-18 | Adicionar `@knowhub/shared-types` e `@knowhub/shared-utils` ao `apps/api/package.json` | Dev         | 10 min     |
| T-19 | Inicializar `apps/web` com Next.js: `npx create-next-app@latest web`                   | Dev         | 20 min     |
| T-20 | Configurar `apps/web/tsconfig.json` estendendo `packages/tsconfig/nextjs.json`         | Dev         | 15 min     |
| T-21 | Adicionar `@knowhub/shared-types` ao `apps/web/package.json`                           | Dev         | 10 min     |
| T-22 | Criar `apps/cli/src/index.ts` com esqueleto Commander.js                               | Dev         | 20 min     |
| T-23 | Configurar `apps/cli/tsconfig.json` estendendo `packages/tsconfig/base.json`           | Dev         | 10 min     |

### Fase D — Linting e Qualidade

| #    | Tarefa                                                                | Responsável | Estimativa |
| ---- | --------------------------------------------------------------------- | ----------- | ---------- |
| T-24 | Instalar e configurar ESLint na raiz com `@typescript-eslint`         | Dev         | 45 min     |
| T-25 | Instalar e configurar Prettier com `prettier-plugin-organize-imports` | Dev         | 20 min     |
| T-26 | Integrar Prettier ao ESLint via `eslint-config-prettier`              | Dev         | 15 min     |
| T-27 | Criar `.editorconfig` com configurações de indentação e fim de linha  | Dev         | 10 min     |
| T-28 | Criar `.vscode/settings.json` com configurações sugeridas             | Dev         | 15 min     |
| T-29 | Instalar Husky: `npm dlx husky init`                                  | Dev         | 15 min     |
| T-30 | Configurar lint-staged no `package.json` raiz                         | Dev         | 20 min     |
| T-31 | Configurar hook `pre-commit` para executar lint-staged                | Dev         | 10 min     |

### Fase E — Validação e Ajustes

| #    | Tarefa                                                                             | Responsável | Estimativa |
| ---- | ---------------------------------------------------------------------------------- | ----------- | ---------- |
| T-32 | Executar `npm install && npm build` em ambiente limpo (sem cache) e corrigir erros | Dev         | Variável   |
| T-33 | Testar import de `@knowhub/shared-types` em `apps/api` e confirmar autocomplete    | Dev         | 20 min     |
| T-34 | Testar import de `@knowhub/shared-types` em `apps/web` e confirmar autocomplete    | Dev         | 20 min     |
| T-35 | Testar hook Husky: fazer commit com erro de lint e confirmar bloqueio              | Dev         | 15 min     |
| T-36 | Criar `.env.example` em `apps/api` e `apps/web`                                    | Dev         | 15 min     |
| T-37 | Atualizar seção Quick Start no `README.md` raiz                                    | Dev         | 20 min     |

**Estimativa total:** ~12-16 horas de trabalho efetivo

---

## 10. Dependências

### 10.1 Dependências de Outros Épicos

**Nenhuma.** Este é o épico fundacional — nenhum outro épico pode iniciar antes de sua conclusão.

### 10.2 Dependências Externas

| Dependência         | Versão    | Uso                                     | Risco                       |
| ------------------- | --------- | --------------------------------------- | --------------------------- |
| Node.js ≥ 20.x      | LTS atual | Runtime de todos os workspaces          | Baixo — versão LTS estável  |
| npm ≥ 9.x           | Atual     | Gerenciador de pacotes e workspaces     | Baixo — amplamente adotado  |
| Turborepo ^2.x      | Estável   | Orquestração de builds                  | Baixo — mantido pela Vercel |
| TypeScript ^5.x     | Estável   | Linguagem base                          | Baixo                       |
| NestJS ^10.x        | LTS       | Framework do `apps/api`                 | Baixo                       |
| Next.js ^15.x       | Estável   | Framework do `apps/web`                 | Baixo                       |
| LangChain.js ^1.2.x | Estável   | Usado no `shared-utils` (text-splitter) | Médio — API em evolução     |

### 10.3 Decisões Técnicas que Este Épico Solidifica

As seguintes ADRs (Architecture Decision Records) da especificação técnica são concretizadas neste épico:

- **ADR-001:** NestJS como framework de backend
- **ADR-002:** Next.js 15 com App Router como frontend
- **ADR-005:** LangChain.js ^1.2.x (impacta `shared-utils`)
- **ADR-007:** DrizzleORM (schema fica em `apps/api`, mas tipos em `shared-types`)

---

## 11. Estratégia de Testes

### 11.1 Abordagem para Este Épico

Este épico é de **infraestrutura**, não de lógica de negócio. A estratégia de testes é diferente dos épicos seguintes:

| Tipo de teste                          | Aplicável?          | Como                                        |
| -------------------------------------- | ------------------- | ------------------------------------------- |
| Testes unitários                       | Não aplicável       | Não há lógica de negócio para testar        |
| Testes de integração                   | Não aplicável       | Nenhuma integração com serviços externos    |
| **Testes de smoke (validação manual)** | **Sim — principal** | Scripts de validação executados manualmente |
| Testes E2E                             | Não aplicável       | Nenhuma interface web ainda                 |

### 11.2 Checklist de Smoke Tests

Cada tarefa abaixo deve ser executada em uma **máquina nova sem cache**, de preferência em um container limpo ou VM:

```bash
# Smoke Test 1: Install
git clone <repo> test-clean && cd test-clean
npm install
# Esperado: sem erros, tempo < 3 min

# Smoke Test 2: Build
npm build
# Esperado: todos os workspaces compilam sem erros TypeScript

# Smoke Test 3: Lint
npm lint
# Esperado: zero warnings ou erros

# Smoke Test 4: Types
cd apps/api
npx tsc --noEmit
# Esperado: sem erros

cd ../web
npx tsc --noEmit
# Esperado: sem erros

# Smoke Test 5: Shared types resolution
# Criar arquivo temporário em apps/api/src/test-types.ts:
# import { KnowledgeEntry } from "@knowhub/shared-types";
# const entry: KnowledgeEntry = {} as KnowledgeEntry;
# Esperado: autocomplete funciona no IDE, sem erros TypeScript

# Smoke Test 6: Husky hook
echo "const x: any = 1" >> apps/api/src/test-lint.ts
git add apps/api/src/test-lint.ts
git commit -m "test: lint hook"
# Esperado: commit BLOQUEADO pelo Husky com mensagem de erro ESLint
# Limpar: git checkout -- . && rm apps/api/src/test-lint.ts
```

### 11.3 Validação Cross-Platform

O ambiente de desenvolvimento deve ser testado em:

| Sistema Operacional            | Prioridade | Observações                               |
| ------------------------------ | ---------- | ----------------------------------------- |
| macOS (Apple Silicon)          | Alta       | Ambiente principal da maioria dos devs    |
| Windows 11 (WSL2)              | Alta       | Muitos contribuidores usam Windows + WSL2 |
| Ubuntu 22.04 LTS               | Alta       | CI/CD e deployments rodam Linux           |
| Windows 11 (PowerShell nativo) | Média      | Atenção ao `end_of_line = lf` vs CRLF     |

---

## 12. Riscos e Mitigações

| Risco                                                                   | Probabilidade  | Impacto | Mitigação                                                                                   |
| ----------------------------------------------------------------------- | -------------- | ------- | ------------------------------------------------------------------------------------------- |
| **Conflito de versões** entre ESLint v9 (flat config) e plugins legados | Média          | Alto    | Usar apenas plugins compatíveis com flat config. Documentar lista de plugins testados.      |
| **Path aliases** não resolvendo em alguns workspaces                    | Média          | Alto    | Testar import de `@knowhub/shared-types` em todos os apps antes de fechar o épico.          |
| **Turborepo cache corrompido** causando builds inconsistentes           | Baixa          | Médio   | Documentar o comando `npm clean` para limpar cache. Incluir no `.gitignore`.                |
| **CRLF vs LF** em Windows causando falhas no ESLint                     | Alta (Windows) | Médio   | `.editorconfig` + `.gitattributes` com `* text=auto eol=lf`. Teste explícito em Windows.    |
| **Breaking change no LangChain.js** afetando `shared-utils`             | Baixa          | Médio   | Fixar versão exata (`1.2.x`) no `package.json`, não `^1.x`.                                 |
| **Tempo subestimado** para resolver conflitos de TypeScript strict mode | Média          | Baixo   | Iniciar com strict mode desde o início evita surpresas posteriores. Prioridade T-06 a T-08. |

---

## 13. Métricas de Sucesso

### 13.1 Métricas Objetivas

| Métrica                                            | Meta                          | Como medir                                      |
| -------------------------------------------------- | ----------------------------- | ----------------------------------------------- |
| Tempo de setup (do clone ao `npm dev`)             | **< 5 minutos**               | Cronometrado em máquina limpa com conexão média |
| `npm build` em ambiente sem cache                  | **sem erros**                 | Rodar em CI sem cache habilitado                |
| `npm lint` no repositório completo                 | **0 warnings, 0 erros**       | Saída do comando                                |
| `tsc --noEmit` em todos os workspaces              | **0 erros**                   | Executado via `npm build`                       |
| Commit com erro de lint/type                       | **100% bloqueado pelo Husky** | Teste manual do hook                            |
| Import de `@knowhub/shared-types` em todos os apps | **autocomplete funcional**    | Teste em VSCode com extensão TypeScript         |

### 13.2 Métricas Qualitativas

| Métrica                                                  | Como avaliar                                            |
| -------------------------------------------------------- | ------------------------------------------------------- |
| Clareza da estrutura para novos contribuidores           | PR review de um dev externo ao projeto                  |
| Facilidade de adicionar um novo workspace                | Documentar os passos necessários — devem ser < 5 passos |
| Consistência da experiência entre macOS, Linux e Windows | Teste manual em cada SO antes do fechamento             |

### 13.3 Gate para Avanço ao EPIC-0.2

O EPIC-0.2 (CI/CD) **não pode iniciar** sem que todos os seguintes critérios sejam verificados:

- [ ] `npm install && npm build` funciona em Node.js 20 limpo
- [ ] Todos os path aliases funcionam em todos os apps
- [ ] Husky + lint-staged bloqueiam commits com erros
- [ ] Structures de diretório correspondem exatamente à especificação
- [ ] `shared-types` tem todos os tipos listados no critério de aceite da STORY-0.1.4

---

## 14. Estimativa e Priorização

### 14.1 Estimativa de Esforço

**Estimativa:** `L` — 5 a 10 dias de desenvolvedor

**Breakdown:**
| Fase | Duração estimada |
|---|---|
| Fase A (estrutura base) | ~2h |
| Fase B (TypeScript + packages) | ~5h |
| Fase C (scaffolding dos apps) | ~3h |
| Fase D (linting e qualidade) | ~2.5h |
| Fase E (validação e ajustes) | ~2h + variável |
| Testes cross-platform | ~3h |
| **Total** | **~17-22h** |

### 14.2 Ordem de Prioridade das Stories

| Prioridade         | Story                                  | Justificativa                                        |
| ------------------ | -------------------------------------- | ---------------------------------------------------- |
| 🔴 P0 — Bloqueante | STORY-0.1.1 (Estrutura do Monorepo)    | Tudo mais depende disso                              |
| 🔴 P0 — Bloqueante | STORY-0.1.2 (TypeScript Compartilhado) | Sem isso, os tipos do 0.1.4 não funcionam            |
| 🟡 P1 — Alta       | STORY-0.1.4 (Pacotes Compartilhados)   | Tipos são usados a partir do EPIC-1.2                |
| 🟢 P2 — Normal     | STORY-0.1.3 (Linting e Formatação)     | Importante mas não bloqueia o EPIC-0.2 imediatamente |

---

## 15. Referências

### Documentos do Projeto

- [Especificação Não-Técnica](./spec-nao-tecnica.md) — Visão de produto, personas e roadmap
- [Especificação Técnica](./spec-tecnica.md) — ADRs, stack, arquitetura e modelo de dados
- [Épicos e Histórias de Usuário](./epicos.md) — Backlog completo por fase

### Referências Técnicas Externas

- [Turborepo Docs — Structuring a repository](https://turbo.build/repo/docs/crafting-your-repository)
- [npm Workspaces](https://npm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [ESLint v9 Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Husky + lint-staged setup](https://typicode.github.io/husky/)
- [LangChain.js RecursiveCharacterTextSplitter](https://js.langchain.com/docs/modules/data_connection/document_transformers/)

### ADRs Relacionadas (de `spec-tecnica.md`)

- ADR-001: NestJS como framework de backend
- ADR-002: Next.js 15 com App Router
- ADR-005: LangChain.js ^1.2.x
- ADR-007: DrizzleORM (schema base para os tipos compartilhados)

---

_PRD preparado por Glaucia Lemos · KnowHub AI Assistant · EPIC-0.1 — Setup do Monorepo e Tooling · Open Source · MIT License · Fevereiro 2026_
