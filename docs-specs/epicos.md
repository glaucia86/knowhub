# Épicos e Histórias de Usuário — KnowHub AI Assistant

**Glaucia Lemos** · Versão 1.0 · Fevereiro 2026  
Projeto Open Source · Licença MIT

> Este documento organiza o desenvolvimento do KnowHub AI Assistant em épicos e histórias de usuário por fase do roadmap. Cada épico é uma unidade autossuficiente de entrega que gera valor mensurável e serve como base para a criação dos arquivos `PRD.md` individuais.

---

## Índice

### Fase 0 — Fundação _(Semanas 1–2)_

- [EPIC-0.1 — Setup do Monorepo e Tooling](#epic-01--setup-do-monorepo-e-tooling)
- [EPIC-0.2 — CI/CD e Automações](#epic-02--cicd-e-automações)
- [EPIC-0.3 — Ambiente de Desenvolvimento Local](#epic-03--ambiente-de-desenvolvimento-local)
- [EPIC-0.4 — Governança e Documentação Open Source](#epic-04--governança-e-documentação-open-source)

### Fase 1 — MVP Essencial _(Semanas 3–6)_

- [EPIC-1.1 — Autenticação e Setup Inicial](#epic-11--autenticação-e-setup-inicial)
- [EPIC-1.2 — Gerenciamento de Entradas de Conhecimento (CRUD)](#epic-12--gerenciamento-de-entradas-de-conhecimento-crud)
- [EPIC-1.3 — Pipeline de Ingestão de Conteúdo](#epic-13--pipeline-de-ingestão-de-conteúdo)
- [EPIC-1.4 — Agent de Indexação (RAG — Indexing)](#epic-14--agent-de-indexação-rag--indexing)
- [EPIC-1.5 — Agent de Query (RAG — Consulta)](#epic-15--agent-de-query-rag--consulta)
- [EPIC-1.6 — Interface Web Core (Frontend MVP)](#epic-16--interface-web-core-frontend-mvp)
- [EPIC-1.7 — CLI — Comandos Essenciais](#epic-17--cli--comandos-essenciais)
- [EPIC-1.8 — WebSocket e Eventos em Tempo Real](#epic-18--websocket-e-eventos-em-tempo-real)

### Fase 2 — Conexões e Agentes _(Semanas 7–12)_

- [EPIC-2.1 — Grafo de Conexões entre Conhecimentos](#epic-21--grafo-de-conexões-entre-conhecimentos)
- [EPIC-2.2 — Mapa Visual de Conhecimento (Frontend)](#epic-22--mapa-visual-de-conhecimento-frontend)
- [EPIC-2.3 — Agent de Manutenção](#epic-23--agent-de-manutenção)
- [EPIC-2.4 — Sugestões Proativas do Assistente](#epic-24--sugestões-proativas-do-assistente)
- [EPIC-2.5 — Integração com GitHub](#epic-25--integração-com-github)
- [EPIC-2.6 — Bot Gateway Telegram](#epic-26--bot-gateway-telegram)
- [EPIC-2.7 — Testes End-to-End (Playwright)](#epic-27--testes-end-to-end-playwright)

### Fase 3 — Experiência e Alcance _(Meses 4–6)_

- [EPIC-3.1 — Onboarding Wizard](#epic-31--onboarding-wizard)
- [EPIC-3.2 — Instalador One-Click](#epic-32--instalador-one-click)
- [EPIC-3.3 — Extensão de Navegador](#epic-33--extensão-de-navegador)
- [EPIC-3.4 — Modo Híbrido (Fallback Cloud)](#epic-34--modo-híbrido-fallback-cloud)
- [EPIC-3.5 — Internacionalização (PT-BR e EN)](#epic-35--internacionalização-pt-br-e-en)

### Fase 4 — Ecossistema de Plugins _(Meses 7–12)_

- [EPIC-4.1 — Infraestrutura do Sistema de Plugins](#epic-41--infraestrutura-do-sistema-de-plugins)
- [EPIC-4.2 — Registry e Descoberta de Plugins](#epic-42--registry-e-descoberta-de-plugins)
- [EPIC-4.3 — Plugins Oficiais da Comunidade](#epic-43--plugins-oficiais-da-comunidade)
- [EPIC-4.4 — SDK e Experiência do Desenvolvedor de Plugins](#epic-44--sdk-e-experiência-do-desenvolvedor-de-plugins)

---

## Convenções deste Documento

| Campo                     | Descrição                                                    |
| ------------------------- | ------------------------------------------------------------ |
| **ID**                    | Identificador único no formato `EPIC-{fase}.{número}`        |
| **Objetivo**              | O valor de negócio que o épico entrega                       |
| **Contexto**              | Motivação técnica ou de produto                              |
| **Histórias de Usuário**  | No formato `Como [quem], quero [o quê], para [por quê]`      |
| **Critérios de Aceite**   | Condições verificáveis para considerar a história concluída  |
| **Tarefas Técnicas**      | Implementações necessárias (não prescrevem a solução)        |
| **Dependências**          | Épicos ou histórias que precisam estar concluídos antes      |
| **Testes Necessários**    | Estratégia mínima de teste para o épico                      |
| **Métricas de Sucesso**   | Como medir que o épico entregou valor                        |
| **Estimativa de Esforço** | S (< 2 dias) · M (2–5 dias) · L (5–10 dias) · XL (> 10 dias) |

---

# FASE 0 — Fundação

> **Objetivo da fase:** Criar a base técnica, de governança e de comunidade antes de qualquer linha de código produtivo. Projetos open source de sucesso começam com estrutura sólida, não apenas com features.

---

## EPIC-0.1 — Setup do Monorepo e Tooling

**Objetivo:** Ter a estrutura completa do monorepo funcionando com todos os workspaces configurados, dependências instaladas e scripts de build executando sem erros.

**Contexto técnico:** O projeto usa Turborepo para gerenciar `apps/api` (NestJS), `apps/web` (Next.js), `apps/cli` (Commander.js) e `packages/shared-types`, `packages/shared-utils`. A configuração inicial correta evita dívida técnica de reestruturação posterior.

### Histórias de Usuário

**STORY-0.1.1 — Estrutura do monorepo**

> Como desenvolvedor contribuidor, quero clonar o repositório e executar `pnpm install` para ter todas as dependências instaladas e o projeto pronto para desenvolvimento.

_Critérios de aceite:_

- [ ] `pnpm install` na raiz instala dependências de todos os workspaces
- [ ] `pnpm build` via Turborepo compila `api`, `web` e `cli` sem erros
- [ ] `pnpm dev` inicia `api` e `web` em paralelo com hot-reload
- [ ] `pnpm test` executa Jest em todos os workspaces com relatório consolidado
- [ ] `pnpm lint` executa ESLint em todos os workspaces
- [ ] Cada workspace tem seu próprio `package.json` com scripts `dev`, `build`, `test`, `lint`

**STORY-0.1.2 — Configuração de TypeScript compartilhada**

> Como desenvolvedor, quero que todos os workspaces compartilhem uma configuração base de TypeScript para garantir consistência e evitar repetição.

_Critérios de aceite:_

- [ ] `packages/tsconfig/` contém `base.json`, `nextjs.json` e `nestjs.json`
- [ ] Todos os `tsconfig.json` dos workspaces estendem o base correspondente
- [ ] Strict mode habilitado em todos os workspaces
- [ ] Path aliases configurados (`@knowhub/shared-types`, `@knowhub/shared-utils`)
- [ ] Tipos do `packages/shared-types` são reconhecidos em todos os workspaces sem `npm link`

**STORY-0.1.3 — Linting e formatação**

> Como desenvolvedor, quero que o código seja automaticamente formatado e validado para manter consistência no projeto.

_Critérios de aceite:_

- [ ] ESLint configurado com regras para TypeScript, Node.js e React
- [ ] Prettier configurado e integrado ao ESLint (sem conflito de regras)
- [ ] `.editorconfig` define indentação e fim de linha (LF)
- [ ] `pnpm lint:fix` corrige problemas automaticamente quando possível
- [ ] VSCode settings sugeridos em `.vscode/settings.json` (não obrigatório)
- [ ] Husky + lint-staged faz lint apenas nos arquivos staged no commit

**STORY-0.1.4 — Pacotes compartilhados iniciais**

> Como desenvolvedor, quero que os tipos TypeScript e utilitários sejam compartilhados entre todos os apps sem duplicação.

_Critérios de aceite:_

- [ ] `packages/shared-types/src/knowledge.types.ts` exporta `KnowledgeEntry`, `ContentChunk`, `Tag`, `ConnectionEdge`, `MaintenanceJob`
- [ ] `packages/shared-types/src/agent.types.ts` exporta `IndexingResult`, `QueryResult`, `SearchResult`
- [ ] `packages/shared-types/src/api.types.ts` exporta DTOs de request/response com JSDoc
- [ ] `packages/shared-utils/src/text-splitter.ts` exporta `createTextSplitter()` configurado
- [ ] `packages/shared-utils/src/metadata-extractor.ts` exporta helpers de extração de metadados
- [ ] Mudanças em `shared-types` são detectadas e recompiladas automaticamente pelo Turborepo

**Tarefas Técnicas:**

- Inicializar Turborepo com `npx create-turbo@latest`
- Configurar workspaces no `package.json` raiz com pnpm workspaces
- Criar estrutura de diretórios completa: `apps/{api,web,cli}`, `packages/{shared-types,shared-utils,tsconfig}`
- Configurar `turbo.json` com pipelines de `build`, `dev`, `test`, `lint`
- Instalar e configurar ESLint flat config com `@typescript-eslint/eslint-plugin`
- Instalar e configurar Prettier com `prettier-plugin-organize-imports`
- Configurar Husky + lint-staged no package.json raiz
- Criar arquivos `package.json` iniciais de cada workspace com dependências corretas

**Dependências:** Nenhuma.

**Testes necessários:** Validação manual de que todos os scripts executam sem erros.

**Métricas de sucesso:**

- `pnpm install && pnpm build` executa sem erros em ambiente limpo
- Novo contribuidor clona e tem ambiente funcionando em < 5 minutos

**Estimativa:** L

---

## EPIC-0.2 — CI/CD e Automações

**Objetivo:** Ter pipelines automatizados de validação e release que garantam qualidade de código em toda contribuição externa.

**Contexto técnico:** GitHub Actions executará lint, testes e build em cada PR. Tags semver disparam builds de release. A qualidade do CI é crítica para atrair contribuidores de confiança.

### Histórias de Usuário

**STORY-0.2.1 — Pipeline de validação de PR**

> Como mantenedor do projeto, quero que cada Pull Request seja automaticamente validado para garantir que não quebra o build nem os testes.

_Critérios de aceite:_

- [ ] Workflow `.github/workflows/ci.yml` roda a cada push em PRs
- [ ] Pipeline executa: checkout → install → lint → build → test (nessa ordem)
- [ ] Falha em qualquer etapa bloqueia o PR merge
- [ ] Tempo total do pipeline < 5 minutos para não desestimular contribuições
- [ ] Relatório de cobertura de testes é publicado como comentário no PR
- [ ] Badge de CI no README reflete estado atual do branch main

**STORY-0.2.2 — Pipeline de release**

> Como mantenedor, quero que uma tag semver no formato `v1.2.3` dispare automaticamente a criação de um GitHub Release com changelog gerado.

_Critérios de aceite:_

- [ ] Workflow `.github/workflows/release.yml` dispara em tags `v*.*.*`
- [ ] Changelog é gerado automaticamente baseado nos commits convencionais desde a última tag
- [ ] GitHub Release é criado com o changelog como body
- [ ] Pacote npm (CLI) é publicado automaticamente no npm registry (quando aplicável)
- [ ] Assets de instalação (quando existirem) são anexados ao Release

**STORY-0.2.3 — Automações de issues e PRs**

> Como mantenedor, quero automações que gerenciem o ciclo de vida de issues e PRs para escalar o gerenciamento da comunidade.

_Critérios de aceite:_

- [ ] Issues sem atividade por 30 dias recebem label `stale` automaticamente
- [ ] PRs de Dependabot são automaticamente aprovados e mergeados se CI passa
- [ ] Label `good first issue` é aplicada automaticamente em issues marcadas como `help wanted` e com complexidade baixa
- [ ] Comentário de boas-vindas automático no primeiro PR de um novo contribuidor

**Tarefas Técnicas:**

- Criar `.github/workflows/ci.yml` com jobs: `lint`, `build`, `test`
- Criar `.github/workflows/release.yml` com `release-please` ou `semantic-release`
- Configurar Codecov ou similar para cobertura de testes
- Criar `.github/workflows/stale.yml` para gerenciamento de issues inativas
- Configurar `dependabot.yml` para atualizações automáticas de dependências
- Definir `CODEOWNERS` para review automático de PRs em áreas críticas
- Criar templates de PR com checklist (testes, docs, lint)

**Dependências:** EPIC-0.1 (estrutura do monorepo necessária para os scripts de CI).

**Testes necessários:** Testar workflows em branches de teste antes de ativar em main.

**Métricas de sucesso:**

- 100% dos PRs passam pelo CI antes do merge
- Tempo médio do pipeline < 5 minutos

**Estimativa:** M

---

## EPIC-0.3 — Ambiente de Desenvolvimento Local

**Objetivo:** Qualquer desenvolvedor consegue ter o ambiente completo rodando localmente em menos de 10 minutos com um único comando.

**Contexto técnico:** O ambiente local inclui NestJS API, Next.js frontend, SQLite, Redis/Valkey e Ollama. O Docker Compose orquestra os serviços que precisam de containers. O banco SQLite e o Ollama rodam nativamente.

### Histórias de Usuário

**STORY-0.3.1 — Docker Compose para serviços de infraestrutura**

> Como desenvolvedor, quero iniciar todos os serviços de infraestrutura (Redis, Ollama) com um único comando para não depender de instalações manuais.

_Critérios de aceite:_

- [ ] `docker-compose up -d` sobe Redis/Valkey e Ollama sem erros
- [ ] Volumes persistentes garantem que dados e modelos sobrevivem ao `down`
- [ ] Health checks configurados para Redis e Ollama
- [ ] `docker-compose down -v` limpa completamente o ambiente
- [ ] Porta 6379 (Redis) e 11434 (Ollama) expostas corretamente

**STORY-0.3.2 — Schema do banco de dados e migrations**

> Como desenvolvedor, quero que o schema do banco seja criado automaticamente no primeiro boot, sem precisar executar comandos manuais.

_Critérios de aceite:_

- [ ] `drizzle-kit generate` gera migrations SQL a partir do schema TypeScript
- [ ] `drizzle-kit migrate` aplica migrations no SQLite local automaticamente no start da API
- [ ] Schema inclui todas as tabelas: `users`, `user_settings`, `knowledge_entries`, `content_chunks`, `tags`, `connection_edges`, `maintenance_jobs`
- [ ] Tabelas têm índices conforme especificado no schema
- [ ] Migration de rollback documentada
- [ ] Seed script cria dados de exemplo para desenvolvimento: `pnpm db:seed`

**STORY-0.3.3 — Variáveis de ambiente**

> Como desenvolvedor, quero exemplos claros de todas as variáveis de ambiente necessárias para não precisar descobrir por tentativa e erro.

_Critérios de aceite:_

- [ ] `.env.example` existe em `apps/api` e `apps/web` com todas as variáveis documentadas
- [ ] Variáveis obrigatórias vs opcionais claramente distinguidas nos comentários
- [ ] Script `pnpm env:setup` copia `.env.example` para `.env` e gera segredos aleatórios automaticamente
- [ ] A API falha com mensagem clara se variável obrigatória estiver ausente na inicialização
- [ ] `.env` está no `.gitignore` de todos os workspaces

**Tarefas Técnicas:**

- Criar `docker-compose.yml` com serviços `redis`, `ollama`
- Definir schema completo em `apps/api/drizzle/schema.ts` com DrizzleORM
- Configurar `drizzle.config.ts` apontando para banco local
- Criar seed script com dados de exemplo
- Criar scripts `env:setup` no `package.json` raiz
- Documentar setup completo no README com screenshots
- Criar `Makefile` com targets comuns: `make dev`, `make db:reset`, `make ollama:pull`

**Dependências:** EPIC-0.1.

**Testes necessários:** Testado manualmente em Windows, macOS e Linux.

**Métricas de sucesso:**

- Comando `make dev` leva menos de 10 minutos do zero ao ambiente funcionando
- Testado com sucesso em pelo menos 3 SOs diferentes

**Estimativa:** M

---

## EPIC-0.4 — Governança e Documentação Open Source

**Objetivo:** Ter todos os documentos de governança que tornam o projeto atraente e acessível para contribuidores externos.

**Contexto técnico:** Projetos open source de sucesso têm documentação clara antes das primeiras contribuições externas. O README é o "cartão de visita" e o CONTRIBUTING.md é o "manual de integração" da comunidade.

### Histórias de Usuário

**STORY-0.4.1 — README completo**

> Como pessoa interessada no projeto, quero entender em 2 minutos o que é o KnowHub, como instalar, como usar e como contribuir.

_Critérios de aceite:_

- [ ] README tem seções: Visão do produto, Demo (GIF ou screenshot), Instalação rápida, Uso básico, Stack, Roadmap resumido, Como contribuir, Licença
- [ ] Badge de CI, versão npm, licença e estrelas do GitHub no topo
- [ ] Seção de instalação funciona copiando e colando os comandos
- [ ] Link para documentação completa (quando existir)
- [ ] README em português (principal) com link para versão em inglês

**STORY-0.4.2 — Guia de contribuição**

> Como desenvolvedor que quer contribuir, quero entender exatamente como fazer isso: branches, commits, PRs, code review e deploy.

_Critérios de aceite:_

- [ ] `CONTRIBUTING.md` descreve: setup local, convenção de commits, fluxo de PR, labels de issues, processo de review
- [ ] Convenção de commits adotada (Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`)
- [ ] Seção "Good First Issues" explica onde começar para novos contribuidores
- [ ] Código de conduta em `CODE_OF_CONDUCT.md` (Contributor Covenant)
- [ ] `SECURITY.md` descreve como reportar vulnerabilidades (não via issue pública)

**STORY-0.4.3 — Templates de issues e PRs**

> Como usuário ou contribuidor, quero ter templates que me guiem ao abrir issues ou PRs para facilitar o entendimento dos mantenedores.

_Critérios de aceite:_

- [ ] Template de bug report: passos para reproduzir, comportamento esperado/atual, ambiente, logs
- [ ] Template de feature request: problema que resolve, solução proposta, alternativas consideradas
- [ ] Template de PR: descrição, tipo (feat/fix/docs), checklist (testes, docs, lint), issue relacionada
- [ ] Template de "good first issue" pré-preenchido com contexto suficiente para novatos
- [ ] Pelo menos 10 issues iniciais criadas cobrindo a Fase 1, rotuladas adequadamente

**STORY-0.4.4 — Licença e atribuições**

> Como usuário ou empresa interessada, quero entender claramente os termos de uso do projeto.

_Critérios de aceite:_

- [ ] `LICENSE` contém MIT License com nome e ano corretos
- [ ] Cabeçalho de licença nos arquivos principais do código (ou referência no README)
- [ ] `NOTICE` ou seção no README lista dependências de terceiros e suas licenças
- [ ] Política clara sobre CLA (Contributor License Agreement) — para este projeto: não obrigatória

**Tarefas Técnicas:**

- Redigir README.md completo com todas as seções
- Redigir CONTRIBUTING.md detalhado
- Redigir CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
- Redigir SECURITY.md com processo de disclosure
- Criar `.github/ISSUE_TEMPLATE/` com 3 templates
- Criar `.github/PULL_REQUEST_TEMPLATE.md`
- Criar 10+ issues iniciais cobrindo Fase 1 com labels `good first issue`
- Adicionar `LICENSE` (MIT)

**Dependências:** Nenhuma (pode ser feito em paralelo com EPIC-0.1).

**Testes necessários:** Revisão por peer de toda a documentação.

**Métricas de sucesso:**

- Novo contribuidor abre seu primeiro PR sem precisar perguntar como fazer
- Issues `good first issue` têm pelo menos uma tentativa de contribuição externa na primeira semana

**Estimativa:** M

---

# FASE 1 — MVP Essencial

> **Objetivo da fase:** Ter um produto mínimo que resolve o problema central — capturar qualquer informação e consultá-la em linguagem natural — rodando 100% local, sem dependência de nuvem.

---

## EPIC-1.1 — Autenticação e Setup Inicial

**Objetivo:** O usuário executa um comando de setup e tem o KnowHub funcionando em < 5 minutos, com autenticação local segura configurada automaticamente.

**Contexto técnico:** A autenticação é local-only no MVP: um `clientSecret` gerado no setup emite JWTs para comunicação frontend ↔ backend. Não há login/senha no sentido tradicional — um único usuário local. Preparação para multi-user na v2.

### Histórias de Usuário

**STORY-1.1.1 — Setup automático via CLI**

> Como novo usuário, quero executar `npx knowhub-ai setup` e ter o sistema configurado automaticamente para começar a usar sem conhecimento técnico.

_Critérios de aceite:_

- [ ] `npx knowhub-ai setup` cria `~/.knowhub/config.json` com `clientId`, `clientSecret` e `jwtSecret` gerados com 64 bytes aleatórios
- [ ] Cria diretório `~/.knowhub/data/` para o banco SQLite
- [ ] Executa migrations do banco automaticamente
- [ ] Detecta se Ollama está instalado; se não, imprime instruções de instalação claras
- [ ] Cria usuário padrão no banco com nome fornecido pelo usuário no setup
- [ ] Ao final, imprime URL de acesso e instrui o usuário a abrir o browser

**STORY-1.1.2 — Autenticação JWT local**

> Como sistema, preciso garantir que apenas o cliente local autorizado acesse a API para prevenir acesso não autorizado de outros processos na máquina.

_Critérios de aceite:_

- [ ] Endpoint `POST /api/v1/auth/token` aceita `clientId` + `clientSecret` e retorna JWT com validade de 24h
- [ ] Endpoint `POST /api/v1/auth/refresh` renova o JWT sem precisar do `clientSecret`
- [ ] Todos os endpoints protegidos retornam 401 sem Bearer token válido
- [ ] `JwtAuthGuard` globalmente aplicado com exceção para rotas públicas (`/auth/token`, `/health`)
- [ ] `clientSecret` lido de `~/.knowhub/config.json`, nunca de variável de ambiente em produção local
- [ ] JWT contém `userId`, `clientId` e `iat`/`exp` — sem dados pessoais além do necessário

**STORY-1.1.3 — Endpoint de healthcheck**

> Como sistema de monitoramento (PM2), quero verificar se a API está saudável sem precisar de autenticação.

_Critérios de aceite:_

- [ ] `GET /api/v1/health` retorna `{ status: "ok", version, uptime, database: "connected" | "error", ollama: "available" | "unavailable" }` com status 200
- [ ] Retorna 503 se o banco de dados não está acessível
- [ ] Endpoint não requer autenticação
- [ ] PM2 usa esse endpoint como health check no `ecosystem.config.js`

**STORY-1.1.4 — Configurações do usuário**

> Como usuário, quero poder configurar preferências básicas como nome, idioma preferido e provider de IA para personalizar minha experiência.

_Critérios de aceite:_

- [ ] `GET /api/v1/settings` retorna as configurações atuais do usuário
- [ ] `PATCH /api/v1/settings` atualiza `displayName`, `preferredLanguage`, `privacyMode`, `aiProvider`, `aiModel`
- [ ] `POST /api/v1/settings/test-ai` testa conexão com o modelo configurado e retorna `{ ok: boolean, modelName, latencyMs }`
- [ ] `GET /api/v1/settings/ai-models` lista modelos Ollama disponíveis consultando `GET http://localhost:11434/api/tags` dinamicamente
- [ ] Configurações persistem no banco e sobrevivem ao restart da API

**Tarefas Técnicas:**

- Criar módulo `AuthModule` em NestJS com `JwtModule`, `PassportModule`
- Implementar `LocalAuthGuard`, `JwtAuthGuard` e `JwtStrategy`
- Implementar serviço de leitura do `~/.knowhub/config.json`
- Criar módulo `ConfigModule` com `SettingsService` e `AIProviderFactory`
- Implementar detecção dinâmica de modelos Ollama via HTTP
- Criar comando `setup` no CLI (Commander.js)
- Criar script de setup com geração de segredos via `crypto.randomBytes`
- Implementar `HealthModule` com indicadores de banco e Ollama

**Dependências:** EPIC-0.1, EPIC-0.3 (banco de dados disponível).

**Testes necessários:**

- Unit: `JwtStrategy`, `SettingsService`, `AIProviderFactory` (mock Ollama)
- Integration: ciclo completo de auth token → request autenticada → token expirado → refresh

**Métricas de sucesso:**

- Setup executado em < 2 minutos em novo ambiente
- Zero falsos negativos no healthcheck em 24h de operação

**Estimativa:** L

---

## EPIC-1.2 — Gerenciamento de Entradas de Conhecimento (CRUD)

**Objetivo:** O usuário pode criar, listar, visualizar, editar e remover entradas de conhecimento via API REST, com validação robusta e paginação.

**Contexto técnico:** `KnowledgeEntry` é a entidade central do sistema. O CRUD aqui definido é consumido pelo frontend, CLI e bots. Soft delete (status ARCHIVED) preserva histórico e facilita recuperação acidental.

### Histórias de Usuário

**STORY-1.2.1 — Criar entrada de conhecimento**

> Como usuário, quero criar uma nova entrada de conhecimento via API para salvar uma nota, URL ou qualquer conteúdo.

_Critérios de aceite:_

- [ ] `POST /api/v1/knowledge` aceita `{ type: "NOTE"|"LINK"|"PDF"|"GITHUB", content?, sourceUrl?, title? }`
- [ ] Retorna 201 com a entrada criada, incluindo `id`, `status: "PENDING"` e `createdAt`
- [ ] Validação: `type` é obrigatório; `sourceUrl` é obrigatório para type LINK/GITHUB; `content` é obrigatório para type NOTE
- [ ] Uma entrada criada emite evento interno `entry.created` que dispara a indexação assíncrona
- [ ] Título é gerado automaticamente se não fornecido: primeiros 80 chars do conteúdo ou domínio da URL

**STORY-1.2.2 — Listar entradas com filtros e paginação**

> Como usuário, quero listar minhas entradas com filtros e paginação para navegar pelo meu acervo.

_Critérios de aceite:_

- [ ] `GET /api/v1/knowledge` retorna `{ data: KnowledgeEntry[], meta: { total, page, limit, totalPages } }`
- [ ] Query params suportados: `page` (default: 1), `limit` (default: 20, max: 100), `type`, `tag`, `status`, `q` (busca textual no título)
- [ ] Ordenação padrão: `createdAt` decrescente
- [ ] Filtro por `tag` retorna entradas que têm a tag especificada (por slug)
- [ ] Filtro por `status` aceita: `PENDING`, `INDEXED`, `FAILED`, `ARCHIVED`
- [ ] Filtro `q` busca no `title` e `content` (LIKE, não semântico — semântico é o QueryAgent)

**STORY-1.2.3 — Visualizar entrada com detalhes**

> Como usuário, quero ver os detalhes completos de uma entrada, incluindo resumo gerado, tags e conexões.

_Critérios de aceite:_

- [ ] `GET /api/v1/knowledge/:id` retorna a entrada com `{ ...entry, tags: Tag[], connections: ConnectionEdge[], chunksCount: number }`
- [ ] Retorna 404 com mensagem clara se entrada não existe ou pertence a outro usuário
- [ ] Atualiza `accessedAt` na entrada quando visualizada
- [ ] Inclui `summary` gerado pelo indexador se disponível

**STORY-1.2.4 — Editar entrada**

> Como usuário, quero editar o título, conteúdo ou tags de uma entrada para manter meu acervo atualizado.

_Critérios de aceite:_

- [ ] `PATCH /api/v1/knowledge/:id` aceita `{ title?, content?, tags? }`
- [ ] Atualizar `content` dispara re-indexação automática (status volta para PENDING)
- [ ] Atualizar apenas `title` ou `tags` não dispara re-indexação
- [ ] Tags são gerenciadas por nome: novas são criadas automaticamente, removidas são apenas desassociadas (não deletadas)
- [ ] Retorna 200 com a entrada atualizada

**STORY-1.2.5 — Remover entrada (soft delete)**

> Como usuário, quero remover entradas que não preciso mais sem perder permanentemente o histórico.

_Critérios de aceite:_

- [ ] `DELETE /api/v1/knowledge/:id` muda status para `ARCHIVED` e define `archivedAt`
- [ ] Entrada arquivada não aparece em listagens padrão (apenas com filtro `status=ARCHIVED`)
- [ ] Entradas arquivadas não são consideradas no RAG pelo QueryAgent
- [ ] Retorna 204 em sucesso
- [ ] Futura restauração é possível via `PATCH` com `{ status: "INDEXED" }` (admin-only no MVP)

**STORY-1.2.6 — Re-indexar entrada**

> Como usuário, quero forçar a re-indexação de uma entrada quando sei que seu conteúdo externo foi atualizado.

_Critérios de aceite:_

- [ ] `POST /api/v1/knowledge/:id/reindex` enfileira re-indexação e retorna 202 `{ jobId }`
- [ ] Status da entrada muda para `PENDING` imediatamente
- [ ] Re-indexação recria chunks e embeddings, substituindo os anteriores
- [ ] Se a entrada é do tipo LINK, refaz o fetch do conteúdo da URL

**Tarefas Técnicas:**

- Criar `KnowledgeModule` com `KnowledgeController`, `KnowledgeService`, `KnowledgeRepository`
- Implementar DTOs: `CreateKnowledgeEntryDto`, `UpdateKnowledgeEntryDto`, `KnowledgeQueryDto` com class-validator
- Implementar paginação genérica com helper `paginateQuery()`
- Criar `TagsService` para gerenciamento de tags com upsert por nome
- Implementar EventEmitter2 para evento `entry.created` → IndexingAgent
- Implementar row-level security: todo query filtra por `userId` do JWT
- Escrever migrations DrizzleORM para as tabelas necessárias

**Dependências:** EPIC-1.1.

**Testes necessários:**

- Unit: `KnowledgeService` (mock repository), `TagsService`
- Integration: CRUD completo com banco SQLite em memória
- E2E: fluxo de criação → listagem → edição → remoção

**Métricas de sucesso:**

- 85% de cobertura no módulo de knowledge
- Nenhum bug de vazamento de dados entre usuários (row-level security)

**Estimativa:** L

---

## EPIC-1.3 — Pipeline de Ingestão de Conteúdo

**Objetivo:** O usuário pode enviar qualquer tipo de conteúdo (texto, URL, PDF) e o sistema extrai, limpa e prepara o texto para indexação.

**Contexto técnico:** A ingestão é o primeiro estágio do pipeline. Ela transforma conteúdo bruto em texto limpo e estruturado. O resultado é passado para o IndexingAgent. A qualidade da ingestão determina diretamente a qualidade do RAG.

### Histórias de Usuário

**STORY-1.3.1 — Ingestão de texto/nota**

> Como usuário, quero salvar uma nota de texto livre diretamente para ter minhas ideias capturadas instantaneamente.

_Critérios de aceite:_

- [ ] `POST /api/v1/ingest/text` aceita `{ content: string, title?: string }` e cria uma `KnowledgeEntry` do tipo NOTE
- [ ] Conteúdo máximo: 100.000 caracteres
- [ ] Retorna 201 com `{ entryId, status: "PENDING" }` imediatamente (indexação é assíncrona)
- [ ] Texto é sanitizado (remove caracteres de controle, normaliza espaços)
- [ ] Se `title` não fornecido, usa os primeiros 80 chars do conteúdo como título

**STORY-1.3.2 — Ingestão de URL**

> Como usuário, quero salvar um link e ter o conteúdo da página extraído automaticamente, sem precisar copiar e colar o texto.

_Critérios de aceite:_

- [ ] `POST /api/v1/ingest/url` aceita `{ url: string, title?: string }` e cria uma `KnowledgeEntry` do tipo LINK
- [ ] URL é validada com `class-validator` antes do fetch
- [ ] Sistema faz fetch da URL com timeout de 15 segundos
- [ ] Extração usa Playwright (headless) como primário; fallback para fetch + cheerio se Playwright falhar
- [ ] Readability remove navegação, ads e boilerplate — preserva conteúdo editorial
- [ ] Se URL retorna 4xx/5xx ou timeout, entrada fica com status FAILED com mensagem clara
- [ ] Metadados extraídos: `og:title`, `og:description`, `og:image` armazenados em `metadata` JSON

**STORY-1.3.3 — Ingestão de arquivo PDF**

> Como usuário, quero fazer upload de um PDF e ter seu conteúdo extraído e indexado para consultá-lo via linguagem natural.

_Critérios de aceite:_

- [ ] `POST /api/v1/ingest/file` aceita multipart form com arquivo PDF (máx 50 MB)
- [ ] Arquivo é validado: MIME type `application/pdf`, extensão `.pdf`
- [ ] Texto extraído por página com `pdf-parse` ou `pdfjs-dist`
- [ ] PDFs protegidos por senha retornam erro 422 com mensagem orientativa
- [ ] PDFs escaneados (sem texto selecionável) recebem aviso de qualidade reduzida (OCR é feature futura)
- [ ] Arquivo original é descartado após extração (não armazenado, somente o texto)
- [ ] Título extraído dos metadados do PDF se disponível; fallback para nome do arquivo

**STORY-1.3.4 — Ingestão de arquivo Markdown e texto plano**

> Como usuário técnico, quero importar arquivos `.md` e `.txt` e ter o conteúdo indexado preservando a estrutura semântica.

_Critérios de aceite:_

- [ ] `POST /api/v1/ingest/file` aceita também `.txt` e `.md` (MIME `text/plain`, `text/markdown`)
- [ ] Arquivos Markdown têm syntax removida por `remark + strip-markdown`, preservando hierarquia de cabeçalhos como separadores de chunks
- [ ] Encoding detectado automaticamente (UTF-8 aceito; outros encodings convertidos ou rejeitados com erro claro)
- [ ] Limite de 10 MB para arquivos de texto

**Tarefas Técnicas:**

- Criar `IngestionModule` com `IngestionController`, `IngestionService`
- Criar loaders: `TextLoader`, `UrlLoader`, `PdfLoader`, `MarkdownLoader`
- Integrar Playwright headless para fetch de URLs com detecção de JavaScript
- Implementar wrapper de fallback fetch + cheerio com Readability
- Configurar `multer` para upload com validação de MIME type e tamanho
- Implementar extração de metadados Open Graph
- Criar interface `IContentLoader` (em shared-types) seguida por todos os loaders
- Implementar retry com exponential backoff para fetches de URL

**Dependências:** EPIC-1.2 (cria entradas após ingestão).

**Testes necessários:**

- Unit: cada loader com mocks de HTTP/filesystem
- Integration: upload de PDF real, fetch de URL estática mockada
- Resiliência: timeout de URL, PDF inválido, arquivo grande demais

**Métricas de sucesso:**

- 75% de cobertura no módulo de ingestão
- Taxa de sucesso de extração > 90% em URLs de conteúdo editorial (blogs, docs)

**Estimativa:** L

---

## EPIC-1.4 — Agent de Indexação (RAG — Indexing)

**Objetivo:** Após uma entrada ser criada, o sistema a processa automaticamente — divide em chunks, gera embeddings vetoriais, cria resumo e sugere tags — tornando-a consultável pelo QueryAgent.

**Contexto técnico:** O `IndexingAgent` é implementado como um LangGraph State Graph (padrão canônico da v1.x que substitui o `AgentExecutor`). Cada node do grafo é uma etapa do pipeline: load → split → embed → store → summarize → tag. O estado flui através dos nodes com possibilidade de retry por step.

### Histórias de Usuário

**STORY-1.4.1 — Chunking e embedding de entradas**

> Como sistema, quero dividir entradas longas em chunks sobrepostos e gerar vetores de embedding para cada chunk para habilitar busca semântica.

_Critérios de aceite:_

- [ ] `RecursiveCharacterTextSplitter` com `chunkSize: 1000` e `chunkOverlap: 200`
- [ ] Separadores na ordem: `\n\n`, `\n`, `. `, ` `, ``
- [ ] Cada chunk é armazenado na tabela `content_chunks` com `entryId`, `chunkIndex`, `content` e `embedding`
- [ ] Embedding gerado por `OllamaEmbeddings` (modelo `nomic-embed-text`) ou `AzureOpenAIEmbeddings` (modo cloud)
- [ ] Vetores armazenados como JSON serializado no SQLite (compatível com sqlite-vss)
- [ ] Chunks anteriores são deletados antes de re-indexação para não duplicar

**STORY-1.4.2 — Sumarização automática**

> Como usuário, quero que cada entrada tenha um resumo gerado automaticamente para entender rapidamente o conteúdo sem precisar ler tudo.

_Critérios de aceite:_

- [ ] Após chunking, um LLM gera um resumo com máximo de 200 palavras usando estratégia `map_reduce` do LangChain.js
- [ ] Resumo é armazenado no campo `summary` da `KnowledgeEntry`
- [ ] Prompt de sumarização usa o idioma detectado do conteúdo
- [ ] Entradas muito curtas (< 200 palavras) recebem o próprio conteúdo como resumo sem chamar o LLM
- [ ] Se sumarização falhar, indexação continua — o resumo fica em branco, não bloqueia o pipeline

**STORY-1.4.3 — Sugestão automática de tags**

> Como usuário, quero que o sistema sugira tags relevantes automaticamente para organizar meu acervo sem esforço manual.

_Critérios de aceite:_

- [ ] LLM sugere entre 3 e 7 tags baseadas no conteúdo usando prompt definido na spec
- [ ] Tags no formato `snake_case` em minúsculas
- [ ] Tags sugeridas são criadas/associadas automaticamente à entrada
- [ ] Usuário pode remover ou adicionar tags manualmente depois (EPIC-1.2)
- [ ] Resposta do LLM é validada como JSON array de strings; formato inválido é ignorado silenciosamente

**STORY-1.4.4 — Controle de estado e retry**

> Como sistema, quero monitorar o estado do pipeline de indexação e retentar falhas parciais para garantir que toda entrada seja processada.

_Critérios de aceite:_

- [ ] Status da entrada percorre: `PENDING` → `INDEXING` → `INDEXED` (sucesso) | `FAILED` (falha definitiva)
- [ ] Falhas transitórias (Ollama indisponível, timeout) geram retry com backoff exponencial (3 tentativas com 1s, 5s, 30s de espera)
- [ ] Após 3 falhas consecutivas, status é `FAILED` com campo `lastError` preenchido
- [ ] `MaintenanceAgent` (EPIC-2.3) pode retentar entradas FAILED manualmente via job `reindex-failed`
- [ ] Estado do LangGraph é persistido (checkpointing) para permitir retomar do step com falha

**STORY-1.4.5 — Processamento assíncrono via fila**

> Como usuário, quero que a indexação aconteça em background sem bloquear minha interface para continuar adicionando conteúdo enquanto o sistema processa.

_Critérios de aceite:_

- [ ] Indexação enfileirada no BullMQ imediatamente após criação da entrada
- [ ] Fila `indexing-queue` processa com concorrência de 2 jobs simultâneos (não sobrecarregar Ollama)
- [ ] Jobs têm timeout de 5 minutos (entradas muito longas ou LLM lento)
- [ ] Progresso é emitido via WebSocket `entry.indexing` a cada step concluído (0%, 25%, 50%, 75%, 100%)
- [ ] Dashboard do BullMQ acessível em `/api/v1/admin/queues` (protegido, apenas local)

**Tarefas Técnicas:**

- Criar `IndexingModule` com `IndexingService`, `IndexingAgent` (LangGraph State Graph)
- Implementar nodes do grafo: `LoaderNode`, `SplitterNode`, `EmbeddingNode`, `StorageNode`, `SummaryNode`, `TagNode`
- Integrar `@langchain/langgraph ^1.1.x` com Estado tipado: `IndexingState`
- Implementar `EmbeddingService` com abstração para Ollama e Azure
- Configurar BullMQ com `@nestjs/bull` e definir worker
- Implementar checkpointing do LangGraph em SQLite
- Criar `MockEmbeddingModel` para testes unitários (determinístico via hash)
- Integrar sqlite-vss para storage de vetores

**Dependências:** EPIC-1.1, EPIC-1.2, EPIC-1.3, EPIC-1.8 (WebSocket para progresso).

**Testes necessários:**

- Unit: cada node do LangGraph com mock de LLM e embeddings
- Unit: lógica de retry e tratamento de errors
- Integration: pipeline completo com SQLite real e MockEmbeddingModel
- Snapshot: prompt templates de sumarização e tags

**Métricas de sucesso:**

- 80% de cobertura no IndexingAgent
- Taxa de sucesso de indexação > 95% em condições normais
- Latência P95 do pipeline completo < 30s para entradas de até 10.000 chars

**Estimativa:** XL

---

## EPIC-1.5 — Agent de Query (RAG — Consulta)

**Objetivo:** O usuário pode fazer perguntas em linguagem natural sobre seu acervo e receber respostas precisas e citadas, com streaming de tokens em tempo real.

**Contexto técnico:** O `QueryAgent` implementa o padrão RAG usando `createRetrievalChain` (substituto do deprecado `RetrievalQAChain`). A resposta é gerada via LangGraph com suporte a streaming via Server-Sent Events (SSE) e WebSocket.

### Histórias de Usuário

**STORY-1.5.1 — Pergunta com resposta RAG**

> Como usuário, quero fazer uma pergunta e receber uma resposta baseada no meu acervo, com indicação das fontes consultadas.

_Critérios de aceite:_

- [ ] `POST /api/v1/query/ask` aceita `{ question: string }` e retorna `{ answer, sources: Source[], tokensUsed, latencyMs }`
- [ ] `Source` contém: `entryId`, `title`, `sourceUrl?`, `relevanceScore`
- [ ] Resposta é baseada exclusivamente nos chunks do acervo do usuário (sem conhecimento externo do LLM)
- [ ] Se nenhum chunk relevante for encontrado (score < 0.5), responde: "Não encontrei informações sobre isso no seu acervo."
- [ ] Língua da resposta segue `preferredLanguage` do usuário nas configurações

**STORY-1.5.2 — Streaming de resposta em tempo real**

> Como usuário, quero ver a resposta sendo gerada token por token para uma experiência mais fluida e sem espera.

_Critérios de aceite:_

- [ ] Endpoint SSE `GET /api/v1/query/ask/stream?q={question}` retorna evento `data: { token }` por chunk gerado
- [ ] Evento final `data: { done: true, sources, tokensUsed }` sinaliza conclusão
- [ ] Suporte a cancelamento: cliente pode fechar conexão SSE e geração para
- [ ] Frontend usa `@tanstack/ai-react` com adapter para o endpoint SSE
- [ ] WebSocket alternativo: evento `query.ask` com `stream: true` emite `query.streaming` tokens

**STORY-1.5.3 — Busca semântica pura**

> Como usuário, quero buscar no meu acervo por similaridade semântica sem precisar de uma resposta gerada por IA para ter resultados mais rápidos.

_Critérios de aceite:_

- [ ] `POST /api/v1/query/search` aceita `{ q: string, limit?: number }` e retorna `SearchResult[]`
- [ ] `SearchResult` contém: `entryId`, `title`, `snippet` (chunk mais relevante), `score`, `type`
- [ ] Busca usa cosine similarity no sqlite-vss com os chunks indexados
- [ ] `limit` padrão é 10, máximo é 50
- [ ] Resultados filtrados ao `userId` do token JWT (isolamento total de dados)
- [ ] Latência P95 < 300ms para acervos de até 10.000 chunks

**STORY-1.5.4 — Resumo de entradas específicas**

> Como usuário, quero gerar um resumo consolidado de um conjunto de entradas relacionadas para criar um briefing rápido sobre um tema.

_Critérios de aceite:_

- [ ] `POST /api/v1/query/summarize` aceita `{ entryIds: string[] }` (máximo 10 entradas)
- [ ] Gera um documento consolidado usando `map_reduce` — resume cada entrada e depois combina
- [ ] Retorna `{ summary: string, tokenUsed, sourceEntries: string[] }`
- [ ] Retorna 422 se algum `entryId` não existir ou não pertencer ao usuário

**Tarefas Técnicas:**

- Criar `QueryModule` com `QueryController`, `QueryService`, `QueryAgent` (LangGraph)
- Implementar nodes: `EmbeddingQueryNode`, `VectorSearchNode`, `ContextAssemblerNode`, `LLMChainNode`, `SourceAttributionNode`
- Integrar `createRetrievalChain` do LangChain.js v1.x
- Implementar `VectorStoreService` com busca cosine no sqlite-vss
- Implementar Context Assembler: ordena por score, respeita token limit do modelo
- Implementar resposta SSE no NestJS (`@Sse()` decorator + `Observable`)
- Implementar adapter `@tanstack/ai-react` no frontend (apps/web)
- Implementar montagem do `SOUL.md` + skill `knowledge-rag/SKILL.md` via `SkillsLoaderService`

**Dependências:** EPIC-1.4 (chunks e embeddings no banco), EPIC-1.1 (auth e configurações de modelo).

**Testes necessários:**

- Unit: `VectorSearchNode`, `ContextAssemblerNode` com dados mock
- Unit: `SkillsLoaderService` — montagem correta de prompts
- Integration: pipeline RAG completo com MockEmbeddingModel
- Snapshot: prompts RAG e de sumarização
- Benchmark: latência P50/P95 de embedding + busca vetorial + first token

**Métricas de sucesso:**

- 80% de cobertura no QueryAgent
- Latência first token (streaming) < 800ms em hardware com Gemma-3 4B
- Usuário avalia qualidade da resposta ≥ 4/5 em 75% dos casos (feedback manual inicial)

**Estimativa:** XL

---

## EPIC-1.6 — Interface Web Core (Frontend MVP)

**Objetivo:** O usuário tem uma interface web funcional para gerenciar seu acervo, adicionar conteúdo e conversar com o assistente.

**Contexto técnico:** Next.js 15 com App Router e `output: 'standalone'` para deploy gerenciado pelo PM2. O design usa shadcn/ui com Tailwind CSS. O estado global do chat é gerenciado por `@tanstack/ai-react`.

### Histórias de Usuário

**STORY-1.6.1 — Layout e navegação base**

> Como usuário, quero uma interface limpa e intuitiva com navegação clara entre as seções principais do app.

_Critérios de aceite:_

- [ ] Layout responsivo com sidebar de navegação em desktop e bottom nav em mobile
- [ ] Rotas: `/` (dashboard), `/knowledge` (lista), `/chat` (assistente), `/settings` (configurações)
- [ ] Loading states em todas as navegações
- [ ] Indicador de status do sistema (backend online, modelo de IA disponível) visível na UI
- [ ] Dark mode e light mode com persistência da preferência

**STORY-1.6.2 — Dashboard com visão geral**

> Como usuário, quero ver um resumo do meu acervo ao abrir o app para ter contexto imediato do estado do meu segundo cérebro.

_Critérios de aceite:_

- [ ] Dashboard exibe: total de entradas, entradas adicionadas hoje/semana, breakdown por tipo (NOTE, LINK, PDF)
- [ ] Lista das 5 entradas adicionadas mais recentemente com título e status de indexação
- [ ] Indicador de entradas com status FAILED (com link para cada uma)
- [ ] Ação rápida de adicionar entrada diretamente do dashboard

**STORY-1.6.3 — Lista e captura de entradas**

> Como usuário, quero listar todas minhas entradas e adicionar novas de forma rápida diretamente na interface.

_Critérios de aceite:_

- [ ] Página `/knowledge` lista entradas com paginação (20 por página)
- [ ] Filtros por tipo e status visíveis e funcionais
- [ ] Busca por título em tempo real (debounce 300ms)
- [ ] Cards de entrada mostram: título, tipo (ícone), status, data, tags
- [ ] Formulário de captura rápida (overlay/modal): abas para Nota, URL e Upload de arquivo
- [ ] Feedback visual imediato após salvar: toast "Salvo! Indexando..." → "Indexado!"
- [ ] Progress bar de indexação atualizada via WebSocket

**STORY-1.6.4 — Detalhe de entrada**

> Como usuário, quero ver os detalhes completos de uma entrada, incluindo o resumo gerado e as tags, para entender rapidamente o que guardei.

_Critérios de aceite:_

- [ ] Página `/knowledge/:id` exibe: título, conteúdo completo (ou URL com preview), resumo gerado, tags, data de criação e último acesso
- [ ] Tags são editáveis inline com adição por Enter e remoção por X
- [ ] Botão de re-indexação com confirmação
- [ ] Links para conexões identificadas (lista de entradas relacionadas)

**STORY-1.6.5 — Interface de chat com o assistente**

> Como usuário, quero conversar com o assistente sobre meu acervo em uma interface de chat fluida com streaming de resposta.

_Critérios de aceite:_

- [ ] Página `/chat` tem interface de chat com histórico da sessão atual
- [ ] Campo de texto com suporte a Enter para enviar e Shift+Enter para nova linha
- [ ] Resposta do assistente aparece em streaming (token por token) sem piscar
- [ ] Fontes citadas são exibidas abaixo da resposta como chips clicáveis que abrem a entrada
- [ ] Mensagem de "Nenhum conteúdo encontrado" quando o acervo está vazio ou sem conteúdo relevante
- [ ] Botão para iniciar nova conversa (limpa histórico do estado local)
- [ ] Indicador de carregamento enquanto embedding é gerado

**STORY-1.6.6 — Página de configurações**

> Como usuário, quero configurar as preferências do app, incluindo o modelo de IA e o idioma, de forma simples.

_Critérios de aceite:_

- [ ] Página `/settings` exibe configurações atuais: nome, idioma, provider de IA, modelo selecionado
- [ ] Seletor de modelo exibe os modelos Ollama disponíveis localmente (busca dinâmica)
- [ ] Botão "Testar conexão" testa o modelo selecionado e exibe latência
- [ ] Alterações salvas com feedback visual de confirmação
- [ ] Seção de informações do sistema: versão, uptime, uso do banco de dados

**Tarefas Técnicas:**

- Inicializar Next.js 15 com App Router, TypeScript, Tailwind CSS
- Configurar shadcn/ui com tema personalizado
- Implementar layout com navegação responsiva
- Criar cliente HTTP centralizado (fetch wrapper com auth header automático)
- Implementar hook `useKnowledgeEntries` com SWR para listagem
- Implementar hook `useWebSocket` para eventos em tempo real
- Integrar `@tanstack/ai-react` com adapter para endpoint SSE da API
- Criar componentes: `KnowledgeCard`, `ChatMessage`, `IngestModal`, `TagInput`, `ModelSelector`
- Configurar `next.config.js` com `output: 'standalone'` para PM2

**Dependências:** EPIC-1.1, EPIC-1.2, EPIC-1.5, EPIC-1.8.

**Testes necessários:**

- Unit (Jest + React Testing Library): `ChatMessage`, `KnowledgeCard`, `TagInput`
- E2E (Playwright): fluxo de adicionar nota → ver na lista → perguntar no chat

**Métricas de sucesso:**

- Core Web Vitals: LCP < 2.5s, CLS < 0.1 na página de lista
- Usuário consegue adicionar conteúdo e fazer primeira pergunta sem instruções

**Estimativa:** XL

---

## EPIC-1.7 — CLI — Comandos Essenciais

**Objetivo:** Usuários técnicos podem interagir com o KnowHub sem abrir o browser, adicionando entradas e fazendo perguntas diretamente do terminal.

**Contexto técnico:** CLI implementado com Commander.js + tsx para execução direta de TypeScript. Consome a API REST local. Distribuído como pacote npm (`npx knowhub-ai`).

### Histórias de Usuário

**STORY-1.7.1 — Adicionar entrada via CLI**

> Como usuário técnico, quero adicionar uma nota ou URL ao meu acervo diretamente do terminal sem abrir o browser.

_Critérios de aceite:_

- [ ] `knowhub add "texto da nota"` cria uma nota e exibe `✓ Salvo (id: abc123)`
- [ ] `knowhub add https://example.com` inicia ingestão de URL e exibe progresso
- [ ] `knowhub add --file ./documento.pdf` faz upload do arquivo
- [ ] Flag `--title "Meu título"` define título manualmente
- [ ] Se não autenticado, exibe instrução clara de como fazer o setup

**STORY-1.7.2 — Perguntar via CLI**

> Como usuário técnico, quero fazer perguntas ao assistente diretamente do terminal para integrar com meus workflows de desenvolvimento.

_Critérios de aceite:_

- [ ] `knowhub ask "qual minha nota sobre arquitetura de microsserviços?"` imprime a resposta no terminal
- [ ] Flag `--stream` imprime os tokens em tempo real (streaming)
- [ ] Fontes são exibidas ao final: `[Fonte: Título da entrada]`
- [ ] Suporte a pipe: `echo "Qual o resumo de LangGraph?" | knowhub ask`

**STORY-1.7.3 — Listar entradas via CLI**

> Como usuário técnico, quero listar minhas entradas no terminal para consulta rápida.

_Critérios de aceite:_

- [ ] `knowhub list` exibe as 20 entradas mais recentes em formato tabular
- [ ] `knowhub list --tag typescript` filtra por tag
- [ ] `knowhub list --status failed` filtra por status
- [ ] Flag `--json` exporta como JSON para pipelines de automação

**Tarefas Técnicas:**

- Criar `apps/cli` com Commander.js e tsx
- Implementar cliente HTTP autenticado (lê `~/.knowhub/config.json`)
- Implementar streaming SSE no terminal via `EventSource` ou fetch stream
- Configurar `package.json` com `bin` apontando para o CLI
- Publicar como `knowhub-ai` no npm (com `@knowhub-ai/cli` como alternativa)

**Dependências:** EPIC-1.1, EPIC-1.2, EPIC-1.3, EPIC-1.5.

**Testes necessários:**

- Unit: parsers de argumentos, formatação de saída
- Integration: comandos com API mockada (MSW ou nock)

**Métricas de sucesso:**

- Fluxo `knowhub add url && knowhub ask pergunta` funciona end-to-end

**Estimativa:** M

---

## EPIC-1.8 — WebSocket e Eventos em Tempo Real

**Objetivo:** A interface web recebe atualizações em tempo real de indexação, streaming de respostas e alertas do sistema sem precisar fazer polling.

**Contexto técnico:** NestJS `@WebSocketGateway` com Socket.io. Eventos de longa duração (indexação, sugestões) são persistidos em Redis Streams com TTL de 7 dias para replay em caso de reconexão.

### Histórias de Usuário

**STORY-1.8.1 — Eventos de progresso de indexação**

> Como usuário, quero ver o progresso da indexação de cada entrada em tempo real para saber quando meu conteúdo estará disponível para consulta.

_Critérios de aceite:_

- [ ] Evento `entry.indexing` emitido a cada step com `{ entryId, progress: 0-100, step: string }`
- [ ] Evento `entry.indexed` emitido ao final com `{ entryId, summary, tags, connectionsCount }`
- [ ] Evento `entry.failed` emitido em falha com `{ entryId, error }`
- [ ] Frontend atualiza o card da entrada em tempo real sem precisar recarregar a página
- [ ] Status badge anima durante indexação (spinner) e confirma com check verde ao finalizar

**STORY-1.8.2 — Streaming de resposta do assistente**

> Como usuário, quero ver os tokens da resposta sendo gerados em tempo real para uma experiência mais responsiva.

_Critérios de aceite:_

- [ ] Evento `query.streaming` emitido por token gerado com `{ token: string }`
- [ ] Evento `query.done` sinaliza conclusão com `{ answer, sources, tokensUsed }`
- [ ] Cliente pode emitir `query.cancel` para interromper a geração
- [ ] Frontend reconstrói a resposta concatenando tokens sem glitch visual

**STORY-1.8.3 — Persistência de eventos com Redis Streams**

> Como usuário, quero que eventos importantes não sejam perdidos se minha conexão cair temporariamente.

_Critérios de aceite:_

- [ ] Eventos `entry.indexed` e `agent.suggestion` são persistidos em Redis Stream `events:{userId}` com TTL 7 dias
- [ ] Ao reconectar, cliente envia `lastEventId` e recebe eventos perdidos via `XREAD`
- [ ] Eventos efêmeros (`query.streaming`, `query.done`) não são persistidos
- [ ] Implementação funciona tanto em modo single-instance (local) quanto multi-instance (cloud)

**Tarefas Técnicas:**

- Criar `WebSocketGateway` com `@nestjs/websockets` e `@nestjs/platform-socket.io`
- Implementar eventos servidor → cliente conforme tabela da spec
- Implementar `RedisStreamService` para persistência e replay
- Criar hook `useWebSocket` no frontend com reconexão automática
- Configurar `@socket.io/redis-adapter` para suporte multi-instância (cloud)

**Dependências:** EPIC-1.1 (auth do WebSocket), Redis disponível (EPIC-0.3).

**Testes necessários:**

- Unit: `RedisStreamService` com mock do ioredis
- Integration: gateway WebSocket com cliente de teste Socket.io
- Resiliência: comportamento na reconexão com Redis mockado caindo e voltando

**Métricas de sucesso:**

- 0 eventos perdidos após reconexão com Redis Streams ativo
- Latência do primeiro token via WebSocket < 100ms adicional vs polling

**Estimativa:** L

---

# FASE 2 — Conexões e Agentes

> **Objetivo da fase:** Transformar o repositório de notas em um sistema de conhecimento vivo, com conexões automáticas entre informações, agente de manutenção proativo e novos canais de captura (Telegram, GitHub).

---

## EPIC-2.1 — Grafo de Conexões entre Conhecimentos

**Objetivo:** O sistema identifica automaticamente entradas semanticamente relacionadas e cria conexões entre elas, formando um grafo de conhecimento consultável.

**Contexto técnico:** Após cada indexação, o `ConnectionFinder` calcula cosine similarity entre o vetor médio da nova entrada e todas as entradas existentes do usuário. Conexões com score > 0.75 são armazenadas em `connection_edges`.

### Histórias de Usuário

**STORY-2.1.1 — Cálculo automático de conexões**

> Como sistema, quero calcular automaticamente as conexões entre entradas ao final de cada indexação para manter o grafo sempre atualizado.

_Critérios de aceite:_

- [ ] Após `entry.indexed`, `ConnectionFinder` é executado como step final do `IndexingAgent`
- [ ] Calcula cosine similarity entre vetor médio da nova entrada e vetores médios das entradas existentes
- [ ] Cria `connection_edges` para pares com score ≥ 0.75
- [ ] Não cria edge duplicada: upsert por `(sourceId, targetId)` (unique index)
- [ ] Máximo de 20 conexões por entrada para evitar grafos excessivamente densos
- [ ] Edges são bidirecionais: `(A→B)` e `(B→A)` tratadas como a mesma conexão

**STORY-2.1.2 — API de grafo para visualização**

> Como desenvolvedor frontend, quero endpoints que retornem nodes e edges do grafo em formato adequado para visualização.

_Critérios de aceite:_

- [ ] `GET /api/v1/graph/nodes` retorna `{ id, title, type, tags[], status }[]`
- [ ] `GET /api/v1/graph/edges` retorna `{ id, sourceId, targetId, similarity, type: "auto"|"manual" }[]`
- [ ] `GET /api/v1/graph/clusters` retorna clusters identificados por community detection (algoritmo Louvain simplificado ou agrupamento por similaridade)
- [ ] `POST /api/v1/graph/connections` cria conexão manual: `{ sourceId, targetId, label? }`
- [ ] Todos os endpoints retornam apenas dados do userId do JWT

**STORY-2.1.3 — Recálculo periódico de conexões**

> Como sistema, quero recalcular conexões diariamente para entradas novas que podem ter sido adicionadas depois de outras já existentes.

_Critérios de aceite:_

- [ ] Job `generate-connections` roda diariamente às 02:00 (configurável)
- [ ] Processa apenas entradas adicionadas nas últimas 24h (incremental, não full-scan)
- [ ] Atualiza scores de conexões existentes se mudaram significativamente (delta > 0.05)

**Tarefas Técnicas:**

- Implementar `ConnectionFinderService` com cálculo de vetor médio e cosine similarity
- Criar node `ConnectionFinderNode` no LangGraph do `IndexingAgent`
- Implementar `GraphModule` com `GraphController` e `GraphService`
- Implementar algoritmo de clustering simples por threshold de similaridade
- Adicionar job BullMQ `generate-connections` ao `MaintenanceAgent` (EPIC-2.3)

**Dependências:** EPIC-1.4, EPIC-1.2.

**Testes necessários:**

- Unit: `ConnectionFinderService` com vetores mockados e cálculo de similarity
- Integration: pipeline completo de indexação → criação de edges

**Métricas de sucesso:**

- Precisão das conexões: 70%+ das conexões automáticas avaliadas como "relevantes" em teste manual
- Zero edges duplicadas em 100.000 entradas

**Estimativa:** L

---

## EPIC-2.2 — Mapa Visual de Conhecimento (Frontend)

**Objetivo:** O usuário pode explorar seu acervo como um grafo visual interativo, descobrindo conexões e clusters de conhecimento.

**Contexto técnico:** React Flow para renderização do grafo. Dados consumidos dos endpoints `/graph/nodes` e `/graph/edges`. Layout calculado com dagre ou force-directed.

### Histórias de Usuário

**STORY-2.2.1 — Visualização do grafo**

> Como usuário, quero ver meu acervo como um mapa de conexões para descobrir relacionamentos entre ideias que não perceberia em uma lista.

_Critérios de aceite:_

- [ ] Página `/map` renderiza grafo interativo com React Flow
- [ ] Nodes coloridos por tipo (NOTE, LINK, PDF, GITHUB)
- [ ] Espessura das edges proporcional ao score de similaridade
- [ ] Layout force-directed com separação visual de clusters
- [ ] Performance aceitável para acervos de até 500 nodes (sem virtualização na v1)

**STORY-2.2.2 — Interatividade do grafo**

> Como usuário, quero interagir com o grafo para explorar meu conhecimento.

_Critérios de aceite:_

- [ ] Click em node abre painel lateral com detalhes da entrada (título, resumo, tags)
- [ ] Hover em node destaca suas conexões diretas e esmaece o resto
- [ ] Duplo-click em node navega para `/knowledge/:id`
- [ ] Controles de zoom, pan e "fit to screen"
- [ ] Minimap para navegação em grafos grandes
- [ ] Filtro por tipo de entrada e por tag (filtra nodes no grafo)

**STORY-2.2.3 — Briefing de cluster**

> Como usuário, quando identifico um cluster de notas relacionadas, quero gerar um resumo consolidado delas com um clique.

_Critérios de aceite:_

- [ ] Botão "Gerar Briefing" disponível ao selecionar um cluster
- [ ] Chama `POST /api/v1/query/summarize` com os IDs das entradas do cluster
- [ ] Resultado exibido em modal com opção de copiar o Markdown gerado
- [ ] Feedback de carregamento enquanto o LLM processa

**Tarefas Técnicas:**

- Instalar e configurar React Flow com layout dagre
- Criar `KnowledgeGraphView` com fetch de nodes e edges
- Implementar `GraphNodeComponent` e `GraphEdgeComponent`
- Criar painel lateral de detalhes (slide-in)
- Implementar filtros de tipo e tag com atualização reactiva do grafo

**Dependências:** EPIC-2.1, EPIC-1.5 (resumo de cluster).

**Testes necessários:**

- E2E: adicionar 5 entradas relacionadas → verificar conexões no mapa → gerar briefing

**Métricas de sucesso:**

- Grafo renderiza em < 2s para 100 nodes
- Usuário descobre pelo menos 1 conexão "surpresa" relevante na primeira semana de uso

**Estimativa:** L

---

## EPIC-2.3 — Agent de Manutenção

**Objetivo:** O sistema executa jobs periódicos de manutenção do acervo (verificação de links, deduplicação, conexões, limpeza) e apresenta os resultados ao usuário para aprovação — nunca age automaticamente sobre os dados.

**Contexto técnico:** `MaintenanceAgent` como módulo NestJS com jobs BullMQ agendados via cron. Implementado como LangGraph State Graph com human-in-the-loop nativo para qualquer ação sobre dados. Cada job emite sugestões via WebSocket e Redis Streams.

### Histórias de Usuário

**STORY-2.3.1 — Verificação de links quebrados**

> Como sistema, quero verificar periodicamente se os links salvos ainda funcionam e notificar o usuário sobre os que quebraram.

_Critérios de aceite:_

- [ ] Job `check-links` roda toda segunda-feira às 09:00
- [ ] Faz HEAD request para cada entry do tipo LINK com timeout de 10s
- [ ] Links com status HTTP ≥ 400 ou timeout marcados internamente como quebrados
- [ ] Gera sugestão `agent.suggestion` via WebSocket: "3 links estão quebrados. Revisar?"
- [ ] Usuário pode ver os links, arquivá-los ou marcá-los como OK (ignora)
- [ ] O job NOT arquiva links automaticamente — apenas sugere

**STORY-2.3.2 — Detecção de duplicatas**

> Como sistema, quero identificar entradas com conteúdo muito similar e sugerir ao usuário que faça merge para manter o acervo limpo.

_Critérios de aceite:_

- [ ] Job `deduplicate` roda diariamente às 03:00
- [ ] Identifica pares de entradas com cosine similarity > 0.95
- [ ] Sugere ao usuário via notificação: "2 entradas parecem duplicatas. Deseja mesclar?"
- [ ] Usuário pode: mesclar (mantém a mais recente e arquiva a outra), ignorar, ou ver as duas
- [ ] Job NOT mescla automaticamente

**STORY-2.3.3 — Sugestão de arquivamento de conteúdo antigo**

> Como sistema, quero identificar entradas pouco acessadas e sugerir arquivamento para manter o acervo relevante.

_Critérios de aceite:_

- [ ] Job `archive-stale` roda todo domingo às 04:00
- [ ] Identifica entradas com `accessedAt` há mais de 6 meses (configurável nas settings)
- [ ] Gera sugestão com lista das entradas: "7 entradas não são acessadas há 6+ meses."
- [ ] Usuário pode arquivar em lote ou individualmente
- [ ] Job NOT arquiva automaticamente

**STORY-2.3.4 — Re-indexação de entradas com falha**

> Como sistema, quero tentar re-indexar periodicamente entradas que falharam para garantir que nenhum conteúdo fique permanentemente inacessível.

_Critérios de aceite:_

- [ ] Job `reindex-failed` roda a cada 30 minutos
- [ ] Tenta re-indexar entradas com status FAILED que tiveram < 3 tentativas
- [ ] Após 3 tentativas sem sucesso, marca como FAILED definitivo e notifica o usuário
- [ ] Log de falhas disponível em `GET /api/v1/admin/jobs/failed`

**STORY-2.3.5 — Dashboard de sugestões**

> Como usuário, quero ver todas as sugestões pendentes do agente de manutenção em um único lugar para processá-las de forma organizada.

_Critérios de aceite:_

- [ ] `GET /api/v1/query/suggestions` retorna sugestões ativas pendentes de decisão do usuário
- [ ] Frontend exibe badge com contagem de sugestões no ícone de notificação
- [ ] Painel de sugestões lista cada item com ação disponível (aprovar/rejeitar)
- [ ] Sugestões têm validade de 30 dias; expiram automaticamente se não tratadas

**Tarefas Técnicas:**

- Criar `MaintenanceModule` com `MaintenanceAgent` (LangGraph) e jobs BullMQ
- Implementar 5 jobs com cron expressions configuráveis
- Implementar `SuggestionService` para persistência e gerenciamento de sugestões
- Integrar WebSocket gateway para emissão de `agent.suggestion`
- Criar tela de sugestões no frontend com ações inline
- Implementar lógica de human-in-the-loop no LangGraph (estado aguarda decisão do usuário)

**Dependências:** EPIC-2.1, EPIC-1.8, EPIC-1.2.

**Testes necessários:**

- Unit: cada job com mocks de banco e HTTP
- Resiliência: comportamento de jobs quando Redis está indisponível
- E2E: gerar link quebrado → rodar job → verificar notificação → arquivar

**Métricas de sucesso:**

- 0 ações automáticas sobre dados sem confirmação do usuário
- Taxa de aceitação de sugestões de deduplicação > 60% (sugere conteúdo realmente duplicado)

**Estimativa:** L

---

## EPIC-2.4 — Sugestões Proativas do Assistente

**Objetivo:** O assistente identifica automaticamente conexões surpresa e oportunidades de consolidação de conhecimento, apresentando-as ao usuário de forma não-intrusiva.

**Contexto técnico:** Extensão do `MaintenanceAgent` com um node de LLM que analisa padrões no acervo e gera sugestões contextuais. Usa `agent.suggestion` WebSocket + Redis Streams.

### Histórias de Usuário

**STORY-2.4.1 — Sugestão de conexão relevante**

> Como usuário, quero ser notificado quando o assistente identifica uma conexão relevante entre algo que acabei de adicionar e algo que guardei antes.

_Critérios de aceite:_

- [ ] Após indexação bem-sucedida, se `ConnectionFinder` encontrar edges com score > 0.85, o assistente emite sugestão
- [ ] Sugestão: "Você tem uma nota sobre X que pode ser relevante para o que acabou de salvar."
- [ ] Sugestão aparece como notificação toast não-bloqueante na interface
- [ ] Usuário pode ignorar ou clicar para ver as conexões no mapa

**STORY-2.4.2 — Sugestão de consolidação de cluster**

> Como usuário, quero ser sugerido a consolidar um conjunto de notas relacionadas em um único documento quando o sistema percebe que acumulei muitas sobre o mesmo tema.

_Critérios de aceite:_

- [ ] Quando um cluster ultrapassa 5 entradas relacionadas, o assistente sugere consolidação
- [ ] Sugestão: "Você tem 7 notas sobre React Hooks. Quer que eu gere um documento consolidado?"
- [ ] Usuário pode aprovar (chama `summarize` com IDs do cluster) ou dispensar
- [ ] Sugestão não se repete para o mesmo cluster por 30 dias após ser dispensada

**Tarefas Técnicas:**

- Adicionar node de análise proativa ao `MaintenanceAgent`
- Implementar lógica de threshold de cluster e regra de silêncio pós-dispensa
- Criar componente de toast de sugestão no frontend com ações inline

**Dependências:** EPIC-2.3, EPIC-2.1.

**Testes necessários:**

- Unit: lógica de threshold e regra de silêncio

**Estimativa:** M

---

## EPIC-2.5 — Integração com GitHub

**Objetivo:** O usuário pode importar conteúdo de repositórios GitHub (READMEs, issues, documentação) para seu acervo de conhecimento.

**Contexto técnico:** Integração via GitHub OAuth App + `@octokit/rest`. O loader de GitHub é um `IContentLoader` como os demais, ativado via `POST /api/v1/ingest/github`.

### Histórias de Usuário

**STORY-2.5.1 — Autenticação GitHub OAuth**

> Como usuário, quero conectar minha conta GitHub ao KnowHub para autorizar a leitura dos meus repositórios.

_Critérios de aceite:_

- [ ] Fluxo OAuth 2.0 completo com redirect para GitHub e callback em `/api/v1/github/callback`
- [ ] Token GitHub armazenado criptografado (AES-256-GCM) no `user_settings`
- [ ] `GET /api/v1/github/status` retorna `{ connected: boolean, login?, scopes? }`
- [ ] Botão "Desconectar GitHub" revoga o token e limpa o armazenamento

**STORY-2.5.2 — Importar README de repositório**

> Como usuário, quero importar o README de qualquer repositório GitHub que tenho acesso para ter sua documentação no meu acervo.

_Critérios de aceite:_

- [ ] `POST /api/v1/ingest/github` aceita `{ repoUrl: string, importType: "readme" | "issues" | "all" }`
- [ ] Importação de README: busca via `@octokit/rest`, converte Markdown para texto, cria entry do tipo GITHUB
- [ ] Metadados: `sourceUrl`, `title` = nome do repo, `metadata.stars`, `metadata.language`

**STORY-2.5.3 — Importar issues de repositório**

> Como usuário, quero importar issues de um repositório para ter o contexto de decisões e discussões técnicas no meu acervo.

_Critérios de aceite:_

- [ ] Importação de issues: busca issues abertas e fechadas com paginação automática
- [ ] Cada issue importada como entry separada: título = `[repo] Issue #N: Título da Issue`
- [ ] Conteúdo = body + comentários principais (máximo 5 comentários)
- [ ] Label das issues viram tags automaticamente
- [ ] Limite de 100 issues por importação (para não sobrecarregar)

**Tarefas Técnicas:**

- Criar `GithubModule` com `GithubController`, `GithubService`, `GithubLoader`
- Implementar OAuth flow com PKCE
- Implementar `GithubLoader` implementando `IContentLoader`
- Criptografar token OAuth antes de salvar no banco
- Adicionar configuração de GitHub App (Client ID, Secret) no `.env`

**Dependências:** EPIC-1.3 (sistema de loaders), EPIC-1.1 (settings de usuário).

**Testes necessários:**

- Unit: `GithubLoader` com mock do Octokit
- Integration: OAuth flow com servidor mock

**Métricas de sucesso:**

- Taxa de sucesso na importação de README > 99%
- Token OAuth seguro: nunca logado, armazenado criptografado

**Estimativa:** L

---

## EPIC-2.6 — Bot Gateway Telegram

**Objetivo:** O usuário pode capturar conhecimento e consultar seu acervo enviando mensagens para um bot do Telegram, de qualquer lugar.

**Contexto técnico:** Bot implementado com grammY (`^1.x`) como módulo NestJS. O bot é pessoal — cada usuário configura seu próprio token de bot. Comunicação com a API local via HTTP interno.

### Histórias de Usuário

**STORY-2.6.1 — Configuração do bot pessoal**

> Como usuário, quero configurar meu próprio bot Telegram para ter um canal de captura privado.

_Critérios de aceite:_

- [ ] Campo `telegramToken` nas settings do usuário
- [ ] `POST /api/v1/settings` com `telegramToken` inicia o bot automaticamente
- [ ] O bot responde `/start` com mensagem de boas-vindas e instruções de uso
- [ ] Se token inválido, retorna erro claro com link para o BotFather

**STORY-2.6.2 — Captura de conteúdo via Telegram**

> Como usuário, quero enviar mensagens, links ou arquivos para o meu bot Telegram e tê-los salvos automaticamente no acervo.

_Critérios de aceite:_

- [ ] Mensagem de texto → cria NOTE entry
- [ ] URL enviada → cria LINK entry e inicia ingestão
- [ ] Arquivo PDF enviado → faz download e inicia ingestão como PDF
- [ ] Bot responde confirmando: "✓ Salvo! Indexando em background..."
- [ ] Após indexação, bot envia mensagem de conclusão (usando WebSocket interno)

**STORY-2.6.3 — Consulta ao acervo via Telegram**

> Como usuário, quero fazer perguntas ao meu acervo via Telegram para consultar conhecimento de qualquer lugar.

_Critérios de aceite:_

- [ ] `/ask [pergunta]` ou texto começando com `?` dispara o QueryAgent
- [ ] Resposta enviada no Telegram com fontes: "Baseado em: [Título da Nota]"
- [ ] Respostas longas divididas em múltiplas mensagens (limite 4096 chars do Telegram)
- [ ] `/list` exibe as 5 entradas mais recentes

**Tarefas Técnicas:**

- Criar `TelegramModule` com `TelegramService` usando grammY
- Implementar lifecycle de start/stop do bot via settings
- Implementar handlers: text, URL, document (PDF)
- Implementar download de PDFs do Telegram via file API
- Integrar com `IngestionService` e `QueryService` internamente

**Dependências:** EPIC-1.3, EPIC-1.5, EPIC-1.1 (settings).

**Testes necessários:**

- Unit: handlers do bot com mock do grammY context
- Integration: fluxo de envio → criação de entry com bot mock

**Métricas de sucesso:**

- Taxa de entrega de notificações de indexação > 99%
- Latência de resposta do bot < 3s para queries simples

**Estimativa:** M

---

## EPIC-2.7 — Testes End-to-End (Playwright)

**Objetivo:** Ter cobertura automatizada dos fluxos críticos da interface web para garantir que regressões não chegam a usuários.

**Contexto técnico:** Playwright com browser Chromium. Ambiente de teste dedicado com seed de dados via API. Executado no CI em cada PR.

### Histórias de Usuário

**STORY-2.7.1 — Fluxo de ingestão e consulta**

> Como equipe, quero que o fluxo principal de adicionar um link e consultar sobre ele seja testado automaticamente.

_Critérios de aceite:_

- [ ] Teste: Abrir app → Adicionar URL → Aguardar indexação → Perguntar sobre conteúdo → Verificar resposta com fonte
- [ ] Teste passa em < 60 segundos usando LLM mock

**STORY-2.7.2 — Fluxo de upload de PDF e consulta**

> Como equipe, quero que upload de PDF → consulta seja testado automaticamente.

_Critérios de aceite:_

- [ ] Teste: Upload de PDF de exemplo → Aguardar indexação → Consulta sobre conteúdo → Verificar resposta

**STORY-2.7.3 — Fluxo de mapa de conhecimento**

> Como equipe, quero que o mapa visual seja testado automaticamente.

_Critérios de aceite:_

- [ ] Teste: Seed de 5 entradas pré-indexadas → Abrir mapa → Verificar nodes e edges → Click em node → Verificar painel de detalhes

**Tarefas Técnicas:**

- Instalar e configurar Playwright com Chromium
- Criar `playwright.config.ts` com baseURL e timeouts adequados
- Criar fixtures de seed de dados via API REST
- Implementar mock do LLM para testes determinísticos (respostas fixas)
- Configurar job de CI para Playwright com artifacts de screenshots em falha

**Dependências:** EPIC-1.6, EPIC-2.2.

**Estimativa:** L

---

# FASE 3 — Experiência e Alcance

> **Objetivo da fase:** Tornar o produto acessível para usuários não-técnicos com onboarding guiado, instalador simplificado e extensão de navegador.

---

## EPIC-3.1 — Onboarding Wizard

**Objetivo:** Qualquer usuário, técnico ou não, consegue instalar e configurar o KnowHub em menos de 5 minutos com um assistente guiado que detecta o ambiente e faz escolhas sensatas automaticamente.

### Histórias de Usuário

**STORY-3.1.1 — Detecção de hardware e recomendação de modelo**

> Como novo usuário, quero que o sistema detecte minha configuração de hardware e recomende o modelo de IA mais adequado automaticamente.

_Critérios de aceite:_

- [ ] Setup script detecta RAM disponível e recomenda modelo: 4GB → Gemma-3 4B, 8GB → Phi-4 Mini, 16GB+ → Llama-3.3 8B
- [ ] Usuário pode aceitar a recomendação ou escolher outro modelo
- [ ] Download progress do modelo Ollama exibido com barra de progresso e ETA
- [ ] Se hardware insuficiente para qualquer modelo local, oferece opção de usar Azure OpenAI como alternativa

**STORY-3.1.2 — Wizard passo a passo no frontend**

> Como novo usuário, quero ser guiado por um wizard de configuração no browser que explique cada etapa do setup.

_Critérios de aceite:_

- [ ] Rota `/onboarding` com wizard de 4 passos: Bem-vindo → Hardware → Modelo de IA → Primeira Captura
- [ ] Cada passo tem explicação simples em linguagem não-técnica
- [ ] Progresso persistido: se o usuário fechar, retoma do último passo concluído
- [ ] Passo "Primeira Captura" guia o usuário a salvar sua primeira nota/link
- [ ] Ao final, redireciona para o dashboard com mensagem de parabéns

**STORY-3.1.3 — Primeira experiência de onboarding no chat**

> Como novo usuário, quero que o assistente me explique como usar o produto quando converso com ele pela primeira vez.

_Critérios de aceite:_

- [ ] Na primeira abertura do chat, o assistente envia mensagem de boas-vindas com 3 exemplos de perguntas que pode responder
- [ ] Sugestões de perguntas rápidas como chips clicáveis: "O que tenho sobre X?", "Faça um resumo de..."
- [ ] Assistente detecta acervo vazio e sugere adicionar conteúdo primeiro

**Tarefas Técnicas:**

- Criar `OnboardingModule` no backend para rastrear estado do wizard
- Criar componente `OnboardingWizard` no frontend com step machine (XState ou useState)
- Implementar detecção de RAM via `os` module no setup script
- Implementar progress de download do Ollama via polling do endpoint de status

**Dependências:** EPIC-1.1, EPIC-1.6.

**Estimativa:** M

---

## EPIC-3.2 — Instalador One-Click

**Objetivo:** Qualquer pessoa consegue instalar o KnowHub no Windows, macOS ou Linux sem precisar de conhecimento técnico, usando um instalador com um clique.

### Histórias de Usuário

**STORY-3.2.1 — Script de instalação universal**

> Como usuário não-técnico, quero instalar o KnowHub com um único comando que faz tudo automaticamente.

_Critérios de aceite:_

- [ ] Script install.sh / install.ps1 verifica Node.js ≥ 20, instala se necessário (via nvm/winget)
- [ ] Instala o pacote npm `knowhub-ai` globalmente
- [ ] Executa `knowhub-ai setup` automaticamente
- [ ] Registra KnowHub no PM2 com auto-start no boot do sistema
- [ ] Cria atalho na área de trabalho / launchpad que abre o browser no app

**STORY-3.2.2 — Gerenciamento de processos com PM2**

> Como usuário, quero que o KnowHub inicie automaticamente quando ligo o computador sem precisar lembrar de nenhum comando.

_Critérios de aceite:_

- [ ] `ecosystem.config.js` gerado em `~/.knowhub/` com configuração de `knowhub-api` e `knowhub-web`
- [ ] `pm2 startup` executado no install para registro no sistema (launchd, systemd ou Windows startup)
- [ ] `pm2 save` persiste os processos
- [ ] Comando `knowhub-ai status` exibe estado dos processos com saúde de cada um
- [ ] Comando `knowhub-ai restart` reinicia tudo
- [ ] Comando `knowhub-ai stop` para todos os processos

**STORY-3.2.3 — Atualização automática**

> Como usuário, quero ser notificado sobre atualizações disponíveis e poder instalar com um clique.

_Critérios de aceite:_

- [ ] App checa versão do npm na inicialização (uma vez por dia)
- [ ] Notificação discreta na UI: "Nova versão disponível: v0.2.0 — Atualizar?"
- [ ] `knowhub-ai update` para a API, atualiza o pacote npm e reinicia

**Tarefas Técnicas:**

- Criar `apps/installer/` com scripts `install.sh` e `install.ps1`
- Criar gerador do `ecosystem.config.js` para PM2
- Implementar comando `knowhub-ai status/restart/stop/update` no CLI
- Configurar Next.js com `output: 'standalone'` para build sem servidor de dev
- Testar em Windows 11, macOS Sonoma e Ubuntu 22.04

**Dependências:** EPIC-1.7, EPIC-1.1.

**Estimativa:** L

---

## EPIC-3.3 — Extensão de Navegador

**Objetivo:** O usuário pode salvar páginas web no KnowHub com um clique, sem precisar copiar URL e abrir o app.

### Histórias de Usuário

**STORY-3.3.1 — Captura de página com um clique**

> Como usuário, quero clicar no ícone do KnowHub no navegador para salvar a página atual no meu acervo instantaneamente.

_Critérios de aceite:_

- [ ] Extensão disponível para Chrome e Firefox
- [ ] Click no ícone → popup com: URL atual, título sugerido, campo de comentário opcional, botão "Salvar"
- [ ] Chamada à API local (`localhost:3001`) com o JWT da extensão
- [ ] Feedback visual: ícone muda de cor por 2 segundos após salvar com sucesso
- [ ] Se API não estiver rodando, exibe mensagem clara com instruções

**STORY-3.3.2 — Autenticação da extensão**

> Como sistema, preciso garantir que a extensão se autentique com a API local de forma segura.

_Critérios de aceite:_

- [ ] Extensão faz login inicial via `chrome.storage.local` com `clientId` + `clientSecret` configurados por popup de settings
- [ ] Token JWT armazenado no storage da extensão com renovação automática
- [ ] Settings da extensão: URL da API (default: localhost:3001), configurar token

**STORY-3.3.3 — Seleção e captura de trecho**

> Como usuário, quero selecionar um trecho de texto em qualquer página e salvá-lo diretamente como nota.

_Critérios de aceite:_

- [ ] Ao selecionar texto, ícone flutuante aparece com opção "Salvar no KnowHub"
- [ ] Cria NOTE com o trecho selecionado, com metadado da URL de origem
- [ ] Feedback inline: "Salvo no KnowHub ✓"

**Tarefas Técnicas:**

- Criar `apps/extension/` como Manifest V3 (Chrome) + adaptação Firefox
- Implementar popup HTML/JS com comunicação à API local
- Implementar content script para seleção de texto
- Configurar CORS na API para aceitar `chrome-extension://` origins do localhost
- Publicar na Chrome Web Store e Firefox Add-ons

**Dependências:** EPIC-1.3, EPIC-1.1.

**Estimativa:** L

---

## EPIC-3.4 — Modo Híbrido (Fallback Cloud)

**Objetivo:** Usuários com hardware insuficiente para modelos locais podem usar Azure OpenAI como fallback, com consentimento explícito e transparência total sobre o que é enviado.

### Histórias de Usuário

**STORY-3.4.1 — Configuração do modo híbrido**

> Como usuário com hardware limitado, quero configurar o Azure OpenAI como fallback para quando o modelo local não estiver disponível.

_Critérios de aceite:_

- [ ] Configuração de `privacyMode: "hybrid"` nas settings habilita fallback cloud
- [ ] Campos na settings page: Azure OpenAI Key, Endpoint, Deployment
- [ ] Aviso claro na UI quando modo hybrid está ativo: "⚠️ Modo Híbrido: conteúdo pode ser enviado para Azure OpenAI"
- [ ] `POST /api/v1/settings/test-ai` testa tanto Ollama quanto Azure e exibe status de cada um

**STORY-3.4.2 — Fallback automático com notificação**

> Como usuário no modo híbrido, quero ser informado quando o sistema usa cloud em vez do modelo local.

_Critérios de aceite:_

- [ ] Quando Ollama está indisponível e modo híbrido ativo, sistema usa Azure automaticamente
- [ ] Toast de aviso: "Modelo local indisponível. Usando Azure OpenAI para esta consulta."
- [ ] Log de cada consulta que usou cloud (acessível nas settings)
- [ ] Usuário pode desabilitar o fallback e receber erro ao invés de ir para cloud

**STORY-3.4.3 — Minimização de dados enviados ao cloud**

> Como sistema, devo enviar para o cloud apenas o mínimo necessário para processar a requisição, sem metadados desnecessários.

_Critérios de aceite:_

- [ ] Para embeddings cloud: somente o texto do chunk, sem `userId`, `entryId` ou título
- [ ] Para LLM cloud: somente os chunks relevantes + pergunta, sem informação de identidade
- [ ] Nenhum dado é logado no Azure além do que a Azure OpenAI loga por padrão
- [ ] Documentação clara de quais dados trafegam para o cloud em cada operação

**Tarefas Técnicas:**

- Atualizar `AIProviderFactory` com lógica de fallback e notificação via evento
- Implementar log de uso de cloud no banco local
- Criar seção de auditoria de privacidade na settings page
- Documentar política de dados para cada modo (local, híbrido, cloud)

**Dependências:** EPIC-1.1, EPIC-1.4, EPIC-1.5.

**Estimativa:** M

---

## EPIC-3.5 — Internacionalização (PT-BR e EN)

**Objetivo:** A interface do KnowHub está disponível em português do Brasil e inglês, com suporte a alternância de idioma nas configurações.

### Histórias de Usuário

**STORY-3.5.1 — Interface traduzida para PT-BR e EN**

> Como usuário brasileiro, quero usar o app em português, e como usuário internacional, em inglês.

_Critérios de aceite:_

- [ ] `i18next` configurado com `react-i18next` no frontend
- [ ] Todos os textos da UI são strings traduzíveis (sem strings hardcoded em português/inglês)
- [ ] Arquivos de tradução em `apps/web/public/locales/pt-BR/` e `/en/`
- [ ] Mudança de idioma reflete imediatamente sem reload
- [ ] Idioma padrão detectado do browser; fallback para PT-BR

**STORY-3.5.2 — Prompts de IA em PT-BR e EN**

> Como usuário, quero que as respostas do assistente sejam no meu idioma configurado.

_Critérios de aceite:_

- [ ] `SkillsLoaderService` substitui `{language}` no SOUL.md e skills com o idioma do usuário
- [ ] Respostas do LLM são no idioma configurado independente do idioma do conteúdo indexado
- [ ] Tags sugeridas automaticamente respeitam o idioma configurado

**Tarefas Técnicas:**

- Configurar i18next com namespace `common`, `knowledge`, `chat`, `settings`
- Auditar todos os textos da UI e extrair para arquivos de tradução
- Traduzir todos os textos para PT-BR e EN
- Criar `LanguageSelector` nas settings e no onboarding

**Dependências:** EPIC-1.6, EPIC-3.1.

**Estimativa:** M

---

# FASE 4 — Ecossistema de Plugins

> **Objetivo da fase:** Abrir o produto para que a comunidade expanda suas capacidades indefinidamente com novos loaders, ações e integrações.

---

## EPIC-4.1 — Infraestrutura do Sistema de Plugins

**Objetivo:** Ter um sistema seguro de carregamento de plugins com isolamento via `worker_threads` e interface bem definida que os plugins devem implementar.

**Contexto técnico:** Plugins implementam a interface `IKnowhubPlugin` definida em `packages/shared-types`. São carregados como módulos Node.js isolados em `worker_threads` — sem acesso direto ao banco de dados ou ao sistema de arquivos além do que a API de plugins expõe.

### Histórias de Usuário

**STORY-4.1.1 — Carregamento e isolamento de plugins**

> Como sistema, preciso carregar plugins de forma isolada para que um plugin malicioso ou com bug não comprometa o core do app.

_Critérios de aceite:_

- [ ] Cada plugin roda em `worker_thread` separado
- [ ] Plugins NÃO têm acesso direto ao banco de dados — usam apenas a API de `PluginContext`
- [ ] `PluginContext` expõe: `knowledge.create`, `knowledge.findById`, `knowledge.addTags`, `logger`, `config`
- [ ] Plugin que lança exceção não derruba o processo principal
- [ ] Timeout de 30s por operação de plugin; ultrapassado → worker killed e erro logado

**STORY-4.1.2 — Registro e descoberta de plugins instalados**

> Como desenvolvedor ou usuário avançado, quero instalar um plugin localmente e tê-lo disponível automaticamente.

_Critérios de aceite:_

- [ ] Plugins instalados como pacotes npm no diretório `~/.knowhub/plugins/`
- [ ] Plugin é descoberto automaticamente na inicialização se contém `knowhub-plugin` no `keywords` do `package.json`
- [ ] `GET /api/v1/plugins` lista plugins instalados com nome, versão, status (`active`/`error`) e capacidades (loaders, actions)
- [ ] Falha no load de um plugin loga erro mas não impede o start da API

**STORY-4.1.3 — Plugin de loader customizado**

> Como desenvolvedor, quero criar um plugin que adiciona suporte a um novo tipo de fonte de conteúdo.

_Critérios de aceite:_

- [ ] Plugin implementa `IContentLoader` com `canLoad(source: string)` e `load(source, ctx)`
- [ ] `canLoad` é testado contra cada URL antes dos loaders nativos; se retorna true, o plugin é usado
- [ ] Loader de plugin tem timeout de 15s igual aos loaders nativos
- [ ] Erro no loader retorna 422 com mensagem do plugin, não 500

**STORY-4.1.4 — Plugin de ação pós-indexação**

> Como desenvolvedor, quero criar um plugin que executa uma ação após uma entrada ser indexada (ex: postar no Slack).

_Critérios de aceite:_

- [ ] Plugin implementa `IPluginAction` com `trigger: "after-index"` e `execute(entry, ctx)`
- [ ] Ações são executadas de forma assíncrona, sem bloquear a resposta ao usuário
- [ ] Falha na ação não reverte a indexação — é logada apenas
- [ ] Configuração do plugin (ex: webhook URL do Slack) passada via `ctx.config`

**Tarefas Técnicas:**

- Criar `PluginsModule` com `PluginLoaderService` e `PluginRegistry`
- Implementar isolamento com `worker_threads` e comunicação via `MessageChannel`
- Implementar `PluginContext` com interface controlada
- Criar `PluginController` com endpoints de listagem e status
- Definir `IKnowhubPlugin`, `IContentLoader`, `IPluginAction` em `shared-types`
- Documentar interface completa e exemplos no CONTRIBUTING.md

**Dependências:** EPIC-1.3, EPIC-1.4.

**Estimativa:** XL

---

## EPIC-4.2 — Registry e Descoberta de Plugins

**Objetivo:** Ter um registry público onde desenvolvedores publicam plugins e usuários os descobrem e instalam com um comando.

### Histórias de Usuário

**STORY-4.2.1 — Registry público de plugins**

> Como desenvolvedor, quero publicar meu plugin no registry oficial para que outros usuários possam descobri-lo.

_Critérios de aceite:_

- [ ] Registry implementado como repositório GitHub `knowhub-ai/plugin-registry` com `plugins.json`
- [ ] `plugins.json` lista: nome, versão, descrição, autor, URL do npm, categorias, downloads
- [ ] Processo de submissão via Pull Request com template definido
- [ ] Review manual obrigatório para plugins que acessam internet externa
- [ ] Badge de "Official" para plugins mantidos pela equipe core

**STORY-4.2.2 — Descoberta e instalação de plugins via UI**

> Como usuário, quero descobrir e instalar plugins com um clique na interface.

_Critérios de aceite:_

- [ ] Página `/settings/plugins` exibe plugins do registry com filtro por categoria
- [ ] Botão "Instalar" executa `npm install` no diretório de plugins e reinicia o loader
- [ ] Botão "Desinstalar" remove o plugin e reinicia o loader
- [ ] Indicador de plugins com update disponível (versão do registry vs instalada)

**STORY-4.2.3 — Instalação via CLI**

> Como usuário técnico, quero instalar plugins pelo terminal.

_Critérios de aceite:_

- [ ] `knowhub plugin install knowhub-notion-plugin` instala o plugin
- [ ] `knowhub plugin list` lista instalados
- [ ] `knowhub plugin remove knowhub-notion-plugin` desinstala

**Tarefas Técnicas:**

- Criar repositório `plugin-registry` no GitHub
- Criar `plugins.json` schema e processo de validação via CI
- Implementar `PluginStoreService` que consulta o registry (com cache de 1h)
- Criar páginas de plugins no frontend
- Adicionar comandos `plugin` ao CLI

**Dependências:** EPIC-4.1.

**Estimativa:** L

---

## EPIC-4.3 — Plugins Oficiais da Comunidade

**Objetivo:** Ter pelo menos 3 plugins oficiais funcionando e publicados no registry para demonstrar as capacidades da plataforma e servir de referência de implementação.

### Histórias de Usuário

**STORY-4.3.1 — Plugin Notion Importer**

> Como usuário do Notion, quero importar páginas do Notion para o KnowHub para consolidar meu conhecimento em um único lugar.

_Critérios de aceite:_

- [ ] `knowhub-notion-plugin` importa qualquer página Notion via URL ou integração OAuth
- [ ] Preserva estrutura de blocos: títulos, listas, código, tabelas
- [ ] Configuração: Notion Integration Token via `ctx.config`

**STORY-4.3.2 — Plugin RSS/Atom Feed**

> Como usuário, quero assinar feeds RSS e ter novos artigos importados automaticamente para meu acervo.

_Critérios de aceite:_

- [ ] `knowhub-rss-plugin` com trigger `scheduled`: monitora feeds configurados a cada 1h
- [ ] Importa artigos novos como LINK entries automaticamente
- [ ] Configuração: lista de URLs de feeds RSS

**STORY-4.3.3 — Plugin Evernote Importer**

> Como usuário do Evernote, quero importar minhas notas para o KnowHub.

_Critérios de aceite:_

- [ ] `knowhub-evernote-plugin` suporta exportação `.enex` do Evernote
- [ ] Converte notas ENML para texto limpo
- [ ] Preserva tags do Evernote como tags do KnowHub

**Tarefas Técnicas:**

- Implementar os 3 plugins como pacotes npm independentes
- Publicar no npm e no registry
- Criar documentação e exemplos para cada plugin
- Usar como referências de implementação para documentar o SDK

**Dependências:** EPIC-4.1, EPIC-4.2.

**Estimativa:** L (cada plugin: M)

---

## EPIC-4.4 — SDK e Experiência do Desenvolvedor de Plugins

**Objetivo:** Qualquer desenvolvedor consegue criar e testar um plugin do zero em menos de 2 horas com documentação clara e ferramentas de scaffolding.

### Histórias de Usuário

**STORY-4.4.1 — CLI de scaffolding de plugin**

> Como desenvolvedor, quero gerar a estrutura básica de um plugin com um comando para começar a desenvolver sem boilerplate manual.

_Critérios de aceite:_

- [ ] `knowhub plugin create meu-plugin` gera estrutura completa: `src/index.ts`, `package.json`, `README.md`, testes
- [ ] Template inclui exemplo de `IContentLoader` e `IPluginAction`
- [ ] `pnpm dev:plugin` no template detecta mudanças e reinicia o plugin automaticamente em modo desenvolvimento

**STORY-4.4.2 — Documentação e exemplos interativos**

> Como desenvolvedor, quero documentação completa com exemplos de código que posso executar para entender a API de plugins.

_Critérios de aceite:_

- [ ] Guia "Crie seu primeiro plugin em 30 minutos" na documentação
- [ ] Referência completa da `PluginContext` API com JSDoc e exemplos
- [ ] Repositório de plugins de exemplo (`knowhub-ai/plugin-examples`) com 5+ exemplos comentados

**STORY-4.4.3 — Plugin Tester — utilitário de teste**

> Como desenvolvedor de plugin, quero testar meu plugin localmente sem precisar de uma instalação completa do KnowHub.

_Critérios de aceite:_

- [ ] `@knowhub/plugin-tester` expõe `createTestContext()` que retorna um `PluginContext` mock com banco em memória
- [ ] Permite testar `canLoad()`, `load()` e `execute()` com dados controlados
- [ ] Integração com Jest documentada com exemplos

**Tarefas Técnicas:**

- Criar template de scaffolding para `knowhub plugin create`
- Criar pacote `@knowhub/plugin-tester` com `createTestContext()`
- Criar repositório `plugin-examples` com 5 exemplos
- Escrever documentação completa da Plugin API
- Criar guia "Hello World Plugin" passo a passo

**Dependências:** EPIC-4.1, EPIC-4.2.

**Estimativa:** L

---

## Resumo por Fase

| Fase                                | Épicos | Histó­rias | Estimativa Total |
| ----------------------------------- | ------ | ---------- | ---------------- |
| **Fase 0 — Fundação**               | 4      | 16         | ~3 semanas       |
| **Fase 1 — MVP Essencial**          | 8      | 38         | ~6 semanas       |
| **Fase 2 — Conexões e Agentes**     | 7      | 28         | ~8 semanas       |
| **Fase 3 — Experiência e Alcance**  | 5      | 17         | ~6 semanas       |
| **Fase 4 — Ecossistema de Plugins** | 4      | 14         | ~8 semanas       |
| **Total**                           | **28** | **113**    | **~31 semanas**  |

---

## Mapa de Dependências Entre Épicos

```
EPIC-0.1 ──► EPIC-0.2
EPIC-0.1 ──► EPIC-0.3
EPIC-0.3 ──► EPIC-1.1
EPIC-1.1 ──► EPIC-1.2 ──► EPIC-1.3 ──► EPIC-1.4 ──► EPIC-1.5
                                                           │
EPIC-1.6 ◄──────────────────────────────────────────────┘
EPIC-1.7 ◄── EPIC-1.2, 1.3, 1.5
EPIC-1.8 ◄── EPIC-1.1
EPIC-1.4 ──► EPIC-2.1 ──► EPIC-2.2
EPIC-2.1 ──► EPIC-2.3 ──► EPIC-2.4
EPIC-1.3 ──► EPIC-2.5 (GitHub Loader)
EPIC-1.3 ──► EPIC-2.6 (Telegram Loader)
EPIC-1.6 ──► EPIC-2.7 (E2E tests)
EPIC-1.1 ──► EPIC-3.1 ──► EPIC-3.2
EPIC-1.3 ──► EPIC-3.3 (Extensão)
EPIC-1.4 ──► EPIC-3.4 (Modo Híbrido)
EPIC-1.6 ──► EPIC-3.5 (i18n)
EPIC-1.3 ──► EPIC-4.1 ──► EPIC-4.2 ──► EPIC-4.3
EPIC-4.1 ──► EPIC-4.4
```

---

## Critérios para Criação de PRD.md por Épico

Cada épico identificado neste documento deve gerar um arquivo `PRD-{ID}.md` com a seguinte estrutura mínima:

1. **Contexto e motivação** — Por que estamos construindo isso? Qual problema resolve?
2. **Escopo detalhado** — O que está incluído e explicitamente excluído
3. **Histórias de usuário expandidas** — Com mockups ou wireframes se aplicável
4. **Contratos de API** — Endpoints, DTOs, eventos WebSocket
5. **Modelo de dados** — Tabelas afetadas, novos campos, migrations
6. **Diagrama de fluxo** — Sequência de chamadas e estados
7. **Decisões de design** — ADRs específicas do épico
8. **Estratégia de testes** — Unit, integration, E2E, snapshot
9. **Critérios de aceite técnicos** — Lista verificável para o desenvolvedor
10. **Definição de "Done"** — Condições para fechar o épico

> ⚠️ **Nota:** Épicos marcados como XL devem ser subdivididos em sub-épicos no PRD antes do início do desenvolvimento. Nenhuma sprint deve conter mais de um épico XL simultaneamente.

---

_KnowHub AI Assistant · Épicos e Histórias v1.0 · Glaucia Lemos · Open Source · MIT License · 2026_
