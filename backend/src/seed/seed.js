/**
 * Seed de datos de prueba - Informática Destaca
 * Datos ficticios coherentes con el contexto universitario.
 *
 * Uso:  npm run seed          (agrega datos)
 *       npm run seed:fresh    (borra todo y vuelve a sembrar)
 * El servidor también siembra automáticamente si la base está vacía.
 */
const mongoose = require('mongoose');
const config = require('../config/env');

const Usuario = require('../models/Usuario');
const Estudiante = require('../models/Estudiante');
const Evento = require('../models/Evento');
const Participacion = require('../models/Participacion');
const Logro = require('../models/Logro');
const Proyecto = require('../models/Proyecto');
const Certificacion = require('../models/Certificacion');
const Evidencia = require('../models/Evidencia');

const fecha = (iso) => new Date(iso);

const datos = {
  usuarios: [
    { nombre: 'Coordinación Académica', email: 'admin@informatica.edu', password: 'Admin123*', rol: 'administrador' },
    { nombre: 'Laura Mendoza Pineda', email: 'responsable@informatica.edu', password: 'Responsable123*', rol: 'responsable' },
    { nombre: 'Ana Sofía Ramírez Vega', email: 'estudiante@informatica.edu', password: 'Estudiante123*', rol: 'estudiante', matricula: 'ISR-2201' },
  ],

  estudiantes: [
    {
      nombre: 'Ana Sofía', apellidos: 'Ramírez Vega', matricula: 'ISR-2201', semestre: '8', generacion: '2022-2026',
      fotoUrl: '/img/avatars/avatar-ana.svg',
      perfilProfesional: 'Estudiante de Licenciatura en Informática enfocada en inteligencia artificial y ciencia de datos. Apasionada por resolver problemas reales con análisis de datos y aprendizaje automático. Me caracteriza la disciplina, el trabajo en equipo y el gusto por enseñar lo que aprendo.',
      areasInteres: ['Inteligencia Artificial', 'Ciencia de datos', 'Aprendizaje automático', 'Visualización de datos'],
      habilidades: [
        { nombre: 'Python', nivel: 'Avanzado' }, { nombre: 'SQL', nivel: 'Avanzado' },
        { nombre: 'TensorFlow', nivel: 'Intermedio' }, { nombre: 'Power BI', nivel: 'Intermedio' },
        { nombre: 'Inglés técnico', nivel: 'Avanzado' },
      ],
      correoContacto: 'ana.ramirez@alumno.utv.edu', githubUrl: 'https://github.com/ana-ramirez-vega', linkedinUrl: 'https://www.linkedin.com/in/ana-sofia-ramirez-vega',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Diego Alejandro', apellidos: 'Morales Cruz', matricula: 'DMC-2204', semestre: '6', generacion: '2022-2026',
      fotoUrl: '/img/avatars/avatar-diego.svg',
      perfilProfesional: 'Desarrollador web full stack en formación. Disfruto construir productos útiles desde la idea hasta el despliegue. Experiencia en proyectos académicos con JavaScript, Node.js y bases de datos relacionales.',
      areasInteres: ['Desarrollo web', 'Arquitectura de software', 'Bases de datos'],
      habilidades: [
        { nombre: 'JavaScript', nivel: 'Avanzado' }, { nombre: 'Node.js', nivel: 'Intermedio' },
        { nombre: 'MySQL', nivel: 'Intermedio' }, { nombre: 'React', nivel: 'Básico' },
      ],
      correoContacto: 'diego.morales@alumno.utv.edu', githubUrl: 'https://github.com/diego-morales-cruz',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Valeria Guadalupe', apellidos: 'Hernández Ruiz', matricula: 'VHR-2302', semestre: '4', generacion: '2023-2027',
      fotoUrl: '/img/avatars/avatar-valeria.svg',
      perfilProfesional: 'Entusiasta de la ciberseguridad. Participo activamente en competencias CTF y comunidades de seguridad informática. Mi meta es dedicarme a la seguridad ofensiva con ética y responsabilidad.',
      areasInteres: ['Ciberseguridad', 'Redes', 'Sistemas operativos', 'Forense digital'],
      habilidades: [
        { nombre: 'Linux', nivel: 'Avanzado' }, { nombre: 'Redes TCP/IP', nivel: 'Intermedio' },
        { nombre: 'Python', nivel: 'Intermedio' }, { nombre: 'Análisis de vulnerabilidades', nivel: 'Básico' },
      ],
      correoContacto: 'valeria.hernandez@alumno.utv.edu',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Emiliano', apellidos: 'Torres Salinas', matricula: 'ETS-2108', semestre: 'Egresado', generacion: '2021-2025',
      fotoUrl: '/img/avatars/avatar-emiliano.svg',
      perfilProfesional: 'Egresado de la Licenciatura en Informática, especializado en operaciones en la nube y prácticas DevOps. Experiencia en automatización de despliegues y monitoreo de servicios durante mi servicio social y residencia profesional.',
      areasInteres: ['Cloud computing', 'DevOps', 'Contenedores', 'Automatización'],
      habilidades: [
        { nombre: 'AWS', nivel: 'Avanzado' }, { nombre: 'Docker', nivel: 'Avanzado' },
        { nombre: 'Kubernetes', nivel: 'Intermedio' }, { nombre: 'Linux', nivel: 'Avanzado' },
        { nombre: 'Bash', nivel: 'Intermedio' },
      ],
      correoContacto: 'emiliano.torres@alumno.utv.edu', linkedinUrl: 'https://www.linkedin.com/in/emiliano-torres-salinas',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Renata', apellidos: 'Orozco Méndez', matricula: 'ROM-2305', semestre: '4', generacion: '2023-2027',
      fotoUrl: '/img/avatars/avatar-renata.svg',
      perfilProfesional: 'Diseñadora de experiencias de usuario en formación. Me interesa que la tecnología sea útil, accesible y bella. Combino fundamentos de programación con diseño centrado en las personas.',
      areasInteres: ['UX/UI', 'Diseño accesible', 'Prototipado', 'Investigación de usuarios'],
      habilidades: [
        { nombre: 'Figma', nivel: 'Avanzado' }, { nombre: 'HTML/CSS', nivel: 'Intermedio' },
        { nombre: 'Investigación de usuarios', nivel: 'Intermedio' },
      ],
      correoContacto: 'renata.orozco@alumno.utv.edu',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Sebastián', apellidos: 'Castillo Flores', matricula: 'SCF-2209', semestre: '6', generacion: '2022-2026',
      fotoUrl: '/img/avatars/avatar-sebastian.svg',
      perfilProfesional: 'Desarrollador de videojuegos y gráficos por computadora. Me apasiona el desarrollo con motores modernos y la programación de mecánicas creativas. Participo en game jams cada que puedo.',
      areasInteres: ['Videojuegos', 'Gráficos por computadora', 'Realidad virtual'],
      habilidades: [
        { nombre: 'Unity', nivel: 'Avanzado' }, { nombre: 'C#', nivel: 'Avanzado' },
        { nombre: 'Blender', nivel: 'Básico' },
      ],
      correoContacto: 'sebastian.castillo@alumno.utv.edu', githubUrl: 'https://github.com/sebas-castillo',
      consentimientoPublicacion: true, estadoPublicacion: 'aprobado',
    },
    {
      nombre: 'Mariana', apellidos: 'Espinosa Lara', matricula: 'MEL-2401', semestre: '2', generacion: '2024-2028',
      fotoUrl: '/img/avatars/avatar-mariana.svg',
      perfilProfesional: 'Estudiante de nuevo ingreso interesada en redes y administración de sistemas. Construyendo mis primeras bases en programación y estructuras de datos.',
      areasInteres: ['Redes', 'Administración de servidores'],
      habilidades: [{ nombre: 'Fundamentos de programación', nivel: 'Básico' }],
      correoContacto: 'mariana.espinosa@alumno.utv.edu',
      consentimientoPublicacion: false, estadoPublicacion: 'pendiente',
    },
  ],

  eventos: [
    {
      nombre: 'CodeFest UTV 2026: Hackathon de Innovación', categoria: 'Concurso', estado: 'proximo', estadoPublicacion: 'aprobado',
      descripcion: 'Hackathon anual de la Licenciatura en Informática. Equipos de 3 a 4 estudiantes desarrollarán soluciones tecnológicas a retos reales propuestos por empresas de la región durante 24 horas continuas. Habrá ponencias magistrales, mentores por mesa y premios para los tres primeros lugares.',
      fechaInicio: fecha('2026-11-13T09:00:00'), fechaFin: fecha('2026-11-14T18:00:00'), horario: '09:00 a 18:00 h',
      modalidad: 'Presencial', lugar: 'Edificio de Ingeniería, Campus UTV', organizador: 'Coordinación de la Licenciatura en Informática',
      imagenUrl: '/img/eventos/ev-codefest.svg',
    },
    {
      nombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', categoria: 'Congreso', estado: 'realizado', estadoPublicacion: 'aprobado',
      descripcion: 'Tres días de conferencias y ponencias sobre inteligencia artificial, ciberseguridad, nube y desarrollo de software, con investigadores invitados de universidades nacionales. La licenciatura presentó cuatro ponencias estudiantiles.',
      fechaInicio: fecha('2026-03-10T08:00:00'), fechaFin: fecha('2026-03-12T17:00:00'), horario: '08:00 a 17:00 h',
      modalidad: 'Híbrida', lugar: 'Auditorio Central y transmisión en línea', organizador: 'Facultad de Ingeniería',
      imagenUrl: '/img/eventos/ev-conate.svg',
    },
    {
      nombre: 'Feria de Proyectos de Ingeniería 2026', categoria: 'Feria', estado: 'realizado', estadoPublicacion: 'aprobado',
      descripcion: 'Exposición de proyectos académicos de todas las ingenierías. La Licenciatura en Informática presentó 12 proyectos entre aplicaciones web, sistemas embebidos y soluciones de datos. Jurado integrado por docentes e invitados de la industria.',
      fechaInicio: fecha('2026-05-08T10:00:00'), fechaFin: fecha('2026-05-08T16:00:00'), horario: '10:00 a 16:00 h',
      modalidad: 'Presencial', lugar: 'Explanada principal del campus', organizador: 'Dirección Académica UTV',
      imagenUrl: '/img/eventos/ev-feria.svg',
    },
    {
      nombre: 'Maratón de Programación Regional 2025', categoria: 'Concurso', estado: 'realizado', estadoPublicacion: 'aprobado',
      descripcion: 'Competencia de programación estilo ICPC con equipos de universidades de la región. Cinco horas, diez problemas y mucho trabajo en equipo. Nuestros equipos obtuvieron el primer y tercer lugar.',
      fechaInicio: fecha('2025-10-17T09:00:00'), fechaFin: fecha('2025-10-17T15:00:00'), horario: '09:00 a 15:00 h',
      modalidad: 'Presencial', lugar: 'Laboratorios de Cómputo, Edificio B', organizador: 'Academia de Programación',
      imagenUrl: '/img/eventos/ev-maraton.svg',
    },
    {
      nombre: 'Taller: Introducción a la Nube con AWS Academy', categoria: 'Taller', estado: 'realizado', estadoPublicacion: 'aprobado',
      descripcion: 'Taller práctico de dos sesiones sobre fundamentos de cloud computing: instancias EC2, almacenamiento S3, bases de datos administradas y buenas prácticas de seguridad. Entrega de constancia con valor curricular.',
      fechaInicio: fecha('2026-02-21T16:00:00'), fechaFin: fecha('2026-02-28T19:00:00'), horario: '16:00 a 19:00 h',
      modalidad: 'Virtual', lugar: 'Plataforma de videoconferencia institucional', organizador: 'Academia de Sistemas Distribuidos',
      imagenUrl: '/img/eventos/ev-taller-aws.svg',
    },
    {
      nombre: 'GitFest: Conferencia de Software Libre', categoria: 'Académico', estado: 'cancelado', estadoPublicacion: 'aprobado',
      descripcion: 'Jornada sobre cultura y herramientas de software libre con comunidades locales. El evento fue cancelado por condiciones meteorológicas; se reprogramará en el próximo semestre.',
      fechaInicio: fecha('2026-09-30T10:00:00'), horario: '10:00 a 15:00 h',
      modalidad: 'Presencial', lugar: 'Centro Cultural Universitario', organizador: 'Comunidad de Software Libre UTV',
      imagenUrl: '/img/eventos/ev-gitfest.svg',
    },
    {
      nombre: 'Webinar: Carreras profesionales en Ciberseguridad', categoria: 'Tecnológico', estado: 'proximo', estadoPublicacion: 'pendiente',
      descripcion: 'Con exalumnas y exalumnos dedicados a la seguridad informática: rutas profesionales, certificaciones recomendadas y experiencias laborales en el sector. Propuesta registrada por el equipo responsable, pendiente de aprobación por la coordinación.',
      fechaInicio: fecha('2026-11-25T17:00:00'), horario: '17:00 a 19:00 h',
      modalidad: 'Virtual', lugar: 'Transmisión en línea', organizador: 'Comunidad de Ciberseguridad Estudiantil',
      imagenUrl: '/img/eventos/ev-webinar-ciber.svg',
    },
  ],

  participaciones: [
    { estudianteMatricula: 'ISR-2201', eventoNombre: 'Maratón de Programación Regional 2025', fecha: fecha('2025-10-17'), tipo: 'Concursante', descripcion: 'Integrante del equipo "Algoritmos UTV" en la competencia de programación regional.', resultado: 'Primer lugar general entre 18 equipos', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'DMC-2204', eventoNombre: 'Maratón de Programación Regional 2025', fecha: fecha('2025-10-17'), tipo: 'Concursante', descripcion: 'Integrante del equipo "Binary Bravos" en la competencia de programación.', resultado: 'Tercer lugar general', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ISR-2201', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', fecha: fecha('2026-03-11'), tipo: 'Expositor', descripcion: 'Ponencia "Modelo predictivo de deserción escolar usando aprendizaje automático" en la mesa de inteligencia artificial.', resultado: 'Mención honorífica del comité científico', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ETS-2108', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', fecha: fecha('2026-03-10'), tipo: 'Organizador', descripcion: 'Coordinador del comité de logística y apoyo técnico durante las tres jornadas del congreso.', resultado: 'Operación sin incidentes, 480 asistentes', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'VHR-2302', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', fecha: fecha('2026-03-12'), tipo: 'Asistente', descripcion: 'Participación en las conferencias y taller de ciberseguridad ofensiva.', resultado: 'Constancia con valor curricular', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'DMC-2204', eventoNombre: 'Feria de Proyectos de Ingeniería 2026', fecha: fecha('2026-05-08'), tipo: 'Expositor', descripcion: 'Presentación del proyecto "GestorU: sistema de gestión escolar para grupos de tutoría" en el pabellón de informática.', resultado: 'Premio especial a la mejor propuesta con impacto social', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ROM-2305', eventoNombre: 'Feria de Proyectos de Ingeniería 2026', fecha: fecha('2026-05-08'), tipo: 'Colaborador', descripcion: 'Diseño UX de la aplicación "Rutas Accesibles" junto al equipo de ingeniería civil.', resultado: 'Mención del jurado a mejor diseño de interfaz', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'SCF-2209', eventoNombre: 'CodeFest UTV 2026: Hackathon de Innovación', fecha: fecha('2025-11-14'), tipo: 'Concursante', descripcion: 'Participación en la edición 2025 del CodeFest con el prototipo de juego serio sobre reciclaje.', resultado: 'Segundo lugar de la categoría innovación', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ETS-2108', eventoNombre: 'Taller: Introducción a la Nube con AWS Academy', fecha: fecha('2026-02-21'), tipo: 'Organizador', descripcion: 'Facilitador del laboratorio práctico de despliegue en EC2 y S3.', resultado: '28 estudiantes con constancia', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'VHR-2302', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', fecha: fecha('2026-03-11'), tipo: 'Concursante', descripcion: 'Participación en la competencia CTF del congreso, categoría universitaria.', resultado: 'Primer lugar de la categoría captura la bandera', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'MEL-2401', eventoNombre: 'Taller: Introducción a la Nube con AWS Academy', fecha: fecha('2026-02-21'), tipo: 'Asistente', descripcion: 'Asistencia completa al taller introductorio de cloud computing.', resultado: 'Constancia de participación', estadoPublicacion: 'pendiente' },
  ],

  logros: [
    { estudianteMatricula: 'ISR-2201', titulo: 'Primer lugar en la Maratón de Programación Regional 2025', categoria: 'Académico', tipoReconocimiento: 'Primer lugar', fecha: fecha('2025-10-17'), institucion: 'Academia de Programación - UTV', eventoNombre: 'Maratón de Programación Regional 2025', destacado: true, estadoPublicacion: 'aprobado', descripcion: 'Junto a su equipo resolvió 8 de 10 problemas en tiempo récord, obteniendo el primer lugar entre 18 equipos universitarios de la región.' },
    { estudianteMatricula: 'ISR-2201', titulo: 'Mención honorífica por ponencia de investigación en CONATE 2026', categoria: 'Investigación', tipoReconocimiento: 'Mención honorífica', fecha: fecha('2026-03-11'), institucion: 'Comité Científico CONATE', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacado: true, estadoPublicacion: 'aprobado', descripcion: 'El comité científico destacó la ponencia sobre predicción de deserción escolar con aprendizaje automático por su rigor metodológico e impacto social.' },
    { estudianteMatricula: 'ISR-2201', titulo: 'Beca de excelencia académica 2026', categoria: 'Académico', tipoReconocimiento: 'Beca', fecha: fecha('2026-08-15'), institucion: 'Universidad Tecnológica del Valle', destacado: false, estadoPublicacion: 'aprobado', descripcion: 'Beca por promedio sobresaliente y participación destacada en actividades académicas y de investigación.' },
    { estudianteMatricula: 'DMC-2204', titulo: 'Premio especial a la mejor propuesta con impacto social', categoria: 'Innovación', tipoReconocimiento: 'Premio especial', fecha: fecha('2026-05-08'), institucion: 'Feria de Proyectos de Ingeniería', eventoNombre: 'Feria de Proyectos de Ingeniería 2026', destacado: true, estadoPublicacion: 'aprobado', descripcion: 'El sistema GestorU fue reconocido como la propuesta con mayor potencial de impacto en comunidades escolares de la región.' },
    { estudianteMatricula: 'VHR-2302', titulo: 'Primer lugar en la competencia CTF de CONATE 2026', categoria: 'Tecnología', tipoReconocimiento: 'Primer lugar', fecha: fecha('2026-03-11'), institucion: 'CONATE', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacado: true, estadoPublicacion: 'aprobado', descripcion: 'Obtuvo el primer lugar en la competencia de seguridad "captura la bandera" categoría universitaria, resolviendo 9 de 12 retos.' },
    { estudianteMatricula: 'ETS-2108', titulo: 'Reconocimiento al liderazgo organizativo en CONATE 2026', categoria: 'Liderazgo', tipoReconocimiento: 'Reconocimiento', fecha: fecha('2026-03-12'), institucion: 'Facultad de Ingeniería UTV', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacado: false, estadoPublicacion: 'aprobado', descripcion: 'Reconocimiento por la coordinación logística y técnica de un congreso con 480 asistentes y transmisión híbrida sin incidentes.' },
    { estudianteMatricula: 'SCF-2209', titulo: 'Segundo lugar en el CodeFest 2025, categoría innovación', categoria: 'Tecnología', tipoReconocimiento: 'Segundo lugar', fecha: fecha('2025-11-14'), institucion: 'Coordinación de la Licenciatura en Informática', eventoNombre: 'CodeFest UTV 2026: Hackathon de Innovación', destacado: false, estadoPublicacion: 'aprobado', descripcion: 'El prototipo de juego serio sobre reciclaje impresionó al jurado por su mecánica educativa y pulido visual en 24 horas de desarrollo.' },
    { estudianteMatricula: 'ROM-2305', titulo: 'Mención del jurado al mejor diseño de interfaz', categoria: 'Cultural', tipoReconocimiento: 'Mención honorífica', fecha: fecha('2026-05-08'), institucion: 'Feria de Proyectos de Ingeniería', eventoNombre: 'Feria de Proyectos de Ingeniería 2026', destacado: false, estadoPublicacion: 'aprobado', descripcion: 'Por el diseño accesible y centrado en las personas de la aplicación "Rutas Accesibles".' },
    { estudianteMatricula: 'VHR-2302', titulo: 'Reconocimiento Women in Cybersecurity', categoria: 'Tecnología', tipoReconocimiento: 'Reconocimiento', fecha: fecha('2026-06-20'), institucion: 'Capítulo estudiantil WiCys', destacado: false, estadoPublicacion: 'pendiente', descripcion: 'Reconocimiento regional por su participación activa en la comunidad y mentoría a estudiantes de nuevo ingreso. Propuesta pendiente de aprobación.' },
  ],

  proyectos: [
    { estudianteMatricula: 'ISR-2201', nombre: 'Modelo predictivo de deserción escolar', descripcion: 'Sistema que analiza indicadores académicos y socioeconómicos para predecir riesgo de deserción y orientar acciones de tutoría. Entrenado con datos históricos anonimizados de la universidad.', tecnologias: ['Python', 'scikit-learn', 'Pandas', 'Power BI'], fechaInicio: fecha('2025-09-01'), fechaFin: fecha('2026-03-01'), urlRepositorio: 'https://github.com/ana-ramirez-vega/predictor-desercion', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'DMC-2204', nombre: 'GestorU: gestión escolar para grupos de tutoría', descripcion: 'Aplicación web para registrar sesiones de tutoría, seguimiento académico y alertas tempranas. Incluye panel docente y reportes imprimibles.', tecnologias: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'Bootstrap'], fechaInicio: fecha('2025-10-01'), fechaFin: fecha('2026-04-30'), urlRepositorio: 'https://github.com/diego-morales-cruz/gestor-u', urlDemo: 'https://gestor-u.demo.utv.edu', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'SCF-2209', nombre: 'Recicla-Juego: videojuego serio de reciclaje', descripcion: 'Videojuego 2D educativo que enseña separación de residuos mediante mecánicas de categorización con tiempo y puntajes. Desarrollado en 24 horas durante el CodeFest 2025 y luego extendido como proyecto de materia.', tecnologias: ['Unity', 'C#'], fechaInicio: fecha('2025-11-01'), estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ROM-2305', nombre: 'Rutas Accesibles', descripcion: 'Diseño UX de aplicación móvil que sugiere rutas peatonales accesibles para personas con movilidad reducida, con mapa colaborativo de obstáculos.', tecnologias: ['Figma', 'Maze', 'HTML/CSS'], fechaInicio: fecha('2026-01-15'), estadoPublicacion: 'aprobado' },
  ],

  certificaciones: [
    { estudianteMatricula: 'ETS-2108', nombre: 'AWS Certified Solutions Architect - Associate', institucion: 'Amazon Web Services', fechaObtencion: fecha('2025-12-10'), urlCredencial: 'https://aws.amazon.com/verification', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ETS-2108', nombre: 'Certified Kubernetes Application Developer (CKAD)', institucion: 'Cloud Native Computing Foundation', fechaObtencion: fecha('2026-04-18'), estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'ISR-2201', nombre: 'Data Analysis with Python', institucion: 'freeCodeCamp', fechaObtencion: fecha('2025-06-30'), urlCredencial: 'https://www.freecodecamp.org/certification', estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'VHR-2302', nombre: 'Introducción a la Ciberseguridad', institucion: 'Cisco Networking Academy', fechaObtencion: fecha('2025-11-15'), estadoPublicacion: 'aprobado' },
    { estudianteMatricula: 'DMC-2204', nombre: 'Diseño Web Responsivo', institucion: 'freeCodeCamp', fechaObtencion: fecha('2025-08-22'), estadoPublicacion: 'aprobado' },
  ],

  evidencias: [
    { titulo: 'Equipo ganador de la Maratón de Programación 2025', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-maraton-equipo.svg', fecha: fecha('2025-10-17'), descripcion: 'El equipo "Algoritmos UTV" celebrando el primer lugar. Autorización de publicación otorgada por los integrantes.', estudianteMatricula: 'ISR-2201', eventoNombre: 'Maratón de Programación Regional 2025', destacada: true, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Ponencia de Ana Sofía en CONATE 2026', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-conate-ponencia.svg', fecha: fecha('2026-03-11'), descripcion: 'Presentación del modelo predictivo de deserción en la mesa de inteligencia artificial.', estudianteMatricula: 'ISR-2201', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacada: true, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Proyecto GestorU en la Feria de Proyectos', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-feria-gestoru.svg', fecha: fecha('2026-05-08'), descripcion: 'Stand del proyecto GestorU durante la Feria de Proyectos de Ingeniería 2026.', estudianteMatricula: 'DMC-2204', eventoNombre: 'Feria de Proyectos de Ingeniería 2026', destacada: true, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Competencia CTF en CONATE 2026', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-ctf-conate.svg', fecha: fecha('2026-03-11'), descripcion: 'Momentos de la competencia de captura la bandera categoría universitaria.', estudianteMatricula: 'VHR-2302', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacada: true, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Registro en video del CodeFest 2025', tipo: 'Video', urlExterna: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', fecha: fecha('2025-11-15'), descripcion: 'Resumen en video de la hackathon CodeFest 2025 con entrevistas a los equipos participantes.', eventoNombre: 'CodeFest UTV 2026: Hackathon de Innovación', destacada: false, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Repositorio del proyecto GestorU', tipo: 'Enlace', urlExterna: 'https://github.com/diego-morales-cruz/gestor-u', fecha: fecha('2026-05-08'), descripcion: 'Código fuente del proyecto premiado en la Feria de Proyectos 2026.', estudianteMatricula: 'DMC-2204', destacada: false, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Fotografía grupal del taller de AWS', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-taller-aws-grupo.svg', fecha: fecha('2026-02-28'), descripcion: 'Cierre del taller de nube con los 28 estudiantes que obtuvieron constancia.', eventoNombre: 'Taller: Introducción a la Nube con AWS Academy', destacada: false, estadoPublicacion: 'aprobado', autorizadoPublicacion: true },
    { titulo: 'Fotografía pendiente de autorización', tipo: 'Imagen', archivoUrl: '/img/evidencias/ev-ctf-conate.svg', fecha: fecha('2026-03-11'), descripcion: 'Evidencia en espera de revisión y autorización de publicación.', eventoNombre: 'CONATE 2026: Congreso Nacional de Tecnologías Emergentes', destacada: false, estadoPublicacion: 'pendiente', autorizadoPublicacion: false },
  ],
};

async function sembrar({ fresh = false, log = console.log } = {}) {
  if (fresh) {
    await Promise.all([
      Usuario.deleteMany({}), Estudiante.deleteMany({}), Evento.deleteMany({}),
      Participacion.deleteMany({}), Logro.deleteMany({}), Proyecto.deleteMany({}),
      Certificacion.deleteMany({}), Evidencia.deleteMany({}),
    ]);
    log('[seed] Colecciones existentes eliminadas.');
  }

  const yaHayDatos = await Usuario.countDocuments({}) > 0;
  if (yaHayDatos) {
    log('[seed] La base de datos ya contiene datos. Usa --fresh para resembrar.');
    return { sembrado: false };
  }

  // Usuarios (el primer estudiante se vincula a su perfil)
  const admin = await Usuario.create({
    nombre: datos.usuarios[0].nombre, email: datos.usuarios[0].email,
    password: datos.usuarios[0].password, rol: 'administrador',
  });
  const responsable = await Usuario.create({
    nombre: datos.usuarios[1].nombre, email: datos.usuarios[1].email,
    password: datos.usuarios[1].password, rol: 'responsable',
  });

  const estudiantesPorMatricula = {};
  for (const e of datos.estudiantes) {
    const est = await Estudiante.create({ ...e });
    estudiantesPorMatricula[e.matricula] = est;
  }

  const usuarioAna = await Usuario.create({
    nombre: `${datos.estudiantes[0].nombre} ${datos.estudiantes[0].apellidos}`,
    email: datos.usuarios[2].email, password: datos.usuarios[2].password,
    rol: 'estudiante', estudiante: estudiantesPorMatricula['ISR-2201']._id,
  });
  await Estudiante.findByIdAndUpdate(estudiantesPorMatricula['ISR-2201']._id, { usuario: usuarioAna._id });

  const eventosPorNombre = {};
  for (const ev of datos.eventos) {
    const creado = await Evento.create({ ...ev, creadoPor: ev.estadoPublicacion === 'pendiente' ? responsable._id : admin._id });
    eventosPorNombre[ev.nombre] = creado;
  }

  for (const p of datos.participaciones) {
    await Participacion.create({
      estudiante: estudiantesPorMatricula[p.estudianteMatricula]._id,
      evento: p.eventoNombre ? eventosPorNombre[p.eventoNombre]._id : null,
      fecha: p.fecha, tipo: p.tipo, descripcion: p.descripcion,
      resultado: p.resultado || '', estadoPublicacion: p.estadoPublicacion,
      propuestoPor: p.estadoPublicacion === 'aprobado' ? admin._id : responsable._id,
    });
  }

  for (const l of datos.logros) {
    await Logro.create({
      estudiante: estudiantesPorMatricula[l.estudianteMatricula]._id,
      titulo: l.titulo, categoria: l.categoria, tipoReconocimiento: l.tipoReconocimiento,
      descripcion: l.descripcion, fecha: l.fecha, institucion: l.institucion,
      evento: l.eventoNombre ? eventosPorNombre[l.eventoNombre]._id : null,
      destacado: l.destacado, estadoPublicacion: l.estadoPublicacion,
      propuestoPor: l.estadoPublicacion === 'aprobado' ? admin._id : usuarioAna._id,
    });
  }

  for (const pr of datos.proyectos) {
    await Proyecto.create({
      estudiante: estudiantesPorMatricula[pr.estudianteMatricula]._id,
      nombre: pr.nombre, descripcion: pr.descripcion, tecnologias: pr.tecnologias,
      fechaInicio: pr.fechaInicio, fechaFin: pr.fechaFin,
      urlRepositorio: pr.urlRepositorio || '', urlDemo: pr.urlDemo || '',
      estadoPublicacion: pr.estadoPublicacion, propuestoPor: admin._id,
    });
  }

  for (const c of datos.certificaciones) {
    await Certificacion.create({
      estudiante: estudiantesPorMatricula[c.estudianteMatricula]._id,
      nombre: c.nombre, institucion: c.institucion,
      fechaObtencion: c.fechaObtencion, urlCredencial: c.urlCredencial || '',
      estadoPublicacion: c.estadoPublicacion, propuestoPor: admin._id,
    });
  }

  for (const ev of datos.evidencias) {
    await Evidencia.create({
      titulo: ev.titulo, tipo: ev.tipo, archivoUrl: ev.archivoUrl || '',
      urlExterna: ev.urlExterna || '', descripcion: ev.descripcion || '', fecha: ev.fecha,
      evento: ev.eventoNombre ? eventosPorNombre[ev.eventoNombre]._id : null,
      estudiante: ev.estudianteMatricula ? estudiantesPorMatricula[ev.estudianteMatricula]._id : null,
      destacada: ev.destacada, autorizadoPublicacion: ev.autorizadoPublicacion,
      estadoPublicacion: ev.estadoPublicacion, subidoPor: admin._id,
    });
  }

  log('[seed] Datos de prueba creados:');
  log(`       Usuarios: ${await Usuario.countDocuments({})} | Estudiantes: ${await Estudiante.countDocuments({})} | Eventos: ${await Evento.countDocuments({})}`);
  log(`       Participaciones: ${await Participacion.countDocuments({})} | Logros: ${await Logro.countDocuments({})} | Evidencias: ${await Evidencia.countDocuments({})}`);
  return { sembrado: true };
}

module.exports = sembrar;

/* Ejecución directa como CLI: npm run seed [-- --fresh] */
if (require.main === module) {
  const fresh = process.argv.includes('--fresh');
  (async () => {
    try {
      await mongoose.connect(config.mongoUri);
      console.log(`[seed] Conectado a ${config.mongoUri}`);
      await sembrar({ fresh });
      await mongoose.connection.close();
      console.log('[seed] Listo. Conexión cerrada.');
      process.exit(0);
    } catch (error) {
      console.error('[seed] Error:', error.message);
      console.error('[seed] Verifica que MongoDB esté en ejecución y que MONGODB_URI sea correcta (.env).');
      process.exit(1);
    }
  })();
}
