import { icon, esc, estadoVacio } from '../js/ui.js';
import { PERFILES_EJEMPLO } from '../components/cuadroHonorDestacados.js';

export function vistaPerfilDestacado(contenedor, params) {
  const indice = Number(params.id) - 1;
  const perfil = Number.isInteger(indice) ? PERFILES_EJEMPLO[indice] : null;

  if (!perfil) {
    contenedor.innerHTML = estadoVacio('user', 'Perfil no disponible', 'No encontramos ese perfil destacado.');
    return;
  }

  contenedor.innerHTML = `
    <div class="acciones-cv mb-2">
      <a class="btn btn-secundario btn-sm" href="#/cuadro-honor">${icon('chevron-left')} Volver al Cuadro de Honor</a>
    </div>

    <article class="perfil-destacado-lectura" aria-labelledby="perfil-destacado-nombre">
      <header class="perfil-destacado-cabecera">
        <img
          src="/public/img/avatars/${esc(perfil.avatar)}"
          alt="${perfil.perfilPendiente ? 'Fotografía' : 'Avatar ilustrativo'} de ${esc(perfil.nombre)}"
        />
        <div>
          <span class="badge badge-secundario">${icon('award')} Perfil destacado · Información por completar</span>
          <h1 id="perfil-destacado-nombre">${esc(perfil.nombre)}</h1>
          <p>${esc(perfil.generacion)} · ${esc(perfil.area)}</p>
        </div>
      </header>

      <p class="perfil-destacado-aviso">${icon('info')} Perfil de solo lectura. La trayectoria académica, los proyectos y reconocimientos se completarán con información autorizada.</p>

      <div class="perfil-destacado-secciones">
        ${perfil.perfilPendiente ? `
          <section class="perfil-destacado-panel perfil-destacado-panel-completo" aria-labelledby="perfil-destacado-pendiente">
            <h2 id="perfil-destacado-pendiente">${icon('info')} Trayectoria académica por completar</h2>
            <p>Aquí se podrán agregar el perfil profesional, áreas de interés, habilidades, proyectos, premios, reconocimientos y participaciones oficiales.</p>
          </section>
        ` : `
          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-proyecto">
            <h2 id="perfil-destacado-proyecto">${icon('briefcase')} Proyecto académico y tecnológico</h2>
            <h3>${esc(perfil.proyecto)}</h3>
            <p>${esc(perfil.descripcion)}</p>
            <h4>Tecnologías utilizadas</h4>
            <ul class="perfil-destacado-etiquetas">
              ${perfil.tecnologias.map((tecnologia) => `<li>${esc(tecnologia)}</li>`).join('')}
            </ul>
          </section>

          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-premios">
            <h2 id="perfil-destacado-premios">${icon('trophy')} Premios y reconocimientos</h2>
            <ul class="perfil-destacado-lista">
              ${perfil.premios.map((premio) => `<li>${icon('award')} ${esc(premio)}</li>`).join('')}
            </ul>
          </section>

          <section class="perfil-destacado-panel perfil-destacado-panel-completo" aria-labelledby="perfil-destacado-participaciones">
            <h2 id="perfil-destacado-participaciones">${icon('users')} Participaciones oficiales</h2>
            <ul class="perfil-destacado-etiquetas">
              ${perfil.participaciones.map((participacion) => `<li>${esc(participacion)}</li>`).join('')}
            </ul>
          </section>
        `}
      </div>
    </article>
  `;
}
