import { api, obtenerCatalogos } from '../js/api.js';
import { icon, esc, opcionesSelect, estadoVacio } from '../js/ui.js';
import { tarjetaEstudiante } from '../components/cards.js';
import { montarPaginacion } from '../components/pagination.js';

const estado = { page: 1, q: '', semestre: '' };

export async function vistaPerfiles(contenedor) {
  Object.assign(estado, { page: 1, q: '', semestre: '' });
  const catalogos = await obtenerCatalogos();

  contenedor.innerHTML = `
    <section class="seccion">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('users')}</span>
        <div style="flex:1">
          <h1>Perfiles estudiantiles</h1>
          <p>Conoce a los estudiantes de la Licenciatura en Informática: su trayectoria, habilidades, proyectos y reconocimientos.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="panel-filtros sin-buscador" role="search">
        <div class="caja-buscador" style="grid-column:1/-1">
          ${icon('search', 'icono-buscar')}
          <input type="search" id="fp-q" placeholder="Buscar estudiante por nombre o matrícula…" aria-label="Buscar estudiantes" />
        </div>
        <div class="campo">
          <select id="fp-semestre" aria-label="Filtrar por semestre">
            <option value="">Semestre: todos</option>
            ${opcionesSelect(catalogos.semestres)}
          </select>
        </div>
      </div>

      <p class="texto-tenue" id="fp-conteo" aria-live="polite"></p>
      <div id="fp-lista" class="mt-2"></div>
      <div id="fp-paginacion"></div>
    </section>
  `;

  const $ = (id) => document.getElementById(id);
  let timer = null;

  $('fp-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { estado.q = $('fp-q').value.trim(); estado.page = 1; cargar(); }, 350);
  });
  $('fp-semestre').addEventListener('change', () => { estado.semestre = $('fp-semestre').value; estado.page = 1; cargar(); });

  async function cargar() {
    const lista = document.getElementById('fp-lista');
    lista.innerHTML = '<div class="rejilla rejilla-2"><div class="skeleton" style="height:160px"></div><div class="skeleton" style="height:160px"></div><div class="skeleton" style="height:160px"></div><div class="skeleton" style="height:160px"></div></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.semestre) params.set('semestre', estado.semestre);
    params.set('page', estado.page);
    params.set('limit', 10);

    const res = await api.get(`/estudiantes?${params}`);
    document.getElementById('fp-conteo').textContent =
      res.total === 0 ? 'Sin estudiantes que coincidan.' : `${res.total} estudiante(s) publicado(s)`;

    lista.innerHTML =
      res.datos.length > 0
        ? `<div class="rejilla rejilla-2">${res.datos.map(tarjetaEstudiante).join('')}</div>`
        : estadoVacio('users', 'No encontramos estudiantes', 'Prueba con otro nombre o quita los filtros.');

    montarPaginacion(document.getElementById('fp-paginacion'), res.page, res.pages, (p) => {
      estado.page = p;
      cargar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  await cargar();
  return { limpiar: () => clearTimeout(timer) };
}
