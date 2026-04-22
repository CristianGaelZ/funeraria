/* ═══════════════════════════════════════
   PORTAL.JS — Portal Público de Familias
   Registro de usuarios y agendamiento de velaciones
   ═══════════════════════════════════════ */

// ─── RENDER PORTAL FAMILIAS ───
function renderPortal() {
  const sol = document.getElementById('portal-solicitudes');
  if (!sol) return;

  const solicitudes = (DB.solicitudes || []).slice().sort((a,b) => {
    return new Date(b.fechaSolicitud||0) - new Date(a.fechaSolicitud||0);
  });

  if (!solicitudes.length) {
    sol.innerHTML = '<div class="empty">Sin solicitudes registradas por familias</div>';
    return;
  }

  sol.innerHTML = solicitudes.map(s => {
    const statusMap = {
      pendiente: { label: 'Pendiente revisión', cls: 'pendiente' },
      aprobada:  { label: 'Aprobada', cls: 'proceso' },
      rechazada: { label: 'Rechazada', cls: 'urgente' },
      concluida: { label: 'Concluida', cls: 'concluido' },
    };
    const st = statusMap[s.estado] || statusMap.pendiente;
    return `
    <div class="portal-card ${s.estado === 'pendiente' ? 'portal-card-new' : ''}">
      <div class="portal-card-head">
        <div>
          <div class="portal-card-name">${s.difuntoNombre}</div>
          <div class="portal-card-meta">
            Solicitante: <strong>${s.solicitanteNombre}</strong> · 
            Tel: ${s.tel || '—'} · 
            <span class="folio">#${s.folio}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${badge(st.cls)}
          <button class="btn-icon" onclick="aprobarSolicitud('${s.id}')" title="Aprobar y convertir en expediente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button class="btn-icon btn-danger" onclick="rechazarSolicitud('${s.id}')" title="Rechazar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="portal-card-body">
        <div class="portal-info-grid">
          <div><span>Tipo de Servicio</span><strong>${s.tipoServicio || '—'}</strong></div>
          <div><span>Tipo de Velación</span><strong>${s.tipoVelacion || '—'}</strong></div>
          <div><span>Fecha Solicitada</span><strong>${fmtDateTime(s.fechaServicio) || '—'}</strong></div>
          <div><span>Duración</span><strong>${s.duracion || '—'}</strong></div>
          <div><span>Sala Preferida</span><strong>${s.salaPreferida || 'Sin preferencia'}</strong></div>
          <div><span>Fecha Solicitud</span><strong>${fmtDate(s.fechaSolicitud)}</strong></div>
        </div>
        ${s.notas ? `<div class="portal-notas"><em>"${s.notas}"</em></div>` : ''}
        ${s.serviciosExtra && s.serviciosExtra.length ? `
          <div class="portal-extras">
            <span>Servicios adicionales:</span>
            ${s.serviciosExtra.map(e => `<span class="badge-extra">${e}</span>`).join('')}
          </div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function aprobarSolicitud(id) {
  const s = (DB.solicitudes || []).find(x => x.id === id);
  if (!s) return;
  if (!confirm(`¿Aprobar la solicitud de ${s.solicitanteNombre} para ${s.difuntoNombre}?\n\nSe creará un expediente y un evento en la agenda automáticamente.`)) return;

  // Crear difunto
  DB.saveDifunto({
    nombre:        s.difuntoNombre.split(' ')[0] || s.difuntoNombre,
    apellidos:     s.difuntoNombre.split(' ').slice(1).join(' ') || '',
    fallecimiento: s.fechaFallecimiento || '',
    causa:         s.causa || '',
    servicio:      s.tipoServicio || 'Velación',
    estado:        'proceso',
    sala:          s.salaPreferida || '',
    fechaServicio: s.fechaServicio || '',
    obs:           `Solicitud web. Contacto: ${s.solicitanteNombre} (${s.tel}). ${s.notas || ''}`,
  });

  // Crear familiar
  DB.saveFamiliar({
    nombre:      s.solicitanteNombre,
    relacion:    s.relacion || 'Familiar',
    tel:         s.tel || '',
    email:       s.email || '',
    expediente:  DB.difuntos[0]?.folio || '',
    principal:   true,
  });

  // Crear evento en agenda
  const finEvento = s.fechaServicio ? new Date(new Date(s.fechaServicio).getTime() + (parseInt(s.duracion)||4)*3600000).toISOString().slice(0,16) : '';
  DB.saveEvento({
    titulo:     `${s.tipoVelacion || s.tipoServicio} — ${s.difuntoNombre}`,
    tipo:       s.tipoServicio || 'Velación',
    expediente: DB.difuntos[0]?.folio || '',
    inicio:     s.fechaServicio || '',
    fin:        finEvento,
    lugar:      s.salaPreferida || 'Por asignar',
    estado:     'programado',
    personal:   '',
  });

  // Actualizar estado solicitud
  const idx = DB.solicitudes.findIndex(x => x.id === id);
  if (idx >= 0) { DB.solicitudes[idx].estado = 'aprobada'; DB.save(); }

  renderPortal();
  renderDashboard();
  toast('✓ Solicitud aprobada — expediente y evento creados', 'success');
}

function rechazarSolicitud(id) {
  const s = (DB.solicitudes || []).find(x => x.id === id);
  if (!s) return;
  if (!confirm(`¿Rechazar la solicitud de ${s.solicitanteNombre}?`)) return;
  const idx = DB.solicitudes.findIndex(x => x.id === id);
  if (idx >= 0) { DB.solicitudes[idx].estado = 'rechazada'; DB.save(); }
  renderPortal();
  toast('Solicitud rechazada', 'error');
}

// ─── PORTAL PÚBLICO (pantalla de registro) ───
function mostrarPortalPublico() {
  document.getElementById('public-portal-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('public-portal-overlay').classList.remove('hidden'), 10);
  poblarSalasPortal();
}

function cerrarPortalPublico() {
  const el = document.getElementById('public-portal-overlay');
  el.classList.add('hidden');
  setTimeout(() => el.style.display = 'none', 400);
}

function poblarSalasPortal() {
  const sel = document.getElementById('pp-sala');
  if (!sel) return;
  sel.innerHTML = '<option value="">Sin preferencia</option>' +
    (DB.salas || []).filter(s => s.estado === 'disponible').map(s =>
      `<option value="${s.nombre}">${s.nombre} (cap. ${s.cap||'?'} personas)</option>`
    ).join('');
}

// Pasos del wizard
let portalStep = 1;
const PORTAL_STEPS = 3;

function portalNextStep() {
  if (!validarPasoPortal(portalStep)) return;
  if (portalStep < PORTAL_STEPS) {
    portalStep++;
    actualizarPasoPortal();
  }
}

function portalPrevStep() {
  if (portalStep > 1) { portalStep--; actualizarPasoPortal(); }
}

function actualizarPasoPortal() {
  document.querySelectorAll('.portal-step').forEach((el, i) => {
    el.classList.toggle('active', i+1 === portalStep);
  });
  document.querySelectorAll('.pp-stepper-dot').forEach((el, i) => {
    el.classList.toggle('done', i+1 < portalStep);
    el.classList.toggle('active', i+1 === portalStep);
  });
  document.getElementById('pp-prev').style.visibility = portalStep === 1 ? 'hidden' : 'visible';
  document.getElementById('pp-next').style.display = portalStep === PORTAL_STEPS ? 'none' : 'inline-flex';
  document.getElementById('pp-submit').style.display = portalStep === PORTAL_STEPS ? 'inline-flex' : 'none';
}

function validarPasoPortal(step) {
  const err = document.getElementById('pp-error');
  err.style.display = 'none';
  if (step === 1) {
    const nombre = document.getElementById('pp-sol-nombre').value.trim();
    const tel    = document.getElementById('pp-sol-tel').value.trim();
    const pass   = document.getElementById('pp-sol-pass').value.trim();
    const user   = document.getElementById('pp-sol-usuario').value.trim();
    if (!nombre || !tel || !user || !pass) {
      err.textContent = 'Por favor complete todos los campos obligatorios.';
      err.style.display = 'block'; return false;
    }
    if (pass.length < 6) {
      err.textContent = 'La contraseña debe tener al menos 6 caracteres.';
      err.style.display = 'block'; return false;
    }
    // Verificar usuario único
    const usuarios = JSON.parse(localStorage.getItem('fgr_usuarios_publicos') || '[]');
    if (usuarios.find(u => u.usuario === user)) {
      err.textContent = 'Ese nombre de usuario ya está en uso. Elige otro.';
      err.style.display = 'block'; return false;
    }
  }
  if (step === 2) {
    const difunto = document.getElementById('pp-difunto-nombre').value.trim();
    const tipo    = document.getElementById('pp-tipo-servicio').value;
    if (!difunto || !tipo) {
      err.textContent = 'El nombre del difunto y el tipo de servicio son requeridos.';
      err.style.display = 'block'; return false;
    }
  }
  return true;
}

function enviarSolicitudPublica() {
  if (!validarPasoPortal(PORTAL_STEPS)) return;

  const solNombre  = document.getElementById('pp-sol-nombre').value.trim();
  const solUsuario = document.getElementById('pp-sol-usuario').value.trim();
  const solPass    = document.getElementById('pp-sol-pass').value.trim();
  const solTel     = document.getElementById('pp-sol-tel').value.trim();
  const solEmail   = document.getElementById('pp-sol-email').value.trim();
  const solRelacion= document.getElementById('pp-sol-relacion').value;

  const difNombre  = document.getElementById('pp-difunto-nombre').value.trim();
  const difFecha   = document.getElementById('pp-difunto-fecha').value;
  const difCausa   = document.getElementById('pp-difunto-causa').value.trim();
  const tipoServ   = document.getElementById('pp-tipo-servicio').value;
  const tipoVel    = document.getElementById('pp-tipo-velacion').value;
  const fechaServ  = document.getElementById('pp-fecha-servicio').value;
  const duracion   = document.getElementById('pp-duracion').value;
  const sala       = document.getElementById('pp-sala').value;
  const notas      = document.getElementById('pp-notas').value.trim();

  // Extras seleccionados
  const extras = [...document.querySelectorAll('.pp-extra:checked')].map(c => c.value);

  // Guardar usuario público
  const usuarios = JSON.parse(localStorage.getItem('fgr_usuarios_publicos') || '[]');
  usuarios.push({ usuario: solUsuario, pass: solPass, nombre: solNombre, email: solEmail, tel: solTel, creadoEn: new Date().toISOString() });
  localStorage.setItem('fgr_usuarios_publicos', JSON.stringify(usuarios));

  // Generar folio solicitud
  const folioNum = ((DB.solicitudes || []).length + 1).toString().padStart(4,'0');
  const folio = `SOL-${new Date().getFullYear()}-${folioNum}`;

  // Guardar solicitud
  if (!DB.solicitudes) DB.solicitudes = [];
  const solicitud = {
    id: 'SOL' + Date.now().toString(36).toUpperCase(),
    folio,
    solicitanteNombre: solNombre,
    usuario: solUsuario,
    email: solEmail,
    tel: solTel,
    relacion: solRelacion,
    difuntoNombre: difNombre,
    fechaFallecimiento: difFecha,
    causa: difCausa,
    tipoServicio: tipoServ,
    tipoVelacion: tipoVel,
    fechaServicio: fechaServ,
    duracion,
    salaPreferida: sala,
    serviciosExtra: extras,
    notas,
    estado: 'pendiente',
    fechaSolicitud: new Date().toISOString(),
  };
  DB.solicitudes.push(solicitud);
  DB.addLog(`Nueva solicitud web: ${difNombre} por ${solNombre} (${folio})`);
  localStorage.setItem('fgr_solicitudes', JSON.stringify(DB.solicitudes));

  // Mostrar confirmación
  document.getElementById('pp-form-content').style.display = 'none';
  document.getElementById('pp-confirmacion').style.display = 'block';
  document.getElementById('pp-folio-confirm').textContent = folio;
  document.getElementById('pp-nombre-confirm').textContent = solNombre;

  // Actualizar badge del nav
  actualizarBadgePortal();
}

function cerrarPortalYReset() {
  cerrarPortalPublico();
  // Reset form
  setTimeout(() => {
    document.getElementById('pp-form-content').style.display = 'block';
    document.getElementById('pp-confirmacion').style.display = 'none';
    portalStep = 1;
    actualizarPasoPortal();
    document.querySelectorAll('#public-portal-overlay input:not([type=checkbox]), #public-portal-overlay select, #public-portal-overlay textarea').forEach(el => el.value = '');
    document.querySelectorAll('.pp-extra').forEach(c => c.checked = false);
  }, 400);
}

function actualizarBadgePortal() {
  const pending = (DB.solicitudes || []).filter(s => s.estado === 'pendiente').length;
  const badge = document.getElementById('portal-badge');
  if (badge) {
    badge.textContent = pending;
    badge.style.display = pending > 0 ? 'inline-flex' : 'none';
  }
}

// ─── LOGIN PÚBLICO ───
function loginPublico() {
  const user = document.getElementById('lp-usuario').value.trim();
  const pass = document.getElementById('lp-pass').value.trim();
  const err  = document.getElementById('lp-error');
  const usuarios = JSON.parse(localStorage.getItem('fgr_usuarios_publicos') || '[]');
  const match = usuarios.find(u => u.usuario === user && u.pass === pass);
  if (!match) {
    err.textContent = 'Usuario o contraseña incorrectos.';
    err.style.display = 'block'; return;
  }
  err.style.display = 'none';
  // Mostrar portal privado con sus solicitudes
  mostrarPortalPrivado(match);
}

function mostrarPortalPrivado(usuario) {
  document.getElementById('lp-login-form').style.display = 'none';
  const priv = document.getElementById('lp-privado');
  priv.style.display = 'block';
  document.getElementById('lp-bienvenida').textContent = `Bienvenido/a, ${usuario.nombre}`;

  const mySols = (DB.solicitudes || []).filter(s => s.usuario === usuario.usuario);
  const list = document.getElementById('lp-mis-solicitudes');
  if (!mySols.length) {
    list.innerHTML = '<div class="empty">No tienes solicitudes registradas aún.</div>';
  } else {
    const stMap = { pendiente: '⏳ En revisión', aprobada: '✓ Aprobada', rechazada: '✗ Rechazada', concluida: '✓ Concluida' };
    list.innerHTML = mySols.map(s => `
      <div class="mi-solicitud-item">
        <div>
          <div class="mi-sol-nombre">${s.difuntoNombre}</div>
          <div class="mi-sol-meta">${s.tipoVelacion || s.tipoServicio} · ${fmtDateTime(s.fechaServicio) || 'Fecha por confirmar'}</div>
          <div class="mi-sol-folio">${s.folio}</div>
        </div>
        <div class="${'badge badge-'+(s.estado==='aprobada'?'proceso':s.estado==='rechazada'?'urgente':s.estado==='concluida'?'concluido':'pendiente')}">${stMap[s.estado]||s.estado}</div>
      </div>`).join('');
  }
}

// Cargar solicitudes desde localStorage al iniciar
(function() {
  if (!DB.solicitudes) {
    DB.solicitudes = JSON.parse(localStorage.getItem('fgr_solicitudes') || '[]');
  }
  // Parchear save para incluir solicitudes
  const _origSave = DB.save.bind(DB);
  DB.save = function() {
    _origSave();
    localStorage.setItem('fgr_solicitudes', JSON.stringify(this.solicitudes || []));
  };
})();
