import { esc, icon } from '../js/ui.js';

export const PERFILES_EJEMPLO = [
  {
    nombre: 'Valeria Morales R.',
    generacion: '2022 · 9.º ciclo',
    area: 'Inteligencia artificial',
    premios: ['1.er lugar · Feria de Innovación 2025', 'Proyecto de impacto universitario'],
    participaciones: ['NASA Space Apps', 'Feria de ciencia', 'Hackathon'],
    proyecto: 'EcoOrbit ML Vision',
    descripcion: 'Algoritmo de visión por computadora para analizar imágenes y detectar cambios ambientales.',
    tecnologias: ['Python', 'PyTorch', 'Earth Engine'],
    avatar: 'avatar-valeria.svg',
  },
  {
    nombre: 'Diego Sebastián Ríos',
    generacion: '2021 · egresado',
    area: 'Biotecnología computacional',
    premios: ['Mención honorífica · Investigación 2025', 'Reconocimiento a tesis laureada'],
    participaciones: ['Congreso BioLatam', 'Feria de ciencia', 'Seminario de IA'],
    proyecto: 'CRISPR: enzima termo-resistente',
    descripcion: 'Modelo computacional para analizar y predecir estructuras de proteínas.',
    tecnologias: ['Python', 'Biopython', 'PyMOL'],
    avatar: 'avatar-diego.svg',
  },
  {
    nombre: 'Camila Andrea Thorne',
    generacion: '2023 · 7.º ciclo',
    area: 'Ingeniería robótica y control',
    premios: ['Finalista · Robótica 2025', 'Reconocimiento a innovación tecnológica'],
    participaciones: ['RoboCup Junior', 'Taller de robótica', 'IEEE IROS'],
    proyecto: 'ExpoBiped V4 Rescue',
    descripcion: 'Prototipo de robot bípedo para apoyar tareas de búsqueda y rescate.',
    tecnologias: ['ROS 2', 'C++', 'Gazebo Sim'],
    avatar: 'avatar-renata.svg',
  },
  {
    nombre: 'Ana Sofía Ramírez Vega',
    generacion: '2022 · 8.º ciclo',
    area: 'Ciencia de datos',
    premios: ['Proyecto destacado · Datos Abiertos 2025', 'Excelencia académica'],
    participaciones: ['Datathon', 'Encuentro de investigación', 'Club de ciencia'],
    proyecto: 'Datos para mi comunidad',
    descripcion: 'Tablero interactivo para explorar indicadores y tendencias de datos públicos.',
    tecnologias: ['Python', 'Pandas', 'Power BI'],
    avatar: 'avatar-ana.svg',
  },
  {
    nombre: 'Emiliano Torres Salinas',
    generacion: '2021 · egresado',
    area: 'Computación en la nube',
    premios: ['Mención especial · Soluciones Cloud 2024', 'Liderazgo de equipo'],
    participaciones: ['AWS Cloud Club', 'DevFest', 'Laboratorio DevOps'],
    proyecto: 'AulaCloud',
    descripcion: 'Plataforma para desplegar y monitorear aplicaciones educativas en la nube.',
    tecnologias: ['Docker', 'AWS', 'GitHub Actions'],
    avatar: 'avatar-emiliano.svg',
  },
  {
    nombre: 'Renata Orozco Méndez',
    generacion: '2023 · 4.º ciclo',
    area: 'Diseño de experiencias de usuario',
    premios: ['Mejor experiencia de usuario · Expo 2025', 'Proyecto con impacto social'],
    participaciones: ['Hackathon de inclusión', 'UX Meetup', 'Feria universitaria'],
    proyecto: 'Acceso Digital',
    descripcion: 'Diseño accesible para facilitar el acceso a servicios digitales de la comunidad.',
    tecnologias: ['Figma', 'HTML', 'Accesibilidad web'],
    avatar: 'avatar-renata.svg',
  },
];

function tarjetaPerfil(perfil, indice) {
  const perfilId = `perfil-ejemplo-${indice + 1}`;
  const logrosId = `${perfilId}-logros`;
  const participacionesId = `${perfilId}-participaciones`;
  const proyectoId = `${perfilId}-proyecto`;
  return `
    <article class="honor-perfil" aria-labelledby="${perfilId}">
      <div class="honor-perfil-acento"></div>
      <div class="honor-perfil-cabecera">
        <img
          src="/public/img/avatars/${esc(perfil.avatar)}"
          alt="Avatar ilustrativo de ${esc(perfil.nombre)}"
          loading="lazy"
        />
        <div>
          <span class="honor-perfil-generacion">${esc(perfil.generacion)}</span>
          <h3 id="${perfilId}">${esc(perfil.nombre)}</h3>
          <p>${esc(perfil.area)}</p>
        </div>
      </div>

      <div class="honor-perfil-bloque honor-perfil-premios" aria-labelledby="${logrosId}">
        <h4 id="${logrosId}">${icon('trophy')} Premios y galardones</h4>
        <ul>${perfil.premios.map((premio) => `<li>${icon('award')} ${esc(premio)}</li>`).join('')}</ul>
      </div>

      <div class="honor-perfil-bloque">
        <h4 id="${participacionesId}">${icon('users')} Participaciones oficiales</h4>
        <ul class="honor-perfil-etiquetas" aria-labelledby="${participacionesId}">
          ${perfil.participaciones.map((participacion) => `<li>${esc(participacion)}</li>`).join('')}
        </ul>
      </div>

      <div class="honor-perfil-proyecto" aria-labelledby="${proyectoId}">
        <h4 id="${proyectoId}">Proyecto: ${esc(perfil.proyecto)}</h4>
        <p>${esc(perfil.descripcion)}</p>
        <ul aria-label="Tecnologías del proyecto">
          ${perfil.tecnologias.map((tecnologia) => `<li>${esc(tecnologia)}</li>`).join('')}
        </ul>
      </div>

      <a class="honor-perfil-enlace" href="#/perfiles/destacado/${indice + 1}">
        Explorar perfil y trayectoria ${icon('external')}
      </a>
    </article>
  `;
}

export function htmlCuadroHonorDestacados(id = 'cuadro-honor-destacados') {
  return `
    <section class="seccion honor-destacados" id="${esc(id)}" aria-labelledby="${esc(id)}-titulo">
      <div class="honor-destacados-encabezado">
        <div>
          <span class="honor-destacados-etiqueta">${icon('award')} Trayectorias que inspiran</span>
          <h2 id="${esc(id)}-titulo">Cuadro de Honor</h2>
          <p>Perfiles académicos destacables, proyectos, premios y participación tecnológica.</p>
        </div>
        <div class="honor-carrusel-controles">
          <span class="honor-carrusel-conteo" aria-live="polite"></span>
          <button type="button" class="honor-carrusel-flecha" data-direccion="-1" aria-label="Perfiles anteriores">
            ${icon('chevron-left')}
          </button>
          <button type="button" class="honor-carrusel-flecha" data-direccion="1" aria-label="Perfiles siguientes">
            ${icon('chevron-right')}
          </button>
        </div>
      </div>
      <p class="honor-destacados-nota">${icon('info')} Perfiles y reconocimientos de ejemplo; reemplázalos con información real autorizada antes de publicar.</p>
      <div class="honor-carrusel-ventana" tabindex="0" aria-label="Perfiles académicos destacados, usa las flechas para recorrer">
        <div class="honor-carrusel-pista">
          ${PERFILES_EJEMPLO.map(tarjetaPerfil).join('')}
        </div>
      </div>
      <div class="honor-carrusel-progreso" aria-hidden="true"><span></span></div>
      <p class="honor-destacados-pie">Mostrando <span class="honor-carrusel-rango"></span> · ${PERFILES_EJEMPLO.length} perfiles de ejemplo</p>
    </section>
  `;
}

export function montarCarruselCuadroHonor(contenedor) {
  const ventana = contenedor.querySelector('.honor-carrusel-ventana');
  const pista = contenedor.querySelector('.honor-carrusel-pista');
  const flechas = [...contenedor.querySelectorAll('.honor-carrusel-flecha')];
  const conteo = contenedor.querySelector('.honor-carrusel-conteo');
  const rango = contenedor.querySelector('.honor-carrusel-rango');
  const progreso = contenedor.querySelector('.honor-carrusel-progreso span');
  const perfiles = [...pista.children];
  let frame = 0;

  function actualizar() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const anchoTarjeta = perfiles[0]?.getBoundingClientRect().width || 1;
      const espacio = parseFloat(getComputedStyle(pista).columnGap) || 0;
      const paso = anchoTarjeta + espacio;
      const visibles = Math.max(1, Math.round((ventana.clientWidth + espacio) / paso));
      const inicio = Math.min(perfiles.length - 1, Math.round(ventana.scrollLeft / paso));
      const fin = Math.min(perfiles.length, inicio + visibles);

      conteo.textContent = `Mostrando ${inicio + 1}–${fin} de ${perfiles.length}`;
      rango.textContent = `${inicio + 1}–${fin}`;
      progreso.style.width = `${(fin / perfiles.length) * 100}%`;
      flechas[0].disabled = ventana.scrollLeft <= 1;
      flechas[1].disabled = ventana.scrollLeft + ventana.clientWidth >= pista.scrollWidth - 1;
    });
  }

  flechas.forEach((flecha) => {
    flecha.addEventListener('click', () => {
      const paso = Math.max(ventana.clientWidth * 0.85, perfiles[0].getBoundingClientRect().width);
      ventana.scrollBy({ left: Number(flecha.dataset.direccion) * paso, behavior: 'smooth' });
    });
  });
  ventana.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
  actualizar();

  return () => {
    cancelAnimationFrame(frame);
    ventana.removeEventListener('scroll', actualizar);
    window.removeEventListener('resize', actualizar);
  };
}
