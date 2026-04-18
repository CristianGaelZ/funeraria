/* ═══════════════════════════════════════
   INIT.JS — Dashboard + Inicialización
   ═══════════════════════════════════════ */

function renderDashboard() {
  document.getElementById('dash-total').textContent    = DB.difuntos.length;
  document.getElementById('dash-proceso').textContent  = DB.difuntos.filter(d => d.estado === 'proceso').length;
  document.getElementById('dash-urgente').textContent  = DB.difuntos.filter(d => d.estado === 'urgente').length;
  document.getElementById('dash-concluido').textContent = DB.difuntos.filter(d => d.estado === 'concluido').length;

  // Recientes
  const recEl = document.getElementById('dash-recientes');
  const rec = [...DB.difuntos].slice(0, 6);
  recEl.innerHTML = !rec.length
    ? '<div class="empty">Sin registros aún</div>'
    : rec.map(d => `
        <div class="dash-item" onclick="navigate('difuntos', document.querySelector('[data-page=difuntos]')); setTimeout(()=>verDetalleDifunto('${d.id}'),100)">
          <div>
            <div class="dash-name">${d.nombre} ${d.apellidos}</div>
            <div class="dash-meta">${d.servicio || '—'} · ${d.fechaIngreso || '—'} · <span class="folio">${d.folio}</span></div>
          </div>
          ${badge(d.estado)}
        </div>`).join('');

  // Log
  const logEl = document.getElementById('dash-log');
  logEl.innerHTML = !DB.log.length
    ? '<div class="empty">Sin actividad registrada</div>'
    : DB.log.slice(0, 8).map(l => `
        <div class="log-item">
          <div class="log-dot"></div>
          <div>
            <div class="log-msg">${l.msg}</div>
            <div class="log-time">${l.date} · ${l.time}</div>
          </div>
        </div>`).join('');

  updateSidebarStats();
}

// ─── DATOS DE EJEMPLO ───
function cargarDatosDemostracion() {
  if (DB.difuntos.length > 0) return; // Ya hay datos

  // Salas
  [
    { nombre: 'Capilla A', cap: 80, estado: 'disponible', equip: 'Proyector, audio, flores' },
    { nombre: 'Capilla B', cap: 60, estado: 'ocupada',    equip: 'Audio, sillas extra' },
    { nombre: 'Sala 1',   cap: 40, estado: 'disponible', equip: 'Básica' },
    { nombre: 'Sala 2',   cap: 40, estado: 'mantenimiento', equip: 'En renovación' },
  ].forEach(s => DB.saveSala(s));

  // Difuntos
  const difuntos = [
    { nombre: 'Rodrigo',    apellidos: 'Martínez Leal',   fallecimiento: '2025-04-10', causa: 'Paro cardíaco',     servicio: 'Velación',   estado: 'proceso',    sala: 'Capilla B', fechaServicio: '2025-04-12T10:00', obs: 'Familia requiere servicio especial' },
    { nombre: 'Esperanza',  apellidos: 'Torres Vda. de R',fallecimiento: '2025-04-11', causa: 'Insuficiencia renal', servicio: 'Cremación', estado: 'pendiente',  sala: '',          fechaServicio: '2025-04-13T14:00', obs: '' },
    { nombre: 'Miguel Ángel',apellidos:'Herrera Fuentes',  fallecimiento: '2025-04-09', causa: 'Accidente vial',    servicio: 'Entierro',  estado: 'urgente',    sala: 'Capilla A', fechaServicio: '2025-04-11T09:00', obs: 'Caso urgente — coordinación con panteón' },
    { nombre: 'Carmen',     apellidos: 'Díaz Sandoval',   fallecimiento: '2025-04-05', causa: 'Vejez',             servicio: 'Velación',   estado: 'concluido',  sala: 'Sala 1',    fechaServicio: '2025-04-07T11:00', obs: '' },
    { nombre: 'José Luis',  apellidos: 'Garza Moreno',    fallecimiento: '2025-04-12', causa: 'Cáncer',            servicio: 'Repatriación',estado: 'pendiente', sala: '',          fechaServicio: '2025-04-15T08:00', obs: 'Traslado a Monterrey desde CDMX' },
  ];
  difuntos.forEach(d => DB.saveDifunto(d));

  // Familiares
  [
    { nombre: 'Ana Sofía Martínez', relacion: 'Hijo/a',   tel: '8112345678', email: 'ana@email.com', expediente: DB.difuntos[0]?.folio, principal: true },
    { nombre: 'Jorge Torres',       relacion: 'Hijo/a',   tel: '8119876543', email: '',              expediente: DB.difuntos[1]?.folio, principal: true },
    { nombre: 'Laura Herrera',      relacion: 'Cónyuge',  tel: '8115551234', email: 'laura@mail.com',expediente: DB.difuntos[2]?.folio, principal: true },
  ].forEach(f => DB.saveFamiliar(f));

  // Eventos
  [
    { titulo: 'Velación Rodrigo Martínez', tipo: 'Velación', expediente: DB.difuntos[0]?.folio, inicio: '2025-04-12T10:00', fin: '2025-04-12T18:00', lugar: 'Capilla B', estado: 'en-curso', personal: 'Juan Pérez, María López' },
    { titulo: 'Cremación Esperanza Torres', tipo: 'Cremación', expediente: DB.difuntos[1]?.folio, inicio: '2025-04-13T14:00', fin: '2025-04-13T16:00', lugar: 'Crematorio Sur', estado: 'programado', personal: 'Carlos Ruiz' },
    { titulo: 'Servicio Urgente Herrera', tipo: 'Entierro', expediente: DB.difuntos[2]?.folio, inicio: '2025-04-11T09:00', fin: '2025-04-11T12:00', lugar: 'Panteón Municipal', estado: 'finalizado', personal: 'Juan Pérez, Roberto Sánchez' },
  ].forEach(e => DB.saveEvento(e));

  // Limpiar log demo
  DB.log = [];
  DB.addLog('Sistema iniciado con datos de demostración');
  DB.save();
}

// ─── INIT ───
cargarDatosDemostracion();
renderDashboard();
