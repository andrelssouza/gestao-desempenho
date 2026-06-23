const user = JSON.parse(localStorage.getItem('user') || 'null');
const skipAuth = localStorage.getItem('skipAuth') === 'true';
const currentUser = user || {
  name: 'Modo demonstracao',
  email: 'demo@atlasperformance.local',
  role: 'Gestor',
  company: 'Atlas Performance Demo',
};

if (!user && !skipAuth) {
  window.location.href = 'login.html';
}

const pageTitle = document.getElementById('page-title');
const pageContent = document.getElementById('page-content');
const heroCard = document.getElementById('hero-card');
const userSummary = document.getElementById('user-summary');
const saveIndicator = document.getElementById('save-indicator');
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const logoutButton = document.getElementById('logout-btn');
const refreshButton = document.getElementById('refresh-btn');

let appState = null;
const uiState = {
  view: 'dashboard',
  selectedPlayerId: null,
  playersSearch: '',
  playersSector: 'todos',
  academyTrailId: null,
  showFlashcardAnswer: false,
};

const nineBoxDescriptions = {
  '1-1': {
    title: 'Baixo potencial · Baixa performance',
    description: 'Players que exigem plano corretivo, redefinicao de escopo ou reavaliacao de aderencia.',
  },
  '1-2': {
    title: 'Potencial moderado · Baixa performance',
    description: 'Existe espaco de crescimento, mas a entrega atual pede rotina intensa de acompanhamento.',
  },
  '1-3': {
    title: 'Alto potencial · Baixa performance',
    description: 'Talento com capacidade de evolucao, porem com baixa consistencia na entrega atual.',
  },
  '2-1': {
    title: 'Baixo potencial · Performance media',
    description: 'Bom para sustentacao operacional, com foco em estabilidade e previsibilidade.',
  },
  '2-2': {
    title: 'Potencial moderado · Performance media',
    description: 'Grupo de consolidacao, pronto para evoluir com metas mais claras e desenvolvimento dirigido.',
  },
  '2-3': {
    title: 'Alto potencial · Performance media',
    description: 'Players promissores, ideais para trilhas de aceleracao e missao progressivamente mais complexa.',
  },
  '3-1': {
    title: 'Baixo potencial · Alta performance',
    description: 'Especialistas consistentes, importantes para sustentacao, mentoria tecnica e confiabilidade.',
  },
  '3-2': {
    title: 'Potencial moderado · Alta performance',
    description: 'Performers fortes e estaveis, preparados para ampliar impacto ou liderar projetos-chave.',
  },
  '3-3': {
    title: 'Alto potencial · Alta performance',
    description: 'Talentos de destaque, prontos para sucessao, protagonismo e investimento prioritario.',
  },
};

const copyByView = {
  dashboard: {
    title: 'Dashboard',
    eyebrow: 'Visao executiva',
    heroTitle: 'Gestao de performance com prioridade, risco e decisao rapida.',
    description: 'Identifique metas em vencimento, Players com Score em queda, PDIs atrasados e oportunidades de desenvolvimento.',
  },
  players: {
    title: 'Players',
    eyebrow: 'Base operacional',
    heroTitle: 'Todos os Players, seus setores, cargos e Score em uma leitura unica.',
    description: 'Use filtros, compare Scores e mergulhe no detalhe individual quando houver risco ou destaque.',
  },
  player: {
    title: 'Player',
    eyebrow: 'Analise individual',
    heroTitle: 'Detalhe completo do Player para decidir com mais seguranca.',
    description: 'Visualize soft skills, hard skills, metas, PDI, historico e Score medio em um unico lugar.',
  },
  ninebox: {
    title: 'Ninebox',
    eyebrow: 'Mapa de talento',
    heroTitle: 'Posicionamento automatico para orientar sucessao, risco e desenvolvimento.',
    description: 'Cada celula explica o momento do Player e sugere a leitura de gestao mais adequada.',
  },
  relatorios: {
    title: 'Relatorios',
    eyebrow: 'Evolucao historica',
    heroTitle: 'Entenda quem melhorou, quem piorou e onde o Score mudou com o tempo.',
    description: 'Compare ciclos, identifique tendencias e transforme historico em conversa de desenvolvimento.',
  },
  academy: {
    title: 'Academy',
    eyebrow: 'Aprendizagem aplicada',
    heroTitle: 'Trilhas, Saber em Pilulas e quiz para fechar o ciclo entre gap e evolucao.',
    description: 'Conecte o gap do Player a uma jornada concreta de desenvolvimento, reforco diario e pratica.',
  },
};

function createId() {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function setStatus(text) {
  saveIndicator.textContent = text;
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function daysUntil(dateValue) {
  const now = new Date('2026-06-23T00:00:00');
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.round((target - now) / 86400000);
}

function getStatusClass(status) {
  if (status === 'em_dia' || status === 'concluida' || status === 'concluido') {
    return 'status-ok';
  }
  if (status === 'atencao' || status === 'em_andamento') {
    return 'status-warning';
  }
  return 'status-danger';
}

function getRiskClass(score) {
  if (score >= 8) {
    return 'risk-low';
  }
  if (score >= 6) {
    return 'risk-medium';
  }
  return 'risk-high';
}

function renderUserSummary() {
  userSummary.innerHTML = `
    <div><strong>${escapeHtml(currentUser.name)}</strong></div>
    <div class="body-copy">${escapeHtml(currentUser.role)} · ${escapeHtml(currentUser.company)}</div>
  `;
}

function buildFallbackState() {
  const leadershipTrailId = createId();
  const communicationTrailId = createId();
  const executionTrailId = createId();

  return {
    manager: {
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      company: currentUser.company,
      team: 'Time Growth',
    },
    players: [
      {
        id: createId(),
        name: 'Ana Souza',
        role: 'Coordenadora Comercial',
        sector: 'Vendas',
        score: 6.4,
        performance: 2,
        potential: 3,
        statusGoals: 'atrasado',
        statusPdi: 'atencao',
        softSkills: [
          { name: 'Lideranca', score: 4.8, previous: 4.2 },
          { name: 'Comunicacao', score: 7.1, previous: 6.4 },
          { name: 'Gestao de conflitos', score: 6.0, previous: 6.2 },
        ],
        hardSkills: [
          { name: 'Pipeline comercial', score: 7.8, previous: 7.4 },
          { name: 'Forecast', score: 6.6, previous: 6.0 },
          { name: 'Negociacao', score: 7.3, previous: 6.8 },
        ],
        goals: [
          { title: 'Atingir 92% da meta trimestral', deadline: '2026-06-27', progress: 78, scoreMeta: 6.3, status: 'em_andamento' },
          { title: 'Fechar playbook da equipe', deadline: '2026-06-22', progress: 55, scoreMeta: 5.8, status: 'atrasada' },
        ],
        pdis: [
          { title: 'Rito de feedback com o time', action: 'Rodar 1:1 estruturado com roteiro padrao por 4 semanas.', deadline: '2026-06-21', status: 'fora_do_prazo' },
          { title: 'Delegacao em sprints', action: 'Aplicar matriz de autonomia em dois projetos da equipe.', deadline: '2026-06-30', status: 'em_andamento' },
        ],
        history: [
          { cycle: 'Q4 2025', score: 5.9, improved: ['Comunicacao'], worsened: ['Delegacao'] },
          { cycle: 'Q1 2026', score: 6.1, improved: ['Forecast'], worsened: ['Gestao de conflitos'] },
          { cycle: 'Q2 2026', score: 6.4, improved: ['Lideranca'], worsened: ['Execucao de metas'] },
        ],
        academy: { recommendedTrailId: leadershipTrailId },
      },
      {
        id: createId(),
        name: 'Bruno Melo',
        role: 'Analista de Operacoes',
        sector: 'Operacoes',
        score: 8.6,
        performance: 3,
        potential: 2,
        statusGoals: 'em_dia',
        statusPdi: 'em_dia',
        softSkills: [
          { name: 'Organizacao', score: 8.8, previous: 8.1 },
          { name: 'Colaboracao', score: 8.2, previous: 7.7 },
          { name: 'Ownership', score: 8.5, previous: 8.0 },
        ],
        hardSkills: [
          { name: 'Processos', score: 9.0, previous: 8.4 },
          { name: 'Analise de dados', score: 8.7, previous: 8.1 },
          { name: 'Melhoria continua', score: 8.4, previous: 7.8 },
        ],
        goals: [
          { title: 'Reduzir retrabalho em 18%', deadline: '2026-06-29', progress: 84, scoreMeta: 8.9, status: 'em_andamento' },
          { title: 'Atualizar SOP da area', deadline: '2026-07-05', progress: 63, scoreMeta: 8.0, status: 'em_andamento' },
        ],
        pdis: [
          { title: 'Mentoria cruzada', action: 'Apoiar dois Players juniores em desenho de rotina operacional.', deadline: '2026-07-01', status: 'em_andamento' },
        ],
        history: [
          { cycle: 'Q4 2025', score: 7.8, improved: ['Ownership'], worsened: ['Comunicacao executiva'] },
          { cycle: 'Q1 2026', score: 8.1, improved: ['Processos'], worsened: ['-'] },
          { cycle: 'Q2 2026', score: 8.6, improved: ['Analise de dados'], worsened: ['-'] },
        ],
        academy: { recommendedTrailId: executionTrailId },
      },
      {
        id: createId(),
        name: 'Carla Dias',
        role: 'Gerente de RH',
        sector: 'People',
        score: 7.2,
        performance: 2,
        potential: 2,
        statusGoals: 'atencao',
        statusPdi: 'em_dia',
        softSkills: [
          { name: 'Comunicacao', score: 8.0, previous: 7.1 },
          { name: 'Lideranca', score: 6.5, previous: 6.2 },
          { name: 'Escuta ativa', score: 7.7, previous: 7.4 },
        ],
        hardSkills: [
          { name: 'People analytics', score: 7.3, previous: 6.9 },
          { name: 'Rituais de performance', score: 7.1, previous: 6.8 },
          { name: 'Desenho de PDI', score: 6.8, previous: 6.2 },
        ],
        goals: [
          { title: 'Implementar comite de calibragem', deadline: '2026-06-26', progress: 68, scoreMeta: 7.0, status: 'em_andamento' },
          { title: 'Revisar trilhas de onboarding', deadline: '2026-06-20', progress: 40, scoreMeta: 5.9, status: 'atrasada' },
        ],
        pdis: [
          { title: 'Leitura de indicadores por squad', action: 'Executar leitura quinzenal com recorte por lider.', deadline: '2026-06-29', status: 'em_andamento' },
        ],
        history: [
          { cycle: 'Q4 2025', score: 6.6, improved: ['Comunicacao'], worsened: ['Priorizacao'] },
          { cycle: 'Q1 2026', score: 6.9, improved: ['People analytics'], worsened: ['Ritmo de execucao'] },
          { cycle: 'Q2 2026', score: 7.2, improved: ['Escuta ativa'], worsened: ['Follow-up de metas'] },
        ],
        academy: { recommendedTrailId: communicationTrailId },
      },
      {
        id: createId(),
        name: 'Diego Ramos',
        role: 'Supervisor de CX',
        sector: 'Customer Experience',
        score: 5.8,
        performance: 1,
        potential: 2,
        statusGoals: 'atrasado',
        statusPdi: 'atrasado',
        softSkills: [
          { name: 'Gestao de equipe', score: 5.0, previous: 5.4 },
          { name: 'Feedback', score: 5.7, previous: 5.9 },
          { name: 'Comunicacao', score: 6.0, previous: 6.1 },
        ],
        hardSkills: [
          { name: 'SLA operacional', score: 6.3, previous: 6.8 },
          { name: 'Qualidade de atendimento', score: 5.9, previous: 6.0 },
          { name: 'Analise de causa', score: 5.8, previous: 6.2 },
        ],
        goals: [
          { title: 'Reduzir backlog do suporte', deadline: '2026-06-21', progress: 48, scoreMeta: 5.4, status: 'atrasada' },
          { title: 'Fechar plano de escala', deadline: '2026-06-24', progress: 52, scoreMeta: 5.9, status: 'em_andamento' },
        ],
        pdis: [
          { title: 'Rotina de calibragem com lideres', action: 'Formalizar checkpoints semanais com foco em atendimento critico.', deadline: '2026-06-18', status: 'fora_do_prazo' },
        ],
        history: [
          { cycle: 'Q4 2025', score: 6.4, improved: ['SLA operacional'], worsened: ['Gestao de equipe'] },
          { cycle: 'Q1 2026', score: 6.1, improved: ['Comunicacao'], worsened: ['Feedback'] },
          { cycle: 'Q2 2026', score: 5.8, improved: ['-'], worsened: ['Execucao de metas'] },
        ],
        academy: { recommendedTrailId: leadershipTrailId },
      },
      {
        id: createId(),
        name: 'Fernanda Torres',
        role: 'Especialista Financeira',
        sector: 'Financeiro',
        score: 9.1,
        performance: 3,
        potential: 3,
        statusGoals: 'em_dia',
        statusPdi: 'atencao',
        softSkills: [
          { name: 'Influencia', score: 8.5, previous: 8.0 },
          { name: 'Clareza executiva', score: 9.2, previous: 8.6 },
          { name: 'Priorizacao', score: 9.0, previous: 8.4 },
        ],
        hardSkills: [
          { name: 'Planejamento financeiro', score: 9.4, previous: 8.9 },
          { name: 'Modelagem', score: 9.0, previous: 8.7 },
          { name: 'Forecast', score: 9.1, previous: 8.8 },
        ],
        goals: [
          { title: 'Fechar projeção do semestre', deadline: '2026-06-28', progress: 88, scoreMeta: 9.2, status: 'em_andamento' },
          { title: 'Automatizar rotina de fechamento', deadline: '2026-07-08', progress: 61, scoreMeta: 8.8, status: 'em_andamento' },
        ],
        pdis: [
          { title: 'Preparacao para sucessao', action: 'Liderar leitura mensal do comite executivo e mentorar um analista senior.', deadline: '2026-06-25', status: 'em_andamento' },
        ],
        history: [
          { cycle: 'Q4 2025', score: 8.4, improved: ['Influencia'], worsened: ['-'] },
          { cycle: 'Q1 2026', score: 8.7, improved: ['Forecast'], worsened: ['-'] },
          { cycle: 'Q2 2026', score: 9.1, improved: ['Clareza executiva'], worsened: ['-'] },
        ],
        academy: { recommendedTrailId: communicationTrailId },
      },
    ],
    academy: {
      trails: [
        {
          id: leadershipTrailId,
          competency: 'Lideranca',
          title: 'Liderar sem perder a clareza',
          description: 'Trilha para Players com gap em lideranca, delegacao e acompanhamento de time.',
          level: 'intermediario',
          scenario: 'Um Player do seu time nao entrega ha duas semanas. Como voce conduz a conversa sem cair em generalidades?',
          saber: {
            titleBook: 'As 5 Disfuncoes de um Time',
            summary: 'Times fortes constroem confianca, lidam com conflito produtivo e assumem compromisso claro.',
            application: 'Na proxima reuniao, troque opinioes vagas por acordos objetivos com dono, prazo e criterio de sucesso.',
          },
          flashcards: [
            {
              question: 'Qual e o primeiro passo para uma conversa de lideranca mais efetiva?',
              answer: 'Definir contexto, fato observado e expectativa com clareza.',
            },
            {
              question: 'Como reforcar accountability sem soar controlador?',
              answer: 'Combinando checkpoints, resultado esperado e autonomia de execucao.',
            },
          ],
        },
        {
          id: communicationTrailId,
          competency: 'Comunicacao',
          title: 'Comunicacao que organiza a execucao',
          description: 'Trilha para aprimorar clareza, influencia e narrativa executiva.',
          level: 'basico',
          scenario: 'Voce precisa atualizar a diretoria sobre um atraso. O que comunicar primeiro: contexto, culpados ou proxima acao?',
          saber: {
            titleBook: 'Comunicacao Nao Violenta',
            summary: 'Separar observacao, sentimento, necessidade e pedido reduz ruido e aumenta adesao.',
            application: 'Na proxima atualizacao, descreva o fato, o impacto e o pedido objetivo sem misturar julgamento.',
          },
          flashcards: [
            {
              question: 'O que torna uma comunicacao executiva mais forte?',
              answer: 'Mensagem curta, contexto claro, risco visivel e proximo passo objetivo.',
            },
            {
              question: 'Como evitar ruido em alinhamentos?',
              answer: 'Confirmando entendimento, prazo e dono da entrega no mesmo momento.',
            },
          ],
        },
        {
          id: executionTrailId,
          competency: 'Execucao',
          title: 'Execucao com disciplina e previsibilidade',
          description: 'Trilha para melhorar acompanhamento de metas, ritmo e consistencia operacional.',
          level: 'avancado',
          scenario: 'Sua meta esta perto do prazo e o progresso nao acompanha. O que fazer hoje para recuperar previsibilidade?',
          saber: {
            titleBook: 'A Meta',
            summary: 'Bons resultados aparecem quando o sistema identifica gargalos e age sobre eles com disciplina.',
            application: 'Mapeie o gargalo da semana, limite o volume paralelo e acompanhe um indicador diario de progresso.',
          },
          flashcards: [
            {
              question: 'Qual e o primeiro sinal de risco em uma meta?',
              answer: 'Prazo se aproximando com progresso abaixo do esperado e sem dono de recuperacao.',
            },
            {
              question: 'O que aumenta previsibilidade?',
              answer: 'Quebra da meta em checkpoints menores com leitura frequente de andamento.',
            },
          ],
        },
      ],
    },
  };
}

async function apiGet(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao carregar dados.');
  }
  return response.json();
}

async function loadState() {
  try {
    return await apiGet(`/api/app-state?email=${encodeURIComponent(currentUser.email)}`);
  } catch (_error) {
    return buildFallbackState();
  }
}

function getSelectedPlayer() {
  if (!appState.players.length) {
    return null;
  }

  return appState.players.find((player) => player.id === uiState.selectedPlayerId) || appState.players[0];
}

function getDashboardData() {
  const players = appState.players;
  const goalsNearDeadline = [];
  const overdueGoals = [];
  const overduePdis = [];
  const riskPlayers = [];

  players.forEach((player) => {
    player.goals.forEach((goal) => {
      const days = daysUntil(goal.deadline);
      if (goal.status !== 'concluida' && days >= 0 && days <= 7) {
        goalsNearDeadline.push({ player, ...goal, days });
      }
      if (goal.status === 'atrasada' || days < 0) {
        overdueGoals.push({ player, ...goal, days });
      }
    });

    player.pdis.forEach((pdi) => {
      const days = daysUntil(pdi.deadline);
      if (pdi.status === 'fora_do_prazo' || days < 0) {
        overduePdis.push({ player, ...pdi, days });
      }
    });

    if (player.score < 6.5 || player.statusGoals === 'atrasado' || player.statusPdi === 'atrasado') {
      riskPlayers.push(player);
    }
  });

  return {
    averageScore: (players.reduce((total, player) => total + player.score, 0) / players.length).toFixed(1),
    playersAtRisk: riskPlayers.length,
    goalsNearDeadline,
    overdueGoals,
    overduePdis,
    riskPlayers,
    topPlayers: [...players].sort((a, b) => b.score - a.score).slice(0, 3),
  };
}

function renderMetric(label, value, note) {
  return `
    <article class="metric-card">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-note">${escapeHtml(note)}</div>
    </article>
  `;
}

function renderHero() {
  const copy = copyByView[uiState.view];
  const selectedPlayer = getSelectedPlayer();
  heroCard.innerHTML = `
    <div>
      <div class="eyebrow">${escapeHtml(copy.eyebrow)}</div>
      <h1 class="hero-title">${escapeHtml(copy.heroTitle)}</h1>
      <p class="hero-copy">${escapeHtml(copy.description)}</p>
      <div class="hero-tags">
        <span class="pill">Time ${escapeHtml(appState.manager.team)}</span>
        <span class="pill">${appState.players.length} Players ativos</span>
        ${selectedPlayer ? `<span class="pill">Player foco: ${escapeHtml(selectedPlayer.name)}</span>` : ''}
      </div>
    </div>
    <div class="hero-side">
      <div class="summary-card">
        <div class="section-kicker">Gestor logado</div>
        <strong>${escapeHtml(appState.manager.name)}</strong>
        <p class="body-copy">${escapeHtml(appState.manager.role)} · ${escapeHtml(appState.manager.company)}</p>
      </div>
      <div class="summary-card">
        <div class="section-kicker">Leitura rapida</div>
        <strong>Score padrao de 1 a 10</strong>
        <p class="body-copy">Ninebox, historico e Academy conectados ao desenvolvimento de cada Player.</p>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const dashboard = getDashboardData();

  pageContent.innerHTML = `
    <div class="metrics-grid">
      ${renderMetric('Score medio do time', dashboard.averageScore, 'Media geral dos Players')}
      ${renderMetric('Metas vencendo', String(dashboard.goalsNearDeadline.length), 'Proximos 7 dias')}
      ${renderMetric('PDIs fora do prazo', String(dashboard.overduePdis.length), 'Demandam acao do gestor')}
      ${renderMetric('Players em risco', String(dashboard.playersAtRisk), 'Score baixo ou atraso relevante')}
    </div>

    <div class="two-columns">
      <section class="list-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Prioridades</div>
            <div class="section-title">Metas que vencem em breve</div>
          </div>
        </div>
        <div class="stack">
          ${dashboard.goalsNearDeadline.map((goal) => `
            <article class="alert-item">
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(goal.title)}</div>
                  <div class="item-subtitle">${escapeHtml(goal.player.name)} · ${escapeHtml(goal.player.sector)}</div>
                </div>
                <span class="deadline-badge ${goal.days <= 2 ? 'status-danger' : 'status-warning'}">${goal.days} dia(s)</span>
              </div>
              <div class="item-description">Progresso de ${goal.progress}% · Score da meta ${goal.scoreMeta.toFixed(1)}</div>
            </article>
          `).join('') || '<div class="empty-state">Nenhuma meta com vencimento iminente.</div>'}
        </div>
      </section>

      <section class="list-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Risco</div>
            <div class="section-title">Pendencias criticas</div>
          </div>
        </div>
        <div class="stack">
          ${dashboard.overdueGoals.map((goal) => `
            <article class="alert-item">
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(goal.player.name)}</div>
                  <div class="item-subtitle">Meta atrasada: ${escapeHtml(goal.title)}</div>
                </div>
                <span class="status-tag status-danger">atrasada</span>
              </div>
            </article>
          `).join('')}
          ${dashboard.overduePdis.map((pdi) => `
            <article class="alert-item">
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(pdi.player.name)}</div>
                  <div class="item-subtitle">PDI fora do prazo: ${escapeHtml(pdi.title)}</div>
                </div>
                <span class="status-tag status-danger">fora do prazo</span>
              </div>
            </article>
          `).join('') || '<div class="empty-state">Nenhuma pendencia critica identificada.</div>'}
        </div>
      </section>
    </div>

    <div class="two-columns">
      <section class="table-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Ranking</div>
            <div class="section-title">Top Players por Score</div>
          </div>
        </div>
        <div class="stack">
          ${dashboard.topPlayers.map((player, index) => `
            <article class="player-overview">
              <div class="player-card-top">
                <div>
                  <div class="player-name">${index + 1}. ${escapeHtml(player.name)}</div>
                  <div class="table-subtitle">${escapeHtml(player.role)} · ${escapeHtml(player.sector)}</div>
                </div>
                <span class="score-badge">Score ${player.score.toFixed(1)}</span>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="table-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Atencao</div>
            <div class="section-title">Players que pedem acao do gestor</div>
          </div>
        </div>
        <div class="stack">
          ${dashboard.riskPlayers.map((player) => `
            <article class="player-overview">
              <div class="player-card-top">
                <div>
                  <div class="player-name">${escapeHtml(player.name)}</div>
                  <div class="table-subtitle">${escapeHtml(player.role)} · ${escapeHtml(player.sector)}</div>
                </div>
                <span class="risk-pill ${getRiskClass(player.score)}">Score ${player.score.toFixed(1)}</span>
              </div>
              <div class="score-row">
                <button class="table-row-button" data-player="${player.id}">Abrir detalhe do Player</button>
              </div>
            </article>
          `).join('') || '<div class="empty-state">Nenhum Player em risco neste momento.</div>'}
        </div>
      </section>
    </div>
  `;
}

function renderPlayers() {
  const sectors = [...new Set(appState.players.map((player) => player.sector))];
  const filteredPlayers = appState.players.filter((player) => {
    const searchMatch = player.name.toLowerCase().includes(uiState.playersSearch.toLowerCase());
    const sectorMatch = uiState.playersSector === 'todos' || player.sector === uiState.playersSector;
    return searchMatch && sectorMatch;
  });

  pageContent.innerHTML = `
    <section class="table-card">
      <div class="panel-header">
        <div>
          <div class="section-kicker">Base geral</div>
          <div class="section-title">Players</div>
        </div>
      </div>

      <div class="toolbar">
        <input id="players-search" placeholder="Buscar Player por nome" value="${escapeHtml(uiState.playersSearch)}">
        <select id="players-sector">
          <option value="todos">Todos os setores</option>
          ${sectors.map((sector) => `<option value="${escapeHtml(sector)}" ${sector === uiState.playersSector ? 'selected' : ''}>${escapeHtml(sector)}</option>`).join('')}
        </select>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Cargo</th>
              <th>Setor</th>
              <th>Score</th>
              <th>Metas</th>
              <th>PDI</th>
              <th>Abrir</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPlayers.map((player) => `
              <tr>
                <td>
                  <div class="player-name">${escapeHtml(player.name)}</div>
                  <div class="table-subtitle">${escapeHtml(player.role)}</div>
                </td>
                <td>${escapeHtml(player.role)}</td>
                <td>${escapeHtml(player.sector)}</td>
                <td><span class="score-badge">Score ${player.score.toFixed(1)}</span></td>
                <td><span class="status-tag ${getStatusClass(player.statusGoals)}">${escapeHtml(player.statusGoals)}</span></td>
                <td><span class="status-tag ${getStatusClass(player.statusPdi)}">${escapeHtml(player.statusPdi)}</span></td>
                <td><button class="table-row-button" data-player="${player.id}">Detalhar</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderPlayerDetail() {
  const player = getSelectedPlayer();
  if (!player) {
    pageContent.innerHTML = '<div class="empty-state">Nenhum Player selecionado.</div>';
    return;
  }

  pageContent.innerHTML = `
    <div class="player-summary">
      <section class="detail-card">
        <div class="player-header">
          <div>
            <div class="section-kicker">Player selecionado</div>
            <div class="player-name">${escapeHtml(player.name)}</div>
            <div class="table-subtitle">${escapeHtml(player.role)} · ${escapeHtml(player.sector)}</div>
            <div class="status-row">
              <span class="status-tag ${getStatusClass(player.statusGoals)}">Metas ${escapeHtml(player.statusGoals)}</span>
              <span class="status-tag ${getStatusClass(player.statusPdi)}">PDI ${escapeHtml(player.statusPdi)}</span>
            </div>
          </div>
          <div class="score-ring" style="--score:${player.score}">
            <div class="score-ring-content">
              <div class="score-value">${player.score.toFixed(1)}</div>
              <div class="table-subtitle">Score</div>
            </div>
          </div>
        </div>
      </section>

      <div class="three-columns">
        <section class="detail-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">Soft skills</div>
              <div class="section-title">Leitura atual</div>
            </div>
          </div>
          <div class="skills-grid">
            ${player.softSkills.map((skill) => `
              <article class="skill-item">
                <div class="skill-line">
                  <span>${escapeHtml(skill.name)}</span>
                  <span>${skill.score.toFixed(1)}</span>
                </div>
                <div class="skill-meta">Antes: ${skill.previous.toFixed(1)}</div>
                <div class="skill-bar"><div class="skill-fill" style="width:${skill.score * 10}%"></div></div>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="detail-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">Hard skills</div>
              <div class="section-title">Leitura atual</div>
            </div>
          </div>
          <div class="skills-grid">
            ${player.hardSkills.map((skill) => `
              <article class="skill-item">
                <div class="skill-line">
                  <span>${escapeHtml(skill.name)}</span>
                  <span>${skill.score.toFixed(1)}</span>
                </div>
                <div class="skill-meta">Antes: ${skill.previous.toFixed(1)}</div>
                <div class="skill-bar"><div class="skill-fill" style="width:${skill.score * 10}%"></div></div>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="detail-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">Historico</div>
              <div class="section-title">Evolucao do Score</div>
            </div>
          </div>
          <div class="stack">
            ${player.history.map((item) => `
              <article class="history-item">
                <div class="split-line">
                  <span>${escapeHtml(item.cycle)}</span>
                  <strong>${item.score.toFixed(1)}</strong>
                </div>
                <div class="field-hint">Melhorou em: ${escapeHtml(item.improved.join(', '))}</div>
                <div class="field-hint">Piorou em: ${escapeHtml(item.worsened.join(', '))}</div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>

      <div class="two-columns">
        <section class="detail-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">Metas</div>
              <div class="section-title">Acompanhamento</div>
            </div>
          </div>
          <div class="stack">
            ${player.goals.map((goal) => `
              <article class="goal-item">
                <div class="item-top">
                  <div>
                    <div class="item-title">${escapeHtml(goal.title)}</div>
                    <div class="item-subtitle">Prazo ${formatDate(goal.deadline)}</div>
                  </div>
                  <span class="status-tag ${getStatusClass(goal.status)}">${escapeHtml(goal.status)}</span>
                </div>
                <div class="item-description">Progresso ${goal.progress}% · Score da meta ${goal.scoreMeta.toFixed(1)}</div>
                <div class="skill-bar"><div class="skill-fill" style="width:${goal.progress}%"></div></div>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="detail-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">PDI</div>
              <div class="section-title">Plano de desenvolvimento</div>
            </div>
          </div>
          <div class="stack">
            ${player.pdis.map((pdi) => `
              <article class="pdi-item">
                <div class="item-top">
                  <div>
                    <div class="item-title">${escapeHtml(pdi.title)}</div>
                    <div class="item-subtitle">Prazo ${formatDate(pdi.deadline)}</div>
                  </div>
                  <span class="status-tag ${getStatusClass(pdi.status)}">${escapeHtml(pdi.status)}</span>
                </div>
                <div class="item-description">${escapeHtml(pdi.action)}</div>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}

function renderNinebox() {
  const orderedKeys = ['3-1', '3-2', '3-3', '2-1', '2-2', '2-3', '1-1', '1-2', '1-3'];
  const cells = orderedKeys.map((key) => {
    const [performance, potential] = key.split('-').map(Number);
    const players = appState.players.filter(
      (player) => player.performance === performance && player.potential === potential
    );
    return {
      key,
      players,
      ...nineBoxDescriptions[key],
    };
  });

  pageContent.innerHTML = `
    <section class="matrix-card">
      <div class="panel-header">
        <div>
          <div class="section-kicker">Matriz 3x3</div>
          <div class="section-title">Ninebox</div>
        </div>
      </div>

      <div class="matrix-grid">
        ${cells.map((cell) => `
          <article class="cell-box">
            <div class="matrix-label">${escapeHtml(cell.key)}</div>
            <strong>${escapeHtml(cell.title)}</strong>
            <div class="cell-description">${escapeHtml(cell.description)}</div>
            <div class="cell-player-list">
              ${cell.players.map((player) => `
                <button class="player-chip" data-player="${player.id}">
                  ${escapeHtml(player.name)} · ${player.score.toFixed(1)}
                </button>
              `).join('') || '<span class="empty-state">Sem Players</span>'}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderReports() {
  pageContent.innerHTML = `
    <section class="report-card">
      <div class="panel-header">
        <div>
          <div class="section-kicker">Comparativo</div>
          <div class="section-title">Historico dos Players</div>
        </div>
      </div>
      <div class="report-grid">
        ${appState.players.map((player) => {
          const last = player.history[player.history.length - 1];
          const previous = player.history[player.history.length - 2] || last;
          const delta = last.score - previous.score;
          return `
            <article class="history-item">
              <div class="item-top">
                <div>
                  <div class="player-name">${escapeHtml(player.name)}</div>
                  <div class="table-subtitle">${escapeHtml(player.role)} · ${escapeHtml(player.sector)}</div>
                </div>
                <span class="score-badge">Score ${last.score.toFixed(1)}</span>
              </div>
              <div class="body-copy">
                ${delta >= 0
                  ? `<span class="delta-good">Melhorou ${delta.toFixed(1)} ponto(s)</span>`
                  : `<span class="delta-bad">Piorou ${Math.abs(delta).toFixed(1)} ponto(s)</span>`}
              </div>
              <div class="field-hint">Ultimo ciclo: ${escapeHtml(last.cycle)}</div>
              <div class="field-hint">Melhorou em: ${escapeHtml(last.improved.join(', '))}</div>
              <div class="field-hint">Piorou em: ${escapeHtml(last.worsened.join(', '))}</div>
              <div class="score-row">
                <button class="table-row-button" data-player="${player.id}">Abrir Player</button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderAcademy() {
  const player = getSelectedPlayer();
  const trailId = uiState.academyTrailId || (player ? player.academy.recommendedTrailId : appState.academy.trails[0].id);
  const selectedTrail = appState.academy.trails.find((trail) => trail.id === trailId) || appState.academy.trails[0];
  uiState.academyTrailId = selectedTrail.id;
  uiState.showFlashcardAnswer = false;

  pageContent.innerHTML = `
    <div class="academy-layout">
      <section class="academy-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Trilhas</div>
            <div class="section-title">Academy</div>
          </div>
        </div>
        <div class="trail-list">
          ${appState.academy.trails.map((trail) => `
            <button class="player-chip ${trail.id === selectedTrail.id ? 'active' : ''}" data-trail="${trail.id}">
              <strong>${escapeHtml(trail.title)}</strong><br>
              <span class="table-subtitle">${escapeHtml(trail.competency)} · ${escapeHtml(trail.level)}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="academy-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Conteudo recomendado</div>
            <div class="section-title">${escapeHtml(selectedTrail.title)}</div>
          </div>
          ${player ? `<span class="pill">Player foco: ${escapeHtml(player.name)}</span>` : ''}
        </div>

        <div class="stack">
          <article class="academy-scenario">
            <div class="matrix-label">Situacao pratica</div>
            <div class="item-description">${escapeHtml(selectedTrail.scenario)}</div>
          </article>

          <article class="academy-book">
            <div class="matrix-label">Saber em Pilulas</div>
            <div class="item-title">${escapeHtml(selectedTrail.saber.titleBook)}</div>
            <div class="item-description">${escapeHtml(selectedTrail.saber.summary)}</div>
            <div class="field-hint">Como aplicar hoje: ${escapeHtml(selectedTrail.saber.application)}</div>
          </article>

          ${selectedTrail.flashcards.map((flashcard, index) => `
            <article class="flashcard ${uiState.showFlashcardAnswer && index === 0 ? 'show-answer' : ''}">
              <div class="matrix-label">Quiz em flashcard ${index + 1}</div>
              <div class="flashcard-question">${escapeHtml(flashcard.question)}</div>
              <div class="flashcard-answer">${escapeHtml(flashcard.answer)}</div>
              ${index === 0 ? `
                <div class="flashcard-actions">
                  <button class="flashcard-button" data-flashcard="toggle">
                    ${uiState.showFlashcardAnswer ? 'Ocultar resposta' : 'Mostrar resposta'}
                  </button>
                </div>
              ` : ''}
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderView() {
  const copy = copyByView[uiState.view];
  pageTitle.textContent = copy.title;
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.view === uiState.view));
  renderHero();

  if (uiState.view === 'players') {
    renderPlayers();
    return;
  }
  if (uiState.view === 'player') {
    renderPlayerDetail();
    return;
  }
  if (uiState.view === 'ninebox') {
    renderNinebox();
    return;
  }
  if (uiState.view === 'relatorios') {
    renderReports();
    return;
  }
  if (uiState.view === 'academy') {
    renderAcademy();
    return;
  }

  renderDashboard();
}

function openPlayer(playerId) {
  uiState.selectedPlayerId = playerId;
  uiState.view = 'player';
  renderView();
}

function bindEvents() {
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      uiState.view = link.dataset.view;
      renderView();
    });
  });

  pageContent.addEventListener('click', (event) => {
    const playerId = event.target.getAttribute('data-player');
    const trailId = event.target.getAttribute('data-trail');
    const flashcardAction = event.target.getAttribute('data-flashcard');

    if (playerId) {
      openPlayer(playerId);
      return;
    }

    if (trailId) {
      uiState.academyTrailId = trailId;
      renderView();
      return;
    }

    if (flashcardAction === 'toggle') {
      uiState.showFlashcardAnswer = !uiState.showFlashcardAnswer;
      renderView();
    }
  });

  pageContent.addEventListener('input', (event) => {
    if (event.target.id === 'players-search') {
      uiState.playersSearch = event.target.value;
      renderPlayers();
    }
  });

  pageContent.addEventListener('change', (event) => {
    if (event.target.id === 'players-sector') {
      uiState.playersSector = event.target.value;
      renderPlayers();
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('skipAuth');
    window.location.href = 'login.html';
  });

  refreshButton.addEventListener('click', async () => {
    setStatus('Atualizando dados...');
    appState = await loadState();
    if (!uiState.selectedPlayerId && appState.players.length) {
      uiState.selectedPlayerId = appState.players[0].id;
    }
    renderView();
    setStatus(skipAuth ? 'Modo demonstracao ativo' : 'Dados sincronizados');
  });
}

async function init() {
  renderUserSummary();
  setStatus('Carregando dados...');
  appState = await loadState();
  if (appState.players.length) {
    uiState.selectedPlayerId = appState.players[0].id;
  }
  bindEvents();
  renderView();
  setStatus(skipAuth ? 'Modo demonstracao ativo' : 'Dados sincronizados');
}

init();
