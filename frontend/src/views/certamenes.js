import { icon } from '../js/ui.js';

const PREMIACION_2025 = [
  {
    lugar: 'Primer lugar',
    imagenes: [
      {
        src: '/public/img/certamenes/ganadores-2025-primer-lugar-equipo.jpg',
        alt: 'Equipo reconocido con el primer lugar del certamen 2025',
      },
      {
        src: '/public/img/certamenes/ganadores-2025-primer-lugar.jpg',
        alt: 'Estudiantes reconocidos con el primer lugar del certamen 2025',
      },
    ],
  },
  {
    lugar: 'Segundo lugar',
    imagenes: [
      {
        src: '/public/img/certamenes/ganadores-2025-segundo-lugar.jpg',
        alt: 'Equipo reconocido con el segundo lugar del certamen 2025',
      },
    ],
  },
  {
    lugar: 'Tercer lugar',
    imagenes: [
      {
        src: '/public/img/certamenes/ganadores-2025-tercer-lugar.jpg',
        alt: 'Estudiantes reconocidas con el tercer lugar del certamen 2025',
      },
    ],
  },
];

const AREAS_2026 = [
  'Inteligencia artificial',
  'Realidad aumentada y virtual',
  'Ciencia de datos',
  'Procesamiento de imágenes',
  'Desarrollo web',
  'Robótica',
  'Tecnologías de la Industria 4.0',
];

function tarjetaGanadores({ lugar, imagenes }) {
  return `
    <article class="certamen-premio">
      <div class="certamen-premio-fotos">
        ${imagenes.map(({ src, alt }) => `
          <img src="${src}" alt="${alt}" loading="lazy" />
        `).join('')}
      </div>
      <div class="certamen-premio-cuerpo">
        <span class="badge badge-primario">${icon('medal')} Certamen 2025</span>
        <h3>${lugar}</h3>
      </div>
    </article>
  `;
}

export function vistaCertamenes(contenedor) {
  contenedor.innerHTML = `
    <section class="certamen-portada" aria-labelledby="certamen-titulo">
      <div class="certamen-portada-contenido">
        <span class="etiqueta-hero">${icon('award')} Investigación · Innovación · Emprendimiento</span>
        <h1 id="certamen-titulo">Certámenes de Informática</h1>
        <p>Celebramos las ideas, el talento y los proyectos que transforman nuestro entorno. Conoce a quienes destacaron en 2025 y consulta la convocatoria 2026.</p>
        <div class="certamen-fecha">
          ${icon('calendar')}
          <span><strong>4 de diciembre de 2026</strong><small>5.º Certamen Interinstitucional · UES Ixtlahuaca</small></span>
        </div>
        <a class="btn btn-primario" href="#convocatoria-2026">${icon('image')} Ver convocatoria 2026</a>
        <a class="certamen-enlace-resultados" href="#ganadores-2025">Conoce a los ganadores de 2025 ↓</a>
      </div>
      <figure class="certamen-cartel">
        <img src="/public/img/certamenes/convocatoria-2026.jpg" alt="Convocatoria del 5.º Certamen Interinstitucional de Investigación, Innovación, Desarrollo Tecnológico y Emprendimiento 2026. Evento el 4 de diciembre de 2026." />
        <figcaption>Convocatoria oficial · 2026</figcaption>
      </figure>
    </section>

    <section class="seccion certamen-seccion" id="ganadores-2025" aria-labelledby="ganadores-titulo">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('trophy')}</span>
        <div>
          <h2 id="ganadores-titulo">Ganadores del Certamen 2025</h2>
          <p>Reconocemos el talento y el trabajo de los equipos premiados.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="certamen-ganadores">
        ${PREMIACION_2025.map(tarjetaGanadores).join('')}
      </div>
    </section>

    <section class="seccion certamen-seccion" id="convocatoria-2026" aria-labelledby="convocatoria-titulo">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('calendar')}</span>
        <div>
          <h2 id="convocatoria-titulo">Convocatoria 2026</h2>
          <p>5.º Certamen Interinstitucional de Investigación, Innovación, Desarrollo Tecnológico y Emprendimiento de la Licenciatura en Informática.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="certamen-convocatoria">
        <div class="certamen-convocatoria-info">
          <div class="certamen-dato">
            ${icon('calendar')}
            <div><strong>Fecha del evento</strong><span>4 de diciembre de 2026</span></div>
          </div>
          <div class="certamen-dato">
            ${icon('map-pin')}
            <div><strong>Sede</strong><span>Unidad de Estudios Superiores Ixtlahuaca</span></div>
          </div>
          <div class="certamen-dato">
            ${icon('users')}
            <div><strong>Participación</strong><span>Escuelas invitadas de nivel superior y medio superior</span></div>
          </div>
          <div>
            <h3>Áreas para desarrollar tu proyecto</h3>
            <ul class="certamen-areas">
              ${AREAS_2026.map((area) => `<li>${icon('check-circle')} ${area}</li>`).join('')}
            </ul>
          </div>
          <p class="certamen-instruccion">${icon('info')} Escanea el código QR del cartel para consultar la convocatoria y el registro.</p>
        </div>
        <a class="certamen-cartel-enlace" href="/public/img/certamenes/convocatoria-2026.jpg" target="_blank" rel="noopener noreferrer" aria-label="Abrir el cartel completo de la convocatoria 2026">
          <img src="/public/img/certamenes/convocatoria-2026.jpg" alt="Cartel completo de la convocatoria 2026 con código QR para registro y convocatoria" loading="lazy" />
          <span>${icon('external')} Abrir cartel completo</span>
        </a>
      </div>
    </section>
  `;

  contenedor.querySelectorAll('.certamen-portada-contenido a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      evento.preventDefault();
      const destino = document.getElementById(enlace.getAttribute('href').slice(1));
      destino?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
