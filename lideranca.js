const user = JSON.parse(localStorage.getItem('user') || 'null');
const skipAuth = localStorage.getItem('skipAuth') === 'true';
const currentUser = user || {
  name: 'Modo demonstracao',
  email: 'demo@atlaslideranca.local',
  role: 'Lider',
  company: 'Workspace Demo',
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
const saveButton = document.getElementById('save-btn');

const storageKey = `atlas-leadership-state:${currentUser.email}`;
let view = 'dashboard';
let appState = null;

const copyByView = {
  dashboard: {
    title: 'Painel',
    eyebrow: 'Leitura da semana',
    heroTitle: 'Lideranca evolui quando pratica vira sistema.',
    description: 'Veja os rituais, trilhas e compromissos que mais movem sua maturidade como lider nesta semana.',
  },
  trilhas: {
    title: 'Trilhas',
    eyebrow: 'Jornadas',
    heroTitle: 'Cada trilha transforma intencao em comportamento observavel.',
    description: 'Use modulos curtos, pratica aplicada e checkpoint de progresso para desenvolver competencias reais.',
  },
  avaliacoes: {
    title: 'Avaliacoes',
    eyebrow: 'Competencias',
    heroTitle: 'Lideres fortes medem o que querem melhorar.',
    description: 'Acompanhe seus niveis atuais, meta desejada e os gaps que pedem acao imediata.',
  },
  feedbacks: {
    title: 'Feedbacks',
    eyebrow: 'Aprendizado social',
    heroTitle: 'Feedback bom acelera consciencia e encurta o caminho da evolucao.',
    description: 'Centralize contexto, comportamento, impacto e proxima acao em um unico fluxo simples.',
  },
  plano: {
    title: 'Plano de acao',
    eyebrow: 'Execucao',
    heroTitle: 'Sem plano, o desenvolvimento continua bonito so no discurso.',
    description: 'Transforme cada insight em um compromisso claro com prazo, status e foco de competencia.',
  },
  perfil: {
    title: 'Perfil',
    eyebrow: 'Direcao',
    heroTitle: 'Seu contexto define o ritmo, mas a disciplina define a curva.',
    description: 'Ajuste objetivo, intencao semanal e nivel atual para manter o app coerente com a sua realidade.',
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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setSaveState(text) {
  saveIndicator.textContent = text;
}

function renderUserSummary() {
  userSummary.innerHTML = `
    <div><strong>${escapeHtml(currentUser.name)}</strong></div>
    <div class="body-copy">${escapeHtml(currentUser.role)} · ${escapeHtml(currentUser.company)}</div>
  `;
}

function buildDefaultState() {
  return {
    profile: {
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      company: currentUser.company,
      objective: 'Conduzir conversas de feedback com seguranca e consistencia.',
      level: 'Primeira lideranca',
      weeklyIntention: 'Criar mais clareza nas expectativas da equipe.',
      nextMentoring: 'Sexta-feira, 10:00',
    },
    habits: [
      {
        id: createId(),
        title: 'Check-in diario com foco',
        description: 'Definir a prioridade de lideranca do dia em 3 minutos.',
        completedToday: true,
      },
      {
        id: createId(),
        title: 'Feedback de qualidade',
        description: 'Registrar ao menos um feedback especifico por semana.',
        completedToday: false,
      },
      {
        id: createId(),
        title: 'Reflexao de encerramento',
        description: 'Anotar um aprendizado real ao final da semana.',
        completedToday: false,
      },
    ],
    tracks: [
      {
        id: createId(),
        title: 'Conversas de feedback que movem gente',
        competency: 'Feedback',
        progress: 58,
        modules: [
          { title: 'Preparar a conversa', done: true },
          { title: 'Conduzir com clareza', done: true },
          { title: 'Fechar com compromisso', done: false },
        ],
      },
      {
        id: createId(),
        title: 'Delegacao com autonomia',
        competency: 'Delegacao',
        progress: 34,
        modules: [
          { title: 'Definir resultado esperado', done: true },
          { title: 'Ajustar nivel de autonomia', done: false },
          { title: 'Acompanhar sem microgerenciar', done: false },
        ],
      },
      {
        id: createId(),
        title: 'Inteligencia emocional em pressao',
        competency: 'Inteligencia emocional',
        progress: 71,
        modules: [
          { title: 'Nomear gatilhos', done: true },
          { title: 'Regular resposta emocional', done: true },
          { title: 'Transformar conflito em alinhamento', done: false },
        ],
      },
    ],
    competencies: [
      { id: createId(), name: 'Comunicacao', current: 3, target: 4 },
      { id: createId(), name: 'Delegacao', current: 2, target: 4 },
      { id: createId(), name: 'Feedback', current: 4, target: 5 },
      { id: createId(), name: 'Gestao de equipe', current: 3, target: 4 },
      { id: createId(), name: 'Inteligencia emocional', current: 4, target: 5 },
    ],
    feedbacks: [
      {
        id: createId(),
        author: 'Patricia Almeida',
        type: 'Fortaleca',
        context: 'Reuniao semanal da equipe',
        message: 'Voce trouxe clareza para as prioridades e destravou a conversa rapidamente.',
        nextStep: 'Repetir a mesma objetividade nas conversas individuais.',
        createdAt: new Date().toISOString(),
      },
      {
        id: createId(),
        author: 'Marcelo Santos',
        type: 'Desenvolva',
        context: 'Acompanhamento de projeto',
        message: 'Faltou combinar o nivel de autonomia esperado para evitar retrabalho.',
        nextStep: 'Explicitar resultado, prazo e checkpoints antes de delegar.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    actionPlan: [
      {
        id: createId(),
        competency: 'Delegacao',
        action: 'Definir um template simples para delegacao com resultado, prazo e autonomia.',
        deadline: '2026-07-03',
        status: 'em andamento',
      },
      {
        id: createId(),
        competency: 'Feedback',
        action: 'Realizar uma conversa de feedback estruturado com cada liderado-chave.',
        deadline: '2026-07-10',
        status: 'pendente',
      },
    ],
    reflections: [
      {
        id: createId(),
        title: 'Aprendizado da semana',
        content: 'A equipe responde melhor quando eu explico contexto antes de cobrar entrega.',
      },
    ],
  };
}

async function apiGet(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Falha ao carregar dados.');
  }
  return response.json();
}

async function apiPost(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Falha ao salvar dados.');
  }
  return response.json();
}

async function loadState() {
  const localState = localStorage.getItem(storageKey);
  if (localState) {
    return JSON.parse(localState);
  }

  if (skipAuth) {
    return buildDefaultState();
  }

  try {
    const serverState = await apiGet(`/api/app-state?email=${encodeURIComponent(currentUser.email)}`);
    localStorage.setItem(storageKey, JSON.stringify(serverState));
    return serverState;
  } catch (_error) {
    return buildDefaultState();
  }
}

async function persistState(reason) {
  localStorage.setItem(storageKey, JSON.stringify(appState));
  setSaveState(reason || 'Salvando...');

  if (skipAuth) {
    setSaveState('Salvo localmente');
    return;
  }

  try {
    await apiPost('/api/app-state', {
      email: currentUser.email,
      state: appState,
    });
    setSaveState('Sincronizado');
  } catch (_error) {
    setSaveState('Salvo localmente');
  }
}

function metricCard(label, value, note) {
  return `
    <article class="metric-card">
      <div class="metric-label">${escapeHtml(label)}</div>
      <div class="metric-value">${escapeHtml(value)}</div>
      <div class="metric-note">${escapeHtml(note)}</div>
    </article>
  `;
}

function percentage(value, total) {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Sem prazo';
  }
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('pt-BR');
}

function competencyDots(value) {
  return Array.from({ length: 5 }, (_item, index) => {
    const active = index < value ? 'active' : '';
    return `<span class="kpi-dot ${active}"></span>`;
  }).join('');
}

function getSummaryMetrics() {
  const completedHabits = appState.habits.filter((habit) => habit.completedToday).length;
  const completedActions = appState.actionPlan.filter((item) => item.status === 'concluido').length;
  const averageTrack = appState.tracks.length
    ? Math.round(appState.tracks.reduce((total, track) => total + track.progress, 0) / appState.tracks.length)
    : 0;
  const biggestGap = [...appState.competencies]
    .sort((a, b) => (b.target - b.current) - (a.target - a.current))[0];

  return {
    completedHabits,
    completedActions,
    averageTrack,
    biggestGap: biggestGap ? biggestGap.name : 'Sem dados',
  };
}

function renderHero() {
  const copy = copyByView[view];
  heroCard.innerHTML = `
    <div>
      <div class="eyebrow">${escapeHtml(copy.eyebrow)}</div>
      <h1 class="hero-title">${escapeHtml(copy.heroTitle)}</h1>
      <p class="hero-copy">${escapeHtml(copy.description)}</p>
      <div class="hero-tags">
        <span class="tag">${escapeHtml(appState.profile.level)}</span>
        <span class="tag">${escapeHtml(appState.profile.weeklyIntention)}</span>
        <span class="tag">${escapeHtml(appState.profile.nextMentoring)}</span>
      </div>
    </div>
    <div class="hero-side">
      <div class="side-panel">
        <div class="section-kicker">Objetivo atual</div>
        <strong>${escapeHtml(appState.profile.objective)}</strong>
        <p class="body-copy">Meta semanal: ${escapeHtml(appState.profile.weeklyIntention)}</p>
      </div>
      <div class="side-panel">
        <div class="section-kicker">Proxima sessao</div>
        <strong>${escapeHtml(appState.profile.nextMentoring)}</strong>
        <p class="body-copy">Use esse momento para revisar trilhas, gaps e compromissos em aberto.</p>
      </div>
    </div>
  `;
}

function renderDashboard() {
  const summary = getSummaryMetrics();
  const nextAction = appState.actionPlan[0];
  const reflection = appState.reflections[0];

  pageContent.innerHTML = `
    <div class="metrics-grid">
      ${metricCard('Habitos concluidos hoje', String(summary.completedHabits), 'Ritmo diario de lideranca')}
      ${metricCard('Media das trilhas', `${summary.averageTrack}%`, 'Progresso consolidado')}
      ${metricCard('Acoes concluidas', String(summary.completedActions), 'Execucao do PDI')}
      ${metricCard('Maior gap atual', summary.biggestGap, 'Prioridade de desenvolvimento')}
    </div>

    <div class="grid-2">
      <section class="grid-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Rituais</div>
            <h3>Habitos de lideranca da semana</h3>
          </div>
          <span class="tag">${summary.completedHabits}/${appState.habits.length} feitos hoje</span>
        </div>
        <div class="stack">
          ${appState.habits.map((habit) => `
            <article class="habit-item">
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(habit.title)}</div>
                  <div class="item-description">${escapeHtml(habit.description)}</div>
                </div>
                <button class="status-button ${habit.completedToday ? 'done' : ''}" data-toggle-habit="${habit.id}">
                  ${habit.completedToday ? 'Concluido' : 'Marcar como feito'}
                </button>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="grid-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Foco</div>
            <h3>Compromisso em evidencia</h3>
          </div>
        </div>
        <article class="reflection-card">
          <h3>${nextAction ? escapeHtml(nextAction.competency) : 'Sem acao priorizada'}</h3>
          <p class="body-copy">${nextAction ? escapeHtml(nextAction.action) : 'Crie o primeiro item do seu plano para puxar a evolucao.'}</p>
          <div class="split-line">
            <span>Prazo</span>
            <strong>${nextAction ? formatDate(nextAction.deadline) : 'A definir'}</strong>
          </div>
        </article>
        <article class="reflection-card">
          <h3>${reflection ? escapeHtml(reflection.title) : 'Sem reflexao ainda'}</h3>
          <p class="body-copy">${reflection ? escapeHtml(reflection.content) : 'Registre um aprendizado para consolidar o que funcionou na pratica.'}</p>
        </article>
      </section>
    </div>

    <div class="grid-2">
      <section class="timeline-card">
        <div class="section-kicker">Trilhas</div>
        <h3>Jornadas em andamento</h3>
        <div class="stack">
          ${appState.tracks.map((track) => `
            <article class="track-item">
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(track.title)}</div>
                  <div class="item-subtitle">${escapeHtml(track.competency)}</div>
                </div>
                <button class="status-button" data-advance-track="${track.id}">Avancar</button>
              </div>
              <div class="progress-wrap">
                <div class="progress-track"><div class="progress-bar" style="width:${track.progress}%"></div></div>
                <div class="progress-labels">
                  <span>${track.progress}% concluido</span>
                  <span>${track.modules.filter((module) => module.done).length}/${track.modules.length} modulos</span>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="timeline-card">
        <div class="section-kicker">Competencias</div>
        <h3>Gap entre nivel atual e desejado</h3>
        <div class="stack">
          ${appState.competencies.map((competency) => `
            <article class="competency-item">
              <div class="item-top">
                <div class="item-title">${escapeHtml(competency.name)}</div>
                <div class="tag">Meta ${competency.target}/5</div>
              </div>
              <div class="kpi-line">
                <span>Nivel atual</span>
                <div class="kpi-scale">${competencyDots(competency.current)}</div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderTracks() {
  pageContent.innerHTML = `
    <div class="cards-grid">
      ${appState.tracks.map((track) => `
        <article class="grid-card">
          <div class="panel-header">
            <div>
              <div class="section-kicker">${escapeHtml(track.competency)}</div>
              <h3>${escapeHtml(track.title)}</h3>
            </div>
            <button class="status-button" data-advance-track="${track.id}">Avancar 8%</button>
          </div>
          <div class="progress-wrap">
            <div class="progress-track"><div class="progress-bar" style="width:${track.progress}%"></div></div>
            <div class="progress-labels">
              <span>${track.progress}% do percurso</span>
              <span>${track.modules.filter((module) => module.done).length} modulos finalizados</span>
            </div>
          </div>
          <div class="stack">
            ${track.modules.map((module) => `
              <div class="habit-item">
                <div class="split-line">
                  <span>${escapeHtml(module.title)}</span>
                  <strong>${module.done ? 'Feito' : 'Pendente'}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderAssessments() {
  pageContent.innerHTML = `
    <div class="grid-2">
      <section class="list-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Radar simplificado</div>
            <h3>Competencias atuais</h3>
          </div>
          <span class="tag">Escala de 1 a 5</span>
        </div>
        <div class="stack">
          ${appState.competencies.map((competency) => `
            <article class="competency-item">
              <div class="item-top">
                <div class="item-title">${escapeHtml(competency.name)}</div>
                <div class="tag">Meta ${competency.target}/5</div>
              </div>
              <div class="kpi-line">
                <span>Nivel atual</span>
                <div class="kpi-scale">${competencyDots(competency.current)}</div>
              </div>
              <div class="form-grid">
                <div class="form-row">
                  <label for="current-${competency.id}">Nivel atual</label>
                  <select id="current-${competency.id}" data-competency="${competency.id}" data-field="current">
                    ${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${value === competency.current ? 'selected' : ''}>${value}</option>`).join('')}
                  </select>
                </div>
                <div class="form-row">
                  <label for="target-${competency.id}">Nivel desejado</label>
                  <select id="target-${competency.id}" data-competency="${competency.id}" data-field="target">
                    ${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${value === competency.target ? 'selected' : ''}>${value}</option>`).join('')}
                  </select>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="form-card">
        <div class="section-kicker">Como ler</div>
        <h3>Interpretacao rapida</h3>
        <div class="stack">
          ${appState.competencies
            .slice()
            .sort((a, b) => (b.target - b.current) - (a.target - a.current))
            .map((competency) => `
              <article class="habit-item">
                <div class="split-line">
                  <span>${escapeHtml(competency.name)}</span>
                  <strong>Gap de ${competency.target - competency.current}</strong>
                </div>
                <div class="item-description">
                  ${competency.target === competency.current
                    ? 'Competencia em alinhamento com a meta desejada.'
                    : 'Existe espaco claro para desenvolvimento intencional nesta competencia.'}
                </div>
              </article>
            `).join('')}
        </div>
      </section>
    </div>
  `;
}

function renderFeedbacks() {
  pageContent.innerHTML = `
    <div class="grid-2">
      <section class="list-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">Historico</div>
            <h3>Feedbacks registrados</h3>
          </div>
          <span class="tag">${appState.feedbacks.length} registros</span>
        </div>
        <div class="stack">
          ${appState.feedbacks.length ? appState.feedbacks.map((feedback) => `
            <article class="feedback-item">
              <div class="feedback-type">${escapeHtml(feedback.type)}</div>
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(feedback.author)}</div>
                  <div class="item-subtitle">${escapeHtml(feedback.context)}</div>
                </div>
                <div class="tag">${new Date(feedback.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
              <div class="body-copy">${escapeHtml(feedback.message)}</div>
              <div class="field-hint">Proxima acao: ${escapeHtml(feedback.nextStep)}</div>
            </article>
          `).join('') : '<div class="empty-state">Nenhum feedback registrado ainda.</div>'}
        </div>
      </section>

      <section class="form-card">
        <div class="section-kicker">Novo registro</div>
        <h3>Adicionar feedback estruturado</h3>
        <form id="feedback-form" class="form-grid">
          <div class="form-row">
            <label for="feedback-author">Autor</label>
            <input id="feedback-author" name="author" placeholder="Ex.: Gestor direto" required>
          </div>
          <div class="form-row">
            <label for="feedback-type">Tipo</label>
            <select id="feedback-type" name="type">
              <option>Fortaleca</option>
              <option>Desenvolva</option>
            </select>
          </div>
          <div class="form-row full">
            <label for="feedback-context">Contexto</label>
            <input id="feedback-context" name="context" placeholder="Ex.: Reuniao 1:1 mensal" required>
          </div>
          <div class="form-row full">
            <label for="feedback-message">Comportamento e impacto</label>
            <textarea id="feedback-message" name="message" placeholder="O que aconteceu e qual impacto gerou?" required></textarea>
          </div>
          <div class="form-row full">
            <label for="feedback-next">Proxima acao</label>
            <textarea id="feedback-next" name="nextStep" placeholder="Qual o proximo experimento ou ajuste?"></textarea>
          </div>
          <div class="form-row full">
            <button class="primary-button" type="submit">Salvar feedback</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderActionPlan() {
  pageContent.innerHTML = `
    <div class="grid-2">
      <section class="list-card">
        <div class="panel-header">
          <div>
            <div class="section-kicker">PDI</div>
            <h3>Itens do plano de acao</h3>
          </div>
        </div>
        <div class="stack">
          ${appState.actionPlan.length ? appState.actionPlan.map((item) => `
            <article class="action-item">
              <div class="action-status">${escapeHtml(item.status)}</div>
              <div class="item-top">
                <div>
                  <div class="item-title">${escapeHtml(item.competency)}</div>
                  <div class="item-description">${escapeHtml(item.action)}</div>
                </div>
                <button class="status-button" data-action-status="${item.id}">Atualizar status</button>
              </div>
              <div class="action-meta">
                <span class="tag">Prazo ${formatDate(item.deadline)}</span>
              </div>
            </article>
          `).join('') : '<div class="empty-state">Seu plano ainda esta vazio.</div>'}
        </div>
      </section>

      <section class="form-card">
        <div class="section-kicker">Nova acao</div>
        <h3>Criar item de desenvolvimento</h3>
        <form id="action-form" class="form-grid">
          <div class="form-row">
            <label for="action-competency">Competencia</label>
            <input id="action-competency" name="competency" placeholder="Ex.: Delegacao" required>
          </div>
          <div class="form-row">
            <label for="action-deadline">Prazo</label>
            <input id="action-deadline" type="date" name="deadline" required>
          </div>
          <div class="form-row full">
            <label for="action-text">Acao</label>
            <textarea id="action-text" name="action" placeholder="Descreva a pratica concreta que voce vai executar." required></textarea>
          </div>
          <div class="form-row full">
            <button class="primary-button" type="submit">Adicionar ao plano</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderProfile() {
  pageContent.innerHTML = `
    <div class="grid-2">
      <section class="list-card">
        <div class="section-kicker">Panorama</div>
        <h3>Identidade do lider</h3>
        <div class="profile-grid">
          <article class="profile-line">
            <span>Nome</span>
            <strong>${escapeHtml(appState.profile.name)}</strong>
          </article>
          <article class="profile-line">
            <span>Papel</span>
            <strong>${escapeHtml(appState.profile.role)}</strong>
          </article>
          <article class="profile-line">
            <span>Empresa</span>
            <strong>${escapeHtml(appState.profile.company)}</strong>
          </article>
          <article class="profile-line">
            <span>Nivel atual</span>
            <strong>${escapeHtml(appState.profile.level)}</strong>
          </article>
        </div>
        <div class="reflection-card">
          <h3>Objetivo principal</h3>
          <p class="body-copy">${escapeHtml(appState.profile.objective)}</p>
        </div>
      </section>

      <section class="form-card">
        <div class="section-kicker">Ajustes</div>
        <h3>Atualizar direcionadores</h3>
        <form id="profile-form" class="form-grid">
          <div class="form-row">
            <label for="profile-level">Nivel atual</label>
            <input id="profile-level" name="level" value="${escapeHtml(appState.profile.level)}" required>
          </div>
          <div class="form-row">
            <label for="profile-next">Proxima mentoria</label>
            <input id="profile-next" name="nextMentoring" value="${escapeHtml(appState.profile.nextMentoring)}" required>
          </div>
          <div class="form-row full">
            <label for="profile-objective">Objetivo principal</label>
            <textarea id="profile-objective" name="objective" required>${escapeHtml(appState.profile.objective)}</textarea>
          </div>
          <div class="form-row full">
            <label for="profile-intention">Intencao da semana</label>
            <textarea id="profile-intention" name="weeklyIntention" required>${escapeHtml(appState.profile.weeklyIntention)}</textarea>
          </div>
          <div class="form-row full">
            <button class="primary-button" type="submit">Salvar perfil</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function renderView() {
  const copy = copyByView[view];
  pageTitle.textContent = copy.title;
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  renderHero();

  switch (view) {
    case 'trilhas':
      renderTracks();
      break;
    case 'avaliacoes':
      renderAssessments();
      break;
    case 'feedbacks':
      renderFeedbacks();
      break;
    case 'plano':
      renderActionPlan();
      break;
    case 'perfil':
      renderProfile();
      break;
    default:
      renderDashboard();
  }
}

function cycleActionStatus(current) {
  const statuses = ['pendente', 'em andamento', 'concluido'];
  const index = statuses.indexOf(current);
  return statuses[(index + 1) % statuses.length];
}

function bindEvents() {
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      view = link.dataset.view;
      renderView();
    });
  });

  pageContent.addEventListener('click', async (event) => {
    const habitId = event.target.getAttribute('data-toggle-habit');
    const trackId = event.target.getAttribute('data-advance-track');
    const actionId = event.target.getAttribute('data-action-status');

    if (habitId) {
      const habit = appState.habits.find((item) => item.id === habitId);
      if (habit) {
        habit.completedToday = !habit.completedToday;
        renderView();
        await persistState('Habito atualizado');
      }
      return;
    }

    if (trackId) {
      const track = appState.tracks.find((item) => item.id === trackId);
      if (track) {
        track.progress = Math.min(track.progress + 8, 100);
        const pendingModule = track.modules.find((module) => !module.done);
        if (pendingModule) {
          pendingModule.done = true;
        }
        renderView();
        await persistState('Trilha atualizada');
      }
      return;
    }

    if (actionId) {
      const action = appState.actionPlan.find((item) => item.id === actionId);
      if (action) {
        action.status = cycleActionStatus(action.status);
        renderView();
        await persistState('Plano atualizado');
      }
    }
  });

  pageContent.addEventListener('change', async (event) => {
    const competencyId = event.target.getAttribute('data-competency');
    const field = event.target.getAttribute('data-field');
    if (!competencyId || !field) {
      return;
    }

    const competency = appState.competencies.find((item) => item.id === competencyId);
    if (competency) {
      competency[field] = Number(event.target.value);
      renderView();
      await persistState('Competencias atualizadas');
    }
  });

  pageContent.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (event.target.id === 'feedback-form') {
      const formData = new FormData(event.target);
      appState.feedbacks.unshift({
        id: createId(),
        author: formData.get('author'),
        type: formData.get('type'),
        context: formData.get('context'),
        message: formData.get('message'),
        nextStep: formData.get('nextStep') || 'Sem proxima acao registrada.',
        createdAt: new Date().toISOString(),
      });
      renderView();
      await persistState('Feedback salvo');
      return;
    }

    if (event.target.id === 'action-form') {
      const formData = new FormData(event.target);
      appState.actionPlan.unshift({
        id: createId(),
        competency: formData.get('competency'),
        action: formData.get('action'),
        deadline: formData.get('deadline'),
        status: 'pendente',
      });
      renderView();
      await persistState('Plano salvo');
      return;
    }

    if (event.target.id === 'profile-form') {
      const formData = new FormData(event.target);
      appState.profile.level = formData.get('level');
      appState.profile.nextMentoring = formData.get('nextMentoring');
      appState.profile.objective = formData.get('objective');
      appState.profile.weeklyIntention = formData.get('weeklyIntention');
      renderView();
      await persistState('Perfil salvo');
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('skipAuth');
    window.location.href = 'login.html';
  });

  saveButton.addEventListener('click', async () => {
    await persistState('Salvando...');
  });
}

async function init() {
  renderUserSummary();
  setSaveState('Carregando...');
  appState = await loadState();
  bindEvents();
  renderView();
  setSaveState(skipAuth ? 'Salvo localmente' : 'Sincronizado');
}

init();
