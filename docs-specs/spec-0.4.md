## EPIC-0.4 — Governança e Documentação Open Source

**Objetivo:** Ter todos os documentos de governança que tornam o projeto atraente e acessível para contribuidores externos.

**Contexto técnico:** Projetos open source de sucesso têm documentação clara antes das primeiras contribuições externas. O README é o "cartão de visita" e o CONTRIBUTING.md é o "manual de integração" da comunidade.

### Histórias de Usuário

**STORY-0.4.1 — README completo**

> Como pessoa interessada no projeto, quero entender em 2 minutos o que é o KnowHub, como instalar, como usar e como contribuir.

> observação: quero que o README.md seja o mais completo possível, servindo como ponto de entrada para o projeto, com links para documentação detalhada quando necessário. E que seja em inglês, como principal, mas com uma versão em português para a comunidade local.

_Critérios de aceite:_

- [ ] README tem seções: Visão do produto, Demo (GIF ou screenshot - ainda não disponível, pois estamos ainda desenvolvendo o projeto), Instalação rápida, Uso básico, Stack, Roadmap resumido, Como contribuir, Licença
- [ ] Badge de CI, versão npm, licença e estrelas do GitHub no topo
- [ ] Seção de instalação funciona copiando e colando os comandos
- [ ] Link para documentação completa (quando existir)
- [ ] README em inglês (principal) com link para versão em português

> O idioma principal do projeto é o inglês. Logo, quaisquer documentos oficiais (README, CONTRIBUTING, CODE_OF_CONDUCT) devem ter uma versão em inglês.

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
