/* ═══════════════════════════════════════
   DB.JS — Base de datos en memoria (localStorage)
   ═══════════════════════════════════════ */

const DB = {
  // Colecciones
  difuntos:  [],
  familiares: [],
  salas:     [],
  eventos:   [],
  log:       [],

  // ─── PERSIST ───
  save() {
    localStorage.setItem('fgr_difuntos',   JSON.stringify(this.difuntos));
    localStorage.setItem('fgr_familiares', JSON.stringify(this.familiares));
    localStorage.setItem('fgr_salas',      JSON.stringify(this.salas));
    localStorage.setItem('fgr_eventos',    JSON.stringify(this.eventos));
    localStorage.setItem('fgr_log',        JSON.stringify(this.log.slice(0, 100)));
  },

  load() {
    try {
      this.difuntos   = JSON.parse(localStorage.getItem('fgr_difuntos'))   || [];
      this.familiares = JSON.parse(localStorage.getItem('fgr_familiares')) || [];
      this.salas      = JSON.parse(localStorage.getItem('fgr_salas'))      || [];
      this.eventos    = JSON.parse(localStorage.getItem('fgr_eventos'))    || [];
      this.log        = JSON.parse(localStorage.getItem('fgr_log'))        || [];
    } catch(e) {
      console.warn('Error cargando datos:', e);
    }
  },

  // ─── ID GENERATOR ───
  uid(prefix = '') {
    return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
  },

  folio() {
    const n = (this.difuntos.length + 1).toString().padStart(4, '0');
    const y = new Date().getFullYear();
    return `FGR-${y}-${n}`;
  },

  // ─── LOG ───
  addLog(msg) {
    const now = new Date();
    this.log.unshift({
      id: this.uid(),
      msg,
      time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
    });
    this.save();
  },

  // ─── DIFUNTOS ───
  saveDifunto(data) {
    if (data.id) {
      const i = this.difuntos.findIndex(d => d.id === data.id);
      if (i >= 0) {
        this.difuntos[i] = { ...this.difuntos[i], ...data };
        this.addLog(`Expediente actualizado: ${data.nombre} ${data.apellidos}`);
      }
    } else {
      const d = { ...data, id: this.uid('D'), folio: this.folio(), fechaIngreso: new Date().toLocaleDateString('es-MX') };
      this.difuntos.unshift(d);
      this.addLog(`Nuevo expediente registrado: ${data.nombre} ${data.apellidos} (${d.folio})`);
    }
    this.save();
  },

  deleteDifunto(id) {
    const d = this.difuntos.find(x => x.id === id);
    this.difuntos = this.difuntos.filter(x => x.id !== id);
    if (d) this.addLog(`Expediente eliminado: ${d.nombre} ${d.apellidos}`);
    this.save();
  },

  // ─── FAMILIARES ───
  saveFamiliar(data) {
    if (data.id) {
      const i = this.familiares.findIndex(f => f.id === data.id);
      if (i >= 0) {
        this.familiares[i] = { ...this.familiares[i], ...data };
        this.addLog(`Familiar actualizado: ${data.nombre}`);
      }
    } else {
      const f = { ...data, id: this.uid('F') };
      this.familiares.unshift(f);
      this.addLog(`Familiar registrado: ${data.nombre}`);
    }
    this.save();
  },

  deleteFamiliar(id) {
    const f = this.familiares.find(x => x.id === id);
    this.familiares = this.familiares.filter(x => x.id !== id);
    if (f) this.addLog(`Familiar eliminado: ${f.nombre}`);
    this.save();
  },

  // ─── SALAS ───
  saveSala(data) {
    if (data.id) {
      const i = this.salas.findIndex(s => s.id === data.id);
      if (i >= 0) {
        this.salas[i] = { ...this.salas[i], ...data };
        this.addLog(`Sala actualizada: ${data.nombre}`);
      }
    } else {
      const s = { ...data, id: this.uid('S') };
      this.salas.push(s);
      this.addLog(`Sala registrada: ${data.nombre}`);
    }
    this.save();
  },

  deleteSala(id) {
    const s = this.salas.find(x => x.id === id);
    this.salas = this.salas.filter(x => x.id !== id);
    if (s) this.addLog(`Sala eliminada: ${s.nombre}`);
    this.save();
  },

  // ─── EVENTOS ───
  saveEvento(data) {
    if (data.id) {
      const i = this.eventos.findIndex(e => e.id === data.id);
      if (i >= 0) {
        this.eventos[i] = { ...this.eventos[i], ...data };
        this.addLog(`Evento actualizado: ${data.titulo}`);
      }
    } else {
      const e = { ...data, id: this.uid('E') };
      this.eventos.unshift(e);
      this.addLog(`Evento programado: ${data.titulo}`);
    }
    this.save();
  },

  deleteEvento(id) {
    const e = this.eventos.find(x => x.id === id);
    this.eventos = this.eventos.filter(x => x.id !== id);
    if (e) this.addLog(`Evento eliminado: ${e.titulo}`);
    this.save();
  }
};

// Cargar al inicio
DB.load();
