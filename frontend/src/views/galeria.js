import { api, obtenerCatalogos } from '../js/api.js';
import { icon, esc, estadoVacio, opcionesSelect } from '../js/ui.js';
import { itemGaleria, verEvidencia } from '../components/cards.js';
import { montarPaginacion } from '../components/pagination.js';

const estado = { page: 1, tipo: '', evento: '' };

export async function vistaGaleria(contenedor) {
  Object.assign(estado, { page: 1, tipo: '', evento: '' });
  const [catalogos, eventos] = await Promise.all([
    obtenerCatalogos(),
    api.get('/eventos?limit=60&estado=&orden=desc'),
  ]);

  contenedor.innerHTML = `
    <section class="seccion">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('image')}</span>
        <div style="flex:1">
          <h1>Galería multimedia</h1>
          <p>Fotografías, videos y enlaces de los eventos y logros de la comunidad.
          Todo el material publicado cuenta con autorización de quienes aparecen en él.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="panel-filtros sin-buscador">
        <div class="caja-buscador" style="grid-column:1/-1">
          ${icon('search', 'icono-buscar')}
          <input type="search" id="fg-q" placeholder="Buscar por título…" aria-label="Buscar en la galería" />
        </div>
        <div class="campo">
          <select id="fg-tipo" aria-label="Filtrar por tipo de multimedia">
            <option value="">Tipo: todos</option>
            ${opcionesSelect(catalogos.tiposEvidencia)}
          </select>
        </div>
        <div class="campo">
          <select id="fg-evento" aria-label="Filtrar por evento">
            <option value="">Evento: todos</option>
            ${eventos.datos.map((e) => `<option value="${e._id}">${esc(e.nombre)}</option>`).join('')}
          </select>
        </div>
      </div>

      <p class="texto-tenue" id="fg-conteo" aria-live="polite"></p>
      <div id="fg-lista" class="mt-2"></div>
      <div id="fg-paginacion"></div>
    </section>
  `;

  const $ = (id) => document.getElementById(id);
  let timer = null;

  $('fg-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { estado.q = $('fg-q').value.trim(); estado.page = 1; cargar(); }, 350);
  });
  $('fg-tipo').addEventListener('change', () => { estado.tipo = $('fg-tipo').value; estado.page = 1; cargar(); });
  $('fg-evento').addEventListener('change', () => { estado.evento = $('fg-evento').value; estado.page = 1; cargar(); });

  async function cargar() {
    const lista = document.getElementById('fg-lista');
    lista.innerHTML = '<div class="rejilla-galeria"><div class="skeleton" style="aspect-ratio:4/3"></div><div class="skeleton" style="aspect-ratio:4/3"></div><div class="skeleton" style="aspect-ratio:4/3"></div><div class="skeleton" style="aspect-ratio:4/3"></div></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.tipo) params.set('tipo', estado.tipo);
    if (estado.evento) params.set('evento', estado.evento);
    params.set('page', estado.page);
    params.set('limit', 16);

    const res = await api.get(`/evidencias?${params}`);
    document.getElementById('fg-conteo').textContent =
      res.total === 0 ? 'Sin material que coincida con los filtros.' : `${res.total} elemento(s) en la galería`;

    lista.innerHTML = '';
    if (res.datos.length === 0) {
      lista.innerHTML = estadoVacio('image', 'Galería vacía', 'No hay material publicado con esos filtros.');
    } else {
      res.datos.forEach((evi) => lista.appendChild(itemGaleria(evi, { abrirDetalle: verEvidencia })));
    }

    montarPaginacion(document.getElementById('fg-paginacion'), res.page, res.pages, (p) => {
      estado.page = p;
      cargar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  await cargar();
  return { limpiar: () => clearTimeout(timer) };
}
