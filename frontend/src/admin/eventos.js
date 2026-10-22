import { api, obtenerCatalogos } from '../js/api.js';
import {
  estructuraListado, conectarBusqueda, eliminarConConfirmacion,
  icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, opcionesSelectBase, esAdmin,
} from './uiAdminShared.js';

const estado = { page: 1, q: '', estado: '' };
let catalogos = null;

export async function vistaAdminEventos(contenedor) {
  catalogos = await obtenerCatalogos();
  Object.assign(estado, { page: 1, q: '', estado: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar evento por nombre u organizador…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-estado">
          <option value="">Publicación: todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
        </select>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nuevo">${icon('plus')} Nuevo evento</button>`],
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => formEvento());
  document.getElementById('ad-estado').addEventListener('change', () => {
    estado.estado = document.getElementById('ad-estado').value;
    estado.page = 1;
    cargar();
  });

  const detener = conectarBusqueda((q) => {
    estado.q = q;
    estado.page = 1;
    cargar();
  });

  await cargar();
  return { limpiar: detener };

  async function cargar() {
    const lista = document.getElementById('ad-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.estado) params.set('estadoPublicacion', estado.estado);
    params.set('todos', '1');
    params.set('page', estado.page);
    params.set('limit', 10);

    const res = await api.get(`/eventos?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio('calendar', 'Sin eventos', 'Ajusta los filtros o registra un evento.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr><th>Evento</th><th>Fecha</th><th>Estado evento</th><th>Categoría</th><th>Publicación</th><th></th></tr></thead>
            <tbody>
              ${res.datos
                .map(
                  (ev) => `
                <tr>
                  <td>
                    <div class="fila" style="gap:.6rem;flex-wrap:nowrap">
                      <img src="${esc(ev.imagenUrl || '/public/img/eventos/default.svg')}" alt="" style="width:52px;height:38px;border-radius:6px;object-fit:cover" onerror="this.src='/public/img/eventos/default.svg'" />
                      <span><strong class="texto-pequeno">${esc(ev.nombre)}</strong>
                      <span class="texto-tenue texto-pequeno" style="display:block">${esc(ev.organizador)}</span></span>
                    </div>
                  </td>
                  <td class="texto-pequeno">${new Date(ev.fechaInicio).toLocaleDateString('es-MX')}</td>
                  <td><span class="badge ${ev.estado === 'proximo' ? 'badge-info' : ev.estado === 'realizado' ? 'badge-exito' : 'badge-error'}">
                    ${ev.estado === 'proximo' ? 'Próximo' : ev.estado === 'realizado' ? 'Realizado' : 'Cancelado'}</span></td>
                  <td class="texto-pequeno">${esc(ev.categoria)}</td>
                  <td><span class="badge ${ev.estadoPublicacion === 'aprobado' ? 'badge-exito' : ev.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(ev.estadoPublicacion)}</span></td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-ver="${ev._id}" title="Ver público">${icon('eye')}</button>
                    <button class="btn btn-secundario btn-sm" data-editar="${ev._id}" title="Editar">${icon('edit')}</button>
                    ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${ev._id}" title="Eliminar">${icon('trash')}</button>` : ''}
                  </div></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`;

    if (res.datos.length) {
      lista.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => (window.location.hash = `/eventos/${b.dataset.ver}`)));
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const resDet = await api.get(`/eventos/${b.dataset.editar}`);
          formEvento(resDet.dato);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar evento?',
            texto: 'Se eliminará el evento junto con sus participaciones y evidencias asociadas. Esta acción no puede deshacerse.',
            accion: () => api.delete(`/eventos/${b.dataset.borrar}`),
          });
          if (ok) cargar();
        })
      );
    }

    montarPaginacion(document.getElementById('ad-paginacion'), res.page, res.pages, (p) => {
      estado.page = p;
      cargar();
    });
  }

  function formEvento(ev = null) {
    const e = ev || {};
    const fecha = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

    abrirModal({
      titulo: e._id ? `Editar evento` : 'Registrar evento',
      grande: true,
      contenido: `
        <form class="formulario" id="form-ev" novalidate>
          <div class="campo">
            <label class="obligatorio">Nombre del evento</label>
            <input id="ev-nombre" value="${esc(e.nombre || '')}" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Descripción</label>
            <textarea id="ev-descripcion" data-validar="requerido, max:3000">${esc(e.descripcion || '')}</textarea>
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-3">
            <div class="campo">
              <label class="obligatorio">Fecha de inicio</label>
              <input type="date" id="ev-inicio" value="${fecha(e.fechaInicio)}" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Fecha de fin</label>
              <input type="date" id="ev-fin" value="${fecha(e.fechaFin)}" data-validar="fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Horario</label>
              <input id="ev-horario" value="${esc(e.horario || '')}" placeholder="09:00 a 17:00 h" data-validar="max:100" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campos-3">
            <div class="campo">
              <label class="obligatorio">Modalidad</label>
              <select id="ev-modalidad">${opcionesSelectBase(catalogos.modalidades, e.modalidad || 'Presencial')}</select>
            </div>
            <div class="campo">
              <label>Categoría</label>
              <select id="ev-categoria">${opcionesSelectBase(catalogos.categoriasEvento, e.categoria || 'Académico')}</select>
            </div>
            <div class="campo">
              <label>Estado del evento</label>
              <select id="ev-estado">${opcionesSelectBase(['proximo', 'realizado', 'cancelado'], e.estado || 'proximo')}</select>
            </div>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Lugar</label>
              <input id="ev-lugar" value="${esc(e.lugar || '')}" placeholder="Auditorio, aula o enlace de transmisión" data-validar="requerido, max:200" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Organizador</label>
              <input id="ev-organizador" value="${esc(e.organizador || '')}" data-validar="requerido, max:150" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campo">
            <label>Imagen representativa (URL)</label>
            <input id="ev-imagen" value="${esc(e.imagenUrl || '')}" placeholder="https://… o /uploads/…" data-validar="max:500" />
            <span class="ayuda">Puedes subir una imagen desde la sección Multimedia y pegar aquí su URL.</span>
            <span class="error-mensaje"></span>
          </div>
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${e._id ? 'Guardar cambios' : 'Registrar evento'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const form = document.getElementById('form-ev');
      const { validarFormulario } = await import('../js/ui.js');
      if (!validarFormulario(form)) return;

      const cuerpo = {
        nombre: document.getElementById('ev-nombre').value.trim(),
        descripcion: document.getElementById('ev-descripcion').value.trim(),
        fechaInicio: document.getElementById('ev-inicio').value,
        fechaFin: document.getElementById('ev-fin').value || null,
        horario: document.getElementById('ev-horario').value.trim(),
        modalidad: document.getElementById('ev-modalidad').value,
        categoria: document.getElementById('ev-categoria').value,
        estado: document.getElementById('ev-estado').value,
        lugar: document.getElementById('ev-lugar').value.trim(),
        organizador: document.getElementById('ev-organizador').value.trim(),
        imagenUrl: document.getElementById('ev-imagen').value.trim(),
      };

      try {
        const res = e._id ? await api.put(`/eventos/${e._id}`, cuerpo) : await api.post('/eventos', cuerpo);
        toast(res.mensaje, 'exito');
        modal.remove();
        cargar();
      } catch (err) {
        const detalle = err.errores?.map((x) => x.mensaje).join(' · ');
        toast(detalle ? `${err.message}: ${detalle}` : err.message, 'error', 6000);
      }
    });
  }
}
