import { sesion, cerrarSesionLocal, rolEtiqueta } from '../js/auth.js';
import { icon, toast, iniciales, esc } from '../js/ui.js';
import { navegar } from '../js/router.js';

const MODULOS = [
  { ruta: '/', rutasActivas: ['/cuadro-honor'], texto: 'Inicio & Cuadro de Honor', icono: 'home' },
  { ruta: '/buscador', texto: 'Buscador & Filtros', icono: 'search' },
  { ruta: '/perfiles', texto: 'Perfil & CV Digital', icono: 'user' },
  { ruta: '/eventos', rutasActivas: ['/galeria'], texto: 'Eventos & Galería', icono: 'calendar' },
  { ruta: '/certamenes', texto: 'Certámenes', icono: 'trophy' },
  { ruta: '/admin', texto: 'Gestión y Auditoría', icono: 'dashboard' },
  { ruta: '/demostracion', texto: 'Flujo de Demostración', icono: 'check-circle' },
];

function enlaceUsuario() {
  if (!sesion.usuario) {
    return `
      <a class="btn btn-primario btn-sm" href="#/login">${icon('lock')} Iniciar sesión</a>
    `;
  }
  const u = sesion.usuario;
  const destino = u.rol === 'estudiante' ? '/mi-espacio' : '/admin';
  return `
    <span class="usuario-chip" title="${rolEtiqueta(u.rol)} — ${esc(u.nombre)}">
      <span class="avatar-mini">${esc(iniciales(u.nombre))}</span>
      <span class="oculto-movil">${esc(u.nombre.split(' ')[0])}</span>
    </span>
    <a class="btn btn-secundario btn-sm" href="#${destino}" title="${destino === '/admin' ? 'Panel de administración' : 'Mi espacio'}">
      ${destino === '/admin' ? icon('dashboard') : icon('user')}
      <span class="oculto-movil">${destino === '/admin' ? 'Panel' : 'Mi espacio'}</span>
    </a>
    <button class="btn btn-fantasma btn-sm" id="btn-salir" title="Cerrar sesión">${icon('logout')}</button>
  `;
}

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
  const modulosActivos = MODULOS.map((modulo) => {
    if (modulo.ruta === '/admin' && sesion.usuario?.rol === 'estudiante') {
      return { ...modulo, ruta: '/mi-espacio', texto: 'Mi espacio', icono: 'user' };
    }
    return modulo;
  });
  const enlacesModulos = modulosActivos.map(
    (e) => `<li><a href="#${e.ruta}" data-nav${e.rutasActivas ? ` data-nav-aliases="${e.rutasActivas.join(',')}"` : ''}>${icon(e.icono)}<span>${esc(e.texto)}</span></a></li>`
  ).join('');
  navbar.innerHTML = `
    <div class="portal-topline">
      <div class="contenedor portal-topline-inner">
        <span><i aria-hidden="true"></i> Portal Académico y Distinción al Mérito</span>
        <span>Licenciatura en Informática</span>
      </div>
    </div>
    <nav class="navbar" aria-label="Navegación principal">
      <div class="contenedor navbar-inner">
        <a class="marca" href="#/">
          <img src="/public/img/logo.svg" alt="Logotipo Informática Destaca" />
          <span>
            Informática Destaca
            <span class="marca-sub">Excelencia y liderazgo académico</span>
          </span>
        </a>

        <ul class="nav-enlaces" aria-label="Módulos principales">${enlacesModulos}</ul>

        <div class="nav-acciones">
          ${enlaceUsuario()}
        </div>
      </div>
    </nav>

    <nav class="portal-modulebar" aria-label="Navegación principal">
      <ul>${enlacesModulos}</ul>
    </nav>
  `;

  navbar.querySelector('#btn-salir')?.addEventListener('click', salir);
}

function salir() {
  cerrarSesionLocal();
  toast('Sesión cerrada correctamente.', 'info');
  navegar('/');
  renderNavbar();
}

// Re-render del navbar al iniciar sesión en otra vista
export function refrescarNavbar() {
  renderNavbar();
}
