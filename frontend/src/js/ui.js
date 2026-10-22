/**
 * Utilidades de interfaz: iconos SVG, toasts, modales, confirmaciones,
 * lightbox, formateadores y validación de formularios.
 */

/* ---------- Iconos SVG inline ---------- */
const ICONOS = {
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="m8.5 9.5-2-7 3.5 2L12 1l2 3.5 3.5-2-2 7"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
  filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><path d="m2 2 20 20"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  'code': '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m15 9-6 6M9 9l6 6"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  graduate: '<path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
};

/** Devuelve un icono SVG inline. */
export function icon(nombre, clase = '') {
  const ruta = ICONOS[nombre];
  if (!ruta) return '';
  return `<svg class="icono ${clase}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ruta}</svg>`;
}

/* ---------- Escape de HTML (prevención XSS) ---------- */
export function esc(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* ---------- Formateadores ---------- */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatoFecha(valor, { larga = false, conHora = false } = {}) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  const base = `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
  if (larga) {
    const mesLargo = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) || mesLargo;
  }
  if (conHora) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${base} · ${hh}:${mm}`;
  }
  return base;
}

export function formatoPeriodo(inicio, fin) {
  if (!inicio && !fin) return 'Fecha por confirmar';
  if (!fin) return formatoFecha(inicio);
  const a = new Date(inicio);
  const b = new Date(fin);
  if (a.toDateString() === b.toDateString()) return formatoFecha(inicio);
  return `${formatoFecha(inicio)} — ${formatoFecha(fin)}`;
}

export function estadoEventoBadge(estado) {
  const mapa = {
    proximo: ['badge-info', 'Próximo'],
    realizado: ['badge-exito', 'Realizado'],
    cancelado: ['badge-error', 'Cancelado'],
  };
  const [cls, txt] = mapa[estado] || ['badge-neutro', estado];
  return `<span class="badge ${cls}">${esc(txt)}</span>`;
}

export function estadoPublicacionBadge(estado) {
  const mapa = {
    pendiente: ['badge-alerta', 'Pendiente de aprobación'],
    aprobado: ['badge-exito', 'Aprobado'],
    rechazado: ['badge-error', 'Rechazado'],
  };
  const [cls, txt] = mapa[estado] || ['badge-neutro', estado];
  return `<span class="badge ${cls}">${esc(txt)}</span>`;
}

export function iniciales(nombre, apellidos = '') {
  const t = `${nombre || ''} ${apellidos || ''}`.trim();
  return t
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => (p[0] || '').toUpperCase())
    .join('') || '?';
}

/* ---------- Toasts ---------- */
export function toast(mensaje, tipo = 'info', duracionMs = 4200) {
  const contenedor = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast-${tipo}`;
  el.setAttribute('role', 'status');
  const iconos = { exito: 'check-circle', error: 'x-circle', alerta: 'alert', info: 'info' };
  el.innerHTML = `
    <span class="toast-icono">${icon(iconos[tipo] || 'info', '')}</span>
    <div>${esc(mensaje)}</div>
    <button class="cerrar-toast" aria-label="Cerrar aviso">${icon('x', '')}</button>
  `;
  const cerrar = () => {
    el.classList.add('saliendo');
    setTimeout(() => el.remove(), 300);
  };
  el.querySelector('.cerrar-toast').addEventListener('click', cerrar);
  contenedor.appendChild(el);
  if (duracionMs > 0) setTimeout(cerrar, duracionMs);
  return el;
}

/* ---------- Modales ---------- */
export function abrirModal({ titulo, contenido, pie, grande = false, alCerrar }) {
  const raiz = document.getElementById('modal-raiz');
  const fondo = document.createElement('div');
  fondo.className = 'modal-fondo';
  fondo.innerHTML = `
    <div class="modal-caja ${grande ? 'modal-grande' : ''}" role="dialog" aria-modal="true" aria-label="${esc(titulo)}">
      <div class="modal-cabecera">
        <h3>${esc(titulo)}</h3>
        <button class="cerrar-modal" aria-label="Cerrar">${icon('x')}</button>
      </div>
      <div class="modal-cuerpo">${contenido}</div>
      ${pie ? `<div class="modal-pie">${pie}</div>` : ''}
    </div>
  `;

  const cerrar = () => {
    fondo.remove();
    document.removeEventListener('keydown', escapar);
    if (alCerrar) alCerrar();
  };
  const escapar = (e) => {
    if (e.key === 'Escape') cerrar();
  };

  fondo.querySelector('.cerrar-modal').addEventListener('click', cerrar);
  fondo.addEventListener('mousedown', (e) => {
    if (e.target === fondo) cerrar();
  });
  document.addEventListener('keydown', escapar);
  raiz.appendChild(fondo);

  const primerInput = fondo.querySelector('input, select, textarea, button:not(.cerrar-modal)');
  if (primerInput) setTimeout(() => primerInput.focus(), 60);

  return { fondo, cerrar };
}

/** Confirmación estilo SweetAlert. Devuelve true si el usuario confirma. */
export function confirmar({ titulo = '¿Estás seguro?', texto = '', textoConfirmar = 'Sí, continuar', textoCancelar = 'Cancelar', tipo = 'peligro' }) {
  return new Promise((resolver) => {
    const iconos = { peligro: 'trash', info: 'info', alerta: 'alert', exito: 'check-circle' };
    const modal = abrirModal({
      titulo: '',
      contenido: `
        <div class="confirmacion">
          <div class="icono-confirmacion ${tipo}">${icon(iconos[tipo] || 'info', '')}</div>
          <h3>${esc(titulo)}</h3>
          ${texto ? `<p>${esc(texto)}</p>` : ''}
        </div>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="no">${esc(textoCancelar)}</button>
        <button class="btn ${tipo === 'peligro' ? 'btn-peligro' : 'btn-primario'}" data-acc="si">${esc(textoConfirmar)}</button>
      `,
      alCerrar: () => resolver(false),
    });

    modal.fondo.querySelector('[data-acc="si"]').addEventListener('click', () => {
      resolver(true);
      modal.fondo.remove();
    });
    modal.fondo.querySelector('[data-acc="no"]').addEventListener('click', () => {
      resolver(false);
      modal.fondo.remove();
    });
  });
}

/* ---------- Lightbox ---------- */
export function abrirLightbox(htmlContenido, pie = '') {
  const raiz = document.getElementById('lightbox-raiz');
  raiz.innerHTML = `
    <div class="lightbox" role="dialog" aria-modal="true">
      <button class="cerrar-lightbox" aria-label="Cerrar">${icon('x')}</button>
      <div class="contenido-lightbox">
        ${htmlContenido}
        ${pie ? `<div class="pie-lightbox">${pie}</div>` : ''}
      </div>
    </div>
  `;
  const cerrar = () => {
    raiz.innerHTML = '';
    document.removeEventListener('keydown', escapar);
  };
  const escapar = (e) => {
    if (e.key === 'Escape') cerrar();
  };
  raiz.querySelector('.lightbox').addEventListener('click', (e) => {
    if (e.target.classList.contains('lightbox')) cerrar();
  });
  raiz.querySelector('.cerrar-lightbox').addEventListener('click', cerrar);
  document.addEventListener('keydown', escapar);
}

/* ---------- Validación de formularios (cliente) ---------- */
const REGLAS = {
  requerido: (v) => v.trim() !== '' || 'Este campo es obligatorio',
  email: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Correo electrónico inválido',
  url: (v) => v.trim() === '' || /^https?:\/\/.+\..+/.test(v.trim()) || 'URL inválida (debe iniciar con http:// o https://)',
  min: (v, n) => v.trim().length >= Number(n) || `Debe tener al menos ${n} caracteres`,
  max: (v, n) => v.trim().length <= Number(n) || `No puede exceder ${n} caracteres`,
  passwordFuerte: (v) =>
    v === '' || (/[A-Za-z]/.test(v) && /[0-9]/.test(v) && v.length >= 8) || 'Mínimo 8 caracteres, con letras y números',
  fecha: (v) => v === '' || !Number.isNaN(new Date(v).getTime()) || 'Fecha inválida',
};

/**
 * Valida campos marcados con data-validar="regla:param, regla2".
 * Muestra/oculta mensajes de error y devuelve true si todo es válido.
 */
export function validarFormulario(form) {
  let valido = true;

  form.querySelectorAll('[data-validar]').forEach((campo) => {
    const contenedor = campo.closest('.campo') || campo.parentElement;
    const msgEl = contenedor.querySelector('.error-mensaje');
    const reglas = (campo.dataset.validar || '').split(',').map((r) => r.trim()).filter(Boolean);
    const valor = campo.type === 'checkbox' ? (campo.checked ? 'si' : '') : campo.value || '';

    campo.classList.remove('error-input');
    if (msgEl) msgEl.classList.remove('visible');

    for (const regla of reglas) {
      const [nombre, param] = regla.split(':');
      const fn = REGLAS[nombre];
      if (!fn) continue;
      const resultado = fn(valor, param);
      if (resultado !== true) {
        valido = false;
        campo.classList.add('error-input');
        if (msgEl) {
          msgEl.textContent = resultado;
          msgEl.classList.add('visible');
        }
        break;
      }
    }
  });

  if (!valido) {
    const primero = form.querySelector('.error-input');
    if (primero) primero.focus();
  }
  return valido;
}

/** Serializa un formulario a objeto plano (por name). */
export function datosFormulario(form) {
  const datos = {};
  new FormData(form).forEach((valor, clave) => {
    datos[clave] = typeof valor === 'string' ? valor : '';
  });
  return datos;
}

/* ---------- Otros ---------- */
export function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function opcionesSelect(valores, seleccionado = '') {
  return valores
    .map((v) => `<option value="${esc(v)}" ${v === seleccionado ? 'selected' : ''}>${esc(v)}</option>`)
    .join('');
}

export function skeleton(rejilla = 3, altura = 'aspect-ratio:16/9') {
  let html = '<div class="rejilla rejilla-3">';
  for (let i = 0; i < rejilla; i++) {
    html += `<div class="skeleton" style="${altura}"></div>`;
  }
  return html + '</div>';
}

export function estadoVacio(icono = 'info', titulo = 'Sin resultados', texto = '') {
  return `
    <div class="estado-vacio">
      <div class="icono-vacio">${icon(icono, '')}</div>
      <h3>${esc(titulo)}</h3>
      ${texto ? `<p>${esc(texto)}</p>` : ''}
    </div>
  `;
}
