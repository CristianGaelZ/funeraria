/* ═══════════════════════════════════════
   FAMILIARES.JS — Microservicio de Familiares
   ═══════════════════════════════════════ */

function renderFamiliares() {
  const q     = (document.getElementById('search-familiares')?.value || '').toLowerCase();
  const tbody = document.getElementById('tabla-familiares');
  const empty = document.getElementById('empty-familiares');
  if (!tbody) return;

  let rows = DB.familiares.filter(f =>
    !q || `${f.nombre} ${f.expediente || ''}`.toLowerCase().includes(q)
  );

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  tbody.innerHTML = rows.map(f => `
    <tr>
      <td>${f.nombre}</td>
      <td>${f.relacion || '—'}</td>
      <td>${f.tel || '—'}</td>
      <td>${f.email || '—'}</td>
      <td><span class="folio">${f.expediente || '—'}</span></td>
      <td>${f.principal ? '<span class="badge badge-disponible">Sí</span>' : '<span style="color:var(--text3)">No</span>'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="editarFamiliar('${f.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="eliminarFamiliar('${f.id}')" title="Eliminar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function guardarFamiliar() {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) { toast('El nombre es requerido', 'error'); return; }

  const data = {
    id:          document.getElementById('f-id').value || null,
    nombre,
    relacion:    document.getElementById('f-relacion').value,
    tel:         document.getElementById('f-tel').value.trim(),
    tel2:        document.getElementById('f-tel2').value.trim(),
    email:       document.getElementById('f-email').value.trim(),
    expediente:  document.getElementById('f-expediente').value,
    domicilio:   document.getElementById('f-domicilio').value.trim(),
    principal:   document.getElementById('f-principal').checked,
  };

  DB.saveFamiliar(data);
  cerrarModal('modal-familiar');
  renderFamiliares();
  toast(data.id ? 'Familiar actualizado' : 'Familiar registrado');
}

function editarFamiliar(id) {
  const f = DB.familiares.find(x => x.id === id);
  if (!f) return;
  document.getElementById('f-id').value = f.id;
  document.getElementById('f-nombre').value = f.nombre || '';
  document.getElementById('f-relacion').value = f.relacion || 'Cónyuge';
  document.getElementById('f-tel').value = f.tel || '';
  document.getElementById('f-tel2').value = f.tel2 || '';
  document.getElementById('f-email').value = f.email || '';
  document.getElementById('f-domicilio').value = f.domicilio || '';
  document.getElementById('f-principal').checked = !!f.principal;
  poblarSelectExpedientes('modal-familiar');
  document.getElementById('f-expediente').value = f.expediente || '';
  abrirModal('modal-familiar');
}

function eliminarFamiliar(id) {
  if (!confirm('¿Eliminar este familiar?')) return;
  DB.deleteFamiliar(id);
  renderFamiliares();
  toast('Familiar eliminado', 'error');
}
