/**
 * Controles de paginación reutilizables.
 * mountPaginacion(contenedor, {page, pages, alCambiar})
 */
export function htmlPaginacion(page, pages) {
  if (pages <= 1) return '';
  const maximo = 5;
  let inicio = Math.max(1, page - Math.floor(maximo / 2));
  const fin = Math.min(pages, inicio + maximo - 1);
  if (fin - inicio + 1 < maximo) inicio = Math.max(1, fin - maximo + 1);

  let botones = '';
  botones += `<button data-pag="${page - 1}" ${page <= 1 ? 'disabled' : ''} aria-label="Página anterior">‹</button>`;
  if (inicio > 1) botones += `<button data-pag="1">1</button><button disabled>…</button>`;
  for (let p = inicio; p <= fin; p++) {
    botones += `<button data-pag="${p}" class="${p === page ? 'activo' : ''}" ${p === page ? 'aria-current="page"' : ''}>${p}</button>`;
  }
  if (fin < pages) botones += `<button disabled>…</button><button data-pag="${pages}">${pages}</button>`;
  botones += `<button data-pag="${page + 1}" ${page >= pages ? 'disabled' : ''} aria-label="Página siguiente">›</button>`;

  return `<nav class="paginacion" aria-label="Paginación">${botones}</nav>`;
}

export function montarPaginacion(contenedor, page, pages, alCambiar) {
  contenedor.innerHTML = htmlPaginacion(page, pages);
  contenedor.querySelectorAll('button[data-pag]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const destino = parseInt(btn.dataset.pag, 10);
      if (destino >= 1 && destino <= pages && destino !== page) alCambiar(destino);
    });
  });
}
