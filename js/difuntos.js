/* ═══════════════════════════════════════
   DIFUNTOS.JS — Microservicio de Difuntos
   ═══════════════════════════════════════ */

function renderDifuntos() {
  const q     = (document.getElementById('search-difuntos')?.value || '').toLowerCase();
  const est   = document.getElementById('filter-estado')?.value || '';
  const tbody = document.getElementById('tabla-difuntos');
  const empty = document.getElementById('empty-difuntos');
  if (!tbody) return;

  let rows = DB.difuntos.filter(d => {
    const match = !q || `${d.nombre} ${d.apellidos} ${d.folio} ${d.servicio||''}`.toLowerCase().includes(q);
    const estOk = !est || d.estado === est;
    return match && estOk;
  });

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = rows.map(d => `
    <tr>
      <td><span class="folio">${d.folio}</span></td>
      <td>${d.nombre} ${d.apellidos}</td>
      <td>${d.servicio || '—'}</td>
      <td>${d.sala || '—'}</td>
      <td>${fmtDateTime(d.fechaServicio)}</td>
      <td>${badge(d.estado)}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="verDetalleDifunto('${d.id}')" title="Ver detalle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="btn-icon" onclick="editarDifunto('${d.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="eliminarDifunto('${d.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function guardarDifunto() {
  const nombre = document.getElementById('d-nombre').value.trim();
  const apellidos = document.getElementById('d-apellidos').value.trim();
  if (!nombre || !apellidos) { toast('Nombre y apellidos son requeridos', 'error'); return; }

  const data = {
    id:           document.getElementById('d-id').value || null,
    nombre,
    apellidos,
    fallecimiento: document.getElementById('d-fallecimiento').value,
    causa:         document.getElementById('d-causa').value.trim(),
    servicio:      document.getElementById('d-servicio').value,
    estado:        document.getElementById('d-estado').value,
    sala:          document.getElementById('d-sala').value,
    fechaServicio: document.getElementById('d-fecha-servicio').value,
    obs:           document.getElementById('d-obs').value.trim(),
  };

  DB.saveDifunto(data);
  cerrarModal('modal-difunto');
  renderDifuntos();
  renderDashboard();
  updateSidebarStats();
  toast(data.id ? 'Expediente actualizado' : 'Expediente registrado');
  document.getElementById('modal-difunto-title').textContent = 'Nuevo Expediente';
}

function editarDifunto(id) {
  const d = DB.difuntos.find(x => x.id === id);
  if (!d) return;
  document.getElementById('modal-difunto-title').textContent = 'Editar Expediente';
  document.getElementById('d-id').value = d.id;
  document.getElementById('d-nombre').value = d.nombre || '';
  document.getElementById('d-apellidos').value = d.apellidos || '';
  document.getElementById('d-fallecimiento').value = d.fallecimiento || '';
  document.getElementById('d-causa').value = d.causa || '';
  document.getElementById('d-servicio').value = d.servicio || '';
  document.getElementById('d-estado').value = d.estado || 'pendiente';
  document.getElementById('d-fecha-servicio').value = d.fechaServicio || '';
  document.getElementById('d-obs').value = d.obs || '';
  poblarSelectSalasModal();
  document.getElementById('d-sala').value = d.sala || '';
  abrirModal('modal-difunto');
}

function eliminarDifunto(id) {
  if (!confirm('¿Eliminar este expediente? Esta acción no se puede deshacer.')) return;
  DB.deleteDifunto(id);
  renderDifuntos();
  renderDashboard();
  updateSidebarStats();
  toast('Expediente eliminado', 'error');
}

function verDetalleDifunto(id) {
  const d = DB.difuntos.find(x => x.id === id);
  if (!d) return;
  document.getElementById('det-titulo').textContent = `${d.nombre} ${d.apellidos}`;
  document.getElementById('det-folio').textContent = d.folio;

  const familiares = DB.familiares.filter(f => f.expediente === d.folio);

  document.getElementById('modal-detalle-body').innerHTML = `
    <div class="form-section-title">Datos del Difunto</div>
    <div class="det-grid">
      <div class="det-field"><label>Folio</label><span class="folio">${d.folio}</span></div>
      <div class="det-field"><label>Fecha de Ingreso</label><span>${d.fechaIngreso || '—'}</span></div>
      <div class="det-field"><label>Nombre Completo</label><span>${d.nombre} ${d.apellidos}</span></div>
      <div class="det-field"><label>Fallecimiento</label><span>${fmtDate(d.fallecimiento)}</span></div>
      <div class="det-field"><label>Causa</label><span>${d.causa || '—'}</span></div>
      <div class="det-field"><label>Estado</label><span>${badge(d.estado)}</span></div>
    </div>
    <div class="det-sep"></div>
    <div class="form-section-title">Servicio Funerario</div>
    <div class="det-grid">
      <div class="det-field"><label>Tipo de Servicio</label><span>${d.servicio || '—'}</span></div>
      <div class="det-field"><label>Sala Asignada</label><span>${d.sala || '—'}</span></div>
      <div class="det-field"><label>Fecha y Hora del Servicio</label><span>${fmtDateTime(d.fechaServicio)}</span></div>
    </div>
    ${d.obs ? `<div class="det-sep"></div><div class="form-section-title">Observaciones</div><p style="font-size:13px;color:var(--text2);line-height:1.6">${d.obs}</p>` : ''}
    ${familiares.length ? `
      <div class="det-sep"></div>
      <div class="form-section-title">Familiares Registrados</div>
      ${familiares.map(f => `
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">
          <span style="color:var(--text)">${f.nombre} <span style="color:var(--text3);font-size:11px">(${f.relacion})</span>${f.principal ? ' <span class="badge badge-disponible" style="font-size:9px">Principal</span>' : ''}</span>
          <span style="color:var(--text3)">${f.tel || '—'}</span>
        </div>`).join('')}` : ''}
  `;
  document.getElementById('det-editar').onclick = () => { cerrarModal('modal-detalle'); editarDifunto(id); };
  abrirModal('modal-detalle');
}
