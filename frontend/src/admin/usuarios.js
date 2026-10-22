import { api } from '../js/api.js';
import {
  estructuraListado, conectarBusqueda, eliminarConConfirmacion, poblarSelectEstudiantes,
  icon, esc, toast, abrirModal, estadoVacio, opcionesSelectBase,
} from './uiAdminShared.js';
import { sesion } from '../js/auth.js';

const estado = { q: '', rol: '' };

const ROL_BADGE = {
  administrador: 'badge-error',
  responsable: 'badge-primario',
  estudiante: 'badge-exito',
};

export async function vistaAdminUsuarios(contenedor) {
  Object.assign(estado, { q: '', rol: '' });

  contenedor.innerHTML = estructuraListado({
    placeholderBusqueda: 'Buscar por nombre o correo…',
    filtrosHTML: `
      <div class="campo">
        <select id="ad-filtro-rol" aria-label="Filtrar por rol">
          <option value="">Rol: todos</option>
          ${opcionesSelectBase(['administrador', 'responsable', 'estudiante'])}
        </select>
      </div>
      <div class="fila" style="justify-content:flex-end">
        <span class="texto-tenue texto-pequeno" id="us-total"></span>
      </div>
    `,
    botones: [`<button class="btn btn-primario btn-sm" id="btn-nuevo">${icon('plus')} Nuevo usuario</button>`],
  });

  document.getElementById('btn-nuevo').addEventListener('click', () => formUsuario());
  document.getElementById('ad-filtro-rol').addEventListener('change', (e) => {
    estado.rol = e.target.value;
    cargar();
  });

  const detener = conectarBusqueda((q) => {
    estado.q = q;
    cargar();
  });

  await cargar();
  return { limpiar: detener };

  async function cargar() {
    const lista = document.getElementById('ad-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.rol) params.set('rol', estado.rol);

    const res = await api.get(`/usuarios?${params}`);
    const usuarios = res.datos.map((u) => ({ ...u, _id: u.id || u._id }));
    document.getElementById('us-total').textContent = `${res.total} usuario(s)`;

    const esYo = (u) => String(u._id) === String(sesion.usuario?._id);

    lista.innerHTML =
      usuarios.length === 0
        ? estadoVacio('users', 'Sin usuarios', 'Crea cuentas con el botón Nuevo usuario.')
        : `
        <div class="contenedor-tabla">
          <table class="tabla">
            <thead><tr><th>Usuario</th><th>Rol</th><th>Estudiante vinculado</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              ${usuarios
                .map(
                  (u) => `
                <tr>
                  <td><strong class="texto-pequeno">${esc(u.nombre)} ${esYo(u) ? '<span class="badge badge-primario">Tú</span>' : ''}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">${esc(u.email)}</span></td>
                  <td><span class="badge ${ROL_BADGE[u.rol] || 'badge-primario'}">${esc(u.rol)}</span></td>
                  <td class="texto-pequeno">${
                    u.estudiante
                      ? `${esc(u.estudiante.nombre || u.estudiante.nombreCompleto || '')} <span class="texto-tenue">${esc(u.estudiante.matricula || '')}</span>`
                      : '<span class="texto-tenue">—</span>'
                  }</td>
                  <td>${u.activo ? '<span class="badge badge-exito">Activo</span>' : '<span class="badge badge-error">Inactivo</span>'}</td>
                  <td><div class="acciones">
                    <button class="btn btn-secundario btn-sm" data-editar="${u._id}" title="Editar">${icon('edit')}</button>
                    ${esYo(u) ? '' : `<button class="btn btn-peligro btn-sm" data-borrar="${u._id}" title="Eliminar">${icon('trash')}</button>`}
                  </div></td>
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>`;

    if (usuarios.length) {
      lista.querySelectorAll('[data-editar]').forEach((b) =>
        b.addEventListener('click', () => {
          const actual = usuarios.find((x) => x._id === b.dataset.editar);
          formUsuario(actual);
        })
      );
      lista.querySelectorAll('[data-borrar]').forEach((b) =>
        b.addEventListener('click', async () => {
          const actual = usuarios.find((x) => x._id === b.dataset.borrar);
          const ok = await eliminarConConfirmacion({
            titulo: '¿Eliminar usuario?',
            texto: `${actual.nombre} perderá el acceso al sistema. El perfil de estudiante asociado no se elimina.`,
            accion: () => api.delete(`/usuarios/${b.dataset.borrar}`),
          });
          if (ok) cargar();
        })
      );
    }
  }

  async function formUsuario(u = null) {
    const esYo = u && String(u._id) === String(sesion.usuario?._id);

    abrirModal({
      titulo: u ? `Editar usuario: ${u.nombre}` : 'Crear usuario',
      grande: true,
      contenido: `
        <form class="formulario" id="form-usuario" novalidate>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Nombre completo</label>
              <input id="us-nombre" value="${esc(u?.nombre || '')}" data-validar="requerido, max:120" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Correo electrónico</label>
              <input id="us-email" value="${esc(u?.email || '')}" placeholder="usuario@utvalle.edu.mx" data-validar="requerido, email" />
              <span class="error-mensaje"></span>
            </div>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label class="${u ? '' : 'obligatorio'}">${u ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
              <input type="password" id="us-password" placeholder="${u ? 'Dejar igual si no deseas cambiarla' : 'Mínimo 8 caracteres'}" data-validar="${u ? 'min:8' : 'requerido, min:8'}" autocomplete="new-password" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio">Rol</label>
              <select id="us-rol" ${esYo ? 'disabled' : ''}>
                ${opcionesSelectBase(['administrador', 'responsable', 'estudiante'], u?.rol || 'responsable')}
              </select>
              ${esYo ? '<span class="texto-tenue texto-pequeno">No puedes cambiar tu propio rol.</span>' : ''}
            </div>
          </div>
          <div class="campo">
            <label>Perfil de estudiante vinculado (para cuentas de rol estudiante)</label>
            <select id="us-estudiante"></select>
            <span class="texto-tenue texto-pequeno" style="display:block;margin-top:4px">
              Si el usuario es estudiante, vincúlalo a su perfil del Cuadro de Honor. Los perfiles nuevos se crean desde el módulo Estudiantes.
            </span>
          </div>
          ${
            u
              ? `<div class="campo-check">
                  <input type="checkbox" id="us-activo" ${u.activo ? 'checked' : ''} ${esYo ? 'disabled' : ''} />
                  <label for="us-activo">Cuenta activa (puede iniciar sesión).</label>
                </div>`
              : ''
          }
        </form>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn btn-primario" data-acc="guardar">${icon('check')} ${u ? 'Guardar cambios' : 'Crear usuario'}</button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());

    await poblarSelectEstudiantes(document.getElementById('us-estudiante'), u?.estudiante?._id || u?.estudiante || '');
    const primeraOpcion = document.querySelector('#us-estudiante option');
    if (primeraOpcion) primeraOpcion.textContent = '— Sin perfil vinculado —';

    modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = document.getElementById('form-usuario');
      if (!validarFormulario(form)) return;

      const password = document.getElementById('us-password').value;
      const cuerpo = {
        nombre: document.getElementById('us-nombre').value.trim(),
        email: document.getElementById('us-email').value.trim(),
        estudiante: document.getElementById('us-estudiante').value || null,
      };
      if (!esYo) cuerpo.rol = document.getElementById('us-rol').value;
      if (password) cuerpo.password = password;
      if (u && !esYo) cuerpo.activo = document.getElementById('us-activo').checked;

      try {
        const res = u ? await api.put(`/usuarios/${u._id}`, cuerpo) : await api.post('/usuarios', cuerpo);
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
