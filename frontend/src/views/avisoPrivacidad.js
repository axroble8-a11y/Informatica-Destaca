import { icon, esc } from '../js/ui.js';

export async function vistaAvisoPrivacidad(contenedor) {
  contenedor.innerHTML = `
    <section class="seccion" style="max-width:860px;margin-inline:auto">
      <div class="encabezado-seccion">
        <span class="icono-seccion">${icon('shield')}</span>
        <div>
          <h1>Aviso de privacidad</h1>
          <p>Tratamiento de datos personales en Informática Destaca.</p>
          <div class="linea-gradiente"></div>
        </div>
      </div>

      <div class="panel">
        <p class="texto-tenue">Última actualización: octubre de 2026 · Proyecto académico de la Licenciatura en Informática.</p>

        <h2 class="mt-2" style="font-size:1.1rem">1. Responsable del tratamiento</h2>
        <p class="texto-suave">
          La Coordinación de la Licenciatura en Informática es responsable del tratamiento de los datos
          personales recopilados a través de la plataforma <strong>Informática Destaca</strong>, cuyo propósito
          es difundir logros estudiantiles, administrar eventos académicos y construir la trayectoria
          digital de los estudiantes.
        </p>

        <h2 class="mt-3" style="font-size:1.1rem">2. Datos que se recopilan</h2>
        <ul class="texto-suave">
          <li><strong>Datos de identificación académica:</strong> nombre, apellidos, matrícula, semestre y generación.</li>
          <li><strong>Datos de contacto:</strong> correo electrónico institucional o personal.</li>
          <li><strong>Contenido aportado voluntariamente:</strong> fotografía, presentación profesional, áreas de interés, habilidades, proyectos, certificaciones, participaciones en eventos, logros y evidencias multimedia.</li>
          <li><strong>Datos de acceso:</strong> correo y contraseña cifrada de la cuenta de usuario.</li>
        </ul>

        <h2 class="mt-3" style="font-size:1.1rem">3. Finalidades</h2>
        <ul class="texto-suave">
          <li>Publicar el Cuadro de Honor y los perfiles estudiantiles autorizados.</li>
          <li>Registrar y difundir eventos académicos, tecnológicos y culturales.</li>
          <li>Integrar el historial de participaciones y reconocimientos de cada estudiante.</li>
          <li>Permitir la consulta y exportación del currículum digital del estudiante.</li>
        </ul>

        <h2 class="mt-3" style="font-size:1.1rem">4. Autorización de publicación</h2>
        <p class="texto-suave">
          Ninguna fotografía, video ni dato personal se publica sin la <strong>autorización correspondiente</strong>.
          Cada estudiante otorga o retira su <em>consentimiento de publicación</em> desde su cuenta, y el
          material multimedia se somete a un flujo de revisión y aprobación antes de ser visible en el
          portal público. Puedes solicitar en cualquier momento la actualización, rectificación o
          eliminación de tus datos escribiendo a
          <a href="mailto:informatica.destaca@utv.edu">informatica.destaca@utv.edu</a>.
        </p>

        <h2 class="mt-3" style="font-size:1.1rem">5. Seguridad</h2>
        <p class="texto-suave">
          Las contraseñas se almacenan cifradas (bcrypt) y nunca en texto plano. El acceso a la
          información privada está restringido mediante autenticación JWT y control de roles
          (administrador, responsable de contenido y estudiante). Las rutas de administración están
          protegidas tanto en el servidor como en la interfaz.
        </p>

        <h2 class="mt-3" style="font-size:1.1rem">6. Datos de prueba</h2>
        <p class="texto-suave">
          Esta plataforma es un proyecto académico: los perfiles, eventos y logros mostrados en el modo
          de demostración corresponden a <strong>datos ficticios</strong> coherentes con el contexto
          universitario y no representan personas reales.
        </p>
      </div>
    </section>
  `;
}
