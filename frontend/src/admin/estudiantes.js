import { api, obtenerCatalogos } from '../js/api.js';
import {
  estructuraListado, poblarSelectEstudiantes, eliminarConConfirmacion,
  icon, esc, toast, abrirModal, estadoVacio, montarPaginacion, opcionesSelectBase, esAdmin,
} from './uiAdminShared.js';

const estado = { page: 1, q: '', estado: '' };
let catalogos = null;

export async function vistaAdminEstudiantes(contenedor) {
  catalogos = await obtenerCatalogos();
  Object.assign(estado, { page: 1, q: '', estado: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar por nombre, apellidos o matrícula…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-estado">
          <option value="">Estado: todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option>
        </select>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nuevo">${icon('plus')} Nuevo estudiante</button>`],
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => formEstudiante());
  document.getElementById('ad-estado').addEventListener('change', () => {
    estado.estado = document.getElementById('ad-estado').value;
    estado.page = 1;
    cargar();
  });

  let timer = null;
  document.getElementById('ad-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      estado.q = document.getElementById('ad-q').value.trim();
      estado.page = 1;
      cargar();
    }, 320);
  });

  await cargar();
  return { limpiar: () => clearTimeout(timer) };

  async function cargar() {
    const lista = document.getElementById('ad-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.estado) params.set('estadoPublicacion', estado.estado);
    params.set('todos', '1');
    params.set('page', estado.page);
    params.set('limit', 12);

    const res = await api.get(`/estudiantes?${params}`);

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio('users', 'Sin estudiantes', 'Ajusta la búsqueda o registra uno nuevo.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr>
              <th>Estudiante</th><th>Matrícula</th><th>Semestre</th>
              <th>Consentimiento</th><th>Estado publicación</th><th></th>
            </tr></thead>
            <tbody>
              ${res.datos
                .map(
                  (e) => `
                <tr>
                  <td>
                    <div class="fila" style="gap:.6rem;flex-wrap:nowrap">
                      <img src="${esc(e.fotoUrl || '/public/img/avatars/default.svg')}" alt="" style="width:38px;height:38px;border-radius:50%;object-fit:cover" onerror="this.src='/public/img/avatars/default.svg'" />
                      <span><strong class="texto-pequeno">${esc(e.nombreCompleto)}</strong>
                      <span class="texto-tenue texto-pequeno" style="display:block">${esc(e.correoContacto || 'sin correo')}</span></span>
                    </div>
                  </td>
                  <td class="texto-mono texto-pequeno">${esc(e.matricula)}</td>
                  <td>${esc(e.semestre)}</td>
                  <td>${e.consentimientoPublicacion ? '<span class="badge badge-exito">Autorizado</span>' : '<span class="badge badge-alerta">Sin autorizar</span>'}</td>
                  <td><span class="badge ${e.estadoPublicacion === 'aprobado' ? 'badge-exito' : e.estadoPublicacion === 'pendiente' ? 'badge-alerta' : 'badge-error'}">${esc(e.estadoPublicacion)}</span></td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-ver="${e._id}" title="Ver perfil público">${icon('eye')}</button>
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
      lista.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => window.open(`#/perfiles/${b.dataset.ver}`, '_self')));
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const resDetalle = await api.get(`/estudiantes/${b.dataset.editar}`);
          formEstudiante(resDetalle.dato);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar estudiante?',
            texto: 'Se eliminará el estudiante y toda su trayectoria (participaciones, logros, proyectos, certificaciones y evidencias). Esta acción no puede deshacerse.',
            textoConfirmar: 'Sí, eliminar todo',
            accion: () => api.delete(`/estudiantes/${b.dataset.borrar}`),
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

  function formEstudiante(estudiante = null) {
    const e = estudiante || {};
    abrirModal({
      titulo: e._id ? `Editar: ${e.nombreCompleto}` : 'Registrar estudiante',
      grande: true,
      contenido: `
        <form class="formulario" id="form-est" novalidate>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Nombre(s)</label>
              <input id="es-nombre" value="${esc(e.nombre || '')}" data-validar="requerido, max:80" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Apellidos</label>
              <input id="es-apellidos" value="${esc(e.apellidos || '')}" data-validar="requerido, max:80" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Matrícula</label>
              <input id="es-matricula" class="texto-mono" value="${esc(e.matricula || '')}" placeholder="AAA-2201" data-validar="requerido" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Semestre</label>
              <select id="es-semestre">${opcionesSelectBase(catalogos.semestres, e.semestre || '1')}</select>
            </div>
            <div class="campo">
              <label>Generación</label>
              <input id="es-generacion" value="${esc(e.generacion || '')}" placeholder="2022-2026" data-validar="max:20" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Fotografía (URL)</label>
              <input id="es-foto" value="${esc(e.fotoUrl || '')}" placeholder="https://… o /uploads/…" data-validar="max:500" />
              <span class="error-mensaje"></span>
            </div>
          </div>

          <div class="campo">
            <label>Presentación profesional</label>
            <textarea id="es-perfil" data-validar="max:1200">${esc(e.perfilProfesional || '')}</textarea>
            <span class="error-mensaje"></span>
          </div>

          <div class="campo">
            <label>Áreas de interés (separadas por coma)</label>
            <input id="es-areas" value="${esc((e.areasInteres || []).join(', '))}" />
          </div>

          <div class="campo">
            <label>Habilidades</label>
            <div id="es-habilidades" style="display:grid;gap:.5rem">
              ${(e.habilidades || [])
                .map(
                  (h) => `
                <div class="fila" data-hab>
                  <input class="hab-nombre" placeholder="Habilidad" value="${esc(h.nombre)}" style="flex:2" />
                  <select class="hab-nivel" style="flex:1">${opcionesSelectBase(catalogos.nivelesHabilidad, h.nivel)}</select>
                  <button type="button" class="btn btn-fantasma btn-sm hab-quitar">${icon('trash')}</button>
                </div>`
                )
                .join('')}
            </div>
            <button type="button" class="btn btn-secundario btn-sm mt-1" id="es-add-hab">${icon('plus')} Agregar habilidad</button>
          </div>

          <div class="campos-2">
            <div class="campo">
              <label>Correo de contacto</label>
              <input id="es-correo" value="${esc(e.correoContacto || '')}" data-validar="email" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>GitHub</label>
              <input id="es-github" value="${esc(e.githubUrl || '')}" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>LinkedIn</label>
              <input id="es-linkedin" value="${esc(e.linkedinUrl || '')}" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>Sitio web</label>
              <input id="es-web" value="${esc(e.sitioWebUrl || '')}" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
          </div>

          <div class="campo-check">
            <input type="checkbox" id="es-consentimiento" ${e.consentimientoPublicacion ? 'checked' : ''} />
            <label for="es-consentimiento">El estudiante autorizó la publicación de su perfil, fotografía y trayectoria.</label>
          </div>

          ${
            esAdmin()
              ? `<div class="campo">
                  <label>Estado de publicación</label>
                  <select id="es-estado-publicacion">
                    ${opcionesSelectBase(['pendiente', 'aprobado', 'rechazado'], e.estadoPublicacion || 'aprobado')}
                  </select>
                </div>`
              : ''
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${e._id ? 'Guardar cambios' : 'Registrar'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    const agregarFila = (nombre = '', nivel = 'Básico') => {
      const fila = document.createElement('div');
      fila.className = 'fila';
      fila.setAttribute('data-hab', '');
      fila.innerHTML = `
        <input class="hab-nombre" placeholder="Habilidad" value="${esc(nombre)}" style="flex:2" />
        <select class="hab-nivel" style="flex:1">${opcionesSelectBase(catalogos.nivelesHabilidad, nivel)}</select>
        <button type="button" class="btn btn-fantasma btn-sm hab-quitar">${icon('trash')}</button>
      `;
      fila.querySelector('.hab-quitar').addEventListener('click', () => fila.remove());
      document.getElementById('es-habilidades').appendChild(fila);
    };

    modal.querySelector('#es-add-hab').addEventListener('click', () => agregarFila());
    modal.querySelectorAll('.hab-quitar').forEach((b) => b.addEventListener('click', () => b.closest('[data-hab]').remove()));

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const form = document.getElementById('form-est');
      const { validarFormulario } = await import('../js/ui.js');
      if (!validarFormulario(form)) return;

      if (!/^[A-Za-z0-9-]{4,20}$/.test(document.getElementById('es-matricula').value.trim())) {
        toast('La matrícula debe tener entre 4 y 20 caracteres alfanuméricos.', 'error');
        return;
      }

      const cuerpo = {
        nombre: document.getElementById('es-nombre').value.trim(),
        apellidos: document.getElementById('es-apellidos').value.trim(),
        matricula: document.getElementById('es-matricula').value.trim().toUpperCase(),
        semestre: document.getElementById('es-semestre').value,
        generacion: document.getElementById('es-generacion').value.trim(),
        fotoUrl: document.getElementById('es-foto').value.trim(),
        perfilProfesional: document.getElementById('es-perfil').value.trim(),
        areasInteres: document.getElementById('es-areas').value.split(',').map((s) => s.trim()).filter(Boolean),
        habilidades: [...modal.querySelectorAll('#es-habilidades [data-hab]')]
          .map((f) => ({ nombre: f.querySelector('.hab-nombre').value.trim(), nivel: f.querySelector('.hab-nivel').value }))
          .filter((h) => h.nombre),
        correoContacto: document.getElementById('es-correo').value.trim(),
        githubUrl: document.getElementById('es-github').value.trim(),
        linkedinUrl: document.getElementById('es-linkedin').value.trim(),
        sitioWebUrl: document.getElementById('es-web').value.trim(),
        consentimientoPublicacion: document.getElementById('es-consentimiento').checked,
      };
      if (esAdmin()) cuerpo.estadoPublicacion = document.getElementById('es-estado-publicacion').value;

      try {
        const res = e._id ? await api.put(`/estudiantes/${e._id}`, cuerpo) : await api.post('/estudiantes', cuerpo);
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
