> 🇺🇸 Read in [English](README.md)

<div align="center">
  <img src="resources/banner.svg" alt="KnowHub AI Assistant Banner" width="900"/>
  <h1>KnowHub AI Assistant</h1>
  <p>Seu segundo cérebro local-first com IA para desenvolvedores</p>
</div>

<p align="center">
  <a href="https://github.com/glaucia86/knowhub/actions/workflows/ci.yml">
    <img src="https://github.com/glaucia86/knowhub/actions/workflows/ci.yml/badge.svg" alt="CI"/>
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="Licença: MIT"/>
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js 22+"/>
  </a>
  <a href="CONTRIBUTING.md">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs são bem-vindos"/>
  </a>
</p>

---

## O que é o KnowHub?

KnowHub AI Assistant é um gerenciador de conhecimento **local-first**, com privacidade por padrão,
alimentado por IA. Ele ajuda desenvolvedores a capturar, organizar e recuperar conhecimento
a partir de notas, links, PDFs, issues do GitHub e muito mais — com busca semântica e
resumos gerados por IA que nunca saem do seu dispositivo.

**Princípios fundamentais:**

- 🔒 **Privacidade em primeiro lugar** — todo o processamento de IA é feito localmente via Ollama
- 🧠 **Segundo cérebro** — conexões semânticas entre seus registros de conhecimento
- 💻 **Focado em desenvolvedores** — CLI, API REST e interface Web
- 🌍 **Open Source** — licença MIT, orientado à comunidade

---

## Demo

> 🚧 **Screenshots e GIF em breve** — o produto está em desenvolvimento ativo.
> Acompanhe o [roadmap](#roadmap) para acompanhar o progresso.

---

## Início Rápido

### Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + plugin Compose)
- [Git](https://git-scm.com/)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/glaucia86/knowhub.git
cd knowhub

# 2. Instale todas as dependências dos workspaces
npm install

# 3. Configure as variáveis de ambiente
npm run env:setup

# 4. Inicie os serviços de infraestrutura (Redis + Ollama)
docker compose up -d

# 5. Baixe os modelos de IA (apenas na primeira vez — ~4 GB)
make ollama-pull
# ou: docker compose exec ollama ollama pull gemma3:4b

# 6. Inicie os servidores de desenvolvimento
npm run dev
```

Acesse a aplicação em:

- **Web UI:** http://localhost:3000
- **API:** http://localhost:3001
- **Ollama:** http://localhost:11434

> 💡 **Windows sem WSL2:** substitua `make ollama-pull` por
> `docker compose exec ollama ollama pull gemma3:4b`
>
> **Windows + OneDrive:** `apps/web` pode falhar com `spawn EPERM`. Execute
> `npm run dev` para os serviços principais e `npm run dev:web` separadamente.

### Configuração do banco de dados

```bash
npm run db:migrate
npm run db:seed
```

Reset completo (remove `apps/api/local.db`, re-executa migrations e seed):

```bash
npm run db:reset
```

---

## Uso Básico

> 🚧 Exemplos de uso serão adicionados conforme as funcionalidades forem implementadas.
> Veja as [issues do EPIC-1.x](https://github.com/glaucia86/knowhub/labels/epic-1) para acompanhar o progresso.

---

## Stack Tecnológico

| Camada     | Tecnologia                                                              | Propósito             |
| ---------- | ----------------------------------------------------------------------- | --------------------- |
| API        | [NestJS](https://nestjs.com/)                                           | Servidor REST API     |
| Web        | [Next.js 15](https://nextjs.org/)                                       | Frontend (App Router) |
| CLI        | [Commander.js](https://github.com/tj/commander.js)                      | Interface de terminal |
| Banco      | [SQLite](https://sqlite.org/) + [DrizzleORM](https://orm.drizzle.team/) | Armazenamento local   |
| Cache      | [Redis/Valkey](https://valkey.io/)                                      | Camada de cache       |
| IA         | [Ollama](https://ollama.ai/)                                            | Runtime de LLM local  |
| LLM        | [Gemma 3 4B](https://ollama.com/library/gemma3)                         | Modelo de linguagem   |
| Embeddings | [nomic-embed-text](https://ollama.com/library/nomic-embed-text)         | Embeddings vetoriais  |
| Monorepo   | [Turborepo](https://turbo.build/) + npm workspaces                      | Sistema de build      |
| Linguagem  | [TypeScript 5](https://www.typescriptlang.org/)                         | Tipagem full-stack    |

---

## Roadmap

- **Fase 0 — Infraestrutura** ✅ Monorepo, CI/CD, ambiente local de desenvolvimento, governança open source
- **Fase 1 — Funcionalidades Core** 🚧 Ingestão de conhecimento, busca semântica, Q&A via CLI
- **Fase 2 — Inteligência** 📋 Conexões semânticas, tags, sumarização
- **Fase 3 — Integrações** 📋 Bot Telegram, issues do GitHub, ingestão de PDFs
- **Fase 4 — Polimento** 📋 Web UI completa, suporte multi-usuário, sync na nuvem (opt-in)

---

## Contribuindo

Contribuições são bem-vindas e muito apreciadas! 🎉

Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) (em inglês) para:

- Como configurar o ambiente de desenvolvimento
- Convenção de commits (Conventional Commits)
- Como submeter um Pull Request
- Por onde começar como primeiro contribuidor ([Good First Issues](https://github.com/glaucia86/knowhub/labels/good%20first%20issue))

Ao contribuir, você concorda em seguir nosso [Código de Conduta](CODE_OF_CONDUCT.md).

Encontrou uma vulnerabilidade de segurança? Por favor, leia [SECURITY.md](SECURITY.md) antes de reportar.

---

## Licença

Distribuído sob a Licença MIT. Veja [LICENSE](LICENSE) para mais informações.
