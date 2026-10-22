/**
 * Mi espacio (rol estudiante): propuesta de información propia.
 * El estudiante puede editar su presentación/habilidades y proponer
 * participaciones, logros, proyectos, certificaciones y evidencias.
 * Todo lo propuesto queda "pendiente" hasta que la coordinación lo apruebe.
 */
import { api, obtenerCatalogos } from '../js/api.js';
import { icon, esc, toast, abrirModal, confirmar, estadoPublicacionBadge, formatoFecha, opcionesSelect, validarFormulario } from '../js/ui.js';
import { avatarEstudiante } from '../components/cards.js';
import { sesion } from '../js/auth.js';

let tab = 'perfil';

export async function vistaMiEspacio(contenedor) {
  if (!sesion.usuario?.estudiante) {
    contenedor.innerHTML = `
      <div class="estado-vacio">
        <div class="icono-vacio">${icon('user')}</div>
        <h3>Tu cuenta aún no está vinculada a un perfil estudiantil</h3>
        <p class="texto-suave">Solicita a la coordinación la vinculación de tu cuenta con tu matrícula.</p>
      </div>`;
    return;
  }

  await pintar(contenedor);

  return {
    limpiar: () => {},
  };
}

async function pintar(contenedor) {
  const [perfilRes, catalogos] = await Promise.all([
    api.get(`/estudiantes/${sesion.usuario.estudiante}`),
    obtenerCatalogos(),
  ]);
  const e = perfilRes.dato;
  const t = perfilRes.trayectoria;

  const pestanas = [
    ['perfil', 'user', 'Mi perfil'],
    ['participaciones', 'calendar', `Participaciones (${t.participaciones.length})`],
    ['logros', 'trophy', `Logros (${t.logros.length})`],
    ['proyectos', 'briefcase', `Proyectos (${t.proyectos.length})`],
    ['certificaciones', 'award', `Certificaciones (${t.certificaciones.length})`],
    ['evidencias', 'image', `Evidencias (${t.evidencias.length})`],
  ];

  contenedor.innerHTML = `
    <div class="cabecera-perfil mb-3" style="padding:1.6rem">
      ${avatarEstudiante(e, 110)}
      <div class="datos-perfil" style="flex:1">
        <span class="badge" style="background:rgba(255,255,255,.2);color:#fff">Mi espacio estudiantil</span>
        <h1 style="font-size:1.6rem">${esc(e.nombreCompleto)}</h1>
        <p class="texto-pequeno">Semestre ${esc(e.semestre)} · Matrícula ${esc(e.matricula)}</p>
        <p style="margin-top:.4rem">${estadoPublicacionBadge(e.estadoPublicacion)}
          ${e.consentimientoPublicacion ? '<span class="badge badge-exito">Con consentimiento de publicación</span>' : '<span class="badge badge-alerta">Sin consentimiento de publicación</span>'}
        </p>
      </div>
    </div>

    <div class="banner-info mb-3">${icon('info')} <div>
      Todo lo que registres aquí queda como <strong>propuesta</strong> y será visible públicamente
      cuando la coordinación lo apruebe. No puedes modificar datos académicos (nombre, matrícula, semestre).
    </div></div>

    <div class="chips mb-3" id="pestanas-mi">
      ${pestanas.map(([id, ic, txt]) => `<button class="chip ${id === tab ? 'activo' : ''}" data-tab="${id}">${icon(ic)} ${esc(txt)}</button>`).join('')}
    </div>

    <div id="contenido-mi"></div>
  `;

  contenedor.querySelectorAll('#pestanas-mi .chip').forEach((b) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      contenedor.querySelectorAll('#pestanas-mi .chip').forEach((x) => x.classList.toggle('activo', x === b));
      pintarContenido(document.getElementById('contenido-mi'), e, t, catalogos);
    })
  );

  pintarContenido(document.getElementById('contenido-mi'), e, t, catalogos);
}

function pintarContenido(el, e, t, catalogos) {
  if (tab === 'perfil') pintarPerfil(el, e);
  else if (tab === 'participaciones') pintarParticipaciones(el, e, t, catalogos);
  else if (tab === 'logros') pintarLogros(el, e, t, catalogos);
  else if (tab === 'proyectos') pintarProyectos(el, e, t);
  else if (tab === 'certificaciones') pintarCertificaciones(el, e, t);
  else if (tab === 'evidencias') pintarEvidencias(el, e, t, catalogos);
}

/* ---------------- Perfil ---------------- */
function pintarPerfil(el, e) {
  el.innerHTML = `
    <div class="panel">
      <h2>${icon('user')} Editar mi presentación</h2>
      <p class="texto-suave texto-pequeno">Estos cambios se envían como propuesta y requieren aprobación.</p>
      <form id="form-perfil" class="formulario mt-2" novalidate>
        <div class="campo">
          <label for="pf-foto">URL de fotografía (o deja el avatar institucional)</label>
          <input id="pf-foto" name="fotoUrl" value="${esc(e.fotoUrl)}" placeholder="https://… o /uploads/…" data-validar="max:500" />
          <span class="error-mensaje"></span>
        </div>
        <div class="campo">
          <label for="pf-presentacion">Presentación personal / perfil profesional</label>
          <textarea id="pf-presentacion" name="perfilProfesional" data-validar="max:1200">${esc(e.perfilProfesional)}</textarea>
          <span class="error-mensaje"></span>
        </div>
        <div class="campo">
          <label for="pf-areas">Áreas de interés (separadas por coma)</label>
          <input id="pf-areas" name="areasInteres" value="${esc(e.areasInteres.join(', '))}" placeholder="Inteligencia Artificial, Redes…" />
        </div>
        <div class="campo">
          <label>Habilidades</label>
          <div id="pf-habilidades" style="display:grid;gap:.5rem">
            ${e.habilidades
              .map(
                (h, i) => `
              <div class="fila" data-hab="${i}">
                <input placeholder="Habilidad" value="${esc(h.nombre)}" class="hab-nombre" style="flex:2" />
                <select class="hab-nivel" style="flex:1">${opcionesSelect(['Básico', 'Intermedio', 'Avanzado'], h.nivel)}</select>
                <button type="button" class="btn btn-fantasma btn-sm hab-quitar" aria-label="Quitar">${icon('trash')}</button>
              </div>`
              )
              .join('')}
          </div>
          <button type="button" class="btn btn-secundario btn-sm mt-1" id="pf-add-hab">${icon('plus')} Agregar habilidad</button>
        </div>
        <div class="campos-2">
          <div class="campo">
            <label for="pf-correo">Correo de contacto</label>
            <input id="pf-correo" name="correoContacto" value="${esc(e.correoContacto)}" data-validar="email" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label for="pf-github">GitHub</label>
            <input id="pf-github" name="githubUrl" value="${esc(e.githubUrl)}" placeholder="https://github.com/usuario" data-validar="url" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label for="pf-linkedin">LinkedIn</label>
            <input id="pf-linkedin" name="linkedinUrl" value="${esc(e.linkedinUrl)}" placeholder="https://linkedin.com/in/usuario" data-validar="url" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label for="pf-web">Sitio web / portafolio</label>
            <input id="pf-web" name="sitioWebUrl" value="${esc(e.sitioWebUrl)}" placeholder="https://…" data-validar="url" />
            <span class="error-mensaje"></span>
          </div>
        </div>
        <div>
          <button class="btn btn-primario" type="submit">${icon('check')} Enviar propuesta de perfil</button>
        </div>
      </form>
    </div>
  `;

  document.getElementById('pf-add-hab').addEventListener('click', () => {
    const fila = document.createElement('div');
    fila.className = 'fila';
    fila.innerHTML = `
      <input placeholder="Habilidad" class="hab-nombre" style="flex:2" />
      <select class="hab-nivel" style="flex:1">${opcionesSelect(['Básico', 'Intermedio', 'Avanzado'], 'Básico')}</select>
      <button type="button" class="btn btn-fantasma btn-sm hab-quitar" aria-label="Quitar">${icon('trash')}</button>
    `;
    fila.querySelector('.hab-quitar').addEventListener('click', () => fila.remove());
    document.getElementById('pf-habilidades').appendChild(fila);
  });

  el.querySelectorAll('.hab-quitar').forEach((b) => b.addEventListener('click', () => b.closest('.fila').remove()));

  document.getElementById('form-perfil').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const habilidades = [...el.querySelectorAll('#pf-habilidades .fila')]
      .map((f) => ({ nombre: f.querySelector('.hab-nombre').value.trim(), nivel: f.querySelector('.hab-nivel').value }))
      .filter((h) => h.nombre);

    const cuerpo = {
      fotoUrl: document.getElementById('pf-foto').value.trim(),
      perfilProfesional: document.getElementById('pf-presentacion').value.trim(),
      areasInteres: document.getElementById('pf-areas').value.split(',').map((s) => s.trim()).filter(Boolean),
      habilidades,
      correoContacto: document.getElementById('pf-correo').value.trim(),
      githubUrl: document.getElementById('pf-github').value.trim(),
      linkedinUrl: document.getElementById('pf-linkedin').value.trim(),
      sitioWebUrl: document.getElementById('pf-web').value.trim(),
    };

    try {
      const res = await api.put(`/estudiantes/${sesion.usuario.estudiante}`, cuerpo);
      toast(res.mensaje, 'exito');
      refrescar();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

/* ---------------- Participaciones ---------------- */
function pintarParticipaciones(el, e, t, catalogos) {
  el.innerHTML = `
    <div class="fila-extremos mb-2">
      <h2>${icon('calendar')} Mis participaciones</h2>
      <button class="btn btn-primario btn-sm" id="pp-nueva">${icon('plus')} Proponer participación</button>
    </div>
    ${listaParticipaciones(t.participaciones)}
  `;
  document.getElementById('pp-nueva').addEventListener('click', () => formParticipacion(e, catalogos));
}

function listaParticipaciones(participaciones) {
  if (!participaciones.length) return '<div class="panel texto-suave">Aún no tienes participaciones registradas.</div>';
  return `
    <div class="contenedor-tabla">
      <table class="tabla">
        <thead><tr><th>Fecha</th><th>Evento / actividad</th><th>Tipo</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          ${participaciones
            .map(
              (p) => `
            <tr>
              <td>${esc(formatoFecha(p.fecha))}</td>
              <td>${esc(p.evento?.nombre || p.actividadLibre || 'Actividad')}<div class="texto-tenue texto-pequeno">${esc(p.descripcion)}</div></td>
              <td><span class="badge badge-primario">${esc(p.tipo)}</span></td>
              <td>${estadoPublicacionBadge(p.estadoPublicacion)}${p.comentarioRevision ? `<div class="texto-tenue texto-pequeno">${esc(p.comentarioRevision)}</div>` : ''}</td>
              <td><div class="acciones">
                ${p.estadoPublicacion === 'pendiente' ? `<button class="btn btn-secundario btn-sm" data-editar="${p._id}">${icon('edit')}</button>` : ''}
                ${p.estadoPublicacion === 'pendiente' ? `<button class="btn btn-peligro btn-sm" data-borrar="${p._id}">${icon('trash')}</button>` : ''}
              </div></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function formParticipacion(e, catalogos, registro = null) {
  const eventosPromise = api.get('/eventos?limit=60');
  abrirModal({
    titulo: registro ? 'Editar participación' : 'Proponer participación',
    grande: true,
    contenido: `
      <form class="formulario" id="form-part" novalidate>
        <div class="campo">
          <label class="obligatorio">Evento</label>
          <select id="pp-evento" name="evento"><option value="">— Sin evento (actividad libre) —</option></select>
        </div>
        <div class="campo">
          <label>Actividad libre (si no eliges evento)</label>
          <input id="pp-libre" name="actividadLibre" value="${esc(registro?.actividadLibre || '')}" placeholder="Ej. Organización del club de robótica" data-validar="max:150" />
        </div>
        <div class="campos-3">
          <div class="campo">
            <label class="obligatorio">Fecha</label>
            <input type="date" id="pp-fecha" name="fecha" value="${registro ? new Date(registro.fecha).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Tipo de participación</label>
            <select id="pp-tipo" name="tipo">${opcionesSelect(catalogos.tiposParticipacion, registro?.tipo || 'Asistente')}</select>
          </div>
          <div class="campo">
            <label>Resultado obtenido</label>
            <input id="pp-resultado" name="resultado" value="${esc(registro?.resultado || '')}" placeholder="Ej. 2° lugar" data-validar="max:500" />
          </div>
        </div>
        <div class="campo">
          <label class="obligatorio">Descripción de la actividad</label>
          <textarea id="pp-descripcion" name="descripcion" data-validar="requerido, max:2000">${esc(registro?.descripcion || '')}</textarea>
          <span class="error-mensaje"></span>
        </div>
      </form>
    `,
    pie: `<button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
          <button class="btn btn-primario" data-acc="guardar">${icon('check')} Enviar propuesta</button>`,
  });

  eventosPromise.then((res) => {
    const select = document.getElementById('pp-evento');
    res.datos.forEach((ev) => {
      const op = document.createElement('option');
      op.value = ev._id;
      op.textContent = `${ev.nombre} (${formatoFecha(ev.fechaInicio)})`;
      if (registro?.evento === ev._id) op.selected = true;
      select.appendChild(op);
    });
  });

  const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
  modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());
  modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
    const form = document.getElementById('form-part');
    if (!validarFormulario(form)) return;

    const cuerpo = {
      estudiante: sesion.usuario.estudiante,
      evento: document.getElementById('pp-evento').value || null,
      actividadLibre: document.getElementById('pp-libre').value.trim(),
      fecha: document.getElementById('pp-fecha').value,
      tipo: document.getElementById('pp-tipo').value,
      descripcion: document.getElementById('pp-descripcion').value.trim(),
      resultado: document.getElementById('pp-resultado').value.trim(),
    };
    if (!cuerpo.evento && !cuerpo.actividadLibre) {
      toast('Elige un evento o escribe la actividad libre.', 'error');
      return;
    }

    try {
      const res = registro
        ? await api.put(`/participaciones/${registro._id}`, cuerpo)
        : await api.post('/participaciones', cuerpo);
      toast(res.mensaje, 'exito');
      modal.remove();
      refrescar();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

/* ---------------- Logros ---------------- */
function pintarLogros(el, e, t, catalogos) {
  el.innerHTML = `
    <div class="fila-extremos mb-2">
      <h2>${icon('trophy')} Mis logros</h2>
      <button class="btn btn-primario btn-sm" id="pl-nuevo">${icon('plus')} Proponer logro</button>
    </div>
    ${
      t.logros.length
        ? `<div class="contenedor-tabla">
            <table class="tabla">
              <thead><tr><th>Fecha</th><th>Logro</th><th>Categoría</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                ${t.logros
                  .map(
                    (l) => `
                  <tr>
                    <td>${esc(formatoFecha(l.fecha))}</td>
                    <td><strong>${esc(l.titulo)}</strong><div class="texto-tenue texto-pequeno">${esc(l.descripcion)}</div></td>
                    <td><span class="badge badge-secundario">${esc(l.categoria)}</span></td>
                    <td>${estadoPublicacionBadge(l.estadoPublicacion)}${l.comentarioRevision ? `<div class="texto-tenue texto-pequeno">${esc(l.comentarioRevision)}</div>` : ''}</td>
                    <td><div class="acciones">
                      ${l.estadoPublicacion === 'pendiente' ? `<button class="btn btn-secundario btn-sm" data-editar="${l._id}">${icon('edit')}</button>` : ''}
                      ${l.estadoPublicacion === 'pendiente' ? `<button class="btn btn-peligro btn-sm" data-borrar="${l._id}">${icon('trash')}</button>` : ''}
                    </div></td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
        : '<div class="panel texto-suave">Aún no tienes logros registrados.</div>'
    }
  `;

  document.getElementById('pl-nuevo').addEventListener('click', () => formLogro(e, catalogos));
  el.querySelectorAll('[data-editar]').forEach((b) =>
    b.addEventListener('click', () => {
      const registro = t.logros.find((l) => l._id === b.dataset.editar);
      formLogro(e, catalogos, registro);
    })
  );
  el.querySelectorAll('[data-borrar]').forEach((b) =>
    b.addEventListener('click', async () => {
      if (!(await confirmar({ titulo: '¿Eliminar esta propuesta?', texto: 'La participación o logro pendiente se eliminará.' }))) return;
      try {
        await api.delete(`/logros/${b.dataset.borrar}`);
        toast('Propuesta eliminada.', 'info');
        refrescar();
      } catch (err) {
        toast(err.message, 'error');
      }
    })
  );
}

function formLogro(e, catalogos, registro = null) {
  abrirModal({
    titulo: registro ? 'Editar logro' : 'Proponer logro',
    grande: true,
    contenido: `
      <form class="formulario" id="form-logro" novalidate>
        <div class="campo">
          <label class="obligatorio">Nombre del logro o reconocimiento</label>
          <input id="pl-titulo" value="${esc(registro?.titulo || '')}" placeholder="Ej. Primer lugar en …" data-validar="requerido, max:150" />
          <span class="error-mensaje"></span>
        </div>
        <div class="campos-3">
          <div class="campo">
            <label class="obligatorio">Categoría</label>
            <select id="pl-categoria">${opcionesSelect(catalogos.categoriasLogro, registro?.categoria || 'Académico')}</select>
          </div>
          <div class="campo">
            <label>Tipo de reconocimiento</label>
            <select id="pl-tipo">${opcionesSelect(catalogos.tiposReconocimiento, registro?.tipoReconocimiento || 'Reconocimiento')}</select>
          </div>
          <div class="campo">
            <label class="obligatorio">Fecha</label>
            <input type="date" id="pl-fecha" value="${registro ? new Date(registro.fecha).toISOString().slice(0, 10) : ''}" data-validar="requerido, fecha" />
            <span class="error-mensaje"></span>
          </div>
        </div>
        <div class="campo">
          <label>Institución o concurso relacionado</label>
          <input id="pl-institucion" value="${esc(registro?.institucion || '')}" placeholder="Ej. CONATE, Academia de Programación" data-validar="max:150" />
        </div>
        <div class="campo">
          <label class="obligatorio">Descripción</label>
          <textarea id="pl-descripcion" data-validar="requerido, max:2000">${esc(registro?.descripcion || '')}</textarea>
          <span class="error-mensaje"></span>
        </div>
      </form>
    `,
    pie: `<button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
          <button class="btn btn-primario" data-acc="guardar">${icon('check')} Enviar propuesta</button>`,
  });

  const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
  modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());
  modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
    const form = modal.querySelector('form');
    if (!validarFormulario(form)) return;
    const cuerpo = {
      estudiante: sesion.usuario.estudiante,
      titulo: document.getElementById('pl-titulo').value.trim(),
      categoria: document.getElementById('pl-categoria').value,
      tipoReconocimiento: document.getElementById('pl-tipo').value,
      fecha: document.getElementById('pl-fecha').value,
      institucion: document.getElementById('pl-institucion').value.trim(),
      descripcion: document.getElementById('pl-descripcion').value.trim(),
    };
    try {
      const res = registro ? await api.put(`/logros/${registro._id}`, cuerpo) : await api.post('/logros', cuerpo);
      toast(res.mensaje, 'exito');
      modal.remove();
      refrescar();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

/* ---------------- Proyectos ---------------- */
function pintarProyectos(el, e, t) {
  el.innerHTML = `
    <div class="fila-extremos mb-2">
      <h2>${icon('briefcase')} Mis proyectos</h2>
      <button class="btn btn-primario btn-sm" id="pj-nuevo">${icon('plus')} Proponer proyecto</button>
    </div>
    ${
      t.proyectos.length
        ? `<div class="rejilla rejilla-2">${t.proyectos
            .map(
              (p) => `
            <div class="tarjeta">
              <div class="tarjeta-cuerpo">
                <div class="fila-extremos">
                  <h3>${esc(p.nombre)}</h3>
                  ${estadoPublicacionBadge(p.estadoPublicacion)}
                </div>
                <p class="descripcion">${esc(p.descripcion)}</p>
                ${p.tecnologias.length ? `<div class="etiquetas mt-1">${p.tecnologias.map((te) => `<span class="etiqueta-suave">${esc(te)}</span>`).join('')}</div>` : ''}
                ${p.comentarioRevision ? `<div class="texto-tenue texto-pequeno mt-1">Revisión: ${esc(p.comentarioRevision)}</div>` : ''}
              </div>
            </div>`
            )
            .join('')}</div>`
        : '<div class="panel texto-suave">Aún no tienes proyectos registrados.</div>'
    }
  `;

  document.getElementById('pj-nuevo').addEventListener('click', () =>
    abrirModal({
      titulo: 'Proponer proyecto',
      contenido: `
        <form class="formulario" novalidate>
          <div class="campo">
            <label class="obligatorio">Nombre del proyecto</label>
            <input id="pj-nombre" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Descripción</label>
            <textarea id="pj-descripcion" data-validar="requerido, max:2000"></textarea>
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label>Tecnologías (separadas por coma)</label>
            <input id="pj-tecnologias" placeholder="JavaScript, Node.js, MySQL" />
          </div>
          <div class="campos-2">
            <div class="campo">
              <label>URL de repositorio</label>
              <input id="pj-repo" placeholder="https://github.com/…" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>URL de demo</label>
              <input id="pj-demo" placeholder="https://…" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
          </div>
        </form>
      `,
      pie: `<button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
            <button class="btn btn-primario" data-acc="guardar">${icon('check')} Enviar propuesta</button>`,
    })
  );

  conectarModalSimple({
    guardar: async () => {
      const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
      const form = modal.querySelector('form');
      if (!validarFormulario(form)) return false;
      const cuerpo = {
        estudiante: sesion.usuario.estudiante,
        nombre: document.getElementById('pj-nombre').value.trim(),
        descripcion: document.getElementById('pj-descripcion').value.trim(),
        tecnologias: document.getElementById('pj-tecnologias').value.split(',').map((s) => s.trim()).filter(Boolean),
        urlRepositorio: document.getElementById('pj-repo').value.trim(),
        urlDemo: document.getElementById('pj-demo').value.trim(),
      };
      const res = await api.post('/proyectos', cuerpo);
      toast(res.mensaje, 'exito');
      modal.remove();
      refrescar();
      return true;
    },
  });
}

/* ---------------- Certificaciones ---------------- */
function pintarCertificaciones(el, e, t) {
  el.innerHTML = `
    <div class="fila-extremos mb-2">
      <h2>${icon('award')} Mis certificaciones</h2>
      <button class="btn btn-primario btn-sm" id="ct-nueva">${icon('plus')} Proponer certificación</button>
    </div>
    ${
      t.certificaciones.length
        ? `<div class="contenedor-tabla">
            <table class="tabla">
              <thead><tr><th>Nombre</th><th>Institución</th><th>Obtención</th><th>Estado</th></tr></thead>
              <tbody>${t.certificaciones
                .map(
                  (c) => `
                <tr>
                  <td><strong>${esc(c.nombre)}</strong>${c.urlCredencial ? ` <a href="${esc(c.urlCredencial)}" target="_blank" rel="noopener noreferrer" class="texto-pequeno">credencial</a>` : ''}</td>
                  <td>${esc(c.institucion)}</td>
                  <td>${esc(formatoFecha(c.fechaObtencion))}</td>
                  <td>${estadoPublicacionBadge(c.estadoPublicacion)}</td>
                </tr>`
                )
                .join('')}</tbody>
            </table>
          </div>`
        : '<div class="panel texto-suave">Aún no tienes certificaciones registradas.</div>'
    }
  `;

  document.getElementById('ct-nueva').addEventListener('click', () =>
    abrirModal({
      titulo: 'Proponer certificación',
      contenido: `
        <form class="formulario" novalidate>
          <div class="campo">
            <label class="obligatorio">Nombre de la certificación o curso</label>
            <input id="ct-nombre" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label class="obligatorio">Institución emisora</label>
            <input id="ct-institucion" data-validar="requerido, max:150" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio">Fecha de obtención</label>
              <input type="date" id="ct-fecha" data-validar="requerido, fecha" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label>URL de credencial</label>
              <input id="ct-url" placeholder="https://…" data-validar="url" />
              <span class="error-mensaje"></span>
            </div>
          </div>
        </form>
      `,
      pie: `<button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
            <button class="btn btn-primario" data-acc="guardar">${icon('check')} Enviar propuesta</button>`,
    })
  );

  conectarModalSimple({
    guardar: async () => {
      const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
      const form = modal.querySelector('form');
      if (!validarFormulario(form)) return false;
      const cuerpo = {
        estudiante: sesion.usuario.estudiante,
        nombre: document.getElementById('ct-nombre').value.trim(),
        institucion: document.getElementById('ct-institucion').value.trim(),
        fechaObtencion: document.getElementById('ct-fecha').value,
        urlCredencial: document.getElementById('ct-url').value.trim(),
      };
      const res = await api.post('/certificaciones', cuerpo);
      toast(res.mensaje, 'exito');
      modal.remove();
      refrescar();
      return true;
    },
  });
}

/* ---------------- Evidencias ---------------- */
function pintarEvidencias(el, e, t, catalogos) {
  el.innerHTML = `
    <div class="fila-extremos mb-2">
      <h2>${icon('image')} Mis evidencias</h2>
      <button class="btn btn-primario btn-sm" id="ev-nueva">${icon('plus')} Proponer evidencia</button>
    </div>
    ${
      t.evidencias.length
        ? `<div class="rejilla-galeria">${t.evidencias
            .map(
              (evi) => `
            <div class="item-galeria" style="cursor:default">
              <img src="${esc(evi.tipo === 'Imagen' && evi.archivoUrl ? evi.archivoUrl : '/public/img/eventos/default.svg')}" alt="" onerror="this.src='/public/img/eventos/default.svg'" />
              <span class="icono-tipo">${icon(evi.tipo === 'Imagen' ? 'image' : evi.tipo === 'Video' ? 'video' : 'link', '')}</span>
              <span class="info-galeria"><strong>${esc(evi.titulo)}</strong>${estadoPublicacionBadge(evi.estadoPublicacion)}</span>
            </div>`
            )
            .join('')}</div>`
        : '<div class="panel texto-suave">Aún no tienes evidencias publicadas. Puedes proponer imágenes, videos o enlaces vinculados a tu trayectoria.</div>'
    }
    <div class="banner-aviso mt-3">${icon('alert')} <div>Solo puedes vincular evidencias a tu propia trayectoria. Las imágenes y videos requieren autorización de todas las personas que aparezcan en ellos.</div></div>
  `;

  document.getElementById('ev-nueva').addEventListener('click', () => formEvidencia(catalogos));
}

function formEvidencia(catalogos) {
  abrirModal({
    titulo: 'Proponer evidencia multimedia',
    grande: true,
    contenido: `
      <form class="formulario" id="form-evidencia" novalidate>
        <div class="campo">
          <label class="obligatorio">Título</label>
          <input id="ev-titulo" data-validar="requerido, max:150" />
          <span class="error-mensaje"></span>
        </div>
        <div class="campos-2">
          <div class="campo">
            <label class="obligatorio">Fecha</label>
            <input type="date" id="ev-fecha" data-validar="requerido, fecha" />
            <span class="error-mensaje"></span>
          </div>
          <div class="campo">
            <label>Tipo</label>
            <select id="ev-tipo">${opcionesSelect(catalogos.tiposEvidencia, 'Imagen')}</select>
          </div>
        </div>
        <div class="campo">
          <label>Descripción</label>
          <textarea id="ev-descripcion" data-validar="max:1000"></textarea>
        </div>
        <div class="campo">
          <label>Archivo (imagen o video) — opcional si agregas URL externa</label>
          <input type="file" id="ev-archivo" accept="image/*,video/*" />
          <span class="ayuda">Imágenes hasta 5 MB; videos hasta 50 MB.</span>
        </div>
        <div class="campo">
          <label>URL externa (YouTube, Vimeo, GitHub…) — si no subes archivo</label>
          <input id="ev-url" placeholder="https://youtube.com/watch?v=…" data-validar="url" />
        </div>
        <div class="campo-check">
          <input type="checkbox" id="ev-autorizado" />
          <label for="ev-autorizado">Confirmo que cuento con la autorización de las personas que aparecen en este material para su publicación.</label>
        </div>
      </form>
    `,
    pie: `<button class="btn btn-secundario" data-acc="cancelar">Cancelar</button>
          <button class="btn btn-primario" data-acc="guardar">${icon('check')} Enviar propuesta</button>`,
  });

  const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
  modal.querySelector('[data-acc="cancelar"]').addEventListener('click', () => modal.remove());
  modal.querySelector('[data-acc="guardar"]').addEventListener('click', async () => {
    const form = document.getElementById('form-evidencia');
    if (!validarFormulario(form)) return;
    if (!document.getElementById('ev-autorizado').checked) {
      toast('Debes confirmar la autorización de publicación.', 'error');
      return;
    }

    const fd = new FormData();
    fd.append('estudiante', sesion.usuario.estudiante);
    fd.append('titulo', document.getElementById('ev-titulo').value.trim());
    fd.append('fecha', document.getElementById('ev-fecha').value);
    fd.append('tipo', document.getElementById('ev-tipo').value);
    fd.append('descripcion', document.getElementById('ev-descripcion').value.trim());
    fd.append('urlExterna', document.getElementById('ev-url').value.trim());
    fd.append('autorizadoPublicacion', 'true');

    const archivo = document.getElementById('ev-archivo').files[0];
    if (archivo) fd.append('archivo', archivo);

    try {
      const res = await api.postForm('/evidencias', fd);
      toast(res.mensaje, 'exito');
      modal.remove();
      refrescar();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

/* ---------------- Auxiliares ---------------- */
function conectarModalSimple({ guardar }) {
  const modal = document.querySelector('#modal-raiz .modal-fondo:last-child');
  if (!modal) return;
  modal.querySelector('[data-acc="cancelar"]')?.addEventListener('click', () => modal.remove());
  modal.querySelector('[data-acc="guardar"]')?.addEventListener('click', async () => {
    try {
      const ok = await guardar();
      if (!ok) return;
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

async function refrescar() {
  const contenedor = document.getElementById('vista');
  const { vistaMiEspacio: vista } = await import('./miEspacio.js');
  vista(contenedor);
}
