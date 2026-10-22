import { api, obtenerCatalogos, urlAbsoluta } from '../js/api.js';
import {
  estructuraListado, conectarBusqueda, eliminarConConfirmacion, poblarSelectEstudiantes, poblarSelectEventos,
  icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, opcionesSelectBase, esAdmin,
} from './uiAdminShared.js';

const estado = { page: 1, q: '', tipo: '', estadoPublicacion: '' };
let catalogos = null;

export async function vistaAdminEvidencias(contenedor) {
  catalogos = await obtenerCatalogos();
  Object.assign(estado, { page: 1, q: '', tipo: '', estadoPublicacion: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar por título…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-filtro-tipo" aria-label="Filtrar por tipo">
          <option value="">Tipo: todos</option>
          ${opcionesSelectBase(catalogos.tiposEvidencia)}
        </select>
      </div>
      <div class="campo">
        <select id="ad-filtro-estado" aria-label="Filtrar por estado">
          <option value="">Estado: todos</option>
          ${opcionesSelectBase(['pendiente', 'aprobado', 'rechazado'])}
        </select>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nueva">${icon('upload')} Nueva evidencia</button>`],
  });

  document.getElementById('btn-nueva').addEventListener('click', () => formEvidencia());
  document.getElementById('ad-filtro-tipo').addEventListener('change', (e) => {
    estado.tipo = e.target.value;
    estado.page = 1;
    cargar();
  });
  document.getElementById('ad-filtro-estado').addEventListener('change', (e) => {
    estado.estadoPublicacion = e.target.value;
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

  function miniatura(e) {
    if (e.tipo === 'Imagen' && e.archivoUrl) {
      return `<img src="${urlAbsoluta(e.archivoUrl)}" alt="" style="width:52px;height:52px;object-fit:cover;border-radius:8px" loading="lazy" />`;
    }
    const nombreIcono = e.tipo === 'Video' ? 'video' : 'link';
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:8px;background:var(--superficie-alterna,#f1f5f9)">${icon(nombreIcono)}</span>`;
  }

  function vinculacion(e) {
    const partes = [];
    if (e.evento) partes.push(`Evento: ${e.evento.nombre}`);
    if (e.logro) partes.push(`Logro: ${e.logro.titulo}`);
    if (e.estudiante) partes.push(`Estudiante: ${e.estudiante.nombreCompleto}`);
    return partes.length ? esc(partes.join(' · ')) : '<span class="texto-tenue">General</span>';
  }

  async function cargar() {
    const lista = document.getElementById('ad-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.tipo) params.set('tipo', estado.tipo);
    if (estado.estadoPublicacion) params.set('estadoPublicacion', estado.estadoPublicacion);
    params.set('todos', '1');
    params.set('page', estado.page);
    params.set('limit', 12);

    const res = await api.get(`/evidencias?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio('image', 'Sin evidencias', 'Sube fotografías, videos o enlaces que documenten los eventos y logros.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr><th></th><th>Evidencia</th><th>Tipo</th><th>Vinculada a</th><th>Autorizada</th><th>Destacada</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${res.datos
                .map(
                  (e) => `
                <tr>
                  <td>${miniatura(e)}</td>
                  <td class="texto-pequeno"><strong>${esc(e.titulo)}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block;max-width:260px;white-space:normal">${esc(e.descripcion || '')}</span>
                    ${
                      e.urlExterna
                        ? `<a class="texto-pequeno" href="${esc(e.urlExterna)}" target="_blank" rel="noopener">${icon('external')} Ver enlace</a>`
                        : ''
                    }</td>
                  <td><span class="badge badge-primario">${esc(e.tipo)}</span></td>
                  <td class="texto-pequeno" style="max-width:220px">${vinculacion(e)}</td>
                  <td>${e.autorizadoPublicacion ? `<span class="badge badge-exito">${icon('check')} Sí</span>` : `<span class="badge badge-alerta">Sin autorizar</span>`}</td>
                  <td>${
                    esAdmin()
                      ? `<button class="btn btn-fantasma btn-sm" data-destacar="${e._id}" title="Alternar destacada" style="color:${e.destacada ? 'var(--amarillo,#f59e0b)' : 'inherit'}">${icon('star')}</button>`
                      : e.destacada
                        ? `<span class="badge badge-exito">${icon('star')}</span>`
                        : '<span class="texto-tenue">—</span>'
                  }</td>
                  <td><span class="badge ${e.estadoPublicacion === 'aprobado' ? 'badge-exito' : e.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(e.estadoPublicacion)}</span></td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-editar="${e._id}" title="Editar">${icon('edit')}</button>
                    ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${e._id}" title="Eliminar">${icon('trash')}</button>` : ''}
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
          formEvidencia(actual);
        })
      );
      lista.querySelectorAll('[data-destacar]').forEach((b) =>
        b.addEventListener('click', async () => {
          try {
            const res2 = await api.patch(`/evidencias/${b.dataset.destacar}/destacada`, {});
            toast(res2.mensaje, 'exito');
            cargar();
          } catch (err) {
            toast(err.message, 'error');
          }
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar evidencia?',
            texto: 'Se eliminará también el archivo subido. Esta acción no se puede deshacer.',
            accion: () => api.delete(`/evidencias/${b.dataset.borrar}`),
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

  async function formEvidencia(ev = null) {
    abrirModal({
      titulo: ev ? 'Editar evidencia' : 'Subir evidencia multimedia',
      grande: true,
      contenido: `
        <form class="formulario" id="form-evidencia" novalidate>
          <div class="campo">
            <label class="obligatorio">Título</label>
            <input id="ev-titulo" value="${esc(ev?.titulo || '')}" placeholder="Ej. Entrega de premios – Hackathon UTV 2026" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Fecha</label>
              <input type="date" id="ev-fecha" value="${ev ? new Date(ev.fecha).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Tipo</label>
              <select id="ev-tipo">${opcionesSelectBase(catalogos.tiposEvidencia, ev?.tipo || 'Imagen')}</select>
            </div>
          </div>
          <div class="campo">
            <label>Archivo (imagen hasta 5 MB, video hasta 50 MB)</label>
            <input type="file" id="ev-archivo" accept="image/*,video/*" />
            ${
              ev?.archivoUrl
                ? `<span class="texto-tenue texto-pequeno" style="display:block;margin-top:4px">Archivo actual: ${esc(ev.archivoUrl.split('/').pop())}. Se reemplaza al elegir otro.</span>`
                : ''
            }
          </div>
          <div class="campo">
            <label>URL externa (YouTube, Vimeo o enlace público)</label>
            <input id="ev-url" value="${esc(ev?.urlExterna || '')}" placeholder="https://youtube.com/watch?v=…" data-validar="url" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label>Evento relacionado</label>
              <select id="ev-evento"></select>
            </div>
            <div class="campo">
              <label>Estudiante relacionado</label>
              <select id="ev-estudiante"></select>
            </div>
          </div>
          <div class="campo">
            <label>Logro relacionado</label>
            <select id="ev-logro"></select>
          </div>
          <div class="campo-check">
            <input type="checkbox" id="ev-autorizado" ${!ev || ev.autorizadoPublicacion ? 'checked' : ''} />
            <label for="ev-autorizado">El material cuenta con autorización de las personas que aparecen (aviso de privacidad).</label>
          </div>
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${ev ? 'Guardar cambios' : 'Publicar evidencia'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    const selectLogro = document.getElementById('ev-logro');
    selectLogro.innerHTML = '<option value="">— Sin logro —</option>';
    const resLogros = await api.get('/logros?limit=60&todos=1');
    resLogros.datos.forEach((l) => {
      const op = document.createElement('option');
      op.value = l._id;
      op.textContent = `${l.titulo} · ${l.estudiante?.nombreCompleto || ''}`;
      if (ev?.logro && (ev.logro._id || ev.logro) === l._id) op.selected = true;
      selectLogro.appendChild(op);
    });

    await Promise.all([
      poblarSelectEventos(document.getElementById('ev-evento'), ev?.evento?._id || ev?.evento || ''),
      poblarSelectEstudiantes(document.getElementById('ev-estudiante'), ev?.estudiante?._id || ev?.estudiante || ''),
    ]);

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = document.getElementById('form-evidencia');
      if (!validarFormulario(form)) return;

      const tipo = document.getElementById('ev-tipo').value;
      const url = document.getElementById('ev-url').value.trim();
      const archivo = document.getElementById('ev-archivo').files[0];

      if (tipo === 'Enlace' && !url) {
        toast('Una evidencia de tipo Enlace requiere la URL externa.', 'error');
        return;
      }
      if ((tipo === 'Imagen' || tipo === 'Video') && !archivo && !url && !(ev && ev.archivoUrl)) {
        toast(`Una evidencia de tipo ${tipo} requiere un archivo o una URL externa.`, 'error');
        return;
      }

      const datos = new FormData();
      datos.append('titulo', document.getElementById('ev-titulo').value.trim());
      datos.append('fecha', document.getElementById('ev-fecha').value);
      datos.append('tipo', tipo);
      datos.append('urlExterna', url);
      datos.append('evento', document.getElementById('ev-evento').value);
      datos.append('estudiante', document.getElementById('ev-estudiante').value);
      datos.append('logro', selectLogro.value);
      datos.append('autorizadoPublicacion', document.getElementById('ev-autorizado').checked ? 'true' : 'false');
      if (archivo) datos.append('archivo', archivo);

      try {
        const res = ev
          ? await api.putForm(`/evidencias/${ev._id}`, datos)
          : await api.postForm('/evidencias', datos);
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
