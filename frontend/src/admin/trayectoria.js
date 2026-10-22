import { api } from '../js/api.js';
import {
  eliminarConConfirmacion, poblarSelectEstudiantes, icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, esAdmin,
} from './uiAdminShared.js';

const estado = { pestana: 'proyectos', page: 1, estudiante: '', estadoPublicacion: '' };
const ESTADOS = ['pendiente', 'aprobado', 'rechazado'];

export async function vistaAdminTrayectoria(contenedor) {
  Object.assign(estado, { pestana: 'proyectos', page: 1, estudiante: '', estadoPublicacion: '' });

  contenedor.innerHTML = `
    <div class="panel-filtros sin-buscador" style="grid-template-columns:auto 1fr auto">
      <div class="fila" style="gap:.4rem">
        <button class="btn btn-sm btn-primario" data-pestana="proyectos">Proyectos</button>
        <button class="btn btn-sm btn-secundario" data-pestana="certificaciones">Certificaciones</button>
      </div>
      <div class="campo" style="margin:0">
        <select id="ad-filtro-estudiante" aria-label="Filtrar por estudiante"></select>
      </div>
      <div class="fila" style="gap:.5rem">
        <div class="campo" style="margin:0">
          <select id="ad-filtro-estado" aria-label="Filtrar por estado">
            <option value="">Estado: todos</option>
            ${ESTADOS.map((x) => `<option value="${x}">${x}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primario btn-sm" id="btn-nuevo">${icon('plus')} Nuevo</button>
      </div>
    </div>
    <div id="ad-lista"></div>
    <div id="ad-paginacion"></div>
  `;

  const filtroEstudiante = document.getElementById('ad-filtro-estudiante');
  filtroEstudiante.innerHTML = '<option value="">Todos los estudiantes</option>';
  await poblarSelectEstudiantes(filtroEstudiante);
  filtroEstudiante.addEventListener('change', () => {
    estado.estudiante = filtroEstudiante.value;
    estado.page = 1;
    cargar();
  });

  document.getElementById('ad-filtro-estado').addEventListener('change', (e) => {
    estado.estadoPublicacion = e.target.value;
    estado.page = 1;
    cargar();
  });

  contenedor.querySelectorAll('[data-pestana]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.pestana = b.dataset.pestana;
      estado.page = 1;
      pintarPestanas();
      cargar();
    })
  );

  document.getElementById('btn-nuevo').addEventListener('click', () => {
    if (estado.pestana === 'proyectos') formProyecto();
    else formCertificacion();
  });

  pintarPestanas();
  await cargar();
  return { limpiar: () => {} };

  function pintarPestanas() {
    contenedor.querySelectorAll('[data-pestana]').forEach((b) => {
      const activo = b.dataset.pestana === estado.pestana;
      b.classList.toggle('btn-primario', activo);
      b.classList.toggle('btn-secundario', !activo);
    });
    document.getElementById('btn-nuevo').innerHTML =
      estado.pestana === 'proyectos' ? `${icon('plus')} Nuevo proyecto` : `${icon('plus')} Nueva certificación`;
  }

  async function cargar() {
    const lista = document.getElementById('ad-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const params = new URLSearchParams();
    if (estado.estudiante) params.set('estudiante', estado.estudiante);
    if (estado.estadoPublicacion) params.set('estadoPublicacion', estado.estadoPublicacion);
    params.set('page', estado.page);
    params.set('limit', 12);

    const ruta = estado.pestana === 'proyectos' ? '/proyectos' : '/certificaciones';
    const res = await api.get(`${ruta}?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio(
            estado.pestana === 'proyectos' ? 'briefcase' : 'award',
            `Sin ${estado.pestana}`,
            `Registra ${estado.pestana} del estudiantado con el botón Nuevo.`
          )
        : `<div class="contenedor-tabla"><table class="tabla">
            ${estado.pestana === 'proyectos' ? tablaProyectos(res.datos) : tablaCertificaciones(res.datos)}
          </table></div>`;

    if (res.datos.length) {
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', () => {
          const actual = res.datos.find((x) => x._id === b.dataset.editar);
          if (estado.pestana === 'proyectos') formProyecto(actual);
          else formCertificacion(actual);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: estado.pestana === 'proyectos' ? '¿Eliminar proyecto?' : '¿Eliminar certificación?',
            texto: 'Se quitará del CV digital del estudiante.',
            accion: () => api.delete(`${ruta}/${b.dataset.borrar}`),
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

  function tablaProyectos(datos) {
    return `
      <thead><tr><th>Estudiante</th><th>Proyecto</th><th>Tecnologías</th><th>Periodo</th><th>Enlaces</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        ${datos
          .map(
            (p) => `
          <tr>
            <td><strong class="texto-pequeno">${esc(p.estudiante?.nombreCompleto || '—')}</strong>
              <span class="texto-tenue texto-pequeno" style="display:block">${esc(p.estudiante?.matricula || '')}</span></td>
            <td class="texto-pequeno"><strong>${esc(p.nombre)}</strong>
              <span class="texto-tenue texto-pequeno" style="display:block;max-width:260px;white-space:normal">${esc(p.descripcion)}</span></td>
            <td>${(p.tecnologias || [])
              .slice(0, 4)
              .map((t) => `<span class="chip" style="margin:2px">${esc(t)}</span>`)
              .join('') || '<span class="texto-tenue texto-pequeno">—</span>'}</td>
            <td class="texto-pequeno">${p.fechaInicio ? new Date(p.fechaInicio).toLocaleDateString('es-MX') : '—'}
              ${p.fechaFin ? `<span class="texto-tenue texto-pequeno" style="display:block">→ ${new Date(p.fechaFin).toLocaleDateString('es-MX')}</span>` : ''}</td>
            <td class="texto-pequeno">
              ${p.urlRepositorio ? `<a href="${esc(p.urlRepositorio)}" target="_blank" rel="noopener">${icon('github')} Repo</a><br/>` : ''}
              ${p.urlDemo ? `<a href="${esc(p.urlDemo)}" target="_blank" rel="noopener">${icon('external')} Demo</a>` : ''}
              ${!p.urlRepositorio && !p.urlDemo ? '—' : ''}
            </td>
            <td><span class="badge ${p.estadoPublicacion === 'aprobado' ? 'badge-exito' : p.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(p.estadoPublicacion)}</span></td>
            <td><div class="acciones">
              <button class="btn btn-secundario btn-sm" data-editar="${p._id}" title="Editar">${icon('edit')}</button>
              ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${p._id}" title="Eliminar">${icon('trash')}</button>` : ''}
            </div></td>
          </tr>`
          )
          .join('')}
      </tbody>`;
  }

  function tablaCertificaciones(datos) {
    return `
      <thead><tr><th>Estudiante</th><th>Certificación</th><th>Emisor</th><th>Obtenida</th><th>Expira</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        ${datos
          .map(
            (c) => `
          <tr>
            <td><strong class="texto-pequeno">${esc(c.estudiante?.nombreCompleto || '—')}</strong>
              <span class="texto-tenue texto-pequeno" style="display:block">${esc(c.estudiante?.matricula || '')}</span></td>
            <td class="texto-pequeno"><strong>${esc(c.nombre)}</strong>
              ${
                c.urlCredencial
                  ? `<a class="texto-pequeno" href="${esc(c.urlCredencial)}" target="_blank" rel="noopener">${icon('external')} Ver credencial</a>`
                  : ''
              }</td>
            <td class="texto-pequeno">${esc(c.institucion)}</td>
            <td class="texto-pequeno">${new Date(c.fechaObtencion).toLocaleDateString('es-MX')}</td>
            <td class="texto-pequeno">${c.fechaExpiracion ? new Date(c.fechaExpiracion).toLocaleDateString('es-MX') : 'Vigente'}</td>
            <td><span class="badge ${c.estadoPublicacion === 'aprobado' ? 'badge-exito' : c.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(c.estadoPublicacion)}</span></td>
            <td><div class="acciones">
              <button class="btn btn-secundario btn-sm" data-editar="${c._id}" title="Editar">${icon('edit')}</button>
              ${esAdmin() ? `<button class="btn btn-peligro btn-sm" data-borrar="${c._id}" title="Eliminar">${icon('trash')}</button>` : ''}
            </div></td>
          </tr>`
          )
          .join('')}
      </tbody>`;
  }

  function formProyecto(p = null) {
    abrirModal({
      titulo: p ? 'Editar proyecto' : 'Registrar proyecto',
      grande: true,
      contenido: `
        <form class="formulario" id="form-proyecto" novalidate>
          <div class="campo">
            <label class="obligatorio">Estudiante</label>
            <select id="pj-estudiante" data-requerido="1"></select>
          </div>
          <div class="campo">
            <label class="obligatorio">Nombre del proyecto</label>
            <input id="pj-nombre" value="${esc(p?.nombre || '')}" placeholder="Ej. Sistema de riego inteligente con IoT" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Descripción</label>
            <textarea id="pj-descripcion" data-validar="requerido, max:2000">${esc(p?.descripcion || '')}</textarea>
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label>Tecnologías (separadas por coma)</label>
            <input id="pj-tecnologias" value="${esc((p?.tecnologias || []).join(', '))}" placeholder="Ej. Arduino, C++, MQTT" />
          </div>
          <div class="campos-2">
            <div class="campo">
              <label>Fecha de inicio</label>
              <input type="date" id="pj-inicio" value="${p?.fechaInicio ? new Date(p.fechaInicio).toISOString().slice(0, 10) : ''}" data-validar="fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Fecha de fin</label>
              <input type="date" id="pj-fin" value="${p?.fechaFin ? new Date(p.fechaFin).toISOString().slice(0, 10) : ''}" data-validar="fecha" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label>URL del repositorio</label>
              <input id="pj-repo" value="${esc(p?.urlRepositorio || '')}" placeholder="https://github.com/…" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>URL de demostración</label>
              <input id="pj-demo" value="${esc(p?.urlDemo || '')}" placeholder="https://…" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          ${
            p && p.estadoPublicacion === 'aprobado'
              ? ''
              : '<div class="banner-info">El registro quedará sujeto a revisión según el flujo de aprobación.</div>'
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${p ? 'Guardar cambios' : 'Registrar'}</button>
      `,
    });

    conectarModalComun('form-proyecto', 'pj-estudiante', p, async (form) => {
      const estudianteId = document.getElementById('pj-estudiante').value;
      if (!estudianteId) {
        toast('Selecciona un estudiante.', 'error');
        return null;
      }
      return {
        estudiante: estudianteId,
        nombre: document.getElementById('pj-nombre').value.trim(),
        descripcion: document.getElementById('pj-descripcion').value.trim(),
        tecnologias: document
          .getElementById('pj-tecnologias')
          .value.split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        fechaInicio: document.getElementById('pj-inicio').value || undefined,
        fechaFin: document.getElementById('pj-fin').value || undefined,
        urlRepositorio: document.getElementById('pj-repo').value.trim() || undefined,
        urlDemo: document.getElementById('pj-demo').value.trim() || undefined,
      };
    }, '/proyectos');
  }

  function formCertificacion(c = null) {
    abrirModal({
      titulo: c ? 'Editar certificación' : 'Registrar certificación',
      grande: true,
      contenido: `
        <form class="formulario" id="form-cert" novalidate>
          <div class="campo">
            <label class="obligatorio">Estudiante</label>
            <select id="ce-estudiante" data-requerido="1"></select>
          </div>
          <div class="campo">
            <label class="obligatorio">Nombre de la certificación</label>
            <input id="ce-nombre" value="${esc(c?.nombre || '')}" placeholder="Ej. AWS Certified Cloud Practitioner" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Institución emisora</label>
            <input id="ce-institucion" value="${esc(c?.institucion || '')}" placeholder="Ej. Amazon Web Services" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Fecha de obtención</label>
              <input type="date" id="ce-obtencion" value="${c ? new Date(c.fechaObtencion).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Fecha de expiración</label>
              <input type="date" id="ce-expiracion" value="${c?.fechaExpiracion ? new Date(c.fechaExpiracion).toISOString().slice(0, 10) : ''}" data-validar="fecha" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campo">
            <label>URL del credencial verificable</label>
            <input id="ce-credencial" value="${esc(c?.urlCredencial || '')}" placeholder="https://credly.com/…" data-validar="url" />
            <span class="error-mensaje"></span>
          </div>
          ${
            c && c.estadoPublicacion === 'aprobado'
              ? ''
              : '<div class="banner-info">El registro quedará sujeto a revisión según el flujo de aprobación.</div>'
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${c ? 'Guardar cambios' : 'Registrar'}</button>
      `,
    });

    conectarModalComun('form-cert', 'ce-estudiante', c, async (form) => {
      const estudianteId = document.getElementById('ce-estudiante').value;
      if (!estudianteId) {
        toast('Selecciona un estudiante.', 'error');
        return null;
      }
      return {
        estudiante: estudianteId,
        nombre: document.getElementById('ce-nombre').value.trim(),
        institucion: document.getElementById('ce-institucion').value.trim(),
        fechaObtencion: document.getElementById('ce-obtencion').value,
        fechaExpiracion: document.getElementById('ce-expiracion').value || undefined,
        urlCredencial: document.getElementById('ce-credencial').value.trim() || undefined,
      };
    }, '/certificaciones');
  }

  /** Cablea cancelar, poblar estudiante, validar y enviar (PUT/POST) para un modal de trayectoria. */
  function conectarModalComun(formId, selectId, registro, construirCuerpo, ruta) {
    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    poblarSelectEstudiantes(
      document.getElementById(selectId),
      registro?.estudiante?._id || registro?.estudiante
    );

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = document.getElementById(formId);
      if (!validarFormulario(form)) return;

      const cuerpo = await construirCuerpo(form);
      if (!cuerpo) return;

      try {
        const res = registro
          ? await api.put(`${ruta}/${registro._id}`, cuerpo)
          : await api.post(ruta, cuerpo);
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
