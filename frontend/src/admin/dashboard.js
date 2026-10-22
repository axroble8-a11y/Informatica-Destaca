import { api } from '../js/api.js';
import { icon, esc } from '../js/ui.js';
import { esAdmin } from '../js/auth.js';
import { layoutAdmin } from './adminLayout.js';

export async function vistaDashboard(contenedor) {
  await layoutAdmin('Dashboard', 'Resumen general de la plataforma.', '<div class="skeleton" style="height:220px"></div>', async (el) => {
    const [estadisticas, aprobaciones] = await Promise.all([
      api.get('/estadisticas').catch(() => null),
      esAdmin() ? api.get('/aprobaciones').catch(() => null) : null,
    ]);

    const c = estadisticas?.cifras || {};

    const tarjetas = [
      { icono: 'users', color: 'linear-gradient(135deg,#4f46e5,#7c3aed)', valor: c.estudiantes ?? '—', rotulo: 'Estudiantes publicados' },
      { icono: 'calendar', color: 'linear-gradient(135deg,#0891b2,#2563eb)', valor: c.eventos ?? '—', rotulo: 'Eventos registrados' },
      { icono: 'trophy', color: 'linear-gradient(135deg,#d97706,#dc2626)', valor: c.logros ?? '—', rotulo: 'Logros aprobados' },
      { icono: 'image', color: 'linear-gradient(135deg,#059669,#0d9488)', valor: c.galeria ?? '—', rotulo: 'Fotografías en galería' },
    ];

    const resumenPendientes = aprobaciones
      ? Object.entries(aprobaciones.resumen).filter(([, v]) => v.total > 0)
      : [];

    el.innerHTML = `
      <div class="tarjetas-dashboard mb-3">
        ${tarjetas
          .map(
            (t) => `
          <div class="tarjeta-dash">
            <span class="icono-dash" style="background:${t.color}">${icon(t.icono)}</span>
            <div>
              <div class="valor">${t.valor}</div>
              <div class="rotulo">${esc(t.rotulo)}</div>
            </div>
          </div>`
          )
          .join('')}
      </div>

      ${
        esAdmin()
          ? `<div class="panel mb-3">
              <h2>${icon('check-circle')} Contenido pendiente de aprobación</h2>
              ${
                resumenPendientes.length === 0
                  ? '<p class="texto-suave">No hay contenido pendiente. ¡Todo al día!</p>'
                  : `<div class="chips mt-2">
                      ${resumenPendientes
                        .map(
                          ([clave, v]) => `
                        <a class="chip" href="#/admin/aprobaciones?tipo=${clave}" style="text-decoration:none">
                          ${esc(v.etiqueta)} <span class="badge badge-alerta" style="margin-left:.3rem">${v.total}</span>
                        </a>`
                        )
                        .join('')}
                    </div>`
              }
              <p class="mt-2"><a class="btn btn-primario btn-sm" href="#/admin/aprobaciones">Ir al flujo de aprobación ${icon('chevron-right')}</a></p>
            </div>`
          : `<div class="banner-info mb-3">${icon('info')} <div>
              Como <strong>responsable de contenido</strong> puedes registrar y editar eventos, estudiantes,
              participaciones, logros y multimedia. Tus registros quedan <strong>pendientes de aprobación</strong>
              por la administración antes de publicarse.
            </div></div>`
      }

      <div class="rejilla rejilla-2">
        <div class="panel">
          <h2>${icon('calendar')} Próximos eventos</h2>
          ${
            estadisticas?.proximosEventos?.length
              ? `<ul style="list-style:none;padding:0;margin:.6rem 0 0;display:grid;gap:.6rem">
                  ${estadisticas.proximosEventos
                    .map(
                      (ev) => `
                    <li class="fila-extremos" style="border:1px solid var(--c-borde);border-radius:8px;padding:.6rem .8rem">
                      <span><strong class="texto-pequeno">${esc(ev.nombre)}</strong>
                        <span class="texto-tenue texto-pequeno" style="display:block">${new Date(ev.fechaInicio).toLocaleDateString('es-MX')}</span>
                      </span>
                      <a class="btn btn-secundario btn-sm" href="#/eventos/${ev._id}">Ver</a>
                    </li>`
                    )
                    .join('')}
                </ul>`
              : '<p class="texto-suave">No hay eventos próximos.</p>'
          }
          <p class="mt-2"><a class="btn btn-secundario btn-sm" href="#/admin/eventos">${icon('plus')} Gestionar eventos</a></p>
        </div>

        <div class="panel">
          <h2>${icon('medal')} Últimos logros aprobados</h2>
          ${
            estadisticas?.ultimosLogros?.length
              ? `<ul style="list-style:none;padding:0;margin:.6rem 0 0;display:grid;gap:.6rem">
                  ${estadisticas.ultimosLogros
                    .map(
                      (l) => `
                    <li style="border:1px solid var(--c-borde);border-radius:8px;padding:.6rem .8rem">
                      <strong class="texto-pequeno">${esc(l.titulo)}</strong>
                      <span class="texto-tenue texto-pequeno" style="display:block">
                        ${esc(l.estudiante?.nombreCompleto || '')} · ${new Date(l.fecha).toLocaleDateString('es-MX')}
                      </span>
                    </li>`
                    )
                    .join('')}
                </ul>`
              : '<p class="texto-suave">Aún no hay logros publicados.</p>'
          }
          <p class="mt-2"><a class="btn btn-secundario btn-sm" href="#/admin/logros">${icon('plus')} Gestionar logros</a></p>
        </div>
      </div>
    `;
  });
}
