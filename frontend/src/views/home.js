import { api } from '../js/api.js';
import { icon, esc, formatoPeriodo, formatoFecha, skeleton, estadoVacio } from '../js/ui.js';
import { tarjetaEvento, tarjetaLogro, itemGaleria, verEvidencia } from '../components/cards.js';

export async function vistaHome(contenedor) {
  contenedor.innerHTML = `
    <section class="hero">
      <div class="hero-layout">
        <div class="hero-contenido">
          <span class="etiqueta-hero">${icon('graduate')} Portal institucional de honores y difusión tecnológica</span>
          <h1>Excelencia, Investigación y Liderazgo en <span class="codigo-mono">Informática</span></h1>
          <p>
            Portal oficial para reconocer los logros de la comunidad, consultar eventos y construir
            una trayectoria académica verificable como currículum digital.
          </p>
          <div class="grupo-botones">
            <a class="btn btn-primario btn-lg" href="#/cuadro-honor">${icon('trophy')} Explorar el Cuadro de Honor</a>
            <a class="btn btn-secundario btn-lg" href="#/eventos">${icon('calendar')} Consultar eventos</a>
          </div>
          <a class="hero-privacy" href="#/aviso-privacidad">
            ${icon('shield')} Datos y evidencias se publican con autorización de sus titulares
            <span aria-hidden="true">·</span> Leer aviso de privacidad
          </a>
        </div>
        <aside class="hero-emblem" aria-label="Módulos de la plataforma">
          <div class="hero-emblem-seal">${icon('award')}</div>
          <span class="hero-emblem-kicker">Licenciatura en Informática</span>
          <strong>Trayectorias que inspiran</strong>
          <span class="hero-emblem-rule"></span>
          <span class="hero-emblem-caption">Logros · Eventos · Participaciones · CV digital</span>
        </div>
      </div>
    </section>

    <section class="seccion" id="seccion-cifras" aria-label="Cifras de la plataforma">
      <div class="cifras">
        <div class="skeleton" style="height:92px"></div>
        <div class="skeleton" style="height:92px"></div>
        <div class="skeleton" style="height:92px"></div>
        <div class="skeleton" style="height:92px"></div>
      </div>
    </section>

    <section class="seccion" aria-label="Accesos directos">
      <div class="rejilla rejilla-4" style="grid-template-columns:repeat(2,1fr)">
        <a class="tarjeta tarjeta-enlace" href="#/cuadro-honor" style="padding:1.2rem;text-decoration:none;color:inherit">
          <div class="encabezado-seccion" style="margin-bottom:0">
            <span class="icono-seccion">${icon('trophy')}</span>
            <span><strong>Cuadro de Honor</strong><span class="texto-tenue" style="display:block;font-weight:400">Reconocimientos destacados</span></span>
          </div>
        </a>
        <a class="tarjeta tarjeta-enlace" href="#/perfiles" style="padding:1.2rem;text-decoration:none;color:inherit">
          <div class="encabezado-seccion" style="margin-bottom:0">
            <span class="icono-seccion">${icon('users')}</span>
            <span><strong>Perfiles estudiantiles</strong><span class="texto-tenue" style="display:block;font-weight:400">Trayectoria y CV digital</span></span>
          </div>
        </a>
        <a class="tarjeta tarjeta-enlace" href="#/eventos" style="padding:1.2rem;text-decoration:none;color:inherit">
          <div class="encabezado-seccion" style="margin-bottom:0">
            <span class="icono-seccion">${icon('calendar')}</span>
            <span><strong>Eventos</strong><span class="texto-tenue" style="display:block;font-weight:400">Académicos y tecnológicos</span></span>
          </div>
        </a>
        <a class="tarjeta tarjeta-enlace" href="#/galeria" style="padding:1.2rem;text-decoration:none;color:inherit">
          <div class="encabezado-seccion" style="margin-bottom:0">
            <span class="icono-seccion">${icon('image')}</span>
            <span><strong>Galería</strong><span class="texto-tenue" style="display:block;font-weight:400">Fotografías y videos</span></span>
          </div>
        </a>
      </div>
    </section>

    <section class="seccion" id="seccion-logros" aria-label="Logros recientes">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('medal')}</span>
        <div>
          <h2>Logros recientes</h2>
          <p>Los reconocimientos más recientes de nuestra comunidad estudiantil.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="rejilla rejilla-2" id="logros-home"><div class="skeleton" style="height:230px"></div></div>
      <p class="texto-centrado mt-3"><a class="btn btn-secundario" href="#/cuadro-honor">Ver todos los logros ${icon('chevron-right')}</a></p>
    </section>

    <section class="seccion" id="seccion-proximos" aria-label="Próximos eventos">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('calendar')}</span>
        <div>
          <h2>Próximos eventos</h2>
          <p>Agenda tu participación en las próximas actividades.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="rejilla rejilla-3" id="eventos-home"><div class="skeleton" style="height:280px"></div></div>
    </section>

    <section class="seccion" aria-label="Galería destacada">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('image')}</span>
        <div>
          <h2>Multimedia destacada</h2>
          <p>Instantáneas de nuestra comunidad en acción.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="rejilla-galeria" id="galeria-home"><div class="skeleton" style="aspect-ratio:4/3"></div></div>
      <p class="texto-centrado mt-3"><a class="btn btn-secundario" href="#/galeria">Explorar galería completa ${icon('chevron-right')}</a></p>
    </section>
  `;

  const res = await api.get('/estadisticas');

  // Cifras
  const etiquetas = { estudiantes: 'Estudiantes destacados', eventos: 'Eventos registrados', logros: 'Logros y reconocimientos', galeria: 'Fotografías publicadas' };
  document.getElementById('seccion-cifras').innerHTML = `
    <div class="cifras">
      ${Object.entries(etiquetas)
        .map(
          ([clave, etiqueta]) => `
        <div class="cifra">
          <div class="numero">${res.cifras[clave]}</div>
          <div class="etiqueta">${esc(etiqueta)}</div>
        </div>`
        )
        .join('')}
    </div>
  `;

  // Logros recientes
  const logrosEl = document.getElementById('logros-home');
  logrosEl.innerHTML =
    res.ultimosLogros.length > 0
      ? res.ultimosLogros.map(tarjetaLogro).join('')
      : estadoVacio('trophy', 'Aún no hay logros publicados');

  // Próximos eventos
  const eventosEl = document.getElementById('eventos-home');
  eventosEl.innerHTML =
    res.proximosEventos.length > 0
      ? res.proximosEventos.map(tarjetaEvento).join('')
      : estadoVacio('calendar', 'No hay eventos próximos', 'Vuelve a consultar pronto.');

  // Galería destacada
  const galeriaEl = document.getElementById('galeria-home');
  galeriaEl.innerHTML = '';
  if (res.destacadas.length === 0) {
    galeriaEl.innerHTML = estadoVacio('image', 'La galería destacada está en construcción');
  } else {
    res.destacadas.forEach((evi) => galeriaEl.appendChild(itemGaleria(evi, { abrirDetalle: verEvidencia })));
  }
}
