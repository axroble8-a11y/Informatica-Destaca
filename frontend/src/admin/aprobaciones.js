import { api, urlAbsoluta } from '../js/api.js';
import { icon, esc, toast, abrirModal, estadoVacio } from './uiAdminShared.js';

const TIPOS = [
  ['estudiantes', 'Perfiles', 'user'],
  ['eventos', 'Eventos', 'calendar'],
  ['participaciones', 'Participaciones', 'clipboard'],
  ['logros', 'Logros', 'trophy'],
  ['proyectos', 'Proyectos', 'briefcase'],
  ['certificaciones', 'Certificaciones', 'award'],
  ['evidencias', 'Evidencias', 'image'],
];

let tipoActual = 'estudiantes';
let resumenActual = null;

export async function vistaAdminAprobaciones(contenedor) {
  const tipoHash = new URLSearchParams(window.location.hash.split('?')[1] || '').get('tipo');
  tipoActual = TIPOS.some(([clave]) => clave === tipoHash) ? tipoHash : 'estudiantes';

  contenedor.innerHTML = `
    <div class="panel-filtros sin-buscador" style="grid-template-columns:auto 1fr">
      <div class="fila" id="ap-tipos" style="gap:.4rem;flex-wrap:wrap"></div>
      <div class="fila" style="justify-content:flex-end;align-items:center">
        <span class="texto-tenue texto-pequeno">Contenido propuesto por responsables y estudiantes que requiere revisión.</span>
      </div>
    </div>
    <div id="ap-lista"></div>
  `;

  contenedor.querySelectorAll('[data-tipo]').forEach((b) =>
    b.addEventListener('click', () => {
      tipoActual = b.dataset.tipo;
      cargar();
    })
  );

  await cargar();
  return { limpiar: () => {} };

  function pintarTipos() {
    const barra = document.getElementById('ap-tipos');
    if (!barra) return;
    barra.innerHTML = TIPOS.map(([clave, etiqueta, icono]) => {
      const total = resumenActual?.[clave]?.total ?? 0;
      return `
        <button class="btn btn-sm ${clave === tipoActual ? 'btn-primario' : 'btn-secundario'}" data-tipo="${clave}">
          ${icon(icono)} ${etiqueta}
          ${total > 0 ? `<span class="contador-pendientes">${total}</span>` : ''}
        </button>`;
    }).join('');

    barra.querySelectorAll('[data-tipo]').forEach((b) =>
      b.addEventListener('click', () => {
        tipoActual = b.dataset.tipo;
        cargar();
      })
    );
  }

  async function cargar() {
    pintarTipos();
    const lista = document.getElementById('ap-lista');
    lista.innerHTML = '<div class="skeleton" style="height:280px"></div>';

    const res = await api.get(`/aprobaciones?tipo=${tipoActual}`);
    resumenActual = res.resumen;
    pintarTipos();

    lista.innerHTML =
      res.datos.length === 0
        ? estadoVacio(
            'check',
            'Sin contenido pendiente',
            `No hay ${res.etiqueta ? res.etiqueta.toLowerCase() + 's' : 'elementos'} esperando revisión en esta categoría.`
          )
        : `<div class="fila" style="flex-direction:column;align-items:stretch;gap:.8rem">
            ${res.datos.map((d) => tarjeta(d)).join('')}
          </div>`;

    conectarAcciones();
  }

  function tarjeta(d) {
    const creado = d.createdAt ? new Date(d.createdAt).toLocaleDateString('es-MX') : '';
    return `
      <div class="tarjeta" style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <div style="flex:1;min-width:260px">
          <div class="fila" style="justify-content:space-between;margin-bottom:.4rem">
            <h3 style="margin:0;font-size:1.05rem">${icon(TIPOS.find(([c]) => c === tipoActual)[2])} ${titulo(d)}</h3>
            <span class="texto-tenue texto-pequeno">Propuesto el ${creado}</span>
          </div>
          ${detalle(d)}
        </div>
        <div class="fila" style="gap:.5rem">
          <button class="btn btn-exito btn-sm" data-accion="aprobar" data-id="${d._id}">${icon('check')} Aprobar</button>
          <button class="btn btn-peligro btn-sm" data-accion="rechazar" data-id="${d._id}">${icon('x')} Rechazar</button>
        </div>
      </div>`;

    function titulo(d) {
      switch (tipoActual) {
        case 'estudiantes': return esc(d.nombreCompleto || `${d.nombre} ${d.apellidos}`);
        case 'eventos': return esc(d.nombre);
        case 'logros': return esc(d.titulo);
        case 'proyectos': return esc(d.nombre);
        case 'certificaciones': return esc(d.nombre);
        case 'evidencias': return esc(d.titulo);
        default: return esc(d.actividadLibre || 'Participación');
      }
    }

    function detalle(d) {
      const linea = (etiqueta, valor) =>
        valor ? `<div class="texto-pequeno"><span class="texto-tenue">${etiqueta}:</span> ${valor}</div>` : '';
      const nombreEstudiante = esc(d.estudiante?.nombreCompleto || '');

      switch (tipoActual) {
        case 'estudiantes':
          return `
            ${linea('Matrícula', esc(d.matricula))}
            ${linea('Semestre', esc(d.semestre))}
            ${linea('Generación', esc(d.generacion || ''))}
            ${linea('Correo de contacto', esc(d.correoContacto || ''))}
            ${d.consentimientoPublicacion
              ? '<div class="texto-pequeno"><span class="badge badge-exito">Con autorización de publicación</span></div>'
              : '<div class="texto-pequeno"><span class="badge badge-alerta">Sin consentimiento de publicación: no será visible hasta que lo autorice</span></div>'}`;
        case 'eventos':
          return `
            ${linea('Categoría', `<span class="badge badge-primario">${esc(d.categoria)}</span>`)}
            ${linea('Modalidad', esc(d.modalidad))}
            ${linea('Inicio', new Date(d.fechaInicio).toLocaleDateString('es-MX'))}
            ${linea('Lugar', esc(d.lugar || ''))}
            ${linea('Organiza', esc(d.organizador || ''))}
            ${linea('Descripción', esc(d.descripcion))}`;
        case 'participaciones':
          return `
            ${linea('Estudiante', nombreEstudiante)}
            ${linea('Evento', esc(d.evento?.nombre || d.actividadLibre || ''))}
            ${linea('Tipo', `<span class="badge badge-primario">${esc(d.tipo)}</span>`)}
            ${linea('Fecha', new Date(d.fecha).toLocaleDateString('es-MX'))}
            ${linea('Resultado', esc(d.resultado || ''))}
            ${linea('Descripción', esc(d.descripcion))}`;
        case 'logros':
          return `
            ${linea('Estudiante', nombreEstudiante)}
            ${linea('Categoría', `<span class="badge badge-primario">${esc(d.categoria)}</span>`)}
            ${linea('Tipo de reconocimiento', esc(d.tipoReconocimiento || ''))}
            ${linea('Fecha', new Date(d.fecha).toLocaleDateString('es-MX'))}
            ${linea('Institución', esc(d.institucion || ''))}
            ${linea('Descripción', esc(d.descripcion))}`;
        case 'proyectos':
          return `
            ${linea('Estudiante', nombreEstudiante)}
            ${(d.tecnologias || []).length
              ? `<div class="texto-pequeno">${d.tecnologias.map((t) => `<span class="chip" style="margin:2px">${esc(t)}</span>`).join('')}</div>`
              : ''}
            ${linea('Descripción', esc(d.descripcion))}`;
        case 'certificaciones':
          return `
            ${linea('Estudiante', nombreEstudiante)}
            ${linea('Institución', esc(d.institucion))}
            ${linea('Obtenida', new Date(d.fechaObtencion).toLocaleDateString('es-MX'))}
            ${d.urlCredencial ? `<div class="texto-pequeno"><a href="${esc(d.urlCredencial)}" target="_blank" rel="noopener">${icon('external')} Ver credencial</a></div>` : ''}`;
        case 'evidencias':
          return `
            ${d.archivoUrl && d.tipo === 'Imagen'
              ? `<img src="${urlAbsoluta(d.archivoUrl)}" alt="" style="max-width:180px;max-height:120px;object-fit:cover;border-radius:8px;margin-bottom:.4rem" loading="lazy" />`
              : ''}
            ${linea('Tipo', `<span class="badge badge-primario">${esc(d.tipo)}</span>`)}
            ${linea('Evento', esc(d.evento?.nombre || ''))}
            ${linea('Estudiante', nombreEstudiante)}
            ${d.urlExterna ? `<div class="texto-pequeno"><a href="${esc(d.urlExterna)}" target="_blank" rel="noopener">${icon('external')} ${esc(d.urlExterna)}</a></div>` : ''}
            ${d.autorizadoPublicacion
              ? '<div class="texto-pequeno"><span class="badge badge-exito">Autorizada para publicación</span></div>'
              : '<div class="texto-pequeno"><span class="badge badge-alerta">Sin autorización de publicación</span></div>'}`;
        default:
          return '';
      }
    }
  }

  function conectarAcciones() {
    const lista = document.getElementById('ap-lista');
    if (!lista) return;
    lista.querySelectorAll('[data-accion]').forEach((b) =>
      b.addEventListener('click', () => modalRevision(b.dataset.id, b.dataset.accion))
    );
  }

  function modalRevision(id, accion) {
    const etiqueta = resumenActual?.[tipoActual]?.etiqueta || 'contenido';
    abrirModal({
      titulo: accion === 'aprobar' ? `Aprobar ${etiqueta.toLowerCase()}` : `Rechazar ${etiqueta.toLowerCase()}`,
      contenido: `
        <p class="texto-pequeno">
          ${accion === 'aprobar'
            ? 'El contenido pasará a estar visible en el portal público (siempre que el estudiante tenga consentimiento de publicación).'
            : 'El contenido no se publicará. Puedes dejar un comentario para quien lo propuso.'}
        </p>
        <div class="campo">
          <label>Comentario de revisión (opcional)</label>
          <textarea id="ap-comentario" data-validar="max:500" placeholder="Ej. Verifica la fecha antes de publicar."></textarea>
          <span class="error-mensaje"></span>
        </div>
      `,
      pie: `
        <button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
        <button class="btn ${accion === 'aprobar' ? 'btn-exito' : 'btn-peligro'}" data-acc="confirmar">
          ${icon('check')} ${accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
        </button>
      `,
    });

    const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
    modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());
    modal.querySelector('[data-acc="confirmar"]').addEventListener('click', async () => {
      const { validarFormulario } = await import('../js/ui.js');
      const form = modal.querySelector('.modal-cuerpo');
      if (form && !validarFormulario(form)) return;

      try {
        const res = await api.patch(`/aprobaciones/${tipoActual}/${id}`, {
          accion,
          comentario: document.getElementById('ap-comentario').value.trim(),
        });
        toast(res.mensaje, 'exito');
        modal.remove();
        cargar();
      } catch (err) {
        toast(err.message, 'error');
      }
    });
  }
}
