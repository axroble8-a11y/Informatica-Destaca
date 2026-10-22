import { registrarCuenta } from '../js/auth.js';
import { icon, toast, validarFormulario, datosFormulario, esc } from '../js/ui.js';
import { obtenerCatalogos } from '../js/api.js';
import { refrescarNavbar } from '../components/navbar.js';
import { navegar } from '../js/router.js';

export async function vistaRegistro(contenedor) {
  const catalogos = await obtenerCatalogos();

  contenedor.innerHTML = `
    <div class="pagina-auth" style="max-width:560px">
      <div class="tarjeta-auth">
        <div class="cabecera-auth">
          <img src="/public/img/logo.svg" alt="Logotipo Informática Destaca" />
          <h1 style="font-size:1.4rem">Crear cuenta de estudiante</h1>
          <p class="texto-suave texto-pequeno">
            Regístrate para proponer la información de tu trayectoria (participaciones, logros,
            proyectos y evidencias). Tu perfil se publicará cuando la coordinación lo apruebe.
          </p>
        </div>

        <form class="formulario" id="form-registro" novalidate>
          <div class="campos-2">
            <div class="campo">
              <label class="obligatorio" for="rg-nombre">Nombre(s)</label>
              <input id="rg-nombre" name="nombre" placeholder="Ana Sofía" data-validar="requerido, max:80" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio" for="rg-apellidos">Apellidos</label>
              <input id="rg-apellidos" name="apellidos" placeholder="Ramírez Vega" data-validar="requerido, max:80" />
              <span class="error-mensaje"></span>
            </div>
          </div>

          <div class="campos-3">
            <div class="campo">
              <label class="obligatorio" for="rg-matricula">Matrícula</label>
              <input id="rg-matricula" name="matricula" placeholder="AAA-2201" class="texto-mono" data-validar="requerido" />
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label class="obligatorio" for="rg-semestre">Semestre</label>
              <select id="rg-semestre" name="semestre" data-validar="requerido">
                ${opcionesSelect(catalogos.semestres)}
              </select>
              <span class="error-mensaje"></span>
            </div>
            <div class="campo">
              <label for="rg-generacion">Generación (opcional)</label>
              <input id="rg-generacion" name="generacion" placeholder="2022-2026" data-validar="max:20" />
              <span class="error-mensaje"></span>
            </div>
          </div>

          <div class="campo">
            <label class="obligatorio" for="rg-email">Correo electrónico</label>
            <input type="email" id="rg-email" name="email" placeholder="tucorreo@alumno.utv.edu" data-validar="requerido, email" autocomplete="email" />
            <span class="error-mensaje"></span>
          </div>

          <div class="campo">
            <label class="obligatorio" for="rg-password">Contraseña</label>
            <div class="vista-password">
              <input type="password" id="rg-password" name="password" placeholder="Mínimo 8 caracteres, letras y números"
                     data-validar="requerido, passwordFuerte" autocomplete="new-password" />
              <button type="button" id="rg-ver" aria-label="Mostrar u ocultar contraseña">${icon('eye')}</button>
            </div>
            <span class="ayuda">Usa al menos 8 caracteres combinando letras y números.</span>
            <span class="error-mensaje"></span>
          </div>

          <div class="campo-check">
            <input type="checkbox" id="rg-acepto" data-validar="requerido" />
            <label for="rg-acepto">He leído el <a href="#/aviso-privacidad" target="_blank">aviso de privacidad</a> y autorizo el
            tratamiento de mis datos conforme a él. La publicación de fotografías y datos personales requerirá
            autorización expresa.</label>
          </div>
          <span class="error-mensaje" id="rg-acepto-error" style="display:none;color:var(--c-error);font-size:.8rem;font-weight:600">Debes aceptar el aviso de privacidad</span>

          <button class="btn btn-primario btn-bloque btn-lg" type="submit" id="btn-registrar">${icon('user')} Crear cuenta</button>
        </form>

        <p class="texto-centrado mt-2 texto-pequeno">
          ¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  `;

  document.getElementById('rg-ver').addEventListener('click', () => {
    const input = document.getElementById('rg-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  const form = document.getElementById('form-registro');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const acepta = document.getElementById('rg-acepto').checked;
    document.getElementById('rg-acepto-error').style.display = acepta ? 'none' : 'block';
    if (!acepta || !validarFormulario(form)) return;

    if (!/^[A-Za-z0-9-]{4,20}$/.test(document.getElementById('rg-matricula').value.trim())) {
      toast('La matrícula debe tener entre 4 y 20 caracteres alfanuméricos.', 'error');
      return;
    }

    const btn = document.getElementById('btn-registrar');
    btn.disabled = true;
    btn.innerHTML = '<span class="girando"></span> Creando cuenta…';

    try {
      const datos = datosFormulario(form);
      await registrarCuenta(datos);
      toast('¡Cuenta creada! Ya puedes proponer la información de tu trayectoria.', 'exito', 6000);
      refrescarNavbar();
      navegar('/mi-espacio');
    } catch (err) {
      toast(err.message, 'error', 6500);
      btn.disabled = false;
      btn.innerHTML = `${icon('user')} Crear cuenta`;
    }
  });
}
