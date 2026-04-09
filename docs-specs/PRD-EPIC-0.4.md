# PRD — EPIC-0.4: Governança e Documentação Open Source

**KnowHub AI Assistant** · Glaucia Lemos
Versão 1.0 · Março 2026 · Projeto Open Source · Licença MIT

---

## Índice

1. [Contexto e Motivação](#1-contexto-e-motivação)
2. [Objetivo do Épico](#2-objetivo-do-épico)
3. [Conexão com a Visão do Produto](#3-conexão-com-a-visão-do-produto)
4. [Escopo](#4-escopo)
5. [Arquitetura da Documentação Open Source](#5-arquitetura-da-documentação-open-source)
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

O KnowHub AI Assistant nasce como um projeto open source. Isso não é apenas uma declaração técnica — é uma promessa de comunidade. A missão de "democratizar o acesso a um gerenciador de conhecimento com IA" só se realiza plenamente quando desenvolvedores externos conseguem entender o projeto, confiar nele, contribuir com ele e usá-lo livremente.

Projetos técnicos excepcionais falham como projetos open source quando não comunicam claramente sua proposta, quando não explicam como contribuir, quando intimidam novos colaboradores com processos opacos ou quando permitem que issues e PRs se acumulem sem gestão. A documentação de governança não é burocracia — é a interface entre o código e a comunidade.

Sem a documentação deste épico:

- Um desenvolvedor que chega ao repositório pelo GitHub não entende em 2 minutos o que é o KnowHub, para quem é, como instalar ou como contribuir
- Um contribuidor motivado não sabe qual convenção de commits usar, como estruturar um PR ou onde começar para sua primeira contribuição
- Um usuário com bug não sabe como reportar de forma clara e padronizada
- Um pesquisador de segurança não sabe como reportar uma vulnerabilidade sem expô-la publicamente
- Uma empresa que avalia o projeto como dependência não encontra a licença claramente declarada
- O projeto parece abandonado ou imaturo — mesmo que o código seja de alta qualidade

### 1.2 O problema que este épico resolve

| Problema sem o épico                                                      | Solução entregue pelo épico                                           |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Visitante do repositório não entende o produto em 2 minutos               | README completo com visão, instalação, uso e stack em inglês          |
| Contribuidor não sabe como criar branches, fazer commits ou abrir PRs     | `CONTRIBUTING.md` com fluxo completo e convenção Conventional Commits |
| Issues mal reportadas tomam tempo de triagem e são difíceis de reproduzir | Templates de issue guiam o reporter com campos obrigatórios           |
| PRs chegam sem contexto, sem testes e sem link para a issue               | Template de PR com checklist obrigatório                              |
| Novo contribuidor se sente perdido sem saber por onde começar             | Seção "Good First Issues" + 10+ issues iniciais rotuladas             |
| Vulnerabilidade de segurança reportada publicamente em issue              | `SECURITY.md` com processo de responsible disclosure                  |
| Empresa não pode adotar o projeto sem licença clara                       | `LICENSE` MIT com nome e ano corretos na raiz                         |
| Comportamento inadequado de membros na comunidade sem consequências       | `CODE_OF_CONDUCT.md` com Contributor Covenant v2.1                    |
| Badge de CI ausente — projeto parece sem qualidade                        | Badges de CI, licença, versão e estrelas no topo do README            |

### 1.3 Alinhamento com os princípios do produto

> **"Open Source como cultura: documentação, código e roadmap são públicos e abertos a contribuições da comunidade."**
> — Especificação Não-Técnica, Seção 2 (Princípios Guia)

Open source como cultura significa que a documentação de governança é tão importante quanto o código. Um projeto com código excelente mas documentação pobre não é genuinamente aberto — apenas teoricamente. Este épico concretiza o princípio de open source transformando a intenção em realidade operacional.

> **"Contribuições são bem-vindas: o projeto é aberto a PRs, issues e discussões desde o primeiro dia."**
> — Especificação Não-Técnica, Seção 2 (Princípios Guia)

"Desde o primeiro dia" implica que a infraestrutura de recepção a contribuidores precisa existir antes das primeiras contribuições chegarem — não depois. O EPIC-0.4 instala essa infraestrutura.

---

## 2. Objetivo do Épico

> **Qualquer desenvolvedor que chegue ao repositório do KnowHub encontre, em menos de 2 minutos, tudo que precisa para entender o produto, instalar localmente e fazer sua primeira contribuição — sem precisar perguntar nada a nenhum mantenedor.**

Este épico entrega quatro sistemas complementares:

1. **README bilíngue e completo** — cartão de visita do projeto com todas as seções necessárias para a decisão de usar e contribuir
2. **Guia de contribuição** — processo end-to-end de como contribuir, desde o setup local até o PR mergeado
3. **Templates de issues e PRs** — formulários que estruturam o fluxo de reportes e contribuições
4. **Documentos legais e de governança** — licença, código de conduta, política de segurança e atribuições

---

## 3. Conexão com a Visão do Produto

O KnowHub AI Assistant tem como missão:

> _"Democratizar o acesso a um gerenciador de conhecimento com IA, poderoso para desenvolvedores e acessível para qualquer pessoa."_

A palavra "democratizar" implica acessibilidade — não apenas do produto final, mas de todo o processo de desenvolvimento. Um projeto open source que atinge sua missão de democratizar precisa, ele próprio, ser democraticamente acessível como projeto.

| Princípio do Produto               | Como o épico o sustenta                                                                                                           |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Acessível para qualquer pessoa** | README em inglês (principal) + português (comunidade local); instalação por copy-paste; seção "Good First Issues" para iniciantes |
| **Open Source como cultura**       | `CONTRIBUTING.md` detalha o processo; `CODE_OF_CONDUCT.md` define as regras de convivência; templates estruturam a colaboração    |
| **Privacidade inegociável**        | README explica o modelo local-first com clareza; `SECURITY.md` garante que vulnerabilidades são tratadas com responsabilidade     |
| **Extensível e contribuível**      | 10+ issues iniciais rotuladas criam pontos de entrada concretos para contribuidores                                               |
| **Transparência**                  | Roadmap resumido no README mostra direção futura; licença MIT garante uso e modificação livres                                    |

---

## 4. Escopo

### 4.1 Dentro do Escopo — MVP deste Épico

- `README.md` na raiz com todas as seções especificadas (inglês como idioma principal)
- `README.pt-BR.md` na raiz como versão traduzida para português
- `CONTRIBUTING.md` na raiz com processo completo de contribuição (inglês)
- `CODE_OF_CONDUCT.md` na raiz com Contributor Covenant v2.1 (inglês)
- `SECURITY.md` na raiz com processo de responsible disclosure (inglês)
- `LICENSE` na raiz com MIT License com nome e ano corretos
- `.github/ISSUE_TEMPLATE/bug_report.yml` — template YAML para bugs
- `.github/ISSUE_TEMPLATE/feature_request.yml` — template YAML para features
- `.github/ISSUE_TEMPLATE/good_first_issue.yml` — template YAML para novatos
- `.github/ISSUE_TEMPLATE/config.yml` — configuração de templates de issue
- `.github/PULL_REQUEST_TEMPLATE.md` — template de PR
- 10+ issues iniciais criadas no repositório cobrindo a Fase 1, com labels corretas

### 4.2 Fora do Escopo — Este Épico

| Item                                                       | Onde será tratado              |
| ---------------------------------------------------------- | ------------------------------ |
| Estrutura do monorepo e tooling                            | EPIC-0.1                       |
| Pipelines de CI/CD                                         | EPIC-0.2                       |
| Ambiente de desenvolvimento local (Docker, banco de dados) | EPIC-0.3                       |
| Site de documentação (Docusaurus, Nextra, etc.)            | Épico futuro                   |
| Changelog automático                                       | EPIC-0.2 (pipeline de release) |
| Wiki do GitHub                                             | Épico futuro                   |
| Tradução completa da documentação técnica                  | Épico futuro                   |
| Guias de arquitetura e ADRs                                | Épico futuro                   |

---

## 5. Arquitetura da Documentação Open Source

### 5.1 Estrutura de Arquivos

```
knowhub/
├── README.md                          # Documento principal (inglês)
├── README.pt-BR.md                    # Versão em português
├── CONTRIBUTING.md                    # Guia de contribuição (inglês)
├── CODE_OF_CONDUCT.md                 # Código de conduta (inglês)
├── SECURITY.md                        # Política de segurança (inglês)
├── LICENSE                            # MIT License
│
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.yml             # Template de bug report
    │   ├── feature_request.yml        # Template de feature request
    │   ├── good_first_issue.yml       # Template para novos contribuidores
    │   └── config.yml                 # Configuração de templates (desabilita issues em branco)
    │
    └── PULL_REQUEST_TEMPLATE.md       # Template de PR
```

### 5.2 Hierarquia e Fluxo de Leitura

```
Visitante chega ao repositório
         │
         ▼
    README.md ──── cartão de visita do projeto
         │
         ├─► Quer instalar? ────────────► Seção "Quick Start" no README
         │
         ├─► Quer contribuir? ──────────► Link para CONTRIBUTING.md
         │                                    │
         │                               ├─► Setup local
         │                               ├─► Convenção de commits
         │                               ├─► Fluxo de PR
         │                               └─► Good First Issues
         │
         ├─► Quer reportar bug? ────────► .github/ISSUE_TEMPLATE/bug_report.yml
         │
         ├─► Quer sugerir feature? ─────► .github/ISSUE_TEMPLATE/feature_request.yml
         │
         ├─► Quer abrir PR? ────────────► .github/PULL_REQUEST_TEMPLATE.md
         │
         ├─► Tem dúvida de licença? ────► LICENSE
         │
         └─► Encontrou vulnerabilidade? ─► SECURITY.md
```

### 5.3 Idioma e Internacionalização

O projeto KnowHub adota o **inglês como idioma principal** de toda documentação oficial. Isso garante:

- Alcance máximo da comunidade open source global
- Consistência entre código (em inglês), documentação técnica (em inglês) e documentação de comunidade
- Alinhamento com as convenções do ecossistema npm/Node.js/GitHub

O **português** é mantido como idioma secundário com `README.pt-BR.md` para atender a comunidade local brasileira. Documentos de governança (CONTRIBUTING, CODE_OF_CONDUCT, SECURITY) permanecem apenas em inglês, pois a comunidade open source global lê inglês — e manter duas versões sincronizadas desses documentos representa uma carga de manutenção maior que o benefício.

| Documento               | Idioma Principal | Versão em Português                          |
| ----------------------- | ---------------- | -------------------------------------------- |
| `README.md`             | Inglês           | `README.pt-BR.md` (link no topo)             |
| `CONTRIBUTING.md`       | Inglês           | Não (links de referência no README.pt-BR.md) |
| `CODE_OF_CONDUCT.md`    | Inglês           | Não                                          |
| `SECURITY.md`           | Inglês           | Não                                          |
| Issue/PR templates      | Inglês           | Não                                          |
| Issues iniciais criadas | Português        | Não (audiência local no início)              |

---

## 6. Histórias de Usuário e Critérios de Aceite

---

### STORY-0.4.1 — README completo

> **Como pessoa interessada no projeto, quero entender em 2 minutos o que é o KnowHub, como instalar, como usar e como contribuir.**

**Contexto:** O README é o único documento que recebe 100% dos visitantes do repositório. É a primeira — e frequentemente única — oportunidade de comunicar o valor do produto, estabelecer credibilidade técnica e converter um visitante em usuário ou contribuidor. Um README fraco afasta desenvolvedores experientes (que esperam badges de CI, instruções claras e stack declarada) e confunde usuários iniciantes (que precisam de passos concretos). O README deve funcionar em duas velocidades: uma leitura de 30 segundos (título + badges + descrição + GIF) que convence a continuar, e uma leitura de 5 minutos que transforma o visitante em usuário ativo.

A observação da especificação é clara: o README deve ser o mais completo possível, servindo como ponto de entrada para o projeto, com links para documentação detalhada quando necessário. Deve ser em inglês como idioma principal, com link para versão em português.

**Critérios de Aceite:**

- [ ] README está em inglês como idioma principal
- [ ] Primeira linha do README tem link para `README.pt-BR.md` (versão em português)
- [ ] Seção de badges no topo inclui (na ordem): CI status, licença MIT, versão npm (quando publicado), Node.js versão mínima
- [ ] Seção **Product Vision** (≤ 5 linhas) explica o que é o KnowHub, para quem é e qual problema resolve
- [ ] Seção **Demo** existe com placeholder informando que screenshots/GIF serão adicionados quando o produto estiver em estágio de desenvolvimento avançado — não omitida, não deixada vazia sem contexto
- [ ] Seção **Quick Start** contém comandos funcionais copiáveis que permitem ter o projeto rodando localmente:
  - Pré-requisitos listados (Node.js 22+, Docker, Git)
  - `git clone` + `npm install` + `npm run env:setup` + `docker compose up -d` + `npm run dev`
  - Endereços de acesso: `http://localhost:3000` (Web) e `http://localhost:3001` (API)
- [ ] Seção **Basic Usage** com exemplos de uso da CLI e da interface web (pode ser placeholder inicial, expandido quando funcionalidades existirem)
- [ ] Seção **Tech Stack** lista tecnologias com links oficiais: NestJS, Next.js, TypeScript, DrizzleORM, SQLite, Redis/Valkey, Ollama, Turborepo
- [ ] Seção **Roadmap** com resumo das fases do projeto (Phase 0: Infrastructure, Phase 1: Core Features, etc.) — sem datas
- [ ] Seção **Contributing** com 3–5 linhas e link para `CONTRIBUTING.md`
- [ ] Seção **License** declara MIT com link para arquivo `LICENSE`
- [ ] Todos os comandos da seção "Quick Start" são testados e funcionam em ambiente limpo
- [ ] README.pt-BR.md é tradução fiel do README.md principal, com as mesmas seções na mesma ordem

**Exemplo de estrutura do README:**

```markdown
<!-- README.md -->

> 🇧🇷 Leia em [Português](README.pt-BR.md)

<div align="center">
  <h1>KnowHub AI Assistant</h1>
  <p>A local-first AI-powered knowledge manager for developers</p>

[![CI](https://github.com/glaucia86/knowhub/actions/workflows/ci.yml/badge.svg)](https://github.com/glaucia86/knowhub/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org/)

</div>

## What is KnowHub?

## Demo

## Quick Start

## Basic Usage

## Tech Stack

## Roadmap

## Contributing

## License
```

---

### STORY-0.4.2 — Guia de contribuição

> **Como desenvolvedor que quer contribuir, quero entender exatamente como fazer isso: branches, commits, PRs, code review e deploy.**

**Contexto:** O `CONTRIBUTING.md` é o manual de integração da comunidade. Ele transforma a intenção de contribuir em ação concreta. Um guia de contribuição ruim tem dois extremos igualmente problemáticos: muito curto (não responde as dúvidas básicas) ou muito longo (ninguém lê até o fim). A estratégia é cobrir os cenários que geram 80% das dúvidas com clareza e brevidade, usando exemplos concretos em vez de descrições abstratas.

A convenção de commits adotada é **Conventional Commits** — compatível com o pipeline de release automático (EPIC-0.2) que gera o CHANGELOG. Desvios dessa convenção seriam detectados pelo CI (commitlint) e resultariam em build reprovado.

**Critérios de Aceite:**

- [ ] `CONTRIBUTING.md` está na raiz do repositório, em inglês
- [ ] Seção **Development Setup** cobre:
  - Pré-requisitos com versões mínimas (Node.js 22+, Docker, Git)
  - Passos de fork + clone + install + setup do `.env` + start do Docker + `npm run dev`
  - Verificação de que o ambiente está funcionando (`curl http://localhost:3001/health`)
- [ ] Seção **Commit Convention** documenta Conventional Commits com exemplos reais do projeto:
  - `feat(api): add knowledge entry creation endpoint`
  - `fix(web): resolve hydration error on knowledge list`
  - `docs: update README quick start section`
  - `chore(deps): update drizzle-orm to v0.38`
  - `test(api): add unit tests for IndexingAgent`
  - `refactor(shared-types): rename KnowledgeEntry to Entry`
  - Breaking change: `feat(api)!: change authentication to JWT-only`
- [ ] Seção **Branch Convention** define o padrão de nomenclatura:
  - `feat/<issue-number>-short-description`
  - `fix/<issue-number>-short-description`
  - `docs/<description>`
  - `chore/<description>`
- [ ] Seção **Pull Request Flow** cobre:
  - Fork → branch → commits → PR draft → self-review → ready for review
  - Como linkar a issue (`Closes #123` no corpo do PR)
  - Processo de code review: tempo de resposta esperado, o que esperar dos revisores
  - Como lidar com pedidos de alteração (commits adicionais, não amend+force)
  - Condições para merge (CI verde, pelo menos 1 aprovação, branch atualizado)
- [ ] Seção **Issue Labels** explica os labels do repositório e seu significado:
  - `bug` — comportamento incorreto confirmado
  - `feature` — nova funcionalidade
  - `good first issue` — adequado para contribuidores iniciantes
  - `help wanted` — issue aberta a contribuição externa
  - `documentation` — relacionado a docs
  - `dependencies` — atualização de dependências
  - `blocked` — aguardando outra issue ou decisão
  - `wontfix` — não será corrigido/implementado
- [ ] Seção **Good First Issues** explica:
  - O que são e por que existem
  - Como encontrá-las (link para filtro de labels no GitHub)
  - O que fazer quando você quer trabalhar em uma (comentar na issue para ser atribuída)
  - Expectativas de prazo e processo
- [ ] `CODE_OF_CONDUCT.md` criado com **Contributor Covenant v2.1** completo, em inglês
  - Inclui seção de enforcement com e-mail de contato (`conduct@knowhub.dev` ou e-mail da mantenedora)
- [ ] `SECURITY.md` criado com:
  - Declaração clara de que vulnerabilidades **não devem ser reportadas via issue pública**
  - Processo de responsible disclosure: e-mail privado ou GitHub Private Vulnerability Reporting
  - Tempo de resposta esperado (ex: ACK em 48h, prazo de 90 dias para fix antes de disclosure público)
  - Versões suportadas com patches de segurança (tabela de versões)
  - Tipos de vulnerabilidades que estão em escopo

**Exemplo de seção de commits do CONTRIBUTING.md:**

```markdown
## Commit Convention

This project follows [Conventional Commits](https://conventionalcommits.org/).
The CI pipeline enforces this convention via commitlint.

### Format
```

<type>(<scope>): <description>

[optional body]

[optional footer(s)]

```

### Types

| Type | When to use |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `chore` | Maintenance tasks (deps, config, tooling) |
| `test` | Adding or updating tests |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `ci` | Changes to CI/CD configuration |

### Scopes

Use the workspace name: `api`, `web`, `cli`, `shared-types`, `shared-utils`.
Omit scope for project-wide changes.
```

---

### STORY-0.4.3 — Templates de issues e PRs

> **Como usuário ou contribuidor, quero ter templates que me guiem ao abrir issues ou PRs para facilitar o entendimento dos mantenedores.**

**Contexto:** Issues mal estruturadas são um dos principais problemas de escala em projetos open source. Um bug reportado sem steps de reprodução, sem ambiente e sem logs esperados pode tomar 1 hora de triagem para extrair informação que o reporter tinha disponível em 5 minutos. Templates de issue resolvem isso na fonte, pedindo proativamente as informações necessárias antes que a issue seja submetida.

O GitHub suporta templates de issue em formato YAML (`.github/ISSUE_TEMPLATE/*.yml`) com campos obrigatórios, checkboxes, dropdowns e validação — muito mais poderosos que os antigos templates em Markdown. Este formato é o adotado.

Para PRs, o template em Markdown é o padrão do GitHub e suficiente para as necessidades do projeto.

Um diferencial importante desta story é a criação de **pelo menos 10 issues iniciais** cobrindo a Fase 1 do roadmap, com labels `good first issue`. Isso resolve o problema do "chicken-and-egg" de projetos novos: contribuidores procuram issues para trabalhar, mas nenhuma foi criada ainda.

**Critérios de Aceite:**

- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` criado com campos:
  - **Title** (input, obrigatório)
  - **Description** — Describe the bug (textarea, obrigatório)
  - **Steps to Reproduce** (textarea, obrigatório, com placeholder numerado)
  - **Expected Behavior** (textarea, obrigatório)
  - **Actual Behavior** (textarea, obrigatório)
  - **Environment** (dropdown: Linux / macOS / Windows WSL2 / Windows)
  - **Node.js version** (input)
  - **KnowHub version** (input)
  - **Logs / Stack Trace** (textarea, opcional, com fenced code block pré-preenchido)
  - **Additional context** (textarea, opcional)
  - Label automático: `bug`

- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml` criado com campos:
  - **Title** (input, obrigatório)
  - **Problem to Solve** — What problem does this feature solve? (textarea, obrigatório)
  - **Proposed Solution** (textarea, obrigatório)
  - **Alternatives Considered** (textarea, opcional)
  - **Target User** — Who benefits from this? (dropdown: Developer / End User / Both)
  - **Additional context** (textarea, opcional)
  - Label automático: `feature`

- [ ] `.github/ISSUE_TEMPLATE/good_first_issue.yml` criado com campos pré-preenchidos para uso pelos **mantenedores** ao criar issues adequadas para novatos:
  - **Title** (input, obrigatório)
  - **Context** — Why does this issue exist? (textarea, obrigatório)
  - **Task Description** — What needs to be done? (textarea, obrigatório, com checklist de subtarefas)
  - **Files to Change** — Which files are likely to be modified? (textarea, obrigatório)
  - **Acceptance Criteria** (textarea, obrigatório, em formato de checklist)
  - **Resources** — Links to docs, related code, ADRs (textarea, opcional)
  - Labels automáticos: `good first issue`, `help wanted`

- [ ] `.github/ISSUE_TEMPLATE/config.yml` criado com:
  - `blank_issues_enabled: false` (força uso dos templates)
  - Link para GitHub Discussions como alternativa para perguntas gerais

- [ ] `.github/PULL_REQUEST_TEMPLATE.md` criado com:
  - Seção **Description** — O que esta PR faz?
  - Seção **Type of Change** — checkboxes: `[ ] Bug fix`, `[ ] New feature`, `[ ] Documentation`, `[ ] Refactoring`, `[ ] Chore`
  - Seção **Related Issue** — `Closes #<issue-number>`
  - Seção **How to Test** — passos para o revisor verificar a mudança
  - Seção **Checklist** com itens obrigatórios:
    - `[ ] I have run `npm run lint` and there are no errors`
    - `[ ] I have run `npm run test` and all tests pass`
    - `[ ] I have added/updated tests for the changes I made`
    - `[ ] I have updated documentation if needed`
    - `[ ] The commit message follows the Conventional Commits convention`

- [ ] Pelo menos **10 issues iniciais** criadas no repositório:
  - Cobrem funcionalidades da Fase 1 (EPICs 1.x)
  - Têm título claro, descrição de contexto, critérios de aceite e arquivos sugeridos
  - São rotuladas com `good first issue` e `help wanted` (quando adequado)
  - Têm o template de `good_first_issue` aplicado (todas as seções preenchidas)
  - Estão abertas e disponíveis para atribuição

**Exemplo de estrutura do template de PR:**

```markdown
## Description

<!-- Describe what this PR does and why. Be concise but complete. -->

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Chore (dependency updates, config changes, etc.)

## Related Issue

Closes #<!-- issue number -->

## How to Test

<!-- Step-by-step instructions for the reviewer to verify the changes -->

1.
2.
3.

## Checklist

- [ ] `npm run lint` passes with no errors
- [ ] `npm run test` passes with no failures
- [ ] Tests added or updated for the changes made
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow [Conventional Commits](CONTRIBUTING.md#commit-convention)
```

---

### STORY-0.4.4 — Licença e atribuições

> **Como usuário ou empresa interessada, quero entender claramente os termos de uso do projeto.**

**Contexto:** A licença de um projeto open source é um documento legal com implicações práticas. A ausência de licença é, juridicamente, equivalente a "todos os direitos reservados" — o que impede qualquer uso, modificação ou distribuição. A licença MIT foi escolhida porque maximiza a adoção: permite uso comercial, modificação, distribuição e sublicença, exigindo apenas a manutenção do aviso de copyright.

Para um projeto que almeja crescimento de comunidade, a MIT é a escolha padrão do ecossistema Node.js/npm. Projetas que usam GPL ou licenças mais restritivas frequentemente criam hesitação em empresas e desenvolvedores que querem integrar o projeto em seus sistemas.

**Critérios de Aceite:**

- [ ] Arquivo `LICENSE` existe na raiz com o texto completo da **MIT License**
- [ ] Nome no copyright é `Glaucia Lemos`
- [ ] Ano no copyright é `2025-present` (não apenas um ano fixo — cobre contribuições futuras)
- [ ] Texto da licença está correto e íntegro (sem modificações no texto padrão MIT)
- [ ] README inclui seção **License** com declaração: `Distributed under the MIT License. See [LICENSE](LICENSE) for more information.`
- [ ] Seção no README ou arquivo `NOTICE.md` lista dependências de terceiros críticas e suas licenças (opcional mas recomendado para transparência)
- [ ] Política de CLA (Contributor License Agreement) declarada explicitamente no `CONTRIBUTING.md`: **não obrigatória** para este projeto — contribuidores retêm copyright de suas contribuições e as licenciam sob MIT ao submeter um PR
- [ ] O badge `License: MIT` no README aponta para `https://opensource.org/licenses/MIT`

**Texto padrão do `LICENSE`:**

```
MIT License

Copyright (c) 2025-present Glaucia Lemos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 7. Especificações Técnicas Detalhadas

### 7.1 Estrutura Completa do `README.md`

O README segue a estrutura abaixo com as seções na ordem especificada. O conteúdo de cada seção é expandido conforme o produto evolui — o épico entrega a estrutura completa, com conteúdo de MVP para cada seção.

````markdown
<!-- Topo: language switcher -->

> 🇧🇷 Leia em [Português](README.pt-BR.md)

<!-- Header centralizado com logo, título e tagline -->
<div align="center">
  <h1>KnowHub AI Assistant</h1>
  <p>Your local-first AI-powered second brain for developers</p>
</div>

<!-- Badges em linha -->

[![CI](https://github.com/glaucia86/knowhub/actions/workflows/ci.yml/badge.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](...)
[![Node.js 22+](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](...)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is KnowHub?

KnowHub AI Assistant is a **local-first**, privacy-by-default knowledge manager
powered by AI. It helps developers capture, organize, and retrieve knowledge
from notes, links, PDFs, GitHub issues and more — with semantic search and
AI-generated summaries that never leave your device.

**Key principles:**

- 🔒 **Privacy first** — all AI processing runs locally via Ollama
- 🧠 **Second brain** — semantic connections between your knowledge
- 💻 **Developer-focused** — CLI, REST API, and Web UI
- 🌍 **Open Source** — MIT licensed, community-driven

## Demo

> 🚧 **Screenshots and GIF coming soon** — the product is under active development.
> Follow the [roadmap](#roadmap) to track progress.

## Quick Start

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/glaucia86/knowhub.git
cd knowhub

# 2. Install all workspace dependencies
npm install

# 3. Set up environment variables (generates .env from .env.example)
npm run env:setup

# 4. Start infrastructure services (Redis + Ollama)
docker compose up -d

# 5. Pull AI models (first time only, ~4GB download)
make ollama-pull
# or: docker compose exec ollama ollama pull gemma3:4b

# 6. Start development servers
npm run dev
```
````

Access the app at:

- **Web UI:** http://localhost:3000
- **API:** http://localhost:3001
- **Ollama:** http://localhost:11434

> 💡 On Windows without WSL2, replace `make ollama-pull` with:
> `docker compose exec ollama ollama pull gemma3:4b`

## Basic Usage

> 🚧 Usage examples will be added as features are implemented.
> See [EPIC-1.x issues](https://github.com/glaucia86/knowhub/labels/epic-1) for progress.

## Tech Stack

| Layer      | Technology                                                              | Purpose                |
| ---------- | ----------------------------------------------------------------------- | ---------------------- |
| API        | [NestJS](https://nestjs.com/)                                           | REST API server        |
| Web        | [Next.js 15](https://nextjs.org/)                                       | Frontend (App Router)  |
| CLI        | [Commander.js](https://github.com/tj/commander.js)                      | Terminal interface     |
| Database   | [SQLite](https://sqlite.org/) + [DrizzleORM](https://orm.drizzle.team/) | Local data storage     |
| Cache      | [Redis/Valkey](https://valkey.io/)                                      | Caching layer          |
| AI         | [Ollama](https://ollama.ai/)                                            | Local LLM runtime      |
| LLM        | [Gemma 3 4B](https://ollama.com/library/gemma3)                         | Language model         |
| Embeddings | [nomic-embed-text](https://ollama.com/library/nomic-embed-text)         | Vector embeddings      |
| Monorepo   | [Turborepo](https://turbo.build/) + npm workspaces                      | Build system           |
| Language   | [TypeScript 5](https://www.typescriptlang.org/)                         | Full-stack type safety |

## Roadmap

- **Phase 0 — Infrastructure** ✅ Monorepo, CI/CD, local dev environment, open source governance
- **Phase 1 — Core Features** 🚧 Knowledge ingestion, semantic search, AI Q&A via CLI
- **Phase 2 — Intelligence** 📋 Semantic connections, tagging, summarization
- **Phase 3 — Integrations** 📋 Telegram bot, GitHub issues, PDF ingestion
- **Phase 4 — Polish** 📋 Web UI, multi-user support, cloud sync (opt-in)

## Contributing

Contributions are welcome and appreciated! 🎉

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for:

- How to set up the development environment
- Commit message conventions (Conventional Commits)
- How to submit a Pull Request
- Where to start as a first-time contributor ([Good First Issues](https://github.com/glaucia86/knowhub/labels/good%20first%20issue))

By contributing, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

````

### 7.2 Estrutura Completa do `CONTRIBUTING.md`

```markdown
# Contributing to KnowHub AI Assistant

Thank you for your interest in contributing to KnowHub! This guide explains
everything you need to know to make your first (or tenth) contribution.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Commit Convention](#commit-convention)
4. [Branch Convention](#branch-convention)
5. [Pull Request Flow](#pull-request-flow)
6. [Issue Labels](#issue-labels)
7. [Good First Issues](#good-first-issues)
8. [Code Style](#code-style)
9. [Testing](#testing)
10. [License and CLA](#license-and-cla)

---

## Development Setup

### Prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| Node.js | 22.x LTS | [nodejs.org](https://nodejs.org/) |
| Docker Desktop | 24+ | [docs.docker.com](https://docs.docker.com/get-docker/) |
| Git | any | [git-scm.com](https://git-scm.com/) |

### Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/knowhub.git
cd knowhub

# 2. Add the upstream remote
git remote add upstream https://github.com/glaucia86/knowhub.git

# 3. Install all workspace dependencies
npm install

# 4. Set up environment variables
npm run env:setup

# 5. Start infrastructure services
docker compose up -d

# 6. Start development servers
npm run dev

# 7. Verify everything works
curl http://localhost:3001/health
# Expected: {"status":"ok"}
````

---

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

...

## Branch Convention

...

## Pull Request Flow

...

## Issue Labels

...

## Good First Issues

Looking for a place to start? Issues labeled [`good first issue`](https://github.com/glaucia86/knowhub/labels/good%20first%20issue) are specifically curated for contributors making their first contribution.

**How to pick up an issue:**

1. Find an issue that interests you
2. Comment on the issue: "I'd like to work on this"
3. Wait for a maintainer to assign it to you (usually within 24 hours)
4. Fork, branch, code, and open a PR!

If you have a question about an issue, ask it directly in the issue comments — the maintainers are happy to help.

---

## License and CLA

By submitting a Pull Request, you agree that your contribution is licensed under
the MIT License. **No Contributor License Agreement (CLA) is required** — you
retain copyright of your contributions.

````

### 7.3 Estrutura do `CODE_OF_CONDUCT.md`

Utilizará o texto oficial do **Contributor Covenant v2.1**, disponível em [contributor-covenant.org/version/2/1/code_of_conduct/](https://www.contributor-covenant.org/version/2/1/code_of_conduct/), com as seguintes customizações:

- **E-mail de enforcement** preenchido com o e-mail de contato da mantenedora
- **Enforcement guidelines** completas (as 4 etapas: Correction, Warning, Temporary Ban, Permanent Ban)
- Sem modificações no texto normativo — apenas os campos de contato preenchidos

### 7.4 Estrutura do `SECURITY.md`

```markdown
# Security Policy

## Supported Versions

| Version | Supported |
| --- | --- |
| main (latest) | ✅ |
| older branches | ❌ |

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

To report a security vulnerability, use one of these channels:

1. **GitHub Private Vulnerability Reporting** (preferred):
   Go to [Security → Report a vulnerability](../../security/advisories/new)

2. **Email:** Send details to `security@knowhub.dev`

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

### Response timeline

- **Acknowledgment:** Within 48 hours
- **Status update:** Within 7 days
- **Fix or mitigation:** Within 90 days (or we coordinate a disclosure date)

We follow responsible disclosure: we will not publicly disclose the details
until a fix is available, and we will credit the reporter (unless they prefer
to remain anonymous).
````

### 7.5 Template de Bug Report (`.github/ISSUE_TEMPLATE/bug_report.yml`)

```yaml
name: Bug Report
description: Report a bug or unexpected behavior in KnowHub
title: '[Bug]: '
labels: ['bug']
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug! Please fill out all required fields.

  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: 'When I do X, Y happens instead of Z.'
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce
      description: Step-by-step instructions to reproduce the bug.
      placeholder: |
        1. Start the API with `npm run dev`
        2. Open http://localhost:3000
        3. Click on '...'
        4. See error
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: What did you expect to happen?
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior
      description: What actually happened?
    validations:
      required: true

  - type: dropdown
    id: os
    attributes:
      label: Operating System
      options:
        - Linux
        - macOS (Apple Silicon)
        - macOS (Intel)
        - Windows (WSL2)
        - Windows (native)
    validations:
      required: true

  - type: input
    id: node-version
    attributes:
      label: Node.js Version
      placeholder: 'e.g. 22.11.0 (run: node --version)'

  - type: input
    id: knowhub-version
    attributes:
      label: KnowHub Version / Commit SHA
      placeholder: 'e.g. v0.1.0 or commit abc1234'

  - type: textarea
    id: logs
    attributes:
      label: Relevant Logs or Stack Trace
      description: Paste any relevant logs here (optional but very helpful)
      render: shell

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Any other context, screenshots, or information.
```

### 7.6 Template de Feature Request (`.github/ISSUE_TEMPLATE/feature_request.yml`)

```yaml
name: Feature Request
description: Suggest a new feature or enhancement for KnowHub
title: '[Feature]: '
labels: ['feature']
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a feature! Please describe the problem you want to solve,
        not just the solution — this helps us understand the need better.

  - type: textarea
    id: problem
    attributes:
      label: Problem to Solve
      description: What problem does this feature solve? Who is affected?
      placeholder: 'As a developer, I find it difficult to... because...'
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: Proposed Solution
      description: Describe the solution you'd like to see.
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: Alternatives Considered
      description: What other approaches did you consider? Why did you choose this one?

  - type: dropdown
    id: target-user
    attributes:
      label: Target User
      options:
        - Developer (building on top of KnowHub)
        - End User (using KnowHub to manage knowledge)
        - Both
    validations:
      required: true

  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Mockups, related issues, references, etc.
```

### 7.7 Template de Good First Issue (`.github/ISSUE_TEMPLATE/good_first_issue.yml`)

```yaml
name: Good First Issue
description: A curated issue for first-time contributors (used by maintainers)
title: '[Good First Issue]: '
labels: ['good first issue', 'help wanted']
body:
  - type: markdown
    attributes:
      value: |
        👋 This issue is specifically curated for first-time contributors.
        All the context you need to get started is provided below.

  - type: textarea
    id: context
    attributes:
      label: Context
      description: Why does this issue exist? What problem does it solve?
    validations:
      required: true

  - type: textarea
    id: task
    attributes:
      label: Task Description
      description: Exactly what needs to be done, with subtasks if applicable.
      placeholder: |
        - [ ] Subtask 1
        - [ ] Subtask 2
        - [ ] Subtask 3
    validations:
      required: true

  - type: textarea
    id: files
    attributes:
      label: Files to Change
      description: Which files are likely to be modified?
      placeholder: |
        - `apps/api/src/...`
        - `packages/shared-types/src/...`
    validations:
      required: true

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: How do we know this issue is done?
      placeholder: |
        - [ ] Criterion 1
        - [ ] Criterion 2
        - [ ] Tests pass (`npm run test`)
        - [ ] Lint passes (`npm run lint`)
    validations:
      required: true

  - type: textarea
    id: resources
    attributes:
      label: Resources
      description: Links to relevant documentation, ADRs, related code, or examples.
```

### 7.8 Configuração de Templates (`.github/ISSUE_TEMPLATE/config.yml`)

```yaml
blank_issues_enabled: false
contact_links:
  - name: GitHub Discussions — Questions & Ideas
    url: https://github.com/glaucia86/knowhub/discussions
    about: For general questions, ideas, or anything that doesn't fit a bug or feature request, use GitHub Discussions.
```

### 7.9 Issues Iniciais (10 mínimo)

As issues iniciais devem ser criadas diretamente no repositório GitHub, usando o template de `good_first_issue`. Cada issue deve cobrir uma tarefa concreta da Fase 1 (EPICs 1.x), ser atribuível a um único contribuidor e não requerer conhecimento amplo da base de código.

**Lista de issues sugeridas:**

| #   | Título                                                                  | Área                    | Labels                                    |
| --- | ----------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| 1   | `[Good First Issue]: Add /health endpoint to NestJS API`                | `apps/api`              | `good first issue`, `help wanted`, `feat` |
| 2   | `[Good First Issue]: Create KnowledgeEntry DTO with class-validator`    | `apps/api`              | `good first issue`, `help wanted`, `feat` |
| 3   | `[Good First Issue]: Add `knowhub add` command to CLI`                  | `apps/cli`              | `good first issue`, `help wanted`, `feat` |
| 4   | `[Good First Issue]: Create shared KnowledgeEntry type in shared-types` | `packages/shared-types` | `good first issue`, `help wanted`, `feat` |
| 5   | `[Good First Issue]: Add `createSlug` utility to shared-utils`          | `packages/shared-utils` | `good first issue`, `help wanted`, `feat` |
| 6   | `[Good First Issue]: Write unit tests for text-splitter utility`        | `packages/shared-utils` | `good first issue`, `help wanted`, `test` |
| 7   | `[Good First Issue]: Add request logging middleware to NestJS API`      | `apps/api`              | `good first issue`, `help wanted`, `feat` |
| 8   | `[Good First Issue]: Create KnowledgeRepository with DrizzleORM`        | `apps/api`              | `good first issue`, `help wanted`, `feat` |
| 9   | `[Good First Issue]: Add `knowhub list` command to CLI`                 | `apps/cli`              | `good first issue`, `help wanted`, `feat` |
| 10  | `[Good First Issue]: Create homepage layout in Next.js (App Router)`    | `apps/web`              | `good first issue`, `help wanted`, `feat` |

Cada issue deve conter:

- **Context:** por que existe, o que pertence a qual épico
- **Task Description:** lista de subtasks com checkboxes
- **Files to Change:** caminhos concretos dos arquivos a criar/modificar
- **Acceptance Criteria:** critérios verificáveis incluindo `npm run test` e `npm run lint`
- **Resources:** links para a especificação técnica, ADRs relevantes e exemplos de código similares já existentes

---

## 8. Definição de Pronto (Definition of Done)

Este épico é considerado **DONE** quando todos os itens abaixo estiverem verificados:

### Entregáveis Obrigatórios

- [ ] `README.md` na raiz com todas as seções documentadas (em inglês)
- [ ] `README.pt-BR.md` na raiz como tradução do README principal
- [ ] Link para `README.pt-BR.md` no topo do `README.md`
- [ ] Badges de CI, licença e Node.js funcionando e exibindo status correto
- [ ] Seção "Quick Start" testada em máquina limpa — comandos funcionam por copy-paste
- [ ] `CONTRIBUTING.md` na raiz com todas as seções especificadas
- [ ] `CODE_OF_CONDUCT.md` com Contributor Covenant v2.1 completo e e-mail de enforcement preenchido
- [ ] `SECURITY.md` com processo de responsible disclosure e canais de contato
- [ ] `LICENSE` com MIT License, nome correto e ano `2025-present`
- [ ] `.github/ISSUE_TEMPLATE/bug_report.yml` funcionando no GitHub (campos renderizados corretamente)
- [ ] `.github/ISSUE_TEMPLATE/feature_request.yml` funcionando no GitHub
- [ ] `.github/ISSUE_TEMPLATE/good_first_issue.yml` funcionando no GitHub
- [ ] `.github/ISSUE_TEMPLATE/config.yml` com `blank_issues_enabled: false`
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` exibido automaticamente ao abrir PR
- [ ] Pelo menos 10 issues criadas no repositório, usando o template correto, rotuladas e abertas para contribuição

### Validações Funcionais

- [ ] Abrir uma nova issue no GitHub → seletor de templates exibe os 3 templates disponíveis (sem opção de issue em branco)
- [ ] Selecionar "Bug Report" → formulário renderiza todos os campos corretamente com validação de obrigatórios
- [ ] Selecionar "Feature Request" → formulário renderiza corretamente
- [ ] Abrir um PR no GitHub → template de PR é exibido automaticamente no corpo
- [ ] Badges do README exibem status correto (CI verde, licença MIT)
- [ ] Link "README.pt-BR.md" no `README.md` funciona (não retorna 404)
- [ ] Seção "Quick Start" — todos os comandos executam sem erro em máquina limpa
- [ ] `CONTRIBUTING.md` — seção de commits tem pelo menos 6 exemplos com escopos do projeto

### Documentação de Governança

- [ ] `CODE_OF_CONDUCT.md` referenciado no `CONTRIBUTING.md`
- [ ] `SECURITY.md` referenciado no README
- [ ] Licença declarada no `package.json` raiz (`"license": "MIT"`)
- [ ] Licença declarada no `package.json` de cada workspace (`"license": "MIT"`)
- [ ] Issues iniciais têm labels corretos e aparecem no filtro `label:good first issue` do repositório

---

## 9. Tarefas Técnicas

### 9.1 README (inglês e português)

| #   | Tarefa                                                            | Estimativa | Responsável |
| --- | ----------------------------------------------------------------- | ---------- | ----------- |
| T1  | Redigir `README.md` completo com todas as seções (inglês)         | 3h         | Dev         |
| T2  | Configurar badges: CI, licença, Node.js versão, PRs Welcome       | 30min      | Dev         |
| T3  | Testar todos os comandos da seção "Quick Start" em ambiente limpo | 1h         | Dev         |
| T4  | Traduzir `README.md` para `README.pt-BR.md`                       | 1h         | Dev         |
| T5  | Adicionar link de language switcher no topo do `README.md`        | 15min      | Dev         |

### 9.2 Guia de Contribuição e Código de Conduta

| #   | Tarefa                                                      | Estimativa | Responsável |
| --- | ----------------------------------------------------------- | ---------- | ----------- |
| T6  | Redigir `CONTRIBUTING.md` com todas as seções especificadas | 3h         | Dev         |
| T7  | Criar `CODE_OF_CONDUCT.md` com Contributor Covenant v2.1    | 30min      | Dev         |
| T8  | Criar `SECURITY.md` com processo de responsible disclosure  | 1h         | Dev         |
| T9  | Verificar e-mail de enforcement no `CODE_OF_CONDUCT.md`     | 15min      | Dev         |

### 9.3 Templates de Issues e PRs

| #   | Tarefa                                                                             | Estimativa | Responsável |
| --- | ---------------------------------------------------------------------------------- | ---------- | ----------- |
| T10 | Criar `.github/ISSUE_TEMPLATE/bug_report.yml`                                      | 45min      | Dev         |
| T11 | Criar `.github/ISSUE_TEMPLATE/feature_request.yml`                                 | 30min      | Dev         |
| T12 | Criar `.github/ISSUE_TEMPLATE/good_first_issue.yml`                                | 30min      | Dev         |
| T13 | Criar `.github/ISSUE_TEMPLATE/config.yml` com `blank_issues_enabled: false`        | 15min      | Dev         |
| T14 | Criar `.github/PULL_REQUEST_TEMPLATE.md`                                           | 30min      | Dev         |
| T15 | Testar templates de issue no GitHub (abrir issue de teste, verificar renderização) | 30min      | Dev         |
| T16 | Testar template de PR no GitHub (abrir PR de teste)                                | 15min      | Dev         |

### 9.4 Licença e Atribuições

| #   | Tarefa                                                                | Estimativa | Responsável |
| --- | --------------------------------------------------------------------- | ---------- | ----------- |
| T17 | Verificar/criar `LICENSE` (MIT, nome e ano corretos)                  | 15min      | Dev         |
| T18 | Adicionar `"license": "MIT"` ao `package.json` de todos os workspaces | 15min      | Dev         |
| T19 | Criar seção `License` no README com link para o arquivo               | 15min      | Dev         |

### 9.5 Issues Iniciais

| #   | Tarefa                                                                                                                                                      | Estimativa | Responsável |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------- |
| T20 | Criar labels no repositório: `good first issue`, `help wanted`, `bug`, `feature`, `documentation`, `dependencies`, `blocked`, `wontfix`, `epic-1`, `epic-2` | 30min      | Dev         |
| T21 | Criar 10+ issues iniciais usando o template de `good_first_issue`                                                                                           | 3h         | Dev         |
| T22 | Revisar issues criadas: contexto claro, critérios de aceite verificáveis, arquivos concretos                                                                | 1h         | Dev         |

---

## 10. Dependências

### 10.1 Dependências Internas

| Épico                                      | O que é necessário                                                                         | Impacto se ausente                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **EPIC-0.1** (recomendado, não bloqueante) | Estrutura do monorepo para que os comandos da seção "Quick Start" do README sejam precisos | README pode ter seção de Quick Start baseada na especificação esperada, ajustada após EPIC-0.1 completar |
| **EPIC-0.2** (recomendado, não bloqueante) | Badge de CI exige que o workflow `ci.yml` exista e esteja rodando                          | Badge de CI pode ser adicionada após EPIC-0.2 ou com placeholder "pending"                               |
| **EPIC-0.3** (recomendado, não bloqueante) | Comandos de Docker Compose no Quick Start dependem do `docker-compose.yml` existir         | Quick Start pode referenciar o arquivo esperado, a ser criado no EPIC-0.3                                |

> **Nota importante da spec-0.4:** A especificação original declara **"Dependências: Nenhuma (pode ser feito em paralelo com EPIC-0.1)"**. Isso significa que o EPIC-0.4 pode ser iniciado imediatamente, sem aguardar outros épicos. As seções do README que fazem referência a artefatos de outros épicos (docker-compose.yml, CI badge) podem ser escritas com base na especificação do que será entregue, sendo ajustadas quando os artefatos existirem.

### 10.2 Dependências de Ferramentas Externas

| Ferramenta/Serviço          | Propósito                                                    | Observação                                         |
| --------------------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| GitHub repository ativo     | Testar templates de issue/PR e criar issues iniciais         | Repositório deve estar no GitHub e acessível       |
| GitHub Actions CI rodando   | Badge de CI no README                                        | Badge URL depende do workflow `ci.yml` do EPIC-0.2 |
| Conta GitHub da mantenedora | Criar labels e issues iniciais com privilégio de mantenedora | Sem dependência técnica adicional                  |

### 10.3 Ordem de Implementação Recomendada

```
Fase 1 (Independente — pode iniciar imediatamente):
  LICENSE ─────────────── verificação/criação imediata
  CODE_OF_CONDUCT.md ──── texto padrão, sem dependências
  SECURITY.md ─────────── conteúdo independente
  ISSUE_TEMPLATE/ ─────── configuração do GitHub, independente

Fase 2 (Após ter o monorepo funcionando — EPIC-0.1):
  README.md ───────────── comandos do Quick Start precisam ser testados
  README.pt-BR.md ─────── depende do README.md estar estabilizado
  CONTRIBUTING.md ─────── setup local precisa ser validado

Fase 3 (Após CI estar rodando — EPIC-0.2):
  Badges no README ─────── badge de CI depende do workflow existir

Fase 4 (A qualquer momento após o repositório estar público):
  Issues iniciais ─────── criadas diretamente no GitHub
```

---

## 11. Estratégia de Testes

### 11.1 Abordagem

Este épico é de **documentação e configuração**, não de código. Não há testes automatizados para documentação. A validação é feita por:

1. **Peer review** — outro desenvolvedor lê cada documento como se fosse a primeira vez, anotando pontos de confusão
2. **Smoke test funcional** — seguir o Quick Start em ambiente limpo e verificar que funciona
3. **Testes de formulários GitHub** — abrir cada template no GitHub e verificar renderização
4. **Checklist de completude** — verificar cada item da seção 8 (Definition of Done)

### 11.2 Checklist de Revisão do README

O README será revisado pelo seguinte roteiro, simulando o comportamento de um desenvolvedor novo:

| Ação do revisor               | O que verificar                               | Resultado esperado                   |
| ----------------------------- | --------------------------------------------- | ------------------------------------ |
| Lê o título e a tagline       | Entende o produto em 5 segundos?              | Sim, sem precisar ler mais           |
| Olha os badges                | CI está verde? Licença clara?                 | Badges visíveis e com status correto |
| Lê a seção "What is KnowHub?" | Entende proposta de valor e diferencial?      | Sim, em ≤ 5 linhas                   |
| Segue o Quick Start           | Consegue rodar o projeto?                     | Ambiente funcional em < 10 min       |
| Lê o Tech Stack               | Entende as tecnologias usadas?                | Sim, todas com links                 |
| Lê o Roadmap                  | Entende o que já existe e o que vem a seguir? | Sim, sem confusão                    |
| Busca como contribuir         | Encontra o link para CONTRIBUTING.md?         | Sim, seção clara                     |
| Busca a licença               | Encontra em menos de 10 segundos?             | Sim, seção no final + badge no topo  |

### 11.3 Checklist de Revisão do CONTRIBUTING.md

| Seção             | O que verificar                                                     |
| ----------------- | ------------------------------------------------------------------- |
| Development Setup | Comandos funcionam? Pré-requisitos corretos?                        |
| Commit Convention | Exemplos cobrem os tipos mais comuns? Têm escopos reais do projeto? |
| Branch Convention | Padrão claro e consistente com as práticas do CI?                   |
| PR Flow           | Cobre o caminho end-to-end? Menciona o processo de review?          |
| Issue Labels      | Todos os labels do repositório estão documentados?                  |
| Good First Issues | Explica claramente como "pegar" uma issue?                          |
| License/CLA       | Declara que CLA não é necessário?                                   |

### 11.4 Checklist de Testes dos Templates GitHub

| Template               | Como testar                                     | Resultado esperado                                                                       |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `bug_report.yml`       | Abrir nova issue, selecionar "Bug Report"       | Formulário renderiza com todos os campos; campos obrigatórios bloqueiam submit se vazios |
| `feature_request.yml`  | Abrir nova issue, selecionar "Feature Request"  | Formulário renderiza corretamente                                                        |
| `good_first_issue.yml` | Abrir nova issue, selecionar "Good First Issue" | Formulário renderiza com todas as seções                                                 |
| `config.yml`           | Tentar abrir issue em branco                    | Opção de issue em branco não existe; link para Discussions aparece                       |
| PR template            | Abrir PR de teste                               | Corpo do PR contém o template automaticamente                                            |

### 11.5 Checklist de Peer Review

O processo de peer review para este épico consiste em:

1. **Revisor 1 (dev sênior):** Lê CONTRIBUTING.md simulando ser um contribuidor novo, anota onde ficou confuso
2. **Revisor 2 (dev júnior ou pessoa nova no projeto):** Segue o Quick Start do README do zero, anota onde travou
3. **Ambos:** Verificam o `CODE_OF_CONDUCT.md` e o `SECURITY.md` para garantir completude e tom adequado

**Meta:** Nenhum bloqueio identificado no fluxo de Quick Start. Nenhum ponto de confusão crítico nos documentos de governança.

---

## 12. Riscos e Mitigações

| Risco                                                                        | Probabilidade | Impacto | Mitigação                                                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Seção "Quick Start" do README desatualiza com mudanças nos outros épicos     | Alta          | Médio   | Incluir na Definition of Done dos EPICs 0.1–0.3 a verificação de que o README ainda está preciso; adicionar nota no CONTRIBUTING.md pedindo atualização do README em PRs que mudam o setup |
| Badge de CI quebrado (repositório privado ou workflow renomeado)             | Média         | Baixo   | Badge URL deve referenciar o nome exato do workflow; verificar em review se a URL está correta                                                                                             |
| Issues iniciais não recebem tentativas de contribuição                       | Média         | Médio   | Promover as issues em redes sociais e fóruns de dev no lançamento; garantir que as issues têm contexto suficiente e não são intimidatórias                                                 |
| Template de issue YAML tem erro de sintaxe e não renderiza no GitHub         | Média         | Alto    | Validar cada template YAML com o [GitHub YAML validator](https://rhysd.github.io/actionlint/) antes de commitar; testar manualmente após push                                              |
| `CODE_OF_CONDUCT.md` sem e-mail de contato real — reports vão a lugar nenhum | Baixa         | Crítico | Antes de publicar, garantir que o e-mail de enforcement é monitorado ativamente; documentar internamente quem responde                                                                     |
| CONTRIBUTING.md muito longo — ninguém lê até o final                         | Média         | Médio   | Estrutura com tabela de conteúdo e seções independentes; as seções mais importantes (commit convention, setup) ficam no início                                                             |
| `SECURITY.md` desatualizado (versões suportadas mudam)                       | Baixa         | Médio   | Incluir revisão de `SECURITY.md` no checklist de cada release                                                                                                                              |
| Issues iniciais ficam obsoletas antes de serem trabalhadas                   | Baixa         | Baixo   | Issues com contexto concreto e arquivos nomeados — mesmo que a estrutura evolua, o contexto permanece relevante; mantenedores podem atualizar antes de atribuir                            |
| README.pt-BR.md dessincroniza com README.md                                  | Alta          | Baixo   | Aceitar divergência controlada; prioridade é README.md em inglês; manter README.pt-BR.md "bom o suficiente" sem bloquear PRs por desatualização menor                                      |

---

## 13. Métricas de Sucesso

### 13.1 Métricas Quantitativas

| Métrica                                                                 | Meta                                          | Como medir                                |
| ----------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| Tempo até entender o produto (leitura do README)                        | < 2 minutos                                   | Medição qualitativa em peer review        |
| Tempo do clone ao ambiente funcionando (Quick Start)                    | < 10 minutos (excluindo download do Ollama)   | Cronometrado em ambiente limpo            |
| Número de issues iniciais criadas e rotuladas                           | ≥ 10                                          | Contagem no repositório                   |
| Número de templates de issue disponíveis                                | 3 (bug, feature, good first issue)            | Verificação no GitHub                     |
| Issues com tentativa de contribuição na primeira semana após lançamento | ≥ 1                                           | Monitoramento de atividade no repositório |
| Seções obrigatórias do README presentes                                 | 8 de 8                                        | Revisão do documento                      |
| Documentos de governança presentes                                      | 4 de 4 (CONTRIBUTING, COC, SECURITY, LICENSE) | Verificação de arquivos                   |
| `package.json` com `"license": "MIT"` em todos os workspaces            | 5 de 5                                        | `grep "license" */package.json`           |

### 13.2 Métricas Qualitativas

- **Novo contribuidor abre seu primeiro PR sem precisar perguntar como fazer** — o CONTRIBUTING.md é suficientemente claro para que o processo seja autoexplicativo
- **Issues `good first issue` têm pelo menos uma tentativa de contribuição externa na primeira semana** após lançamento público
- **Um desenvolvedor sênior que nunca viu o projeto considera o README "profissional"** após peer review
- **Alguém que encontrou uma vulnerabilidade consegue reportá-la sem precisar abrir uma issue pública** — o processo no SECURITY.md é claro e acessível
- **Uma empresa que avalia o projeto como dependência encontra a licença MIT claramente declarada** em menos de 30 segundos

### 13.3 Indicadores de Saúde da Comunidade (30 dias após lançamento)

| Indicador                                            | Resultado saudável                |
| ---------------------------------------------------- | --------------------------------- |
| Issues abertas via templates (vs. issues em branco)  | 100% (blank issues desabilitadas) |
| PRs com template preenchido                          | > 80%                             |
| Issues `good first issue` sem atividade há > 30 dias | < 20%                             |
| Primeiro PR de contribuidor externo                  | ≤ 2 semanas após lançamento       |

---

## 14. Estimativa e Priorização

### 14.1 Estimativa Global

**Estimativa total: M (3–4 dias úteis)**

Detalhamento por componente:

| Componente                                         | Estimativa  | Pode ser paralelo?                |
| -------------------------------------------------- | ----------- | --------------------------------- |
| README.md completo (inglês) + teste do Quick Start | 1 dia       | Sim, após EPIC-0.1 básico existir |
| README.pt-BR.md (tradução)                         | 0,5 dia     | Sim, após README.md estabilizado  |
| CONTRIBUTING.md completo                           | 0,5 dia     | Sim, independente                 |
| CODE_OF_CONDUCT.md + SECURITY.md                   | 0,5 dia     | Sim, independente                 |
| Templates de issue + PR (YAML + MD)                | 0,5 dia     | Sim, independente                 |
| Licença e `package.json` updates                   | 0,5 dia     | Sim, imediatamente                |
| Issues iniciais (10+) com contexto completo        | 0,5 dia     | Sim, após repositório público     |
| **Total**                                          | **~4 dias** |                                   |

### 14.2 Ordem de Implementação Recomendada

```
Dia 1 — Fundação Legal e Estrutura:
  └─ LICENSE (verificar/criar)
  └─ CODE_OF_CONDUCT.md
  └─ SECURITY.md
  └─ .github/ISSUE_TEMPLATE/ (4 arquivos)
  └─ .github/PULL_REQUEST_TEMPLATE.md
  └─ "license": "MIT" em todos os package.json

Dia 2 — Guia de Contribuição:
  └─ CONTRIBUTING.md completo
  └─ Criar labels no repositório GitHub

Dia 3 — README principal:
  └─ README.md em inglês (todas as seções)
  └─ Testar Quick Start em ambiente limpo
  └─ Adicionar badges

Dia 4 — Fechamento:
  └─ README.pt-BR.md (tradução)
  └─ 10+ issues iniciais no GitHub
  └─ Revisão peer review de todos os documentos
  └─ Ajustes pós-review
```

### 14.3 Priorização das Stories

| Story                            | Prioridade   | Justificativa                                                                                                     |
| -------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| STORY-0.4.4 (Licença)            | P0 — Crítico | Sem licença, o repositório é "todos os direitos reservados" — nenhuma contribuição ou uso é legalmente permitido  |
| STORY-0.4.1 (README)             | P0 — Crítico | Primeiro ponto de contato com o projeto; sem README profissional, o projeto não atrai usuários nem contribuidores |
| STORY-0.4.2 (CONTRIBUTING)       | P1 — Alto    | Necessário antes das primeiras contribuições chegarem; blocks direto o onboarding                                 |
| STORY-0.4.3 (Templates + Issues) | P1 — Alto    | Templates melhoram qualidade das contribuições; issues iniciais criam primeiros pontos de entrada                 |

### 14.4 Comparação com Outros Épicos

| Épico                        | Estimativa       | Criticidade para outros épicos                 |
| ---------------------------- | ---------------- | ---------------------------------------------- |
| EPIC-0.1 — Setup do Monorepo | M (3–5 dias)     | Bloqueante para EPICs 1.x                      |
| EPIC-0.2 — CI/CD             | M (3–5 dias)     | Bloqueante para qualidade de código            |
| EPIC-0.3 — Ambiente Local    | M (3–5 dias)     | Bloqueante para desenvolvimento                |
| **EPIC-0.4 — Governança**    | **M (3–4 dias)** | **Não bloqueante — pode ser paralelo a todos** |

O EPIC-0.4 tem uma vantagem estratégica sobre os outros: **pode ser implementado completamente em paralelo com qualquer outro épico da Fase 0**, pois não tem dependências técnicas de código. Idealmente, este épico começa imediatamente após a decisão de tornar o repositório público.

---

## 15. Referências

### Documentação Oficial

- [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) — texto padrão do Código de Conduta
- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) — especificação de convenção de commits
- [GitHub — Creating issue templates (YAML)](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
- [GitHub — Creating a pull request template](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository)
- [GitHub — Adding a security policy](https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository)
- [GitHub — Private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
- [MIT License — Open Source Initiative](https://opensource.org/licenses/MIT)
- [Shields.io — Badges](https://shields.io/) — gerador de badges para README
- [GitHub Badges — Actions workflow status](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/adding-a-workflow-status-badge)

### Boas Referências de README e CONTRIBUTING em Projetos Open Source

- [facebook/react — CONTRIBUTING.md](https://github.com/facebook/react/blob/main/CONTRIBUTING.md)
- [microsoft/TypeScript — CONTRIBUTING.md](https://github.com/microsoft/TypeScript/blob/main/CONTRIBUTING.md)
- [nestjs/nest — README.md](https://github.com/nestjs/nest/blob/master/Readme.md)
- [vercel/next.js — Contributing guide](https://github.com/vercel/next.js/blob/canary/contributing/core/adding-a-new-feature.md)

### Arquivos do Repositório

- `docs-specs/spec-0.4.md` — Especificação original do EPIC-0.4
- `docs-specs/spec-nao-tecnica.md` — Especificação não-técnica do produto
- `docs-specs/spec-tecnica.md` — Especificação técnica do produto
- `docs-specs/epicos.md` — Lista completa de épicos e roadmap
- `docs-specs/PRD-EPIC-0.1.md` — PRD do Setup do Monorepo (referência de formato)
- `docs-specs/PRD-EPIC-0.2.md` — PRD de CI/CD (referência de formato)
- `docs-specs/PRD-EPIC-0.3.md` — PRD do Ambiente Local (referência de formato)
