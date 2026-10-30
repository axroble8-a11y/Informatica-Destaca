import { icon, esc, estadoVacio } from '../js/ui.js';
import { PERFILES_EJEMPLO } from '../components/cuadroHonorDestacados.js';

export function vistaPerfilDestacado(contenedor, params) {
  const id = Number(params.id);
  const perfil = Number.isInteger(id) ? PERFILES_EJEMPLO.find((item) => item.id === id) : null;

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
          <span class="badge badge-secundario">${icon('award')} ${esc(perfil.distincion || 'Perfil destacado · Información por completar')}</span>
          <h1 id="perfil-destacado-nombre">${esc(perfil.nombre)}</h1>
          <p>${esc(perfil.generacion)} · ${esc(perfil.area)}</p>
        </div>
      </header>

      <p class="perfil-destacado-aviso">${icon('info')} Perfil de solo lectura. ${perfil.perfilPendiente ? 'La información mostrada corresponde a los datos compartidos por el estudiante.' : 'Los datos de este perfil son ejemplos ilustrativos.'}</p>

      <div class="perfil-destacado-secciones">
        ${perfil.perfilPendiente ? `
          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-trayectoria">
            <h2 id="perfil-destacado-trayectoria">${icon('graduate')} Trayectoria académica</h2>
            <p>${esc(perfil.resumen)}</p>
          </section>
          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-premios">
            <h2 id="perfil-destacado-premios">${icon('trophy')} Premios y reconocimientos</h2>
            <ul class="perfil-destacado-lista">
              ${perfil.premios.map((premio) => `<li>${icon('award')} ${esc(premio)}</li>`).join('')}
            </ul>
          </section>
          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-participaciones">
            <h2 id="perfil-destacado-participaciones">${icon('users')} Participaciones</h2>
            <ul class="perfil-destacado-lista">
              ${perfil.participaciones.map((participacion) => `<li>${icon('users')} ${esc(participacion)}</li>`).join('')}
            </ul>
          </section>
          <section class="perfil-destacado-panel" aria-labelledby="perfil-destacado-experiencia">
            <h2 id="perfil-destacado-experiencia">${icon('briefcase')} Experiencia profesional y servicio social</h2>
            <ul class="perfil-destacado-lista">
              ${perfil.experiencias.map((experiencia) => `
                <li>${icon('briefcase')} <span><strong>${esc(experiencia.tipo)}:</strong> ${esc(experiencia.organizacion)}${experiencia.lugar ? ` · ${esc(experiencia.lugar)}` : ''}</span></li>
              `).join('')}
            </ul>
          </section>
          <section class="perfil-destacado-panel perfil-destacado-panel-completo" aria-labelledby="perfil-destacado-pendiente">
            <h2 id="perfil-destacado-pendiente">${icon('info')} Información por completar</h2>
            <p>Se pueden agregar proyectos, habilidades y áreas de interés cuando se comparta esa información.</p>
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
