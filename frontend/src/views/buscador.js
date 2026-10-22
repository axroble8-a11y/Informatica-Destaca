import { api } from '../js/api.js';
import { icon, esc, estadoVacio, formatoFecha, estadoEventoBadge } from '../js/ui.js';
import { avatarEstudiante } from '../components/cards.js';

export async function vistaBuscador(contenedor) {
  const queryInicial = new URLSearchParams(window.location.hash.split('?')[1] || '').get('q') || '';

  contenedor.innerHTML = `
    <section class="seccion" style="max-width:820px;margin-inline:auto">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('search')}</span>
        <div>
          <h1>Buscador global</h1>
          <p>Encuentra estudiantes, eventos y logros en un solo lugar.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="caja-buscador mb-3" style="max-width:none">
        ${icon('search', 'icono-buscar')}
        <input type="search" id="bg-q" placeholder="Escribe al menos 2 letras: nombre de estudiante, evento o logro…"
               aria-label="Buscar en toda la plataforma" value="${esc(queryInicial)}" autocomplete="off" />
      </div>

      <div id="bg-resultados" aria-live="polite">
        <div class="estado-vacio">
          <div class="icono-vacio">${icon('search')}</div>
          <h3>¿Qué estás buscando?</h3>
          <p class="texto-suave">Escribe el nombre de un estudiante, un evento o un logro para comenzar.</p>
        </div>
      </div>
    </section>
  `;

  const input = document.getElementById('bg-q');
  const resultados = document.getElementById('bg-resultados');
  let timer = null;

  async function buscar(q) {
    if (q.trim().length < 2) {
      resultados.innerHTML = `
        <div class="estado-vacio">
          <div class="icono-vacio">${icon('search')}</div>
          <h3>¿Qué estás buscando?</h3>
          <p class="texto-suave">Escribe el nombre de un estudiante, un evento o un logro para comenzar.</p>
        </div>`;
      return;
    }

    resultados.innerHTML = '<div class="panel skeleton" style="height:200px"></div>';
    const res = await api.get(`/busqueda?q=${encodeURIComponent(q.trim())}`);

    const hayResultados = res.estudiantes.length + res.eventos.length + res.logros.length > 0;
    if (!hayResultados) {
      resultados.innerHTML = estadoVacio('search', `Sin resultados para "${res.consulta}"`, 'Revisa la ortografía o prueba con otras palabras.');
      return;
    }

    resultados.innerHTML = `
      ${
        res.estudiantes.length
          ? `<div class="resultado-grupo">
              <h3>${icon('users')} Estudiantes (${res.estudiantes.length})</h3>
              ${res.estudiantes
                .map(
                  (e) => `
                <a class="resultado-item" href="#/perfiles/${e._id}">
                  ${avatarEstudiante(e, 44)}
                  <span style="flex:1">
                    <strong>${esc(e.nombreCompleto || `${e.nombre} ${e.apellidos}`)}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">${e.semestre ? `Semestre ${esc(e.semestre)}` : ''}</span>
                  </span>
                  ${icon('chevron-right')}
                </a>`
                )
                .join('')}
            </div>`
          : ''
      }

      ${
        res.eventos.length
          ? `<div class="resultado-grupo">
              <h3>${icon('calendar')} Eventos (${res.eventos.length})</h3>
              ${res.eventos
                .map(
                  (ev) => `
                <a class="resultado-item" href="#/eventos/${ev._id}">
                  <span class="icono-resultado">${icon('calendar')}</span>
                  <span style="flex:1">
                    <strong>${esc(ev.nombre)}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">${esc(ev.categoria)} · ${esc(formatoFecha(ev.fechaInicio))}</span>
                  </span>
                  ${estadoEventoBadge(ev.estado)}
                </a>`
                )
                .join('')}
            </div>`
          : ''
      }

      ${
        res.logros.length
          ? `<div class="resultado-grupo">
              <h3>${icon('trophy')} Logros y reconocimientos (${res.logros.length})</h3>
              ${res.logros
                .map(
                  (l) => `
                <a class="resultado-item" href="#/perfiles/${l.estudiante?._id || ''}">
                  <span class="icono-resultado" style="background:var(--c-alerta-claro);color:var(--c-alerta)">${icon('trophy')}</span>
                  <span style="flex:1">
                    <strong>${esc(l.titulo)}</strong>
                    <span class="texto-tenue texto-pequeno" style="display:block">
                      ${l.estudiante ? `${esc(l.estudiante.nombreCompleto || `${l.estudiante.nombre} ${l.estudiante.apellidos}`)} · ` : ''}${esc(l.categoria)} · ${esc(formatoFecha(l.fecha))}
                    </span>
                  </span>
                  ${icon('chevron-right')}
                </a>`
                )
                .join('')}
            </div>`
          : ''
      }
    `;
  }

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => buscar(input.value), 320);
  });

  if (queryInicial) buscar(queryInicial);

  return { limpiar: () => clearTimeout(timer) };
}
