/* ═══════════════════════════════════════
   AGENDA.JS — Microservicio de Agenda
   ═══════════════════════════════════════ */

function renderAgenda() {
  const container = document.getElementById('agenda-lista');
  if (!container) return;

  const eventos = [...DB.eventos].sort((a, b) => {
    const da = a.inicio ? new Date(a.inicio) : new Date(0);
    const db2 = b.inicio ? new Date(b.inicio) : new Date(0);
    return da - db2;
  });

  if (!eventos.length) {
    container.innerHTML = '<div class="empty">Sin eventos programados</div>';
    return;
  }

  container.innerHTML = eventos.map(e => {
    const d = e.inicio ? new Date(e.inicio) : null;
    return `
      <div class="agenda-evento">
        <div class="agenda-date-box">
          ${d ? `<div class="day">${d.getDate()}</div>
          <div class="month">${d.toLocaleString('es-MX', { month: 'short' })}</div>` : '<div class="day">—</div>'}
        </div>
        <div class="agenda-info">
          <div class="agenda-title">${e.titulo}</div>
          <div class="agenda-meta">${e.tipo} · ${e.lugar || 'Sin lugar'} · <span class="folio">${e.expediente || '—'}</span></div>
          ${d ? `<div class="agenda-time">${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs${e.fin ? ' — ' + new Date(e.fin).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + ' hrs' : ''}</div>` : ''}
          ${e.personal ? `<div style="font-size:11px;color:var(--text3);margin-top:4px">Personal: ${e.personal}</div>` : ''}
        </div>
        <div class="agenda-actions">
          ${badge(e.estado)}
          <button class="btn-icon" onclick="editarEvento('${e.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="eliminarEvento('${e.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

function guardarEvento() {
  const titulo = document.getElementById('e-titulo').value.trim();
  if (!titulo) { toast('El título del evento es requerido', 'error'); return; }

  const data = {
    id:          document.getElementById('e-id').value || null,
    titulo,
    tipo:        document.getElementById('e-tipo').value,
    expediente:  document.getElementById('e-expediente').value,
    inicio:      document.getElementById('e-inicio').value,
    fin:         document.getElementById('e-fin').value,
    lugar:       document.getElementById('e-lugar').value.trim(),
    estado:      document.getElementById('e-estado').value,
    personal:    document.getElementById('e-personal').value.trim(),
  };

  DB.saveEvento(data);
  cerrarModal('modal-evento');
  renderAgenda();
  toast(data.id ? 'Evento actualizado' : 'Evento registrado');
}

function editarEvento(id) {
  const e = DB.eventos.find(x => x.id === id);
  if (!e) return;
  document.getElementById('e-id').value = e.id;
  document.getElementById('e-titulo').value = e.titulo || '';
  document.getElementById('e-tipo').value = e.tipo || 'Velación';
  document.getElementById('e-inicio').value = e.inicio || '';
  document.getElementById('e-fin').value = e.fin || '';
  document.getElementById('e-lugar').value = e.lugar || '';
  document.getElementById('e-estado').value = e.estado || 'programado';
  document.getElementById('e-personal').value = e.personal || '';
  poblarSelectExpedientes('modal-evento');
  document.getElementById('e-expediente').value = e.expediente || '';
  abrirModal('modal-evento');
}

function eliminarEvento(id) {
  if (!confirm('¿Eliminar este evento?')) return;
  DB.deleteEvento(id);
  renderAgenda();
  toast('Evento eliminado', 'error');
}
