import { icon, estadoVacio } from '../js/ui.js';

export async function vistaNotFound(contenedor) {
  contenedor.innerHTML = `
    ${estadoVacio('search', 'Página no encontrada', 'La dirección que buscas no existe o fue movida.')}
    <p class="texto-centrado"><a class="btn btn-primario" href="#/">${icon('home')} Volver al inicio</a></p>
  `;
}
