import { api } from '../js/api.js';
import { icon, esc, formatoPeriodo, formatoFecha, estadoEventoBadge, estadoVacio } from '../js/ui.js';
import { avatarEstudiante, itemGaleria, verEvidencia } from '../components/cards.js';

export async function vistaEventoDetalle(contenedor, params) {
  contenedor.innerHTML = '<div class="skeleton" style="aspect-ratio:21/9;border-radius:20px"></div>';

  let res;
  try {
    res = await api.get(`/eventos/${params.id}`);
  } catch (err) {
    contenedor.innerHTML = estadoVacio('calendar', 'Evento no disponible', err.message);
    return;
  }

  const ev = res.dato;
  const imagen = ev.imagenUrl || '/public/img/eventos/default.svg';

  contenedor.innerHTML = `
    <div class="acciones-cv mb-2" style="justify-content:flex-start">
      <a class="btn btn-secundario btn-sm" href="#/eventos">${icon('chevron-left')} Volver a eventos</a>
    </div>

    <article>
      <div class="portada-evento">
        <img src="${esc(imagen)}" alt="Portada de ${esc(ev.nombre)}" onerror="this.src='/public/img/eventos/default.svg'" />
        <div class="encima-portada">
          <div class="fila" style="gap:.5rem;margin-bottom:.3rem">
            <span class="badge badge-primario">${esc(ev.categoria)}</span>
            ${estadoEventoBadge(ev.estado)}
          </div>
          <h1 style="font-size:clamp(1.4rem,3.5vw,2.2rem);margin:0">${esc(ev.nombre)}</h1>
        </div>
      </div>

      <div class="ficha-datos mb-3">
        <div class="ficha-item">
          <div class="titulo-item">${icon('calendar')} Fecha</div>
          <div class="valor-item">${esc(formatoPeriodo(ev.fechaInicio, ev.fechaFin))}</div>
          ${ev.horario ? `<div class="texto-tenue">${icon('clock')} ${esc(ev.horario)}</div>` : ''}
        </div>
        <div class="ficha-item">
          <div class="titulo-item">${icon('map-pin')} Modalidad y lugar</div>
          <div class="valor-item">${esc(ev.modalidad)}</div>
          <div class="texto-tenue">${esc(ev.lugar || 'Por confirmar')}</div>
        </div>
        <div class="ficha-item">
          <div class="titulo-item">${icon('users')} Organizador</div>
          <div class="valor-item">${esc(ev.organizador)}</div>
          <div class="texto-tenue">${res.participaciones.length} participante(s) registrado(s)</div>
        </div>
      </div>

      <section class="panel mb-2">
        <h2>${icon('info')} Descripción</h2>
        <p class="texto-suave" style="white-space:pre-line;margin:0">${esc(ev.descripcion)}</p>
      </section>

      <section class="panel mb-2">
        <h2>${icon('users')} Participantes destacados</h2>
        ${
          res.participaciones.length
            ? `<div class="rejilla rejilla-3 mt-1" style="grid-template-columns:repeat(2,1fr)">
                ${res.participaciones
                  .map(
                    (p) => `
                  <a class="tarjeta" href="#/perfiles/${p.estudiante._id}" style="text-decoration:none;color:inherit">
                    <div class="tarjeta-estudiante" style="padding:.9rem">
                      ${avatarEstudiante(p.estudiante, 52)}
                      <div>
                        <strong class="texto-pequeno">${esc(p.estudiante.nombreCompleto || `${p.estudiante.nombre} ${p.estudiante.apellidos}`)}</strong>
                        <div class="texto-tenue texto-pequeno">Semestre ${esc(p.estudiante.semestre)}</div>
                        <div class="mt-1"><span class="badge badge-primario">${esc(p.tipo)}</span></div>
                        ${p.resultado ? `<div class="texto-tenue texto-pequeno mt-1">${icon('medal')} ${esc(p.resultado)}</div>` : ''}
                      </div>
                    </div>
                  </a>`
                  )
                  .join('')}
              </div>`
            : '<p class="texto-suave">Aún no hay participantes publicados para este evento.</p>'
        }
      </section>

      ${
        res.evidencias.length
          ? `<section class="panel">
              <h2>${icon('image')} Galería del evento</h2>
              <div class="rejilla-galeria mt-1" id="galeria-evento"></div>
            </section>`
          : ''
      }
    </article>
  `;

  const galeria = document.getElementById('galeria-evento');
  if (galeria) {
    res.evidencias.forEach((evi) => galeria.appendChild(itemGaleria(evi, { abrirDetalle: verEvidencia })));
  }
}
