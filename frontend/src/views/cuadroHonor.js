import { api, obtenerCatalogos } from '../js/api.js';
import { icon, esc, opcionesSelect, estadoVacio } from '../js/ui.js';
import { tarjetaLogro } from '../components/cards.js';
import { montarPaginacion } from '../components/pagination.js';
import { htmlCuadroHonorDestacados, montarCarruselCuadroHonor } from '../components/cuadroHonorDestacados.js';

const estado = { page: 1, q: '', categoria: '', tipo: '', destacado: false, desde: '', hasta: '' };

export async function vistaCuadroHonor(contenedor) {
  Object.assign(estado, { page: 1, q: '', categoria: '', tipo: '', destacado: false, desde: '', hasta: '' });
  const catalogos = await obtenerCatalogos();

  contenedor.innerHTML = `
    <section class="hero" style="padding:2rem 1.5rem">
      <div class="hero-contenido">
        <span class="etiqueta-hero">${icon('trophy')} Reconocimiento estudiantil</span>
        <h1>Cuadro de Honor</h1>
        <p>Estudiantes de la Licenciatura en Informática cuyo esfuerzo, talento y resultados
        los hacen merecedores de este reconocimiento público.</p>
      </div>
    </section>

    ${htmlCuadroHonorDestacados('cuadro-honor-perfiles')}

    <section class="seccion">
      <div class="panel-filtros sin-buscador" role="search">
        <div class="caja-buscador" style="grid-column:1/-1">
          ${icon('search', 'icono-buscar')}
          <input type="search" id="fh-q" placeholder="Buscar logro por nombre, descripción o institución…" aria-label="Buscar logros" />
        </div>
        <div class="campo">
          <select id="fh-categoria" aria-label="Filtrar por categoría">
            <option value="">Categoría: todas</option>
            ${opcionesSelect(catalogos.categoriasLogro)}
          </select>
        </div>
        <div class="campo">
          <select id="fh-tipo" aria-label="Filtrar por tipo de reconocimiento">
            <option value="">Tipo: todos</option>
            ${opcionesSelect(catalogos.tiposReconocimiento)}
          </select>
        </div>
        <div class="campo">
          <div class="fila" style="gap:.5rem">
            <input type="date" id="fh-desde" aria-label="Desde" title="Fecha desde" style="flex:1" />
            <input type="date" id="fh-hasta" aria-label="Hasta" title="Fecha hasta" style="flex:1" />
          </div>
        </div>
      </div>

      <div class="chips mb-2">
        <button class="chip" id="fh-destacados">${icon('star')} Solo destacados</button>
      </div>

      <p class="texto-tenue" id="fh-conteo" aria-live="polite"></p>
      <div id="fh-lista" class="mt-2"></div>
      <div id="fh-paginacion"></div>
    </section>
  `;

  const $ = (id) => document.getElementById(id);
  let timer = null;

  $('fh-q').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { estado.q = $('fh-q').value.trim(); estado.page = 1; cargar(); }, 350);
  });
  $('fh-categoria').addEventListener('change', () => { estado.categoria = $('fh-categoria').value; estado.page = 1; cargar(); });
  $('fh-tipo').addEventListener('change', () => { estado.tipo = $('fh-tipo').value; estado.page = 1; cargar(); });
  $('fh-desde').addEventListener('change', () => { estado.desde = $('fh-desde').value; estado.page = 1; cargar(); });
  $('fh-hasta').addEventListener('change', () => { estado.hasta = $('fh-hasta').value; estado.page = 1; cargar(); });
  $('fh-destacados').addEventListener('click', () => {
    estado.destacado = !estado.destacado;
    $('fh-destacados').classList.toggle('activo', estado.destacado);
    estado.page = 1;
    cargar();
  });

  async function cargar() {
    const lista = document.getElementById('fh-lista');
    lista.innerHTML = '<div class="rejilla rejilla-3"><div class="skeleton" style="height:290px"></div><div class="skeleton" style="height:290px"></div><div class="skeleton" style="height:290px"></div></div>';

    const params = new URLSearchParams();
    if (estado.q) params.set('q', estado.q);
    if (estado.categoria) params.set('categoria', estado.categoria);
    if (estado.tipo) params.set('tipo', estado.tipo);
    if (estado.destacado) params.set('destacado', 'true');
    if (estado.desde) params.set('desde', estado.desde);
    if (estado.hasta) params.set('hasta', estado.hasta);
    params.set('page', estado.page);
    params.set('limit', 9);

    const res = await api.get(`/logros?${params}`);
    document.getElementById('fh-conteo').textContent =
      res.total === 0 ? 'Sin logros que coincidan con los filtros.' : `${res.total} logro(s) en el cuadro de honor`;

    lista.innerHTML =
      res.datos.length > 0
        ? `<div class="rejilla rejilla-3">${res.datos.map(tarjetaLogro).join('')}</div>`
        : estadoVacio('trophy', 'Aún no hay logros aquí', 'Cuando la coordinación apruebe reconocimientos aparecerán en este espacio.');

    montarPaginacion(document.getElementById('fh-paginacion'), res.page, res.pages, (p) => {
      estado.page = p;
      cargar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  await cargar();
  const limpiarCarrusel = montarCarruselCuadroHonor(document.getElementById('cuadro-honor-perfiles'));
  return {
    limpiar: () => {
      clearTimeout(timer);
      limpiarCarrusel();
    },
  };
}
