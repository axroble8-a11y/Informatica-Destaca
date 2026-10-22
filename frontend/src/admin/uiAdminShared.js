import { api } from '../js/api.js';
import { icon, esc, estadoVacio, confirmar, toast, abrirModal } from '../js/ui.js';
import { esAdmin } from '../js/auth.js';
import { montarPaginacion } from '../components/pagination.js';

export { icon, esc, estadoVacio, confirmar, toast, abrirModal, esAdmin, montarPaginacion };

export function opcionesSelectBase(valores, seleccionado = '') {
  return valores
    .map((v) => `<option value="${esc(v)}" ${v === seleccionado ? 'selected' : ''}>${esc(v)}</option>`)
    .join('');
}

/** Carga select de estudiantes (staff: incluye pendientes y sin consentimiento). */
export async function poblarSelectEstudiantes(select, seleccionado = '') {
  const res = await api.get('/estudiantes?limit=60&orden=nombre&todos=1');
  select.innerHTML = '<option value="">— Selecciona estudiante —</option>';
  res.datos.forEach((e) => {
    const op = document.createElement('option');
    op.value = e._id;
    op.textContent = `${e.nombreCompleto} · Sem ${e.semestre} · ${e.matricula}`;
    if (seleccionado && seleccionado === e._id) op.selected = true;
    select.appendChild(op);
  });
}

/** Carga select de eventos aprobados. */
export async function poblarSelectEventos(select, seleccionado = '') {
  const res = await api.get('/eventos?limit=60&orden=desc');
  select.innerHTML = '<option value="">— Sin evento —</option>';
  res.datos.forEach((e) => {
    const op = document.createElement('option');
    op.value = e._id;
    op.textContent = `${e.nombre} (${new Date(e.fechaInicio).toLocaleDateString('es-MX')})`;
    if (seleccionado && seleccionado === e._id) op.selected = true;
    select.appendChild(op);
  });
}

/** Envoltorio estándar de listado admin: filtros + tabla + paginación. */
export function estructuraListado({ placeholderBusqueda = 'Buscar…', filtrosHTML = '', conBuscador = true, botones = [] }) {
  return `
    <div class="panel-filtros ${conBuscador ? '' : 'sin-buscador'}" style="grid-template-columns:${conBuscador ? '2fr 1fr' : '1fr 1fr'}">
      ${conBuscador ? `<div class="caja-buscador">${icon('search', 'icono-buscar')}<input type="search" id="ad-q" placeholder="${esc(placeholderBusqueda)}" aria-label="Buscar" /></div>` : ''}
      <div class="fila" style="justify-content:flex-end;gap:.5rem">${botones.join('')}</div>
      ${filtrosHTML}
    </div>
    <div id="ad-lista"></div>
    <div id="ad-paginacion"></div>
  `;
}

/** Confirmación + eliminación con mensaje de resultado. */
export async function eliminarConConfirmacion({ titulo, texto, textoConfirmar = 'Sí, eliminar', accion }) {
  if (!(await confirmar({ titulo, texto, textoConfirmar }))) return false;
  try {
    const res = await accion();
    toast(res?.mensaje || 'Eliminado correctamente.', 'exito');
    return true;
  } catch (err) {
    toast(err.message, 'error');
    return false;
  }
}

/** Conecta un campo de búsqueda con debounce. */
export function conectarBusqueda(alBuscar, ms = 320) {
  let timer = null;
  document.getElementById('ad-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => alBuscar(document.getElementById('ad-q').value.trim()), ms);
  });
  return () => clearTimeout(timer);
}
