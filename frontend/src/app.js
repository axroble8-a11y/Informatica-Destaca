/**
 * Informática Destaca - Aplicación principal del cliente.
 * Registra las rutas del portal público, el panel de administración
 * y el espacio del estudiante, e inicializa navbar, footer y router.
 */
import { cargarSesion } from './js/auth.js';
import { iniciarRouter, registrar } from './js/router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFooter } from './components/footer.js';

import { vistaHome } from './views/home.js';
import { vistaCuadroHonor } from './views/cuadroHonor.js';
import { vistaPerfiles } from './views/perfiles.js';
import { vistaPerfilDetalle } from './views/perfilDetalle.js';
import { vistaPerfilDestacado } from './views/perfilDestacado.js';
import { vistaEventos } from './views/eventos.js';
import { vistaCertamenes } from './views/certamenes.js';
import { vistaEventoDetalle } from './views/eventoDetalle.js';
import { vistaGaleria } from './views/galeria.js';
import { vistaBuscador } from './views/buscador.js';
import { vistaLogin } from './views/login.js';
import { vistaRegistro } from './views/registro.js';
import { vistaAvisoPrivacidad } from './views/avisoPrivacidad.js';
import { vistaDemostracion } from './views/demostracion.js';
import { vistaNotFound } from './views/notFound.js';

import { vistaDashboard } from './admin/dashboard.js';
import { vistaAdminEstudiantes } from './admin/estudiantes.js';
import { vistaAdminEventos } from './admin/eventos.js';
import { vistaAdminParticipaciones } from './admin/participaciones.js';
import { vistaAdminLogros } from './admin/logros.js';
import { vistaAdminTrayectoria } from './admin/trayectoria.js';
import { vistaAdminEvidencias } from './admin/evidencias.js';
import { vistaAdminUsuarios } from './admin/usuarios.js';
import { vistaAdminAprobaciones } from './admin/aprobaciones.js';

import { vistaMiEspacio } from './views/miEspacio.js';

const CON_ADMIN = ['administrador', 'responsable'];

async function main() {
  renderFooter();
  await cargarSesion();
  renderNavbar();

  // Rutas públicas
  registrar('/', { vista: vistaHome });
  registrar('/cuadro-honor', { vista: vistaCuadroHonor });
  registrar('/perfiles', { vista: vistaPerfiles });
  registrar('/perfiles/destacado/:id', { vista: vistaPerfilDestacado });
  registrar('/perfiles/:id', { vista: vistaPerfilDetalle });
  registrar('/eventos', { vista: vistaEventos });
  registrar('/certamenes', { vista: vistaCertamenes });
  registrar('/eventos/:id', { vista: vistaEventoDetalle });
  registrar('/galeria', { vista: vistaGaleria });
  registrar('/buscador', { vista: vistaBuscador });
  registrar('/login', { vista: vistaLogin });
  registrar('/registro', { vista: vistaRegistro });
  registrar('/aviso-privacidad', { vista: vistaAvisoPrivacidad });
  registrar('/demostracion', { vista: vistaDemostracion });

  // Espacio del estudiante autenticado
  registrar('/mi-espacio', { vista: vistaMiEspacio, protegida: true, roles: ['estudiante'] });

  // Panel de administración (admin + responsable; secciones extra solo admin)
  registrar('/admin', { vista: vistaDashboard, protegida: true, roles: CON_ADMIN });
  registrar('/admin/estudiantes', { vista: vistaAdminEstudiantes, protegida: true, roles: CON_ADMIN });
  registrar('/admin/eventos', { vista: vistaAdminEventos, protegida: true, roles: CON_ADMIN });
  registrar('/admin/participaciones', { vista: vistaAdminParticipaciones, protegida: true, roles: CON_ADMIN });
  registrar('/admin/logros', { vista: vistaAdminLogros, protegida: true, roles: CON_ADMIN });
  registrar('/admin/trayectoria', { vista: vistaAdminTrayectoria, protegida: true, roles: CON_ADMIN });
  registrar('/admin/evidencias', { vista: vistaAdminEvidencias, protegida: true, roles: CON_ADMIN });
  registrar('/admin/usuarios', { vista: vistaAdminUsuarios, protegida: true, roles: ['administrador'] });
  registrar('/admin/aprobaciones', { vista: vistaAdminAprobaciones, protegida: true, roles: ['administrador'] });

  registrar('/404', { vista: vistaNotFound });

  iniciarRouter();
}

main();
