import { icon } from '../js/ui.js';

const ANIOS_CERTAMEN = [
  {
    anio: 2022,
    convocatoria: null,
    ganadores: [],
  },
  {
    anio: 2023,
    convocatoria: null,
    ganadores: [],
  },
  {
    anio: 2024,
    convocatoria: null,
    ganadores: [],
  },
  {
    anio: 2025,
    convocatoria: null,
    ganadores: [
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
    ],
  },
  {
    anio: 2026,
    convocatoria: {
      imagen: '/public/img/certamenes/convocatoria-2026.jpg',
      alt: 'Convocatoria del 5.º Certamen Interinstitucional de Investigación, Innovación, Desarrollo Tecnológico y Emprendimiento 2026',
      fecha: '4 de diciembre de 2026',
      sede: 'Unidad de Estudios Superiores Ixtlahuaca',
      areas: [
        'Inteligencia artificial',
        'Realidad aumentada y virtual',
        'Ciencia de datos',
        'Procesamiento de imágenes',
        'Desarrollo web',
        'Robótica',
        'Tecnologías de la Industria 4.0',
      ],
    },
    ganadores: [],
  },
];

function espacioParaFoto(tipo, anio) {
  const etiqueta = tipo === 'convocatoria'
    ? `Imagen de convocatoria ${anio} por agregar`
    : `Fotos de ganadores ${anio} por agregar`;
  return `
    <div class="certamen-espacio-vacio" role="note">
      ${icon(tipo === 'convocatoria' ? 'image' : 'trophy')}
      <span>${etiqueta}</span>
    </div>
  `;
}

function fotosGanadores(ganadores, anio) {
  if (ganadores.length === 0) {
    return espacioParaFoto('ganadores', anio);
  }

  return `
    <div class="certamen-fotos-ganadores">
      ${ganadores.map(({ lugar, imagenes }) => `
        <figure class="certamen-foto-ganador">
          <div class="certamen-foto-ganador-imagenes">
            ${imagenes.map(({ src, alt }) => `
              <img src="${src}" alt="${alt}" loading="lazy" />
            `).join('')}
          </div>
          <figcaption>${lugar}</figcaption>
        </figure>
      `).join('')}
    </div>
  `;
}

function seccionAnual({ anio, convocatoria, ganadores }) {
  const datosConvocatoria = convocatoria
    ? `
      <a
        class="certamen-convocatoria-imagen"
        href="${convocatoria.imagen}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir la convocatoria ${anio} completa"
      >
        <img src="${convocatoria.imagen}" alt="${convocatoria.alt}" loading="lazy" />
        <span>${icon('external')} Abrir cartel completo</span>
      </a>
      ${convocatoria.fecha ? `
        <div class="certamen-datos-anuales">
          <p>${icon('calendar')} <span><strong>Fecha:</strong> ${convocatoria.fecha}</span></p>
          <p>${icon('map-pin')} <span><strong>Sede:</strong> ${convocatoria.sede}</span></p>
        </div>
        <p class="certamen-ayuda-qr">${icon('info')} Escanea el código QR del cartel para consultar la convocatoria y el registro.</p>
        <h4>Áreas para desarrollar tu proyecto</h4>
        <ul class="certamen-areas">
          ${convocatoria.areas.map((area) => `<li>${icon('check-circle')} ${area}</li>`).join('')}
        </ul>
      ` : ''}
    `
    : espacioParaFoto('convocatoria', anio);

  return `
    <article class="certamen-anio" id="certamen-${anio}" aria-labelledby="certamen-titulo-${anio}">
      <header class="certamen-anio-encabezado">
        <span class="certamen-anio-numero">${anio}</span>
        <h3 id="certamen-titulo-${anio}">Certamen ${anio}</h3>
      </header>
      <div class="certamen-anio-secciones">
        <section class="certamen-anio-bloque" aria-labelledby="convocatoria-titulo-${anio}">
          <h4 id="convocatoria-titulo-${anio}">${icon('calendar')} Convocatoria</h4>
          ${datosConvocatoria}
        </section>
        <section class="certamen-anio-bloque" aria-labelledby="ganadores-titulo-${anio}">
          <h4 id="ganadores-titulo-${anio}">${icon('trophy')} Ganadores</h4>
          ${fotosGanadores(ganadores, anio)}
        </section>
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
        <p>Un recorrido por las convocatorias y los proyectos ganadores de cada edición, de 2022 a 2026.</p>
        <div class="certamen-fecha">
          ${icon('calendar')}
          <span><strong>Convocatoria 2026</strong><small>5.º Certamen Interinstitucional · UES Ixtlahuaca</small></span>
        </div>
        <a class="btn btn-primario" href="#certamen-2026">${icon('image')} Ver convocatoria 2026</a>
        <a class="certamen-enlace-resultados" href="#certamen-2025">Ver ganadores de 2025 ↓</a>
      </div>
      <div class="certamen-portada-nota">
        ${icon('info')}
        <p>El historial incluye un espacio para la convocatoria y otro para los ganadores de cada año. Las fotos disponibles ya están colocadas; los espacios pendientes se pueden completar después.</p>
      </div>
    </section>

    <section class="seccion certamen-seccion" aria-labelledby="historial-titulo">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('trophy')}</span>
        <div>
          <h2 id="historial-titulo">Historial de certámenes 2022–2026</h2>
          <p>Convocatoria y ganadores de cada edición.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>
      <div class="certamen-historial">
        ${ANIOS_CERTAMEN.map(seccionAnual).join('')}
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
