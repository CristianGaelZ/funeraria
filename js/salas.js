/* ═══════════════════════════════════════
   SALAS.JS — Microservicio de Salas y Capillas
   ═══════════════════════════════════════ */

function renderSalas() {
  const container = document.getElementById('cards-salas');
  if (!container) return;

  if (!DB.salas.length) {
    container.innerHTML = '<div class="empty" style="grid-column:1/-1;padding:60px">Sin salas registradas</div>';
    return;
  }

  container.innerHTML = DB.salas.map(s => `
    <div class="sala-card">
      <div class="sala-card-header">
        <div>
          <div class="sala-card-name">${s.nombre}</div>
        </div>
        ${badge(s.estado)}
      </div>
      <div class="sala-card-body">
        <div class="sala-card-row">Capacidad <span>${s.cap ? s.cap + ' personas' : '—'}</span></div>
        <div class="sala-card-row">Expediente <span class="folio">${s.expediente || '—'}</span></div>
        <div class="sala-card-row">Inicio <span>${fmtDateTime(s.inicio)}</span></div>
        <div class="sala-card-row">Fin <span>${fmtDateTime(s.fin)}</span></div>
        ${s.equip ? `<div style="margin-top:8px;font-size:11px;color:var(--text3)">🔧 ${s.equip}</div>` : ''}
      </div>
      <div class="sala-card-actions">
        <button class="btn btn-outline btn-sm" onclick="editarSala('${s.id}')">Editar</button>
        <button class="btn btn-danger btn-sm" onclick="eliminarSala('${s.id}')">Eliminar</button>
      </div>
    </div>`).join('');
}

function guardarSala() {
  const nombre = document.getElementById('s-nombre').value.trim();
  if (!nombre) { toast('El nombre de la sala es requerido', 'error'); return; }

  const data = {
    id:          document.getElementById('s-id').value || null,
    nombre,
    cap:         document.getElementById('s-cap').value,
    estado:      document.getElementById('s-estado').value,
    expediente:  document.getElementById('s-expediente').value,
    equip:       document.getElementById('s-equip').value.trim(),
    inicio:      document.getElementById('s-inicio').value,
    fin:         document.getElementById('s-fin').value,
  };

  DB.saveSala(data);
  cerrarModal('modal-sala');
  renderSalas();
  toast(data.id ? 'Sala actualizada' : 'Sala registrada');
  document.getElementById('modal-sala-title').textContent = 'Nueva Sala / Capilla';
}

function editarSala(id) {
  const s = DB.salas.find(x => x.id === id);
  if (!s) return;
  document.getElementById('modal-sala-title').textContent = 'Editar Sala';
  document.getElementById('s-id').value = s.id;
  document.getElementById('s-nombre').value = s.nombre || '';
  document.getElementById('s-cap').value = s.cap || '';
  document.getElementById('s-estado').value = s.estado || 'disponible';
  document.getElementById('s-equip').value = s.equip || '';
  document.getElementById('s-inicio').value = s.inicio || '';
  document.getElementById('s-fin').value = s.fin || '';
  poblarSelectExpedientes('modal-sala');
  document.getElementById('s-expediente').value = s.expediente || '';
  abrirModal('modal-sala');
}

function eliminarSala(id) {
  if (!confirm('¿Eliminar esta sala?')) return;
  DB.deleteSala(id);
  renderSalas();
  toast('Sala eliminada', 'error');
}
