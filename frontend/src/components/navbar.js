import { sesion, cerrarSesionLocal, esStaff, esAdmin, rolEtiqueta } from '../js/auth.js';
import { icon, toast, iniciales, esc } from '../js/ui.js';
import { navegar } from '../js/router.js';

const ENLACES = [
  { ruta: '/', texto: 'Inicio', icono: 'home' },
  { ruta: '/cuadro-honor', texto: 'Cuadro de Honor', icono: 'trophy' },
  { ruta: '/perfiles', texto: 'Estudiantes', icono: 'users' },
  { ruta: '/eventos', texto: 'Eventos', icono: 'calendar' },
  { ruta: '/galeria', texto: 'Galería', icono: 'image' },
  { ruta: '/buscador', texto: 'Buscador', icono: 'search' },
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
    <button class="usuario-chip" id="chip-usuario" title="${rolEtiqueta(u.rol)} — ${u.nombre}">
      <span class="avatar-mini">${esc(iniciales(u.nombre))}</span>
      <span class="oculto-movil">${esc(u.nombre.split(' ')[0])}</span>
    </button>
    <a class="btn btn-secundario btn-sm" href="#${destino}" title="${destino === '/admin' ? 'Panel de administración' : 'Mi espacio'}">
      ${destino === '/admin' ? icon('dashboard') : icon('user')}
      <span class="oculto-movil">${destino === '/admin' ? 'Panel' : 'Mi espacio'}</span>
    </a>
    <button class="btn btn-fantasma btn-sm" id="btn-salir" title="Cerrar sesión">${icon('logout')}</button>
  `;
}

export function renderNavbar() {
  const navbar = document.getElementById('navbar');
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

        <ul class="nav-enlaces">
          ${ENLACES.map(
            (e) => `<li><a href="#${e.ruta}" data-nav>${esc(e.texto)}</a></li>`
          ).join('')}
        </ul>

        <div class="nav-acciones">
          ${enlaceUsuario()}
          <button class="nav-toggle" id="btn-menu" aria-label="Abrir menú" aria-expanded="false">
            ${icon('menu')}
          </button>
        </div>
      </div>
    </nav>

    <div class="nav-movil" id="menu-movil">
      ${ENLACES.map(
        (e) => `<a href="#${e.ruta}" data-nav>${icon(e.icono)} ${esc(e.texto)}</a>`
      ).join('')}
      <div class="separador"></div>
      ${
        sesion.usuario
          ? `<a href="#${sesion.usuario.rol === 'estudiante' ? '/mi-espacio' : '/admin'}">${icon('dashboard')} ${sesion.usuario.rol === 'estudiante' ? 'Mi espacio' : 'Panel de administración'}</a>
             <a href="#" id="salir-movil">${icon('logout')} Cerrar sesión</a>`
          : `<a href="#/login">${icon('lock')} Iniciar sesión</a>
             <a href="#/registro">${icon('user')} Crear cuenta de estudiante</a>`
      }
    </div>
  `;

  // Interacciones
  const btnMenu = navbar.querySelector('#btn-menu');
  const menuMovil = navbar.querySelector('#menu-movil');
  btnMenu?.addEventListener('click', () => {
    const abierto = menuMovil.classList.toggle('abierto');
    btnMenu.setAttribute('aria-expanded', String(abierto));
    btnMenu.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  menuMovil?.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', () => {
      menuMovil.classList.remove('abierto');
      btnMenu?.setAttribute('aria-expanded', 'false');
      btnMenu?.setAttribute('aria-label', 'Abrir menú');
    })
  );

  navbar.querySelector('#btn-salir')?.addEventListener('click', salir);
  navbar.querySelector('#salir-movil')?.addEventListener('click', (e) => {
    e.preventDefault();
    salir();
  });
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
