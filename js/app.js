/* ═══════════════════════════════════════
   APP.JS — Utilidades y navegación
   ═══════════════════════════════════════ */

// ─── NAVEGACIÓN ───
function navigate(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  if (el) el.classList.add('active');

  // Render según página
  const renders = {
    dashboard:  () => { renderDashboard(); },
    difuntos:   () => { renderDifuntos(); },
    familiares: () => { renderFamiliares(); },
    salas:      () => { renderSalas(); },
    agenda:     () => { renderAgenda(); },
<<<<<<< HEAD
    portal:     () => { renderPortal(); renderPortalStats(); },
=======
>>>>>>> a0abcfe76f6be6b7ee2ed14498ba989b02af94b0
    reportes:   () => { renderReportes(); }
  };
  if (renders[page]) renders[page]();
}

// ─── MODALES ───
function abrirModal(id) {
  document.getElementById(id).classList.add('open');
  // Poblar selects
  if (id === 'modal-difunto') poblarSelectSalasModal();
  if (id === 'modal-familiar' || id === 'modal-evento' || id === 'modal-sala') poblarSelectExpedientes(id);
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove('open');
  // Limpiar formulario
  const modal = document.getElementById(id);
  modal.querySelectorAll('input:not([type=checkbox]), select, textarea').forEach(el => {
    if (el.type === 'hidden') return;
    el.value = '';
  });
  modal.querySelectorAll('input[type=checkbox]').forEach(el => el.checked = false);
}

function poblarSelectSalasModal() {
  const sel = document.getElementById('d-sala');
  if (!sel) return;
  sel.innerHTML = '<option value="">Sin asignar</option>' +
    DB.salas.filter(s => s.estado === 'disponible' || true).map(s =>
      `<option value="${s.nombre}">${s.nombre} (${s.estado})</option>`
    ).join('');
}

function poblarSelectExpedientes(modalId) {
  const selIds = { 'modal-familiar': 'f-expediente', 'modal-evento': 'e-expediente', 'modal-sala': 's-expediente' };
  const selId = selIds[modalId];
  const sel = document.getElementById(selId);
  if (!sel) return;
  sel.innerHTML = '<option value="">Sin expediente</option>' +
    DB.difuntos.map(d => `<option value="${d.folio}">${d.folio} — ${d.nombre} ${d.apellidos}</option>`).join('');
}

// ─── BADGE HTML ───
function badge(estado) {
  const labels = {
    pendiente: 'Pendiente', proceso: 'En Proceso', urgente: 'Urgente',
    concluido: 'Concluido', disponible: 'Disponible', ocupada: 'Ocupada',
    mantenimiento: 'Mantenimiento', programado: 'Programado',
    'en-curso': 'En Curso', finalizado: 'Finalizado', cancelado: 'Cancelado'
  };
  return `<span class="badge badge-${estado}">${labels[estado] || estado}</span>`;
}

// ─── TOAST ───
let toastTimer;
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── FORMATO FECHA ───
function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── EXPORT CSV ───
function exportCSV() {
  if (!DB.difuntos.length) { toast('Sin registros para exportar', 'error'); return; }
  const headers = ['Folio','Nombre','Apellidos','Fallecimiento','Servicio','Estado','Sala','Fecha Servicio','Fecha Ingreso','Causa','Observaciones'];
  const rows = DB.difuntos.map(d => [
    d.folio, d.nombre, d.apellidos, d.fallecimiento, d.servicio,
    d.estado, d.sala, d.fechaServicio, d.fechaIngreso, d.causa, d.obs
  ].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'funeraria_expedientes.csv'; a.click();
  URL.revokeObjectURL(url);
  toast('CSV exportado correctamente');
}

// ─── SIDEBAR STATS ───
function updateSidebarStats() {
  document.getElementById('sb-total').textContent = DB.difuntos.length;
  document.getElementById('sb-activos').textContent = DB.difuntos.filter(d => d.estado === 'proceso' || d.estado === 'urgente').length;
}

// Cerrar modal al hacer click fuera
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) cerrarModal(o.id); });
});
