import { api, obtenerCatalogos } from '../js/api.js';
import {
  estructuraListado, conectarBusqueda, eliminarConConfirmacion, poblarSelectEstudiantes, poblarSelectEventos,
  icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, opcionesSelectBase, esAdmin,
} from './uiAdminShared.js';

const estado = { page: 1, q: '', categoria: '', tipo: '' };
let catalogos = null;

export async function vistaAdminLogros(contenedor) {
  catalogos = await obtenerCatalogos();
  Object.assign(estado, { page: 1, q: '', categoria: '', tipo: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar por título, descripción o institución…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-filtro-categoria" aria-label="Filtrar por categoría">
          <option value="">Categoría: todas</option>
          ${opcionesSelectBase(catalogos.categoriasLogro)}
        </select>
      </div>
      <div class="campo">
        <select id="ad-filtro-tipo" aria-label="Filtrar por tipo de reconocimiento">
          <option value="">Tipo: todos</option>
          ${opcionesSelectBase(catalogos.tiposReconocimiento)}
        </select>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nuevo">${icon('plus')} Nuevo logro</button>`],
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => formLogro());
  document.getElementById('ad-filtro-categoria').addEventListener('change', (e) => {
    estado.categoria = e.target.value;
    estado.page = 1;
    cargar();
  });
  document.getElementById('ad-filtro-tipo').addEventListener('change', (e) => {
    estado.tipo = e.target.value;
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
    if (estado.categoria) params.set('categoria', estado.categoria);
    if (estado.tipo) params.set('tipo', estado.tipo);
    params.set('todos', '1');
    params.set('page', estado.page);
    params.set('limit', 12);

    const res = await api.get(`/logros?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio('trophy', 'Sin logros registrados', 'Documenta los reconocimientos de los estudiantes con el botón Nuevo logro.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr><th>Estudiante</th><th>Logro</th><th>Fecha</th><th>Categoría</th><th>Tipo</th><th>Destacado</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${res.datos
                .map(
                  (l) => `
                <tr>
                  <td><strong class="texto-pequeno">${esc(l.estudiante?.nombreCompleto || '—')}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">${esc(l.estudiante?.matricula || '')}</span></td>
                  <td class="texto-pequeno"><strong>${esc(l.titulo)}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block;max-width:280px;white-space:normal">${esc(l.descripcion)}</span></td>
                  <td class="texto-pequeno">${new Date(l.fecha).toLocaleDateString('es-MX')}</td>
                  <td><span class="badge badge-primario">${esc(l.categoria)}</span></td>
                  <td class="texto-pequeno">${esc(l.tipoReconocimiento || '—')}
                    ${l.institucion ? `<span class="texto-tenue texto-pequeno" style="display:block">${esc(l.institucion)}</span>` : ''}</td>
                  <td>${l.destacado ? `<span class="badge badge-exito">${icon('star')} Cuadro de honor</span>` : '<span class="texto-tenue">—</span>'}</td>
                  <td><span class="badge ${l.estadoPublicacion === 'aprobado' ? 'badge-exito' : l.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(l.estadoPublicacion)}</span></td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-editar="${l._id}" title="Editar">${icon('edit')}</button>
                    ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${l._id}" title="Eliminar">${icon('trash')}</button>` : ''}
                  </div></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`;

    if (res.datos.length) {
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', () => {
          const actual = res.datos.find((x) => x._id === b.dataset.editar);
          formLogro(actual);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar logro?',
            texto: 'Se quitará del historial del estudiante y se eliminarán sus evidencias asociadas.',
            accion: () => api.delete(`/logros/${b.dataset.borrar}`),
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

  async function formLogro(l = null) {
    abrirModal({
      titulo: l ? 'Editar logro' : 'Registrar logro',
      grande: true,
      contenido: `
        <form class="formulario" id="form-logro" novalidate>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Estudiante</label>
              <select id="lo-estudiante" data-requerido="1"></select>
            </div>
            <div class="campo">
              <label>Evento relacionado</label>
              <select id="lo-evento"></select>
            </div>
          </div>
          <div class="campo">
            <label class="obligatorio">Título del logro</label>
            <input id="lo-titulo" value="${esc(l?.titulo || '')}" placeholder="Ej. 1er lugar en la Maratón de Programación" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-3">
            <div class="campo">
              <label class="obligatorio">Categoría</label>
              <select id="lo-categoria">
                <option value="">— Selecciona categoría —</option>
                ${opcionesSelectBase(catalogos.categoriasLogro, l?.categoria || '')}
              </select>
            </div>
            <div class="campo">
              <label>Tipo de reconocimiento</label>
              <select id="lo-tipo">
                <option value="">— Sin tipo específico —</option>
                ${opcionesSelectBase(catalogos.tiposReconocimiento, l?.tipoReconocimiento || '')}
              </select>
            </div>
            <div class="campo">
              <label class="obligatorio">Fecha</label>
              <input type="date" id="lo-fecha" value="${l ? new Date(l.fecha).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campo">
            <label>Institución que otorga (si aplica)</label>
            <input id="lo-institucion" value="${esc(l?.institucion || '')}" placeholder="Ej. UTV, CoderGym, Google" data-validar="max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Descripción</label>
            <textarea id="lo-descripcion" data-validar="requerido, max:2000">${esc(l?.descripcion || '')}</textarea>
            <span class="error-mensaje"></span>
          </div>
          ${
            esAdmin()
              ? `<div class="campo-check">
                  <input type="checkbox" id="lo-destacado" ${l?.destacado ? 'checked' : ''} />
                  <label for="lo-destacado">Destacar en el Cuadro de Honor de la portada.</label>
                </div>`
              : '<div class="banner-info">Tu registro quedará pendiente de aprobación por la administración.</div>'
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${l ? 'Guardar cambios' : 'Registrar'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    await Promise.all([
      poblarSelectEstudiantes(document.getElementById('lo-estudiante'), l?.estudiante?._id || l?.estudiante),
      poblarSelectEventos(document.getElementById('lo-evento'), l?.evento?._id || l?.evento || ''),
    ]);

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = document.getElementById('form-logro');
      if (!validarFormulario(form)) return;

      const estudianteId = document.getElementById('lo-estudiante').value;
      if (!estudianteId) {
        toast('Selecciona un estudiante.', 'error');
        return;
      }
      const categoria = document.getElementById('lo-categoria').value;
      if (!categoria) {
        toast('Selecciona la categoría del logro.', 'error');
        return;
      }

      const cuerpo = {
        estudiante: estudianteId,
        evento: document.getElementById('lo-evento').value || null,
        titulo: document.getElementById('lo-titulo').value.trim(),
        categoria,
        tipoReconocimiento: document.getElementById('lo-tipo').value || undefined,
        fecha: document.getElementById('lo-fecha').value,
        institucion: document.getElementById('lo-institucion').value.trim(),
        descripcion: document.getElementById('lo-descripcion').value.trim(),
      };
      if (esAdmin()) cuerpo.destacado = document.getElementById('lo-destacado').checked;

      try {
        const res = l ? await api.put(`/logros/${l._id}`, cuerpo) : await api.post('/logros', cuerpo);
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
