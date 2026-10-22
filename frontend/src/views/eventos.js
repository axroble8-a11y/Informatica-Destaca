import { api, obtenerCatalogos } from '../js/api.js';
import { icon, esc, opcionesSelect, estadoVacio } from '../js/ui.js';
import { tarjetaEvento } from '../components/cards.js';
import { montarPaginacion } from '../components/pagination.js';

const estado = { page: 1, q: '', estado: '', categoria: '', desde: '', hasta: '' };

export async function vistaEventos(contenedor) {
  Object.assign(estado, { page: 1, q: '', estado: '', categoria: '', desde: '', hasta: '' });
  const catalogos = await obtenerCatalogos();

  contenedor.innerHTML = `
    <section class="seccion">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('calendar')}</span>
        <div style="flex:1">
          <h1>Eventos</h1>
          <p>Congresos, concursos, ferias y talleres de la Licenciatura en Informática.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="panel-filtros" role="search">
        <div class="caja-buscador">
          ${icon('search', 'icono-buscar')}
          <input type="search" id="flt-q" placeholder="Buscar evento por nombre, descripción u organizador…" aria-label="Buscar eventos" />
        </div>
        <div class="campo">
          <select id="flt-estado" aria-label="Filtrar por estado">
            <option value="">Estado: todos</option>
            <option value="proximo">Próximos</option>
            <option value="realizado">Realizados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
        <div class="campo">
          <select id="flt-categoria" aria-label="Filtrar por categoría">
            <option value="">Categoría: todas</option>
            ${opcionesSelect(catalogos.categoriasEvento)}
          </select>
        </div>
        <div class="campo">
          <div class="fila" style="gap:.5rem">
            <input type="date" id="flt-desde" aria-label="Desde" title="Desde" style="flex:1" />
            <input type="date" id="flt-hasta" aria-label="Hasta" title="Hasta" style="flex:1" />
          </div>
        </div>
      </div>

      <p class="texto-tenue" id="conteo-eventos" aria-live="polite"></p>
      <div id="lista-eventos" class="mt-2"></div>
      <div id="paginacion-eventos"></div>
    </section>
  `;

  const $ = (id) => document.getElementById(id);
  let timer = null;
  $('flt-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      estado.q = $('flt-q').value.trim();
      estado.page = 1;
      cargar();
    }, 350);
  });
  $('flt-estado').addEventListener('change', () => { estado.estado = $('flt-estado').value; estado.page = 1; cargar(); });
  $('flt-categoria').addEventListener('change', () => { estado.categoria = $('flt-categoria').value; estado.page = 1; cargar(); });
  $('flt-desde').addEventListener('change', () => { estado.desde = $('flt-desde').value; estado.page = 1; cargar(); });
  $('flt-hasta').addEventListener('change', () => { estado.hasta = $('flt-hasta').value; estado.page = 1; cargar(); });

  async function cargar() {
    const lista = document.getElementById('lista-eventos');
    lista.innerHTML = '<div class="rejilla rejilla-3"><div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.estado) params.set('estado', estado.estado);
    if (estado.categoria) params.set('categoria', estado.categoria);
    if (estado.desde) params.set('desde', estado.desde);
    if (estado.hasta) params.set('hasta', estado.hasta);
    params.set('page', estado.page);
    params.set('limit', 9);

    const res = await api.get(`/eventos?${params}`);
    document.getElementById('conteo-eventos').textContent =
      res.total === 0 ? 'Sin eventos que coincidan con los filtros.' : `${res.total} evento(s) encontrado(s)`;

    lista.innerHTML =
      res.datos.length > 0
        ? `<div class="rejilla rejilla-3">${res.datos.map(tarjetaEvento).join('')}</div>`
        : estadoVacio('calendar', 'No encontramos eventos', 'Prueba con otros filtros de búsqueda.');

    montarPaginacion(document.getElementById('paginacion-eventos'), res.page, res.pages, (p) => {
      estado.page = p;
      cargar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  await cargar();
  return { limpiar: () => clearTimeout(timer) };
}
