import { iniciarSesion } from '../js/auth.js';
import { icon, toast, validarFormulario, datosFormulario } from '../js/ui.js';
import { refrescarNavbar } from '../components/navbar.js';
import { navegar } from '../js/router.js';

export async function vistaLogin(contenedor) {
  contenedor.innerHTML = `
    <div class="pagina-auth">
      <div class="tarjeta-auth">
        <div class="cabecera-auth">
          <img src="/public/img/logo.svg" alt="Logotipo Informática Destaca" />
          <h1 style="font-size:1.4rem">Iniciar sesión</h1>
          <p class="texto-suave texto-pequeno">Accede con tu cuenta institucional de la plataforma.</p>
        </div>

        <form class="formulario" id="form-login" novalidate>
          <div class="campo">
            <label class="obligatorio" for="login-email">Correo electrónico</label>
            <input type="email" id="login-email" name="email" placeholder="tucorreo@informatica.edu" data-validar="requerido, email" autocomplete="email" />
            <span class="error-mensaje"></span>
          </div>

          <div class="campo">
            <label class="obligatorio" for="login-password">Contraseña</label>
            <div class="vista-password">
              <input type="password" id="login-password" name="password" placeholder="Tu contraseña" data-validar="requerido" autocomplete="current-password" />
              <button type="button" id="btn-ver-password" aria-label="Mostrar u ocultar contraseña">${icon('eye')}</button>
            </div>
            <span class="error-mensaje"></span>
          </div>

          <button class="btn btn-primario btn-bloque btn-lg" type="submit" id="btn-entrar">${icon('lock')} Entrar</button>
        </form>

        <p class="texto-centrado mt-2 texto-pequeno">
          ¿No tienes cuenta? <a href="#/registro">Regístrate como estudiante</a>
        </p>
      </div>
    </div>
  `;

  document.getElementById('btn-ver-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  const form = document.getElementById('form-login');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario(form)) return;

    const btn = document.getElementById('btn-entrar');
    btn.disabled = true;
    btn.innerHTML = '<span class="girando"></span> Verificando…';

    try {
      const { email, password } = datosFormulario(form);
      const usuario = await iniciarSesion(email, password);
      toast(`Bienvenido, ${usuario.nombre}.`, 'exito');
      refrescarNavbar();

      const destino = sessionStorage.getItem('idestaca_destino');
      sessionStorage.removeItem('idestaca_destino');
      navegar(destino && destino !== '#/login' ? destino.slice(1) : usuario.rol === 'estudiante' ? '/mi-espacio' : '/admin');
    } catch (err) {
      toast(err.message, 'error', 6000);
      btn.disabled = false;
      btn.innerHTML = `${icon('lock')} Entrar`;
    }
  });
}
