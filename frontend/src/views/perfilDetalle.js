import { api } from '../js/api.js';
import { icon, esc, formatoFecha, formatoPeriodo, estadoPublicacionBadge, estadoVacio, toast } from '../js/ui.js';
import { avatarEstudiante, verEvidencia } from '../components/cards.js';
import { sesion, esStaff } from '../js/auth.js';

function barraNivel(nivel) {
  const porcentajes = { Básico: 35, Intermedio: 65, Avanzado: 90 };
  return `<div class="barra-nivel"><div style="width:${porcentajes[nivel] || 40}%"></div></div>`;
}

export async function vistaPerfilDetalle(contenedor, params) {
  contenedor.innerHTML = '<div class="panel skeleton" style="height:420px"></div>';

  let res;
  try {
    res = await api.get(`/estudiantes/${params.id}`);
  } catch (err) {
    contenedor.innerHTML = estadoVacio('user', 'Perfil no disponible', err.message);
    return;
  }

  const e = res.dato;
  const t = res.trayectoria;
  const nombre = e.nombreCompleto;
  const propietario = sesion.usuario?.estudiante === String(e._id);
  const verPrivado = esStaff() || propietario;

  const social = [
    e.githubUrl && { icono: 'github', url: e.githubUrl, texto: 'GitHub' },
    e.linkedinUrl && { icono: 'linkedin', url: e.linkedinUrl, texto: 'LinkedIn' },
    e.correoContacto && { icono: 'mail', url: `mailto:${e.correoContacto}`, texto: e.correoContacto },
    e.sitioWebUrl && { icono: 'globe', url: e.sitioWebUrl, texto: 'Sitio web' },
  ].filter(Boolean);

  const cronologia = [
    ...t.participaciones.map((p) => ({
      fecha: p.fecha,
      tipo: 'participacion',
      titulo: `${p.tipo} — ${p.evento?.nombre || p.actividadLibre || 'Actividad'}`,
      detalle: p.descripcion + (p.resultado ? ` · Resultado: ${p.resultado}` : ''),
    })),
    ...t.logros.map((l) => ({
      fecha: l.fecha,
      tipo: 'logro',
      titulo: `${l.tipoReconocimiento}: ${l.titulo}`,
      detalle: `${l.descripcion}${l.institucion ? ` · ${l.institucion}` : ''}`,
    })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  contenedor.innerHTML = `
    <div class="acciones-cv mb-2" style="justify-content:flex-end">
      <a class="btn btn-secundario btn-sm" href="#/perfiles">${icon('chevron-left')} Volver a estudiantes</a>
      <button class="btn btn-primario btn-sm" id="btn-imprimir-cv" title="Exportar o guardar como PDF desde el diálogo de impresión">
        ${icon('print')} Imprimir / Exportar CV (PDF)
      </button>
    </div>

    ${
      e.estadoPublicacion !== 'aprobado' || !e.consentimientoPublicacion
        ? `<div class="banner-aviso mb-2">${icon('alert')} <div>
            Este perfil <strong>no es visible públicamente</strong>
            ${e.estadoPublicacion !== 'aprobado' ? estadoPublicacionBadge(e.estadoPublicacion) : ''}
            ${!e.consentimientoPublicacion ? '<span class="badge badge-neutro">Sin consentimiento de publicación</span>' : ''}.
            Está visible para ti porque tienes permisos de revisión o es tu propio perfil.
           </div></div>`
        : ''
    }

    <article class="pie-impresion">
      <header class="cabecera-perfil mb-3">
        ${avatarEstudiante(e, 140)}
        <div class="datos-perfil" style="flex:1">
          <span class="badge badge-secundario" style="background:rgba(255,255,255,.2);color:#fff">Currículum Vitae Digital</span>
          <h1>${esc(nombre)}</h1>
          <p>
            ${e.semestre ? `<strong>Semestre ${esc(e.semestre)}</strong>` : ''} ${e.generacion ? `· Generación ${esc(e.generacion)}` : ''}
          </p>
          <p class="texto-mono texto-pequeno">Matrícula: ${esc(e.matricula)}</p>
          ${
            social.length
              ? `<div class="enlaces-sociales">${social
                  .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${icon(s.icono)} ${esc(s.texto)}</a>`)
                  .join('')}</div>`
              : ''
          }
        </div>
      </header>

      ${
        e.perfilProfesional
          ? `<section class="panel mb-2"><h2>${icon('user')} Perfil profesional</h2><p class="texto-suave" style="margin:0">${esc(e.perfilProfesional)}</p></section>`
          : ''
      }

      <div class="rejilla rejilla-2">
        ${
          e.areasInteres.length
            ? `<section class="panel mb-2"><h2>${icon('star')} Áreas de interés</h2>
                <div class="etiquetas">${e.areasInteres.map((a) => `<span class="etiqueta-suave">${esc(a)}</span>`).join('')}</div>
              </section>`
            : ''
        }
        ${
          e.habilidades.length
            ? `<section class="panel mb-2"><h2>${icon('code')} Habilidades y competencias</h2>
                <div style="display:grid;gap:.7rem;margin-top:.5rem">
                  ${e.habilidades
                    .map(
                      (h) => `
                    <div>
                      <div class="fila-extremos texto-pequeno"><strong>${esc(h.nombre)}</strong><span class="texto-tenue">${esc(h.nivel)}</span></div>
                      ${barraNivel(h.nivel)}
                    </div>`
                    )
                    .join('')}
                </div>
              </section>`
            : ''
        }
      </div>

      <section class="panel mb-2">
        <h2>${icon('briefcase')} Proyectos académicos y tecnológicos</h2>
        ${
          t.proyectos.length
            ? `<div class="rejilla rejilla-2 mt-1">${t.proyectos
                .map(
                  (p) => `
                <div class="tarjeta">
                  <div class="tarjeta-cuerpo">
                    <h3>${esc(p.nombre)}</h3>
                    <p class="descripcion">${esc(p.descripcion)}</p>
                    ${p.tecnologias.length ? `<div class="etiquetas mt-1">${p.tecnologias.map((te) => `<span class="etiqueta-suave">${esc(te)}</span>`).join('')}</div>` : ''}
                    <div class="tarjeta-pie">
                      <span class="texto-tenue">${p.fechaInicio ? `${formatoFecha(p.fechaInicio)}${p.fechaFin ? ` — ${formatoFecha(p.fechaFin)}` : ' — actual'}` : ''}</span>
                      <span class="grupo-botones">
                        ${p.urlRepositorio ? `<a class="btn btn-secundario btn-sm" href="${esc(p.urlRepositorio)}" target="_blank" rel="noopener noreferrer">${icon('github')} Código</a>` : ''}
                        ${p.urlDemo ? `<a class="btn btn-secundario btn-sm" href="${esc(p.urlDemo)}" target="_blank" rel="noopener noreferrer">${icon('external')} Demo</a>` : ''}
                      </span>
                    </div>
                  </div>
                </div>`
                )
                .join('')}</div>`
            : '<p class="texto-suave">Sin proyectos registrados.</p>'
        }
      </section>

      <section class="panel mb-2">
        <h2>${icon('award')} Certificaciones y cursos</h2>
        ${
          t.certificaciones.length
            ? `<ul style="margin:.5rem 0 0;padding:0;list-style:none;display:grid;gap:.6rem">
                ${t.certificaciones
                  .map(
                    (c) => `
                  <li class="fila-extremos" style="border-bottom:1px dashed var(--c-borde);padding-bottom:.6rem">
                    <span><strong>${esc(c.nombre)}</strong>
                      <span class="texto-tenue texto-pequeno" style="display:block">${esc(c.institucion)} · ${esc(formatoFecha(c.fechaObtencion))}${c.fechaExpiracion ? ` · vigente hasta ${esc(formatoFecha(c.fechaExpiracion))}` : ''}</span>
                    </span>
                    ${c.urlCredencial ? `<a class="btn btn-secundario btn-sm" href="${esc(c.urlCredencial)}" target="_blank" rel="noopener noreferrer">Ver credencial</a>` : ''}
                  </li>`
                  )
                  .join('')}
              </ul>`
            : '<p class="texto-suave">Sin certificaciones registradas.</p>'
        }
      </section>

      <section class="panel mb-2">
        <h2>${icon('trophy')} Premios y reconocimientos</h2>
        ${
          t.logros.length
            ? `<div class="rejilla rejilla-2 mt-1">${t.logros
                .map(
                  (l) => `
                <div class="tarjeta">
                  <div class="tarjeta-cuerpo">
                    <div class="fila" style="justify-content:space-between">
                      <span class="badge badge-secundario">${esc(l.categoria)}</span>
                      <span class="badge badge-alerta">${esc(l.tipoReconocimiento)}</span>
                    </div>
                    <h3>${esc(l.titulo)}</h3>
                    <p class="descripcion">${esc(l.descripcion)}</p>
                    <div class="tarjeta-pie">
                      <span>${esc(l.institucion || l.evento?.nombre || '')}</span>
                      <strong>${esc(formatoFecha(l.fecha))}</strong>
                    </div>
                  </div>
                </div>`
                )
                .join('')}</div>`
            : '<p class="texto-suave">Sin reconocimientos publicados.</p>'
        }
      </section>

      <section class="panel mb-2">
        <h2>${icon('calendar')} Participación en eventos</h2>
        ${
          t.participaciones.length
            ? `<div class="contenedor-tabla mt-1">
              <table class="tabla">
                <thead><tr><th>Fecha</th><th>Evento / actividad</th><th>Tipo</th><th>Resultado</th></tr></thead>
                <tbody>
                  ${t.participaciones
                    .map(
                      (p) => `
                    <tr>
                      <td>${esc(formatoFecha(p.fecha))}</td>
                      <td>${p.evento ? `<a href="#/eventos/${p.evento._id}">${esc(p.evento.nombre)}</a>` : esc(p.actividadLibre || 'Actividad')}</td>
                      <td><span class="badge badge-primario">${esc(p.tipo)}</span></td>
                      <td>${esc(p.resultado || '—')}</td>
                    </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>`
            : '<p class="texto-suave">Sin participaciones registradas.</p>'
        }
      </section>

      <section class="panel mb-2">
        <h2>${icon('clock')} Historial cronológico</h2>
        ${
          cronologia.length
            ? `<ul class="cronologia mt-2">
                ${cronologia
                  .map(
                    (item) => `
                  <li>
                    <span class="crono-fecha">${esc(formatoFecha(item.fecha))} · ${item.tipo === 'logro' ? 'Logro' : 'Participación'}</span>
                    <h4>${esc(item.titulo)}</h4>
                    <p>${esc(item.detalle)}</p>
                  </li>`
                  )
                  .join('')}
              </ul>`
            : '<p class="texto-suave">Sin actividad registrada.</p>'
        }
      </section>

      ${
        t.evidencias.length
          ? `<section class="panel">
              <h2>${icon('image')} Evidencias multimedia</h2>
              <div class="rejilla-galeria mt-1" id="galeria-perfil"></div>
            </section>`
          : ''
      }
    </article>
  `;

  document.getElementById('btn-imprimir-cv').addEventListener('click', () => {
    toast('Abre el diálogo de impresión y elige "Guardar como PDF" para exportar el CV.', 'info', 5000);
    setTimeout(() => window.print(), 350);
  });

  const galeria = document.getElementById('galeria-perfil');
  if (galeria) {
    t.evidencias.forEach((evi) => galeria.appendChild(verEvidenciaCard(evi)));
  }

  function verEvidenciaCard(evi) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'item-galeria';
    let cuerpo;
    if (evi.tipo === 'Imagen' && evi.archivoUrl) {
      cuerpo = `<img src="${esc(evi.archivoUrl)}" alt="${esc(evi.titulo)}" loading="lazy" onerror="this.src='/public/img/eventos/default.svg'" />`;
    } else if (evi.tipo === 'Video' && evi.archivoUrl) {
      cuerpo = `<video src="${esc(evi.archivoUrl)}" muted preload="metadata"></video>`;
    } else {
      cuerpo = `<img src="/public/img/eventos/default.svg" alt="${esc(evi.titulo)}" />`;
    }
    boton.innerHTML = `
      ${cuerpo}
      <span class="icono-tipo">${icon(evi.tipo === 'Imagen' ? 'image' : evi.tipo === 'Video' ? 'video' : 'link', '')}</span>
      <span class="info-galeria"><strong>${esc(evi.titulo)}</strong>${esc(formatoFecha(evi.fecha))}</span>
    `;
    boton.addEventListener('click', () => verEvidencia(evi));
    return boton;
  }
}
