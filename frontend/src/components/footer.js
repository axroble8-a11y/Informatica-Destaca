import { icon } from '../js/ui.js';

export function renderFooter() {
  const pie = document.getElementById('pie-pagina');
  pie.innerHTML = `
    <div class="pie">
      <div class="contenedor">
        <div class="pie-grid">
          <div>
            <div class="marca-pie">
              <img src="/public/img/logo-blanco.svg" alt="Logotipo Informática Destaca" />
              <div>
                <strong style="color:#fff">Informática Destaca</strong>
                <div class="texto-pequeno" style="color:#d9c9a3">Plataforma de reconocimiento, eventos y trayectoria estudiantil</div>
              </div>
            </div>
            <p class="texto-pequeno" style="max-width:420px; color:#d9c9a3">
              Difundimos los logros de nuestra comunidad estudiantil, administramos eventos académicos
              y tecnológicos, y construimos un historial verificable que integra el currículum digital
              de cada estudiante de la Licenciatura en Informática.
            </p>
          </div>

          <div>
            <h4>Secciones</h4>
            <ul>
              <li><a href="#/cuadro-honor">Cuadro de Honor</a></li>
              <li><a href="#/perfiles">Perfiles estudiantiles</a></li>
              <li><a href="#/eventos">Eventos</a></li>
              <li><a href="#/galeria">Galería multimedia</a></li>
              <li><a href="#/buscador">Buscador</a></li>
            </ul>
          </div>

          <div>
            <h4>Contacto institucional</h4>
            <ul>
              <li>${icon('map-pin')} Edificio de Ingeniería, Campus Universitario</li>
              <li>${icon('mail')} <a href="mailto:informatica.destaca@utv.edu">informatica.destaca@utv.edu</a></li>
              <li>${icon('globe')} <a href="#/aviso-privacidad">Aviso de privacidad</a></li>
              <li>${icon('shield')} <a href="#/login">Acceso administrativo</a></li>
            </ul>
          </div>
        </div>

        <div class="pie-pie">
          <span>© ${new Date().getFullYear()} Licenciatura en Informática · Proyecto académico de desarrollo web.</span>
          <span>Las fotografías y datos personales se publican con autorización de sus titulares.</span>
        </div>
      </div>
    </div>
  `;
}
