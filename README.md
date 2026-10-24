# Informática Destaca

**Plataforma web de reconocimiento, eventos y trayectoria estudiantil** para la Licenciatura en Informática.

La plataforma difunde públicamente los logros del estudiantado (Cuadro de Honor), administra la oferta de eventos académicos y tecnológicos, documenta las participaciones (asistente, expositor, concursante, organizador, colaborador), gestiona una galería multimedia con autorización expresa de publicación y construye, para cada estudiante, un **CV digital** con su trayectoria completa e imprimible a PDF.

Toda la información pasa por un **flujo de revisión y aprobación** controlado por roles, y los datos personales y fotografías solo se publican con el **consentimiento** del titular (aviso de privacidad integrado).

---

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 (mobile-first, identidad Stitch con Pantone 7421 C `#691C32`, 7420 C `#9F2241`, 468 C `#DDC9A3` y 465 C `#C49953`), JavaScript ES6+ (SPA sin build, módulos nativos, router por hash); tipografías Inter, Plus Jakarta Sans y JetBrains Mono |
| Backend | Node.js + Express 4, arquitectura modular (`routes → controllers → models`) |
| Base de datos | MongoDB con Mongoose 8 (schemas normalizados, referencias pobladas, sin duplicación de datos) |
| Autenticación | JWT (`jsonwebtoken`) + hash de contraseñas (`bcryptjs`) + roles y permisos por middleware |
| Validación | Cliente (validador declarativo propio) + servidor (`express-validator`) |
| Archivos | `multer` (imágenes y videos en `backend/uploads/`) |
| Seguridad extra | `helmet`, `cors`, `express-rate-limit` (login), escape de HTML anti-XSS en todo el frontend |
| Notificaciones | Sistema propio de toasts, modales y confirmaciones estilo SweetAlert (sin dependencias externas, funciona sin internet) |

---

## 2. Estructura del proyecto

```
informatica-destaca/
├── backend/
│   ├── src/
│   │   ├── config/            # env.js (variables de entorno), db.js (conexión + modo demo)
│   │   ├── models/            # Usuario, Estudiante, Evento, Participacion,
│   │   │                      # Logro, Proyecto, Certificacion, Evidencia
│   │   ├── controllers/       # lógica de negocio por entidad
│   │   ├── routes/            # definición REST + reglas de validación
│   │   ├── middlewares/       # auth (JWT + roles), validate, upload, errorHandler
│   │   ├── seed/              # seed.js: datos de prueba ficticios coherentes
│   │   └── server.js          # punto de entrada (también sirve el frontend)
│   ├── uploads/               # archivos subidos (imágenes/videos de evidencias)
│   ├── .env.example           # plantilla de variables de entorno
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── public/img/            # logo, favicon, avatares y portadas (SVG)
│   ├── src/
│   │   ├── app.js             # registro de rutas y arranque
│   │   ├── router.js          # router por hash con guardas de sesión/rol
│   │   ├── api.js             # cliente HTTP (fetch) con token JWT
│   │   ├── auth.js            # sesión, login, registro, roles
│   │   ├── ui.js              # iconos SVG, toasts, modales, validación de formularios
│   │   ├── assets/css/        # styles.css (sistema de diseño) + print.css (CV imprimible)
│   │   ├── components/        # navbar, footer, tarjetas, paginación
│   │   ├── views/             # home, cuadro de honor, perfiles + CV, eventos, galería,
│   │   │                      # buscador, login, registro, aviso de privacidad, guía demo y mi espacio
│   │   └── admin/             # panel: dashboard, CRUDs, usuarios, aprobaciones
│   └── package.json
└── README.md
```

---

## 3. Requisitos previos

- **Node.js 18 o superior** (probado con Node 20/24). Descárgalo de <https://nodejs.org>.
- **MongoDB** (opcional, ver punto 4.2):
  - **Opción A (recomendada para clase):** MongoDB Community Server <https://www.mongodb.com/try/download/community> — instala el servicio en `127.0.0.1:27017`.
  - **Opción B (sin instalar nada):** la plataforma arranca en **modo demo** con una base de datos efímera en memoria (`mongodb-memory-server`) y siembra los datos automáticamente.

> El modo demo también se activa automáticamente si MongoDB no responde y `ENABLE_MEMORY_DB=true`. Al detener el servidor se pierden los cambios (es una demo, no hay instalación de BD).

---

## 4. Instalación paso a paso

### 4.1 Variables de entorno (`.env`)

1. Copia la plantilla:

   ```bash
   cd backend
   cp .env.example .env      # Windows CMD: copy .env.example .env
   ```

2. Abre `backend/.env` y ajusta lo mínimo necesario:

   ```env
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/informatica_destaca
   ENABLE_MEMORY_DB=true                 # fallback a BD en memoria si no hay MongoDB
   JWT_SECRET=cambia-esta-frase-secreta-larga
   JWT_EXPIRES_IN=8h
   MAX_IMAGE_SIZE=5242880                # 5 MB
   MAX_VIDEO_SIZE=52428800               # 50 MB
   ```

   - `JWT_SECRET`: **cámbialo** por una cadena larga y aleatoria.
   - `MONGODB_URI`: deja la URI local, o apunta a Atlas (`mongodb+srv://usuario:password@cluster/...`).

### 4.2 Levantar la base de datos

**Con MongoDB instalado (Opción A):** el servicio de Windows/Linux ya corre en segundo plano. Verifica:

```bash
mongosh --eval "db.version()"     # o: mongo --eval "db.version()"
```

**Sin MongoDB (Opción B):** no hagas nada; asegúrate de que `ENABLE_MEMORY_DB=true` en `.env`.

### 4.3 Instalar dependencias y ejecutar el backend

```bash
cd backend
npm install
npm run dev        # desarrollo con recarga (nodemon)
# ó
npm start          # producción simple
```

Al arrancar verás:

```
[db] MongoDB conectado: 127.0.0.1:27017/informatica_destaca
[seed] Base de datos vacía: cargando datos de prueba...
========================================================
  INFORMÁTICA DESTACA - Servidor iniciado
  URL     : http://localhost:4000
  API     : http://localhost:4000/api
========================================================
```

El backend **sirve también el frontend**: abre <http://localhost:4000> y ya tienes la aplicación completa.

**Comandos del seed:**

```bash
npm run seed          # siembra solo si la base está vacía
npm run seed:fresh    # borra todo y vuelve a sembrar (datos de prueba limpios)
```

### 4.4 Ejecutar el frontend como servidor independiente (opcional)

Normalmente **no hace falta** (el backend ya lo sirve en el puerto 4000). Para desarrollo aislado:

```bash
cd frontend
npm install
npm start             # sirve en http://localhost:5500 y redirige la API al 4000
```

---

## 5. Cuentas de prueba (sembradas automáticamente)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@informatica.edu` | `Admin123*` |
| Responsable de contenido | `responsable@informatica.edu` | `Responsable123*` |
| Estudiante | `estudiante@informatica.edu` | `Estudiante123*` |

La semilla incluye 7 estudiantes con perfiles, 7 eventos, 11 participaciones, 9 logros (5 destacados), 5 proyectos, 5 certificaciones y 8 evidencias — con casos **pendientes de aprobación** en varias colecciones para demostrar el flujo de revisión.

---

## 6. Flujo de demostración sugerido (10 min)

1. **Login como administrador** (`admin@informatica.edu`) → redirige al Panel.
2. **Eventos → Nuevo evento**: llena el formulario; al guardar queda **aprobado** y visible en el portal.
3. **Estudiantes → Nuevo estudiante**: registra un perfil (deja sin consentimiento para ver el efecto).
4. **Participaciones → Nueva**: asocia el estudiante al evento con tipo *Asistente* o *Expositor*.
5. **Logros → Nuevo**: documenta un logro del estudiante y márcalo como *destacado*.
6. **Multimedia → Nueva evidencia**: sube una fotografía (o pega un enlace de YouTube) y autoriza su publicación.
7. **Aprobaciones**: revisa el contenido pendiente propuesto por estudiantes/responsables → *Aprobar* o *Rechazar* con comentario.
8. **Estudiantes → Editar**: activa el *consentimiento de publicación* del perfil nuevo.
9. Abre el **portal público** (otra pestaña o cerrar sesión): Cuadro de Honor, perfil con **CV digital → Imprimir / Exportar CV (PDF)**, detalle del evento, galería con lightbox y **buscador global** en tiempo real.
10. **Login como estudiante** (`estudiante@informatica.edu`) → *Mi espacio*: propone una participación, un logro y una evidencia propias; verifica que **no** aparece ningún menú administrativo y que cualquier URL de administración (`#/admin/usuarios`) lo regresa al inicio.
11. Vuelve como administrador → **Aprobaciones**: las propuestas del estudiante esperan revisión. Apruébalas y comprueba que aparecen en el portal.

---

## 7. Módulos implementados

| # | Módulo | Frontend | Backend | BD |
|---|---|---|---|---|
| 1 | Home institucional (cifras, logros recientes, próximos eventos, galería destacada) | ✔ | `/api/estadisticas` | ✔ |
| 2 | Cuadro de Honor con filtros (categoría, tipo, texto, rango de fechas, destacados) | ✔ | `/api/logros` | ✔ |
| 3 | Perfil individual + **CV digital imprimible** (cronología fusionada, habilidades, proyectos, certificaciones) | ✔ | `/api/estudiantes/:id` | ✔ |
| 4 | Registro y administración de eventos (modalidad, categoría, estado, fechas) | ✔ | `/api/eventos` | ✔ |
| 5 | Participaciones y logros N:M estudiante↔evento (asistente, expositor, concursante, organizador, colaborador) | ✔ | `/api/participaciones` | ✔ |
| 6 | Galería multimedia (imágenes/videos subidos + enlaces YouTube/Vimeo embebidos, destacados, lightbox) | ✔ | `/api/evidencias` | ✔ |
| 7 | Buscador y filtros globales **en tiempo real** (estudiantes, eventos, logros) | ✔ | `/api/busqueda` | ✔ |
| 8 | Autenticación JWT + bcrypt con 3 roles y permisos restringidos por ruta y por registro | ✔ | `/api/auth` | ✔ |
| 9 | Panel de administración CRUD completo + **flujo de revisión/aprobación** | ✔ | `/api/usuarios`, `/api/aprobaciones` | ✔ |
| 10 | Seguridad y validación en cliente y servidor; aviso de privacidad; responsive mobile-first; toasts informativos | ✔ | ✔ | ✔ |

**Reglas del flujo de aprobación** (columna `estadoPublicacion` en todas las colecciones de contenido):

- **Administrador** crea → `aprobado` de inmediato; puede destacar logros y evidencias.
- **Responsable** crea → `pendiente` hasta revisión del administrador.
- **Estudiante** solo propone **lo suyo** (participaciones, logros, proyectos, certificaciones, evidencias) → `pendiente`; no puede tocar datos de terceros ni campos académicos de su perfil.
- El portal público solo muestra contenido `aprobado`, y los perfiles además exigen `consentimientoPublicacion: true`; las evidencias exigen `autorizadoPublicacion: true`.

---

## 8. Referencia rápida de la API REST

Todas las rutas cuelgan de `/api`. Salvo las públicas, requieren el encabezado `Authorization: Bearer <token>`.

| Método y ruta | Acceso | Descripción |
|---|---|---|
| `POST /auth/registro` | público | Registro de estudiante (crea usuario + perfil pendiente) |
| `POST /auth/login` | público | Devuelve JWT (rate-limit 50 req/15 min) |
| `GET /auth/me` | autenticado | Perfil del usuario en sesión |
| `GET /estudiantes` | público | Perfiles aprobados y con consentimiento (`?q`, `?semestre`, `?page`) |
| `GET /estudiantes?todos=1` | staff | Listado completo para administración |
| `GET /estudiantes/:id` | público/staff | Perfil + trayectoria aprobada |
| `POST/PUT/DELETE /estudiantes/:id?` | admin/responsable | CRUD de perfiles |
| `GET /eventos` | público | Eventos aprobados (`?q`, `?estado`, `?categoria`, `?desde`, `?hasta`) |
| `POST/PUT/DELETE /eventos` | admin/responsable | CRUD de eventos |
| `GET /participaciones` | autenticado | Listado según rol (estudiante: solo lo suyo) |
| `POST/PUT/DELETE /participaciones` | autenticado | CRUD con reglas de propiedad |
| `GET /logros` | público | Cuadro de honor (`?q`, `?categoria`, `?tipo`, `?destacado=true`) |
| `POST/PUT/DELETE /logros` | autenticado | CRUD con reglas de propiedad |
| `GET /proyectos` · `/certificaciones` | autenticado | Trayectoria (estudiante: solo lo suyo) |
| `POST/PUT/DELETE /proyectos` · `/certificaciones` | autenticado | CRUD con reglas de propiedad |
| `GET /evidencias` | público | Galería aprobada y autorizada (`?evento`, `?estudiante`, `?tipo`, `?destacada`) |
| `POST/PUT /evidencias` | autenticado | multipart/form-data con campo `archivo` |
| `PATCH /evidencias/:id/destacada` | admin | Alterna destacado en portada |
| `GET /aprobaciones?tipo=…` | admin | Resumen y listado de pendientes por colección |
| `PATCH /aprobaciones/:tipo/:id` | admin | `{ "accion": "aprobar" \| "rechazar", "comentario": "…" }` |
| `GET /usuarios` | admin | Gestión de cuentas y roles |
| `POST/PUT/DELETE /usuarios` | admin | CRUD de usuarios (con protección de auto-degradación) |
| `GET /busqueda?q=` | público | Buscador global (mínimo 2 caracteres) |
| `GET /estadisticas` | público | Cifras para el home |
| `GET /catalogos` | público | Catálogos de formularios (enums reales de los schemas) |
| `GET /health` | público | Estado del servicio y de la BD |

Errores homogéneos: `{ "ok": false, "mensaje": "…", "errores": [{ "campo", "mensaje" }] }` (400 validación, 401 sin sesión, 403 sin permisos, 404 no encontrado, 409 duplicado).

---

## 9. Manual breve de usuario

### Visitante (público)
- **Cuadro de Honor**: filtra por categoría, tipo de reconocimiento o texto; las tarjetas con cinta son logros destacados. Clic en el estudiante para ver su perfil.
- **Perfil estudiantil**: CV digital completo; botón **Imprimir / Exportar CV (PDF)** genera la versión imprimible (usa el diálogo del navegador).
- **Eventos**: agenda con filtros; el detalle muestra participantes y galería del evento.
- **Galería**: clic en una tarjeta para abrir el lightbox (imágenes y videos embebidos).
- **Buscador**: escribe y los resultados (estudiantes, eventos, logros) se actualizan al instante.
- **Flujo de demostración**: guía de 10 pasos que abre los módulos reales, respeta los permisos de cada rol y no crea datos de prueba.

### Estudiante
1. Regístrate desde **Iniciar sesión → Regístrate como estudiante** (tu perfil queda pendiente de aprobación).
2. Entra a **Mi espacio**: edita tu perfil profesional, habilidades y enlaces de contacto (los datos académicos solo los cambia la coordinación).
3. Pestañas **Participaciones / Logros / Proyectos / Certificaciones / Evidencias**: agrega propuestas de tu trayectoria. Quedan *pendientes* hasta que la administración las apruebe.
4. Marca el **consentimiento de publicación** para que tu perfil y fotografía sean visibles (aviso de privacidad).

### Responsable de contenido
- Panel → Estudiantes, Eventos, Participaciones, Logros, Proyectos y certificaciones, Multimedia.
- Todo lo que registra queda **pendiente de aprobación** del administrador.
- No tiene acceso a Aprobaciones ni a la gestión de usuarios.

### Administrador
- Todo lo anterior **más**: Aprobaciones (revisar/aprobar/rechazar con comentario), Usuarios y roles (crear cuentas, cambiar rol, activar/desactivar), y los toggles de **destacado** (logros en Cuadro de Honor y evidencias en portada).

---

## 10. Decisiones técnicas de interés

- **Sin build ni CDNs**: el frontend es una SPA con módulos ES nativos; funciona sin internet y sin paso de compilación.
- **bcryptjs** en lugar de `bcrypt` nativo: misma API, sin compilación nativa (evita fallos de `node-gyp` en Windows).
- **Modo demo en memoria**: `ENABLE_MEMORY_DB=true` permite presentar el proyecto sin instalar MongoDB; con MongoDB instalado se usa persistencia real transparentemente.
- **Prevención XSS**: todo el HTML dinámico escapa con `esc()`; los enlaces externos usan `rel="noopener"`.
- **Archivos**: `multer` valida extensión + tipo MIME y tamaño (5 MB imagen / 50 MB video); al eliminar una evidencia se borra el archivo del disco.
- **Índices**: campos de búsqueda y estado indexados en MongoDB (`matricula` único, `estadoPublicacion`, texto en nombre/apellidos).
- **Semilla idempotente**: el servidor siembra automáticamente si la base está vacía; `--fresh` reinicia los datos de prueba.

---

## 11. Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `[db] No se pudo conectar… modo demo` | MongoDB no está corriendo | Instala/inicia MongoDB o continúa en modo demo (datos temporales) |
| `EADDRINUSE: port 4000` | Otro proceso usa el puerto | Cambia `PORT` en `.env` o detén el proceso anterior |
| `Login no responde 429` | Superaste el límite de intentos | Espera 15 minutos o reinicia el servidor |
| No se sube una evidencia | Archivo demasiado grande o tipo no permitido | Imágenes ≤ 5 MB (jpg/png/webp/gif), videos ≤ 50 MB (mp4/webm) |
| El perfil nuevo no aparece en el portal | Falta consentimiento o aprobación | Admin → Estudiantes → Editar → consentimiento; Aprobaciones → Aprobar |

---

Proyecto académico — Licenciatura en Informática, 2026.
Las fotografías y datos personales mostrados son ficticios y se publican con autorización simulada de sus titulares (aviso de privacidad integrado en la plataforma).
