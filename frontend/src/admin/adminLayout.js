import { icon, esc } from '../js/ui.js';
import { sesion, esAdmin, rolEtiqueta } from '../js/auth.js';
import { api } from '../js/api.js';

const SECCIONES = [
  { grupo: 'General' },
  { ruta: '/admin', icono: 'dashboard', texto: 'Dashboard' },
  { grupo: 'Gestión de contenido' },
  { ruta: '/admin/estudiantes', icono: 'users', texto: 'Estudiantes' },
  { ruta: '/admin/eventos', icono: 'calendar', texto: 'Eventos' },
  { ruta: '/admin/participaciones', icono: 'clipboard', texto: 'Participaciones' },
  { ruta: '/admin/logros', icono: 'trophy', texto: 'Logros' },
  { ruta: '/admin/trayectoria', icono: 'briefcase', texto: 'Proyectos y certificaciones' },
  { ruta: '/admin/evidencias', icono: 'image', texto: 'Multimedia' },
  { grupo: 'Administración' },
  { ruta: '/admin/usuarios', icono: 'settings', texto: 'Usuarios y roles', soloAdmin: true },
  { ruta: '/admin/aprobaciones', icono: 'check-circle', texto: 'Aprobaciones', soloAdmin: true, conContador: true },
];

/** Envuelve el contenido de una vista admin con la barra lateral. */
export async function layoutAdmin(titulo, subtitulo, contenidoHTML, initFn) {
  const contenedor = document.getElementById('vista');
  let contadorPendientes = 0;
  try {
    const res = await api.get('/aprobaciones');
    contadorPendientes = Object.values(res.resumen).reduce((suma, r) => suma + r.total, 0);
  } catch {
    /* el responsable no tiene acceso al resumen */
  }

  contenedor.innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar" aria-label="Menú del panel">
        ${SECCIONES.map((s) => {
          if (s.grupo) return `<div class="grupo-titulo">${esc(s.grupo)}</div>`;
          if (s.soloAdmin && !esAdmin()) return '';
          const contador = s.conContador && contadorPendientes > 0 ? `<span class="contador-pendientes">${contadorPendientes}</span>` : '';
          return `<a href="#${s.ruta}" data-nav>${icon(s.icono)} <span>${esc(s.texto)}</span>${contador}</a>`;
        }).join('')}
        <div class="grupo-titulo">Sesión</div>
        <div style="padding:.4rem .8rem;color:#94a3b8;font-size:.8rem">
          <strong style="color:#e2e8f0;display:block">${esc(sesion.usuario.nombre)}</strong>
          ${esc(rolEtiqueta(sesion.usuario.rol))}
        </div>
      </aside>

      <div>
        <div class="encabezado-seccion">
          <div style="flex:1">
            <h1 style="font-size:1.5rem">${esc(titulo)}</h1>
            <p class="texto-suave texto-pequeno">${esc(subtitulo)}</p>
            <div class="linea-gradiente"></div>
          </div>
        </div>
        <div id="admin-contenido">${contenidoHTML}</div>
      </div>
    </div>
  `;

  if (initFn) await initFn(document.getElementById('admin-contenido'));
}
