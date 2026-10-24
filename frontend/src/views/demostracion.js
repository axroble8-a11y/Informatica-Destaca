import { icon, esc } from '../js/ui.js';
import { sesion, rolEtiqueta } from '../js/auth.js';

const PASOS = [
  {
    titulo: 'Inicia sesión con tu cuenta y rol',
    detalle: 'La plataforma protege las operaciones según los permisos de administrador, responsable o estudiante.',
    ruta: '/login',
    accion: 'Abrir inicio de sesión',
    icono: 'lock',
  },
  {
    titulo: 'Registra un evento académico',
    detalle: 'El panel permite crear y editar eventos; según tu rol, el registro puede requerir aprobación antes de publicarse.',
    ruta: '/admin/eventos',
    accion: 'Gestionar eventos',
    icono: 'calendar',
  },
  {
    titulo: 'Localiza o registra un perfil estudiantil',
    detalle: 'Consulta los perfiles públicos autorizados o usa la gestión administrativa para registrar información.',
    ruta: '/admin/estudiantes',
    accion: 'Gestionar estudiantes',
    icono: 'users',
  },
  {
    titulo: 'Asocia una participación con el evento',
    detalle: 'Registra la participación y su relación con el estudiante y el evento desde el panel.',
    ruta: '/admin/participaciones',
    accion: 'Gestionar participaciones',
    icono: 'link',
  },
  {
    titulo: 'Registra un logro y su evidencia',
    detalle: 'Los logros y evidencias se almacenan en sus módulos y siguen el flujo de revisión definido por el rol.',
    ruta: '/admin/logros',
    accion: 'Gestionar logros',
    icono: 'trophy',
  },
  {
    titulo: 'Revisa y aprueba las solicitudes',
    detalle: 'La administración puede revisar, aprobar o rechazar contenido pendiente. Las aprobaciones no se simulan en esta guía.',
    ruta: '/admin/aprobaciones',
    accion: 'Abrir aprobaciones',
    icono: 'check-circle',
  },
  {
    titulo: 'Consulta el contenido publicado',
    detalle: 'Los elementos aprobados aparecen en las secciones públicas cuando cumplen las condiciones de publicación y consentimiento.',
    ruta: '/cuadro-honor',
    accion: 'Ver cuadro de honor',
    icono: 'award',
  },
  {
    titulo: 'Revisa la trayectoria y el CV',
    detalle: 'Los perfiles muestran la trayectoria disponible y ofrecen una versión imprimible para exportar a PDF.',
    ruta: '/perfiles',
    accion: 'Ver perfiles públicos',
    icono: 'briefcase',
  },
  {
    titulo: 'Encuentra registros en el buscador',
    detalle: 'Busca estudiantes, eventos y logros que estén publicados en la plataforma.',
    ruta: '/buscador',
    accion: 'Probar buscador',
    icono: 'search',
  },
  {
    titulo: 'Comprueba las restricciones por rol',
    detalle: 'Cierra sesión y prueba una ruta protegida; vuelve a iniciar sesión con un rol autorizado para comprobar las restricciones reales.',
    ruta: '/admin',
    accion: 'Abrir panel protegido',
    icono: 'shield',
  },
];

export function vistaDemostracion(contenedor) {
  const rol = sesion.usuario ? rolEtiqueta(sesion.usuario.rol) : 'Sin sesión iniciada';

  contenedor.innerHTML = `
    <section class="seccion demostracion">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('check-circle')}</span>
        <div>
          <span class="etiqueta-modulo">Guía interactiva · 10 pasos</span>
          <h1>Flujo de demostración</h1>
          <p>Recorre el flujo real de registro, revisión, publicación y consulta. Cada botón abre el módulo funcional correspondiente.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="demostracion-sesion panel">
        <span>${icon('user')} Sesión actual</span>
        <strong>${esc(rol)}</strong>
        ${sesion.usuario ? `<span>${esc(sesion.usuario.nombre)}</span>` : '<a class="btn btn-primario btn-sm" href="#/login">Iniciar sesión</a>'}
      </div>

      <ol class="demostracion-pasos">
        ${PASOS.map((paso, indice) => `
          <li class="demostracion-paso panel">
            <span class="demostracion-numero">${String(indice + 1).padStart(2, '0')}</span>
            <div class="demostracion-paso-contenido">
              <h2>${esc(paso.titulo)}</h2>
              <p>${esc(paso.detalle)}</p>
              <a href="#${paso.ruta}" class="btn btn-secundario btn-sm">${icon(paso.icono)} ${esc(paso.accion)} ${icon('chevron-right')}</a>
            </div>
          </li>
        `).join('')}
      </ol>

      <p class="demostracion-nota">
        ${icon('info')}
        Esta guía no crea datos de prueba ni marca pasos como aprobados. Las acciones y resultados se verifican en los módulos y con los permisos de tu cuenta.
      </p>
    </section>
  `;
}
