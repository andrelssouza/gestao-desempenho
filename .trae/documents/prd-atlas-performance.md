## 1. Visao do Produto
Atlas Performance e uma plataforma web de gestao de performance e desenvolvimento de players, com foco em acompanhamento do gestor, evolucao individual e decisao baseada em dados.
- Resolve a falta de visibilidade sobre metas, PDIs, desempenho, riscos e progresso de cada player em um unico ambiente.
- Atende principalmente gestores e RH, com experiencia complementar para players acessarem trilhas, materiais e reforcos de aprendizagem.

## 2. Funcionalidades Centrais

### 2.1 Perfis de Usuario
| Perfil | Forma de acesso | Permissoes centrais |
|------|------------------|---------------------|
| Gestor | Email e senha | Visualizar dashboard geral, acompanhar equipe, editar metas, acompanhar PDI, analisar ninebox e acessar relatorios |
| Player | Email e senha | Visualizar propria performance, metas, PDI, trilhas da Academy, minibooks e quizzes |
| RH ou Administrador | Email e senha | Visualizar visao ampliada, configurar trilhas, acompanhar times e consolidar indicadores |

### 2.2 Modulos Principais
1. **Login e acesso**: autenticacao por email e senha, manutencao da tela de login atual e direcionamento conforme perfil.
2. **Dashboard do gestor**: visao de alertas, metas vencendo, metas atrasadas, PDIs fora do prazo, desempenho por player e pendencias criticas.
3. **Players**: lista completa de players, cargo, setor, status de metas, status de PDI e Score medio.
4. **Perfil do player**: detalhamento individual com soft skills, hard skills, metas, PDI, historico e Score medio.
5. **Ninebox**: posicionamento automatico do player na matriz conforme desempenho e potencial, com descricao clara de cada celula.
6. **Relatorios**: comparativo historico do player, evolucoes, regressos, tendencias e leitura consolidada da jornada.
7. **Academy**: trilhas de desenvolvimento por gap, situacoes praticas, materiais de apoio, Saber em Pilulas e quiz curto em flashcards.

### 2.3 Detalhamento das Paginas
| Nome da pagina | Nome do modulo | Descricao da funcionalidade |
|-----------|-------------|---------------------|
| Login | Acesso | Manter tela de login com autenticacao e entrada segura por perfil |
| Dashboard | Alertas de gestao | Mostrar prazos de metas se encerrando, metas nao entregues, PDIs fora do prazo e players com risco |
| Dashboard | Resumo executivo | Exibir indicadores da equipe, distribuicao de status, ranking por Score e recomendacoes rapidas |
| Players | Lista geral | Listar nome, cargo, setor, Score medio, status de metas e status do PDI |
| Players | Filtros | Permitir busca por nome, setor, cargo, status e faixa de Score |
| Player | Soft skills e hard skills | Exibir avaliacoes, gaps e evolucao por competencia |
| Player | Metas | Mostrar metas, prazo, percentual de entrega, status e historico de atualizacoes |
| Player | PDI | Mostrar plano de desenvolvimento, prazos, status, evidencias e pendencias |
| Player | Historico | Exibir comparativo entre ciclos, ganhos e perdas de performance |
| Ninebox | Matriz visual | Posicionar players automaticamente no ninebox e permitir leitura por celula |
| Ninebox | Descricao das celulas | Explicar o significado estrategico de cada quadrante e acao sugerida |
| Relatorios | Visao historica | Consolidar o que melhorou, o que piorou e o que precisa de atencao por player |
| Relatorios | Exportacao futura | Preparar base para exportar relatorios executivos e analiticos |
| Academy | Trilhas de desenvolvimento | Liberar trilhas conforme gaps, com situacoes reais e aplicacao pratica |
| Academy | Saber em Pilulas | Entregar resumo diario de livros do tema, com sugestoes de aplicacao |
| Academy | Quiz em flashcards | Reforcar o aprendizado com perguntas curtas ao final de cada pilar |

## 3. Fluxo Principal
O gestor faz login e acessa um dashboard orientado a excecoes, identificando rapidamente metas em risco, PDIs fora do prazo e players com baixa entrega. A partir da lista de players, ele aprofunda a analise individual, revisa historico, acompanha a posicao no ninebox e identifica necessidades de desenvolvimento. Em paralelo, o player acessa a Academy para consumir trilhas e reforcos de aprendizagem alinhados aos seus gaps.

```mermaid
flowchart TD
    A["Usuario acessa o Atlas Performance"] --> B["Faz login"]
    B --> C["Sistema identifica perfil"]
    C --> D["Gestor acessa dashboard principal"]
    D --> E["Analisa alertas de metas e PDI"]
    E --> F["Abre a lista de players"]
    F --> G["Seleciona um player"]
    G --> H["Visualiza competencias, metas, PDI e historico"]
    H --> I["Consulta posicionamento no ninebox"]
    I --> J["Acessa relatorios comparativos"]
    H --> K["Define trilhas e apoio na Academy"]
    K --> L["Player realiza trilha, Saber em Pilulas e quiz"]
    L --> H
```

## 4. Design da Interface
### 4.1 Estilo Visual
- Nome do produto: Atlas Performance
- Cores principais mantidas: azul petroleo `#133E57`, areia clara `#F7F3EB`, verde de progresso `#3B7A57` e cobre de destaque `#B86A3B`
- Linguagem visual: executiva, analitica e premium, com menos aspecto de landing page e mais estrutura de sistema operacional de gestao
- Terminologia central: usar `Score` como nota padrao de performance na escala de `1 a 10`
- Tipografia: titulos editoriais com corpo tecnico limpo para tabelas, indicadores e historicos
- Layout: desktop-first, com navegacao lateral, dashboards densos, tabelas bem legiveis e modulos de drill-down
- Iconografia: funcional e corporativa, com apoio visual para risco, atraso, evolucao e destaque

### 4.2 Visao de Design por Pagina
| Nome da pagina | Nome do modulo | Elementos de UI |
|-----------|-------------|-------------|
| Login | Acesso | Manter visual atual com refinamento de marca Atlas Performance |
| Dashboard | Indicadores e alertas | Cards executivos, tabela de excecoes, lista de prioridades e area de recomendacoes |
| Players | Lista e filtros | Tabela principal, busca, filtros e indicadores compactos por linha |
| Player | Painel individual | Cabecalho com identidade do player, cards de Score medio, secoes de metas, PDI, historico e competencias |
| Ninebox | Matriz de talento | Grade 3x3, legenda, quantidade de players por celula e descricao acionavel |
| Relatorios | Evolucao historica | Comparativos por periodo, destaques de melhora e piora e linha do tempo |
| Academy | Plataforma de desenvolvimento | Trilhas em cards, minibooks diarios, sugestoes praticas e flashcards de quiz |

### 4.3 Responsividade
Desktop-first com adaptacao responsiva para tablet. Em mobile, a prioridade e consulta rapida de indicadores, historico e trilhas, sem perder leitura das informacoes mais criticas.
