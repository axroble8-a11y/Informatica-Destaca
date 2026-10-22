import { api, obtenerCatalogos } from '../js/api.js';
import {
  estructuraListado, conectarBusqueda, eliminarConConfirmacion, poblarSelectEstudiantes, poblarSelectEventos,
  icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, opcionesSelectBase, esAdmin,
} from './uiAdminShared.js';

const estado = { page: 1, q: '' };
let catalogos = null;

export async function vistaAdminParticipaciones(contenedor) {
  catalogos = await obtenerCatalogos();
  Object.assign(estado, { page: 1, q: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar por estudiante, evento o actividad…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-filtro-tipo">
          <option value="">Tipo: todos</option>
          ${opcionesSelectBase(catalogos.tiposParticipacion)}
        </select>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nueva">${icon('plus')} Nueva participación</button>`],
  });

  document.getElementById('btn-nueva').addEventListener('click', () => formParticipacion());
  document.getElementById('ad-filtro-tipo').addEventListener('change', () => {
    estado.tipo = document.getElementById('ad-filtro-tipo').value;
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
    if (estado.tipo) params.set('tipo', estado.tipo);
    params.set('page', estado.page);
    params.set('limit', 12);

    const res = await api.get(`/participaciones?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio('clipboard', 'Sin participaciones', 'Relaciona estudiantes con eventos desde el botón Nueva participación.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr><th>Estudiante</th><th>Evento / actividad</th><th>Fecha</th><th>Tipo</th><th>Resultado</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${res.datos
                .map(
                  (p) => `
                <tr>
                  <td><strong class="texto-pequeno">${esc(p.estudiante?.nombreCompleto || '—')}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">${esc(p.estudiante?.matricula || '')}</span></td>
                  <td class="texto-pequeno">${esc(p.evento?.nombre || p.actividadLibre || '—')}
                    <span class="texto-tenue texto-pequeno" style="display:block;max-width:280px;white-space:normal">${esc(p.descripcion)}</span></td>
                  <td class="texto-pequeno">${new Date(p.fecha).toLocaleDateString('es-MX')}</td>
                  <td><span class="badge badge-primario">${esc(p.tipo)}</span></td>
                  <td class="texto-pequeno">${esc(p.resultado || '—')}</td>
                  <td><span class="badge ${p.estadoPublicacion === 'aprobado' ? 'badge-exito' : p.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(p.estadoPublicacion)}</span></td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-editar="${p._id}" title="Editar">${icon('edit')}</button>
                    ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${p._id}" title="Eliminar">${icon('trash')}</button>` : ''}
                  </div></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`;

    if (res.datos.length) {
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const actual = res.datos.find((x) => x._id === b.dataset.editar);
          formParticipacion(actual);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar participación?',
            texto: 'Se quitará del historial del estudiante y sus evidencias asociadas.',
            accion: () => api.delete(`/participaciones/${b.dataset.borrar}`),
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

  async function formParticipacion(p = null) {
    abrirModal({
      titulo: p ? 'Editar participación' : 'Registrar participación',
      grande: true,
      contenido: `
        <form class="formulario" id="form-part" novalidate>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Estudiante</label>
              <select id="pa-estudiante" data-requerido="1"></select>
            </div>
            <div class="campo">
              <label>Evento</label>
              <select id="pa-evento"></select>
            </div>
          </div>
          <div class="campo">
            <label>Actividad libre (si no aplica evento)</label>
            <input id="pa-libre" value="${esc(p?.actividadLibre || '')}" placeholder="Ej. Organización del club de robótica" data-validar="max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-3">
            <div class="campo">
              <label class="obligatorio">Fecha</label>
              <input type="date" id="pa-fecha" value="${p ? new Date(p.fecha).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Tipo de participación</label>
              <select id="pa-tipo">${opcionesSelectBase(catalogos.tiposParticipacion, p?.tipo || 'Asistente')}</select>
            </div>
            <div class="campo">
              <label>Resultado obtenido</label>
              <input id="pa-resultado" value="${esc(p?.resultado || '')}" placeholder="Ej. Primer lugar" data-validar="max:500" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campo">
            <label class="obligatorio">Descripción</label>
            <textarea id="pa-descripcion" data-validar="requerido, max:2000">${esc(p?.descripcion || '')}</textarea>
            <span class="error-mensaje"></span>
          </div>
          ${
            esAdmin()
              ? ''
              : '<div class="banner-info">Tu registro quedará pendiente de aprobación por la administración.</div>'
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${p ? 'Guardar cambios' : 'Registrar'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    await Promise.all([
      poblarSelectEstudiantes(document.getElementById('pa-estudiante'), p?.estudiante?._id || p?.estudiante),
      poblarSelectEventos(document.getElementById('pa-evento'), p?.evento?._id || p?.evento || ''),
    ]);

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = document.getElementById('form-part');
      if (!validarFormulario(form)) return;

      const estudianteId = document.getElementById('pa-estudiante').value;
      if (!estudianteId) {
        toast('Selecciona un estudiante.', 'error');
        return;
      }
      const eventoId = document.getElementById('pa-evento').value;
      const libre = document.getElementById('pa-libre').value.trim();
      if (!eventoId && !libre) {
        toast('Selecciona un evento o escribe la actividad libre.', 'error');
        return;
      }

      const cuerpo = {
        estudiante: estudianteId,
        evento: eventoId || null,
        actividadLibre: libre,
        fecha: document.getElementById('pa-fecha').value,
        tipo: document.getElementById('pa-tipo').value,
        descripcion: document.getElementById('pa-descripcion').value.trim(),
        resultado: document.getElementById('pa-resultado').value.trim(),
      };

      try {
        const res = p ? await api.put(`/participaciones/${p._id}`, cuerpo) : await api.post('/participaciones', cuerpo);
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
