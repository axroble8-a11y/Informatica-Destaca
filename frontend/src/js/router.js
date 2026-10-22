/**
 * Enrutador SPA basado en hash (#/ruta).
 * Cada ruta define: vista (función async que renderiza), y opcionalmente
 * protegida (requiere sesión) y roles permitidos.
 */
import { sesion, estaAutenticado, rolEtiqueta } from './auth.js';
import { toast } from './ui.js';

const rutas = [];
let vistaActual = null;

/** Registra una ruta. patron admite segmentos :param. */
export function registrar(patron, opciones) {
  const segmentos = patron.split('/').filter(Boolean);
  rutas.push({ patron, segmentos, ...opciones });
}

function coincidir(hashRuta) {
  const segmentos = hashRuta.split('/').filter(Boolean);
  for (const r of rutas) {
    if (r.segmentos.length !== segmentos.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < segmentos.length; i++) {
      const seg = r.segmentos[i];
      if (seg.startsWith(':')) {
        params[seg.slice(1)] = decodeURIComponent(segmentos[i]);
      } else if (seg !== segmentos[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { ruta: r, params };
  }
  return null;
}

/** Navega a una ruta hash. */
export function navegar(ruta) {
  if (window.location.hash === `#${ruta}`) {
    resolver();
  } else {
    window.location.hash = ruta;
  }
}

async function resolver() {
  const hashLimpio = (window.location.hash || '#/').slice(1).split('?')[0] || '/';
  const contenedor = document.getElementById('vista');

  const coincidencia = coincidir(hashLimpio) || rutas.find((r) => r.patron === '/404');
  if (!coincidencia) {
    contenedor.innerHTML = '<div class="estado-vacio"><h3>Ruta no encontrada</h3></div>';
    return;
  }

  const { ruta, params } = coincidencia;

  if (ruta.protegida && !estaAutenticado()) {
    toast('Inicia sesión para acceder a esta sección.', 'alerta');
    sessionStorage.setItem('idestaca_destino', window.location.hash);
    window.location.hash = '/login';
    return;
  }
  if (ruta.roles && ruta.protegida) {
    const rol = sesion.usuario?.rol;
    if (!ruta.roles.includes(rol)) {
      toast(`Tu rol (${rolEtiqueta(rol)}) no tiene acceso a esta sección.`, 'error');
      window.location.hash = '/';
      return;
    }
  }

  // Cancela la vista anterior si define limpieza
  if (vistaActual?.limpiar) {
    try {
      vistaActual.limpiar();
    } catch {
      /* ignorar */
    }
  }

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  marcarEnlaceActivo(hashLimpio);

  try {
    vistaActual = await ruta.vista(contenedor, params);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio" style="background:var(--c-error-claro);color:var(--c-error)">⚠</div>
        <h3>Ocurrió un error al cargar esta sección</h3>
        <p class="texto-suave">${error.message || 'Inténtalo de nuevo más tarde.'}</p>
        <p class="mt-2"><a class="btn btn-primario" href="#/">Volver al inicio</a></p>
      </div>
    `;
  }
}

function marcarEnlaceActivo(hashLimpio) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const destino = a.getAttribute('href').replace('#', '');
    const activo = destino === hashLimpio || (destino !== '/' && hashLimpio.startsWith(destino));
    a.classList.toggle('activo', activo);
  });
}

export function iniciarRouter() {
  window.addEventListener('hashchange', resolver);
  resolver();
}
