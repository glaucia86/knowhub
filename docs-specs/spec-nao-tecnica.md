# Especificação não Técnica: KnowHub AI Assistant - v.01

# Especificação de Produto — Visão Não-Técnica

**Glaucia Lemos** · Versão 1.0 · Fevereiro 2026

Projeto Open Source · Licença MIT

---

> _"Toda grande ideia começa no caos. Um segundo cérebro transforma esse caos em clareza."_

---

## Índice

1. [Sumário Executivo](#1-sumário-executivo)
2. [Visão do Produto](#2-visão-do-produto)
3. [Público-Alvo e Personas](#3-público-alvo-e-personas)
4. [Funcionalidades — O que o Produto Faz](#4-funcionalidades--o-que-o-produto-faz)
5. [Fluxos de Usuário Principais](#5-fluxos-de-usuário-principais)
6. [Fora do Escopo — MVP](#6-fora-do-escopo--mvp)
7. [Critérios de Sucesso do Produto](#7-critérios-de-sucesso-do-produto)
8. [Roadmap de Fases](#8-roadmap-de-fases)
9. [Riscos e Plano de Mitigação](#9-riscos-e-plano-de-mitigação)
10. [Glossário](#10-glossário)
11. [Próximos Passos](#11-próximos-passos)

---

## 1. Sumário Executivo

O **KnowHub AI Assistant** é um assistente pessoal de gestão de conhecimento construído como software open source. Sua proposta central é simples: ajudar qualquer pessoa — desenvolvedora ou não — a capturar, organizar e conectar ideias, notas, links e documentos de forma inteligente, sem que nenhum dado pessoal precise sair do seu dispositivo.

Inspirado no conceito de "segundo cérebro", baseado no livro do Tiago Forte ([The BASB Book](https://www.buildingasecondbrain.com/book)) popularizado na produtividade pessoal, o projeto vai além de simples anotações: agentes de inteligência artificial trabalham em segundo plano para descobrir conexões entre informações que o usuário nem percebeu existir, responder perguntas sobre o próprio acervo de conhecimento e sugerir ações proativas baseadas no contexto de cada pessoa.

> ✅ **Princípio inegociável:** A privacidade é um pilar não negociável. Nenhum dado do usuário é enviado a servidores externos sem consentimento explícito. Tudo roda localmente no seu dispositivo, que pode ser: celular, tablet ou desktop (computadores/notebooks) — a IA pensa junto com você, mas o conhecimento é exclusivamente seu.

### Problema Central

Profissionais e estudantes acumulam conhecimento em dezenas de lugares diferentes: notas em apps, abas abertas no navegador, e-mails marcados como importantes, documentos salvos em pastas esquecidas, links no Notion, ideias no Telegram consigo mesmo. O resultado é um caos cognitivo: sabe-se que a informação existe, mas não onde está, e muito menos como ela se conecta com o que está sendo trabalhado hoje.

Ferramentas existentes como Notion, Obsidian ou Evernote oferecem organização, mas exigem disciplina manual intensa e não "pensam" junto com o usuário. Ferramentas de IA como ChatGPT são poderosas, mas não têm acesso ao conhecimento pessoal acumulado do usuário — e tudo que é compartilhado vai para servidores de terceiros.

> ⭐ **Destaque:** O KnowHub AI Assistant resolve essa tensão: traz a inteligência da IA para dentro do conhecimento pessoal do usuário, sem abrir mão da privacidade.

### Proposta de Valor

| O que o produto faz          | Como isso beneficia o usuário                                                                         |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Capture qualquer informação  | Notas, links, arquivos, PDFs, bookmarks — tudo em um único lugar, de qualquer canal (app, chat, CLI). |
| Encontre o que precisa       | Perguntas em linguagem natural. Não precisa lembrar onde salvou: pergunte e receba a resposta.        |
| Descubra conexões invisíveis | A IA identifica relações entre informações que você não perceberia manualmente.                       |
| Totalmente local e privado   | Seus dados ficam no seu dispositivo. Nenhuma assinatura, nenhum servidor externo obrigatório.         |
| Open Source e extensível     | Qualquer pessoa pode contribuir, customizar e adicionar novas funcionalidades.                        |

---

## 2. Visão do Produto

### Declaração de Visão

> ⭐ Ser o assistente pessoal de conhecimento mais confiável, privado e inteligente do mundo — onde cada pessoa tem uma IA que conhece seu contexto, respeita seus dados e potencializa sua capacidade de pensar.

### Missão

Democratizar o acesso a um gerenciador de conhecimento com IA, que seja ao mesmo tempo poderoso para desenvolvedores e acessível para qualquer pessoa que deseje organizar melhor sua vida intelectual e profissional.

### Princípios Guia do Produto

1. **Privacidade por padrão:** o dado do usuário nunca sai do dispositivo sem consentimento explícito.
2. **Acessível para todos:** a interface e os fluxos devem funcionar para desenvolvedores e para pessoas sem conhecimento técnico.
3. **Local-first, cloud-optional:** funciona completamente offline, com opção de sincronização ou fallback em nuvem.
4. **Inteligência invisível:** a IA trabalha em segundo plano — o usuário não precisa aprender "como usar IA" para se beneficiar.
5. **Open Source como cultura:** documentação, código e roadmap são públicos e abertos a contribuições da comunidade.
6. **Iteração sobre perfeição:** entregar valor real rapidamente e evoluir com feedback real de usuários.

### Diferencial Competitivo

| Ferramenta               | Pontos Fortes                                                           | Limitações / Gap                                                      |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Obsidian                 | Organização local excelente, visual de grafos                           | Sem IA nativa. Exige disciplina manual para organizar. Sem agentes.   |
| Notion AI                | IA integrada, colaboração em equipe                                     | Cloud-only. Dados em servidores deles. Caro para uso pessoal.         |
| ChatGPT / Claude         | IA extremamente poderosa                                                | Não conhece seu histórico pessoal. Tudo enviado para nuvem.           |
| AnythingLLM              | RAG local com documentos                                                | Foco técnico. Sem agentes proativos. Pouca usabilidade para não-devs. |
| n8n / Zapier             | Automações poderosas                                                    | Focado em integrar apps, não em gestão de conhecimento pessoal.       |
| **KnowHub AI Assistant** | **IA local + gestão de conhecimento + agentes proativos + open source** | MVP em construção. Novo no mercado.                                   |

---

## 3. Público-Alvo e Personas

O KnowHub AI Assistant é projetado para servir dois grandes grupos de usuários, com necessidades distintas mas igualmente válidas. A chave é que um único produto deve funcionar bem para ambos — sem que um grupo precise "tolerar" a experiência pensada para o outro.

- **Grupo Primário:** Pessoas que trabalham com conhecimento — desenvolvedores, designers, pesquisadores, escritores, estudantes de pós-graduação, consultores e profissionais liberais que lidam com grandes volumes de informação e precisam conectar ideias entre projetos e ao longo do tempo.
- **Grupo Secundário:** Pessoas comuns que querem mais organização — qualquer pessoa que se sente sobrecarregada com informações espalhadas: alguém planejando uma mudança de carreira, acompanhando cursos online, organizando uma pesquisa pessoal ou simplesmente querendo lembrar de coisas que leu e achou importante.

---

### Persona 1 — Sofia Mendes

**Desenvolvedora Full-Stack Sênior · 31 anos · São Paulo**

> _"Minha cabeça é cheia de ideias, mas meu Notion virou um cemitério de páginas que nunca abro. Preciso de algo que pense comigo, não que eu precise organizar manualmente toda hora."_

**O que busca:**

- Capturar insights técnicos durante leituras de artigos e GitHub sem perder o fio da meada.
- Conectar conhecimento entre projetos diferentes sem esforço manual.
- Ter um histórico consultável do raciocínio que levou a decisões técnicas antigas.
- Contribuir para projetos open source que ela realmente usa.

**Dores e frustrações:**

- Ferramentas existentes exigem muita disciplina e manutenção manual.
- Tem medo de usar IA para organizar seu conhecimento por questões de privacidade.
- Pastas e tags se multiplicam até ficarem impossíveis de navegar.
- O contexto de projetos antigos se perde com o tempo.

---

### Persona 2 — Ricardo Torres

**Professor Universitário de História · 47 anos · Belo Horizonte**

> _"Tenho dezenas de PDFs, livros marcados, anotações em papel e arquivos espalhados em três computadores diferentes. Se eu precisar encontrar algo que li há dois anos, levo horas."_

**O que busca:**

- Ter um único lugar para guardar todas as referências de pesquisa, com busca inteligente.
- Conseguir perguntar "o que eu já li sobre o tema X?" e receber um resumo útil.
- Organizar o conhecimento para as aulas sem precisar reinventar a roda todo semestre.
- Uma ferramenta que funcione sem precisar aprender programação.

**Dores e frustrações:**

- Não tem perfil técnico — instalar e configurar ferramentas complexas é uma barreira real.
- Tem resistência a colocar dados acadêmicos sensíveis em plataformas cloud.
- Experiências ruins com apps que mudam muito ou descontinuam serviços.
- Tempo limitado para aprender novas ferramentas.

---

### Persona 3 — Camila Reis

**UX Designer Freelancer · 26 anos · Recife**

> _"Eu pesquiso muito para cada projeto — referências visuais, benchmarks, feedbacks de usuário. No fim das contas, tudo some no caos da minha pasta de Downloads."_

**O que busca:**

- Capturar referências e insights rapidamente, inclusive pelo celular.
- Reutilizar aprendizados de projetos anteriores nos novos.
- Ter um "diário de produto" que evolua com o tempo sem esforço.
- Compartilhar partes do seu conhecimento com clientes quando necessário.

**Dores e frustrações:**

- Apps de notas atuais são bons para texto, ruins para contexto e conexões.
- Costuma esquecer onde salvou algo e perde tempo procurando.
- Não quer pagar assinatura cara para algo que usa de forma irregular.
- Precisa de algo que funcione bem tanto no desktop quanto no mobile.

---

## 4. Funcionalidades — O que o Produto Faz

Esta seção descreve o que o KnowHub AI Assistant faz do ponto de vista do usuário, sem entrar em detalhes técnicos de implementação. Cada funcionalidade é descrita pelo valor que entrega, não pela tecnologia que usa.

### 4.1 Captura de Conhecimento — "Jogue aqui, organize depois"

O usuário pode adicionar qualquer tipo de informação ao seu segundo cérebro de múltiplas formas, sem precisar decidir onde guardar na hora:

- **Texto livre:** uma ideia rápida, um trecho de texto, um pensamento do momento.
- **Link de URL:** o sistema captura automaticamente o conteúdo da página, o resumo e o contexto.
- **Upload de arquivo:** PDFs, documentos de texto, apresentações — o conteúdo é extraído e indexado.
- **Integração com GitHub:** importa issues, READMEs e documentação de repositórios diretamente.
- **Via chat (Telegram, WhatsApp, Discord):** manda uma mensagem para o seu assistente de qualquer lugar.
- **Via linha de comando:** para quem prefere o terminal, um comando simples salva qualquer coisa.

> 💡 **Nota:** O usuário nunca precisa pensar em "onde vou colocar isso". A organização é automática, feita pela IA em segundo plano.

### 4.2 Busca Inteligente — "Encontre sem lembrar onde guardou"

Em vez de navegar por pastas ou lembrar tags exatas, o usuário simplesmente pergunta em linguagem natural:

- _"O que eu sei sobre arquitetura de microsserviços?"_
- _"Mostra tudo que eu guardei sobre aquele projeto de 2024."_
- _"Tem alguma coisa que eu li sobre produtividade para desenvolvedores?"_

O sistema entende a intenção, busca nos arquivos, notas e links salvos, e retorna uma resposta contextualizada — não apenas os documentos brutos, mas uma síntese do que foi encontrado.

### 4.3 Mapa de Conhecimento — "Enxergue conexões que você não veria"

Conforme o acervo cresce, o sistema constrói automaticamente um grafo visual de conexões entre ideias, projetos e conceitos. O usuário pode:

- Visualizar como diferentes áreas do seu conhecimento se conectam.
- Descobrir que uma ideia anotada meses atrás é relevante para o projeto atual.
- Explorar clusters de conhecimento por tema, projeto ou período de tempo.

> ⭐ **Destaque:** Pense no mapa como uma conversa entre todas as suas ideias — o sistema revela padrões que sua mente não teria como processar sozinha.

### 4.4 Assistente Proativo — "A IA que pensa junto com você"

O assistente não apenas responde perguntas — ele age proativamente para ajudar o usuário:

- **Sugere conexões:** _"Você salvou algo sobre esse tema há 3 meses — quer ver?"_
- **Cria resumos automáticos:** resume um PDF longo ou uma thread complexa em pontos-chave.
- **Propõe tags e categorias:** organiza o acervo sem que o usuário precise fazer isso manualmente.
- **Alerta sobre conteúdo desatualizado:** indica links quebrados ou informações que podem ter ficado obsoletas.
- **Sugere ações:** _"Você tem 5 notas sobre esse tema — quer que eu gere um documento consolidado?"_

### 4.5 Privacidade Total — "Seus dados, seu controle"

Este é um pilar inegociável do produto:

- Tudo roda no dispositivo do usuário por padrão — zero dados enviados a servidores externos.
- A IA usada localmente não precisa de conexão com a internet.
- O usuário pode optar por usar APIs em nuvem (para mais poder computacional), com consentimento claro e explícito.
- Os dados ficam em um formato aberto e portátil — o usuário pode exportar tudo a qualquer momento.
- Suporte a criptografia local para conteúdos sensíveis.

### 4.6 Extensibilidade via Plugins — "A comunidade expande o que o produto faz"

Por ser open source, o produto tem um sistema de plugins que permite que qualquer desenvolvedor adicione novas capacidades:

- **Plugins de captura:** integração com Notion, Evernote, Apple Notes, ferramentas de RSS.
- **Plugins de ação:** criar tarefas no Jira, postar resumos no Slack, exportar para formatos específicos.
- **Plugins de IA:** usar modelos diferentes para análises específicas de domínio (jurídico, médico, acadêmico).

> ✅ **Princípio:** Qualquer desenvolvedor pode criar um plugin em poucas horas e compartilhar no registry da comunidade — assim o produto cresce além do que a equipe central poderia construir sozinha.

---

## 5. Fluxos de Usuário Principais

### Fluxo 1: Primeiro Uso — Onboarding

1. O usuário baixa o aplicativo (instalador único para Windows, Mac ou Linux).
2. Um assistente de configuração guiado pergunta preferências básicas: idioma, modo de privacidade (100% local ou com fallback cloud), quais canais quer usar (app, Telegram, CLI).
3. O sistema instala automaticamente os componentes necessários nos bastidores.
4. O usuário faz sua primeira captura de teste: escreve uma frase ou cola um link.
5. O assistente mostra como buscar e o que o sistema fez com a informação.
6. Onboarding concluído — o usuário está pronto para começar.

> 💡 **Meta de onboarding:** do download à primeira nota salva em menos de 5 minutos, sem nenhum comando técnico.

### Fluxo 2: Captura no Dia a Dia

1. O usuário está lendo um artigo interessante no navegador.
2. Clica na extensão do navegador (ou envia o link via Telegram para o seu assistente).
3. O sistema captura o conteúdo da página, gera um resumo e salva automaticamente.
4. Uma notificação discreta aparece: _"Salvo! Conectei com 2 notas anteriores sobre este tema."_
5. O usuário pode adicionar um comentário opcional ou simplesmente fechar e continuar.

### Fluxo 3: Consulta e Pesquisa

1. O usuário está trabalhando em um projeto e precisa lembrar algo que pesquisou antes.
2. Abre o assistente e digita: _"Me dá um resumo do que eu sei sobre event-driven architecture."_
3. O sistema busca em todo o acervo — notas, PDFs, links, arquivos do GitHub — e retorna uma síntese coerente com as fontes.
4. O usuário pode fazer perguntas de follow-up: _"E o que eu pensei sobre isso para o projeto Alfa?"_
5. Recebe a resposta com referências específicas para os documentos originais.

### Fluxo 4: Descoberta de Conexões

1. O usuário abre o Mapa de Conhecimento — uma visualização em grafo do seu acervo.
2. Percebe um cluster de notas que não sabia que existia sobre um tema em comum.
3. Clica no cluster e o assistente gera automaticamente um briefing: _"Você tem 12 itens relacionados a X — quer que eu consolide em um documento?"_
4. O usuário aceita — um rascunho é gerado e pode ser editado e exportado.

### Fluxo 5: Manutenção Assistida

1. Periodicamente, o assistente de manutenção envia um relatório: _"3 links salvos estão quebrados. 7 notas não são acessadas há mais de 6 meses — quer arquivar?"_
2. O usuário revisa as sugestões e aprova ou descarta com um clique.
3. O sistema atualiza o acervo e o mapa de conhecimento automaticamente.

---

## 6. Fora do Escopo — MVP

Para garantir que o MVP seja lançado com qualidade e foco, as seguintes funcionalidades estão explicitamente excluídas da primeira versão. Estas podem fazer parte de versões futuras.

> ⚠️ **Atenção:** Definir o que NÃO fazer é tão importante quanto definir o que fazer. Escopo claro protege a qualidade do produto e o bem-estar da equipe.

| Feature Excluída do MVP                         | Motivo                                                                                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Colaboração multi-usuário em tempo real         | O foco do MVP é uso pessoal. Compartilhamento de bases de conhecimento entre times é uma feature futura.                   |
| Aplicativo mobile nativo (iOS/Android)          | O MVP terá acesso mobile via integração com Telegram/WhatsApp. Um app nativo vem em versão posterior.                      |
| Síntese de vídeos e áudios                      | Transcrição e análise de conteúdo de vídeo e áudio ficam para versão futura por complexidade de implementação.             |
| Marketplace de plugins com monetização          | O registry de plugins começa gratuito e aberto. Modelo de monetização para criadores de plugins é pós-MVP.                 |
| IA generativa para criação de conteúdo original | O produto organiza e conecta conhecimento existente. Geração de textos longos como artigos ou e-mails é escopo secundário. |
| Integrações com ERPs ou CRMs corporativos       | O foco é no usuário individual. Integrações empresariais são roadmap futuro.                                               |
| Suporte a múltiplos idiomas além de PT-BR e EN  | O MVP será lançado em português e inglês. Outros idiomas serão adicionados com ajuda da comunidade.                        |

---

## 7. Critérios de Sucesso do Produto

O sucesso do KnowHub AI Assistant será medido por indicadores concretos, divididos em metas de curto prazo (primeiros 3 meses após lançamento) e médio prazo (até 12 meses).

### Metas de Adoção — Primeiros 3 Meses

| Indicador                       | Meta                                | Justificativa                                                      |
| ------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| Estrelas no GitHub              | 200+ estrelas                       | Referência: Repo Doctor teve 73 em 1 mês com menos apelo massivo.  |
| Downloads / Installs            | 500+ instalações únicas             | Indica que as pessoas não só "curtem" mas realmente usam.          |
| Issues e PRs da comunidade      | 10+ contribuições externas          | Sinal de que o projeto está ativo e atraindo colaboradores.        |
| Retenção de uso (semana 2)      | 40%+ dos usuários usam na 2ª semana | Indica que o produto entrega valor real, não é apenas curiosidade. |
| Cobertura de mídia / comunidade | 3+ menções em blogs/podcasts tech   | Amplificação orgânica em comunidades como Dev.to, LinkedIn, X.     |

### Metas de Qualidade — Primeiros 3 Meses

| Indicador                            | Meta                               | Critério de Avaliação                               |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------- |
| Tempo de onboarding                  | Menos de 5 minutos                 | Usuário instala e faz primeira captura sem suporte. |
| Satisfação do usuário (NPS informal) | 7+ em 10 nos feedbacks             | Coletado via formulário simples após 7 dias de uso. |
| Bugs críticos em produção            | Zero por semana após estabilização | Crashes ou perda de dados são inaceitáveis.         |
| Tempo de resposta do assistente      | Menos de 3 segundos (local)        | Lentidão desmotiva o uso no dia a dia.              |

### Metas de Médio Prazo — 12 Meses

- 1.000+ estrelas no GitHub — posicionando o projeto como referência na categoria.
- 5+ plugins da comunidade publicados no registry oficial.
- Presença ativa em pelo menos 3 comunidades internacionais de produtividade/IA.
- Base de usuários diversa: pelo menos 30% de usuários não-desenvolvedores.
- Parceria ou integração com pelo menos uma ferramenta popular (ex: extensão para VSCode, plugin para Obsidian).

---

## 8. Roadmap de Fases

O desenvolvimento do KnowHub AI Assistant é dividido em fases progressivas, cada uma entregando valor real e funcionando como base sólida para a próxima. Cada fase tem critérios claros de entrada e saída.

### Fase 0 — Fundação _(Semanas 1-2)_

**Objetivo:** Criar a base técnica e de governança do projeto antes de qualquer feature.

- Repositório público no GitHub com licença MIT.
- README detalhado com visão, roadmap e guia de contribuição (`CONTRIBUTING.md`).
- Estrutura básica do projeto estabelecida.
- CI/CD configurado para validação automática de contribuições.
- Primeiros issues abertos para a comunidade.

> ⚠️ **Atenção:** A Fase 0 é tão importante quanto as demais: projetos open source de sucesso começam com boa governança, não apenas com código.

### Fase 1 — MVP Essencial _(Semanas 3-6)_

**Objetivo:** Um produto mínimo que resolve o problema central — capturar e buscar conhecimento de forma privada.

- Captura de notas de texto e links via interface web simples.
- Indexação local automática com busca em linguagem natural.
- Importação de PDFs com extração de texto.
- Interface de chat básica para fazer perguntas ao acervo.
- Rodando 100% localmente, sem dependência de nuvem.
- Documentação de instalação passo a passo para usuários não-técnicos.

### Fase 2 — Conexões e Agentes _(Semanas 7-12)_

**Objetivo:** Transformar o repositório de notas em um sistema de conhecimento vivo.

- Mapa visual de conexões entre ideias (visualização em grafo interativo).
- Agente de sugestões proativas (conexões automáticas, resumos, alertas).
- Agente de manutenção (links quebrados, deduplicação, sugestão de arquivo).
- Integração com GitHub para captura de issues e documentação.
- Suporte a Telegram como canal de captura e consulta.

### Fase 3 — Experiência e Alcance _(Meses 4-6)_

**Objetivo:** Ampliar o alcance para além da comunidade de desenvolvedores.

- Instalador simplificado (um clique) para Windows, Mac e Linux.
- Interface adaptada para usuários não-técnicos com onboarding guiado.
- Extensão de navegador para captura rápida de páginas e links.
- Modo híbrido: local + fallback opcional para nuvem com consentimento explícito.
- Suporte completo em português e inglês.

### Fase 4 — Ecossistema de Plugins _(Meses 7-12)_

**Objetivo:** Abrir o produto para a comunidade expandir suas capacidades indefinidamente.

- Sistema de plugins documentado e estável.
- Registry público de plugins com curadoria mínima.
- Primeiros plugins oficiais: Notion, Evernote, RSS, Apple Notes.
- Ferramentas para desenvolvedores criarem plugins com facilidade.
- Programa de reconhecimento para contribuidores da comunidade.

---

## 9. Riscos e Plano de Mitigação

Todo projeto carrega riscos. Identificá-los cedo permite criar estratégias antes que se tornem problemas reais.

| Risco                                                  | Probabilidade     | Plano de Mitigação                                                                                                    |
| ------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| Usuários não-técnicos desistem na instalação           | Alto              | Investir pesadamente no instalador simplificado e vídeos de onboarding antes do lançamento público.                   |
| Modelos de IA locais muito pesados para hardware comum | Médio             | Priorizar modelos leves (Gemma-2, Phi-3). Oferecer modo cloud como alternativa clara e transparente.                  |
| Escopo cresce além do que a equipe consegue entregar   | Alto              | Roadmap público e rígido. Recusar features fora do escopo atual, mesmo que populares.                                 |
| Concorrente lança produto similar                      | Médio             | Foco em diferenciais únicos: privacidade local + open source + comunidade ativa. Velocidade de entrega como vantagem. |
| Baixo engajamento da comunidade open source            | Médio             | Criar issues "good first issue" desde o início. Promover ativamente em comunidades de TypeScript e IA.                |
| Privacidade comprometida por plugin malicioso          | Baixo (mas grave) | Sandboxing de plugins desde a Fase 4. Processo de revisão para plugins no registry oficial.                           |

---

## 10. Glossário

Para garantir alinhamento entre pessoas técnicas e não-técnicas, os termos principais usados neste documento estão explicados aqui em linguagem acessível.

| Termo                     | Definição em linguagem acessível                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Segundo Cérebro**       | Sistema externo (digital) que guarda e organiza conhecimento pessoal, funcionando como extensão da memória humana.                                                      |
| **Agente de IA**          | Programa de computador autônomo que executa tarefas de forma proativa, sem precisar ser acionado manualmente para cada ação.                                            |
| **Local-first**           | Abordagem onde o software funciona completamente no dispositivo do usuário, sem depender de servidores externos. Os dados ficam com o usuário.                          |
| **Open Source**           | Software cujo código é público e pode ser usado, modificado e distribuído por qualquer pessoa, respeitando a licença do projeto.                                        |
| **Plugin**                | Extensão que adiciona uma capacidade nova ao produto base, como uma peça de LEGO. Criado por terceiros, expande o produto sem alterar seu núcleo.                       |
| **MVP**                   | Minimum Viable Product — versão mínima do produto com apenas as funcionalidades essenciais para testar se a solução resolve o problema real.                            |
| **RAG**                   | Retrieval-Augmented Generation — técnica de IA que busca informações em um banco de dados antes de gerar uma resposta. O assistente "lê" seu acervo antes de responder. |
| **Grafo de conhecimento** | Representação visual de como diferentes ideias, notas e documentos se conectam entre si, como um mapa mental automatizado.                                              |
| **CI/CD**                 | Continuous Integration/Continuous Delivery — sistema que verifica automaticamente se o código novo está correto antes de ser publicado, garantindo qualidade.           |

---

## 11. Próximos Passos

Com a especificação não-técnica documentada e validada, os próximos passos imediatos para avançar no projeto são:

1. **Revisão e validação desta especificação:** Glaucia revisa, ajusta e aprova esta versão como baseline do produto.
2. **Criação da Especificação Técnica:** Detalhar arquitetura, stack, decisões de design técnico, APIs, modelos de dados e contratos de interface.
3. **Nome do projeto definido:** KnowHub AI Assistant é o nome oficial. Garantir disponibilidade no GitHub e domínio antes do lançamento.
4. **Setup do repositório GitHub:** Criar o repo público com README, licença MIT, templates de issues e pull requests.
5. **Desenvolvimento do MVP da Fase 1:** Iniciar o código seguindo a especificação técnica aprovada.

> ✅ **Princípio:** Esta especificação é um documento vivo. Ela deve ser revisada a cada fase do roadmap, incorporando aprendizados reais dos usuários. Versionar e datar cada revisão.

---

_Documento preparado por Glaucia Lemos · KnowHub AI Assistant · Open Source Project · 2026_
