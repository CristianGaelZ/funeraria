/* ═══════════════════════════════════════
   REPORTES.JS — Microservicio de Reportes
   ═══════════════════════════════════════ */

function renderReportes() {
  renderRepEstados();
  renderRepServicios();
  renderRepSalas();
  renderRepResumen();
}

function barRow(label, val, max, color = 'var(--gold)') {
  const pct = max > 0 ? Math.round(val / max * 100) : 0;
  return `
    <div class="rep-bar-row">
      <div class="rep-bar-label">
        <span>${label}</span>
        <strong style="color:${color}">${val}</strong>
      </div>
      <div class="rep-bar-track">
        <div class="rep-bar-fill" style="width:${pct}%;background:${color}"></div>
      </div>
    </div>`;
}

function renderRepEstados() {
  const el = document.getElementById('rep-estados');
  if (!el) return;

  const total = DB.difuntos.length;
  if (!total) { el.innerHTML = '<div class="empty">Sin datos aún</div>'; return; }

  const counts = { pendiente: 0, proceso: 0, urgente: 0, concluido: 0 };
  DB.difuntos.forEach(d => { if (d.estado in counts) counts[d.estado]++; });

  const colors = { pendiente: '#e09040', proceso: '#6fb8ef', urgente: '#e07080', concluido: 'var(--text3)' };
  const labels = { pendiente: 'Pendiente', proceso: 'En Proceso', urgente: 'Urgente', concluido: 'Concluido' };

  el.innerHTML = Object.entries(counts)
    .map(([k, v]) => barRow(labels[k], v, total, colors[k]))
    .join('');
}

function renderRepServicios() {
  const el = document.getElementById('rep-servicios');
  if (!el) return;

  const map = {};
  DB.difuntos.forEach(d => { if (d.servicio) map[d.servicio] = (map[d.servicio] || 0) + 1; });

  if (!Object.keys(map).length) { el.innerHTML = '<div class="empty">Sin datos aún</div>'; return; }

  const max = Math.max(...Object.values(map));
  const colors = ['var(--gold)', '#6fb8ef', '#5ec9a0', '#e09040', '#c46070'];

  el.innerHTML = Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v], i) => barRow(k, v, max, colors[i % colors.length]))
    .join('');
}

function renderRepSalas() {
  const el = document.getElementById('rep-salas');
  if (!el) return;

  if (!DB.salas.length) { el.innerHTML = '<div class="empty">Sin salas registradas</div>'; return; }

  const total = DB.salas.length;
  const disp = DB.salas.filter(s => s.estado === 'disponible').length;
  const ocup = DB.salas.filter(s => s.estado === 'ocupada').length;
  const mant = DB.salas.filter(s => s.estado === 'mantenimiento').length;

  el.innerHTML = [
    barRow('Disponibles', disp, total, '#5ec9a0'),
    barRow('Ocupadas', ocup, total, '#e07080'),
    barRow('En Mantenimiento', mant, total, '#e09040'),
  ].join('');
}

function renderRepResumen() {
  const el = document.getElementById('rep-resumen');
  if (!el) return;

  const total = DB.difuntos.length;
  const urgentes = DB.difuntos.filter(d => d.estado === 'urgente').length;
  const concluidos = DB.difuntos.filter(d => d.estado === 'concluido').length;
  const tasaCierre = total > 0 ? Math.round(concluidos / total * 100) : 0;
  const familiaresTotal = DB.familiares.length;
  const eventosTotal = DB.eventos.length;
  const salasDisp = DB.salas.filter(s => s.estado === 'disponible').length;

  el.innerHTML = [
    ['Total de Expedientes', total],
    ['Casos Urgentes Activos', urgentes],
    ['Tasa de Cierre', tasaCierre + '%'],
    ['Familiares Registrados', familiaresTotal],
    ['Eventos en Agenda', eventosTotal],
    ['Salas Disponibles', salasDisp + ' / ' + DB.salas.length],
  ].map(([label, val]) => `
    <div class="rep-metric">
      <span class="rep-metric-label">${label}</span>
      <span class="rep-metric-val">${val}</span>
    </div>`).join('');
}
