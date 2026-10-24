import { esc, icon, formatoFecha, formatoPeriodo, estadoEventoBadge, iniciales } from '../js/ui.js';
import { urlAbsoluta } from '../js/api.js';

/** Imagen de avatar con fallback a iniciales. */
export function avatarEstudiante(estudiante, tamano = 72) {
  const foto = estudiante.fotoUrl ? urlAbsoluta(estudiante.fotoUrl) : '/public/img/avatars/default.svg';
  const nombreCompleto = estudiante.nombreCompleto || `${estudiante.nombre || ''} ${estudiante.apellidos || ''}`;
  return `
    <img src="${esc(foto)}" alt="Fotografía de ${esc(nombreCompleto)}" loading="lazy"
         onerror="this.src='/public/img/avatars/default.svg'" style="width:${tamano}px;height:${tamano}px" />
  `;
}

/** Tarjeta de estudiante para listados públicos. */
export function tarjetaEstudiante(e) {
  const nombre = e.nombreCompleto || `${e.nombre} ${e.apellidos}`;
  return `
    <article class="tarjeta">
      <a class="tarjeta-enlace" href="#/perfiles/${e._id}">
        <div class="tarjeta-estudiante">
          ${avatarEstudiante(e)}
          <div>
            <h3>${esc(nombre)}</h3>
            <div class="texto-pequeno texto-tenue">
              ${e.semestre ? `Semestre ${esc(e.semestre)}` : ''} ${e.generacion ? `· Gen. ${esc(e.generacion)}` : ''}
            </div>
            ${e.matricula ? `<div class="texto-pequeno texto-mono texto-tenue mt-1">${esc(e.matricula)}</div>` : ''}
          </div>
        </div>
        <div class="tarjeta-cuerpo" style="padding-top:0">
          ${e.perfilProfesional ? `<p class="descripcion">${esc(e.perfilProfesional)}</p>` : ''}
          <div class="tarjeta-pie">
            <span>Ver perfil y trayectoria</span>
            ${icon('chevron-right')}
          </div>
        </div>
      </a>
    </article>
  `;
}

/** Tarjeta de evento. */
export function tarjetaEvento(ev) {
  const imagen = ev.imagenUrl ? urlAbsoluta(ev.imagenUrl) : '/public/img/eventos/default.svg';
  return `
    <article class="tarjeta">
      <a class="tarjeta-enlace" href="#/eventos/${ev._id}">
        <div class="tarjeta-portada">
          <span class="badge badge-primario badge-flotante">${esc(ev.categoria)}</span>
          <img src="${esc(imagen)}" alt="Portada de ${esc(ev.nombre)}" loading="lazy"
               onerror="this.src='/public/img/eventos/default.svg'" />
        </div>
        <div class="tarjeta-cuerpo">
          <div class="fila" style="gap:.4rem">${estadoEventoBadge(ev.estado)}</div>
          <h3>${esc(ev.nombre)}</h3>
          <p class="descripcion">${esc(ev.descripcion)}</p>
          <div class="tarjeta-pie">
            <span>${icon('calendar', '')} ${esc(formatoPeriodo(ev.fechaInicio, ev.fechaFin))}</span>
            <span>${icon('users', '')} ${ev.totalParticipantes ?? 0}</span>
          </div>
        </div>
      </a>
    </article>
  `;
}

/** Tarjeta de logro (cuadro de honor). */
export function tarjetaLogro(logro) {
  const est = logro.estudiante || {};
  const nombre = est.nombreCompleto || `${est.nombre || ''} ${est.apellidos || ''}` || 'Estudiante';
  return `
    <article class="tarjeta tarjeta-honor">
      ${logro.destacado ? '<span class="cinta">DESTACADO</span>' : ''}
      <div class="tarjeta-cuerpo">
        <div class="fila" style="justify-content:space-between">
          <span class="badge badge-secundario">${icon('award', '')} ${esc(logro.categoria)}</span>
          <span class="badge badge-alerta">${esc(logro.tipoReconocimiento)}</span>
        </div>
        <h3>${esc(logro.titulo)}</h3>
        <p class="descripcion">${esc(logro.descripcion)}</p>
        <a href="#/perfiles/${est._id || ''}" class="fila mt-1" style="gap:.7rem;text-decoration:none;color:inherit">
          ${avatarEstudiante(est, 44)}
          <span>
            <strong class="texto-pequeno">${esc(nombre)}</strong>
            <span class="texto-tenue texto-pequeno" style="display:block">
              ${est.semestre ? `Semestre ${esc(est.semestre)} · ` : ''}${esc(formatoFecha(logro.fecha))}
            </span>
          </span>
        </a>
        <div class="tarjeta-pie">
          <span>${icon('briefcase', '')} ${esc(logro.institucion || logro.evento?.nombre || 'Institución no especificada')}</span>
        </div>
      </div>
    </article>
  `;
}

/** Evidencia visual (imagen, video, enlace) para galerías. */
export function itemGaleria(evidencia, { abrirDetalle } = {}) {
  const esImagen = evidencia.tipo === 'Imagen';
  const esVideo = evidencia.tipo === 'Video';
  const url = urlAbsoluta(evidencia.archivoUrl || evidencia.urlExterna || '');
  const iconoTipo = esImagen ? 'image' : esVideo ? 'video' : 'link';

  const cuerpo = esImagen
    ? `<img src="${esc(url)}" alt="${esc(evidencia.titulo)}" loading="lazy"
           onerror="this.src='/public/img/eventos/default.svg'" />`
    : esVideo && evidencia.archivoUrl
      ? `<video src="${esc(url)}" muted preload="metadata"></video>`
      : `<img src="/public/img/eventos/default.svg" alt="${esc(evidencia.titulo)}" />`;

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'item-galeria';
  el.setAttribute('aria-label', `Abrir ${evidencia.titulo}`);
  el.innerHTML = `
    ${cuerpo}
    <span class="icono-tipo">${icon(iconoTipo, '')}</span>
    <span class="info-galeria">
      <strong>${esc(evidencia.titulo)}</strong>
      ${esc(formatoFecha(evidencia.fecha))}
    </span>
  `;
  el.addEventListener('click', () => abrirDetalle?.(evidencia));
  return el;
}

/** Abre el visor (lightbox) adecuado según el tipo de evidencia. */
export function verEvidencia(evidencia) {
  return import('../js/ui.js').then(({ abrirLightbox, esc, icon, formatoFecha }) => {
    const url = urlAbsoluta(evidencia.archivoUrl || evidencia.urlExterna || '');
    let cuerpo = '';
    if (evidencia.tipo === 'Imagen') {
      cuerpo = `<img src="${esc(url)}" alt="${esc(evidencia.titulo)}" onerror="this.src='/public/img/eventos/default.svg'" />`;
    } else if (evidencia.tipo === 'Video') {
      const embed = evidenciaEmbed(evidencia.urlExterna);
      cuerpo = embed
        ? `<div class="lightbox-video">
             <iframe src="${esc(embed)}" title="${esc(evidencia.titulo)}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen allow="autoplay; encrypted-media"></iframe>
             <a class="btn btn-secundario" href="${esc(evidencia.urlExterna)}" target="_blank" rel="noopener noreferrer">
               Si el reproductor no inicia, abrir video externo ${icon('external', '')}
             </a>
           </div>`
        : evidencia.archivoUrl
          ? `<video src="${esc(url)}" controls autoplay></video>`
          : `<div class="panel" style="text-align:center">
               ${icon('video', '')}
               <p>No se puede insertar este video en el visor.</p>
               <a class="btn btn-primario" href="${esc(evidencia.urlExterna)}" target="_blank" rel="noopener noreferrer">
                 Abrir video externo ${icon('external', '')}
               </a>
             </div>`;
    } else {
      const embed = evidenciaEmbed(evidencia.urlExterna);
      cuerpo = embed
        ? `<div class="lightbox-video">
             <iframe src="${esc(embed)}" title="${esc(evidencia.titulo)}" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen allow="autoplay; encrypted-media"></iframe>
             <a class="btn btn-secundario" href="${esc(evidencia.urlExterna)}" target="_blank" rel="noopener noreferrer">
               Si el reproductor no inicia, abrir enlace externo ${icon('external', '')}
             </a>
           </div>`
        : `<div class="panel" style="text-align:center">
             ${icon('link', '')}
             <p>Esta evidencia es un enlace externo.</p>
             <a class="btn btn-primario" href="${esc(evidencia.urlExterna)}" target="_blank" rel="noopener noreferrer">
               Abrir enlace ${icon('external', '')}
             </a>
           </div>`;
    }
    const pie = `
      <strong>${esc(evidencia.titulo)}</strong>
      ${evidencia.descripcion ? `<div>${esc(evidencia.descripcion)}</div>` : ''}
      <div class="texto-tenue">${esc(formatoFecha(evidencia.fecha, { conHora: false }))}</div>
    `;
    abrirLightbox(cuerpo, pie);
  });
}

/** Convierte URLs de YouTube/Vimeo a embed. Devuelve '' si no aplica. */
export function evidenciaEmbed(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return '';
}
