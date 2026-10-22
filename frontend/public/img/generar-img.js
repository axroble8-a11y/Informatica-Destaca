/* Generador único de imágenes SVG de marca, avatares, portadas de eventos y evidencias.
   Ejecutar una vez:  node generar-img.js  (desde la carpeta frontend/public/img) */
const fs = require('fs');
const path = require('path');

const raiz = __dirname;
for (const d of ['avatars', 'eventos', 'evidencias']) {
  fs.mkdirSync(path.join(raiz, d), { recursive: true });
}

const grad = (id, c1, c2) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;

function avatar(iniciales, c1, c2, archivo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
${grad('g', c1, c2)}
<rect width="320" height="320" rx="160" fill="url(#g)"/>
<circle cx="160" cy="128" r="52" fill="#ffffff" opacity="0.92"/>
<path d="M160 196c-56 0-92 30-100 70a160 160 0 0 0 200 0c-8-40-44-70-100-70z" fill="#ffffff" opacity="0.92"/>
<text x="160" y="140" font-family="Segoe UI,Arial,sans-serif" font-size="42" font-weight="700" fill="${c2}" text-anchor="middle" dominant-baseline="middle">${iniciales}</text>
</svg>`;
  fs.writeFileSync(path.join(raiz, 'avatars', archivo), svg);
}

function portada(titulo, icono, c1, c2, archivo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
${grad('g', c1, c2)}
<rect width="960" height="540" fill="url(#g)"/>
<circle cx="820" cy="80" r="160" fill="#ffffff" opacity="0.08"/>
<circle cx="120" cy="480" r="200" fill="#ffffff" opacity="0.07"/>
<circle cx="700" cy="470" r="90" fill="#ffffff" opacity="0.06"/>
<text x="60" y="140" font-family="Segoe UI,Arial,sans-serif" font-size="72">${icono}</text>
<text x="60" y="300" font-family="Segoe UI,Arial,sans-serif" font-size="46" font-weight="700" fill="#ffffff">${titulo}</text>
<text x="60" y="360" font-family="Segoe UI,Arial,sans-serif" font-size="26" fill="#ffffff" opacity="0.85">Licenciatura en Informática</text>
<rect x="60" y="390" width="120" height="6" rx="3" fill="#ffffff" opacity="0.9"/>
</svg>`;
  fs.writeFileSync(path.join(raiz, 'eventos', archivo), svg);
}

function evidencia(titulo, icono, c1, c2, archivo) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
${grad('g', c1, c2)}
<rect width="800" height="500" fill="url(#g)"/>
<circle cx="660" cy="90" r="120" fill="#ffffff" opacity="0.09"/>
<circle cx="90" cy="430" r="150" fill="#ffffff" opacity="0.08"/>
<text x="330" y="235" font-family="Segoe UI,Arial,sans-serif" font-size="84" text-anchor="middle">${icono}</text>
<text x="400" y="330" font-family="Segoe UI,Arial,sans-serif" font-size="30" font-weight="600" fill="#ffffff" text-anchor="middle">${titulo}</text>
</svg>`;
  fs.writeFileSync(path.join(raiz, 'evidencias', archivo), svg);
}

/* Identidad del portal */
const logo = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
${grad('g', '#4f46e5', '#06b6d4')}
<rect width="512" height="512" rx="112" fill="url(#g)"/>
<text x="256" y="200" font-family="Consolas,monospace" font-size="120" font-weight="700" fill="#ffffff" text-anchor="middle">&lt;/&gt;</text>
<circle cx="256" cy="330" r="10" fill="#a5f3fc"/>
<circle cx="216" cy="330" r="10" fill="#ffffff" opacity="0.7"/>
<circle cx="296" cy="330" r="10" fill="#ffffff" opacity="0.7"/>
<rect x="176" y="380" width="160" height="14" rx="7" fill="#ffffff" opacity="0.9"/>
</svg>`;
fs.writeFileSync(path.join(raiz, 'logo.svg'), logo);
fs.writeFileSync(path.join(raiz, 'favicon.svg'), logo);

const logoBlanco = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
${grad('g', '#6366f1', '#22d3ee')}
<rect width="512" height="512" rx="112" fill="url(#g)"/>
<text x="256" y="200" font-family="Consolas,monospace" font-size="120" font-weight="700" fill="#ffffff" text-anchor="middle">&lt;/&gt;</text>
<circle cx="256" cy="330" r="10" fill="#a5f3fc"/>
<circle cx="216" cy="330" r="10" fill="#ffffff" opacity="0.7"/>
<circle cx="296" cy="330" r="10" fill="#ffffff" opacity="0.7"/>
<rect x="176" y="380" width="160" height="14" rx="7" fill="#ffffff" opacity="0.9"/>
</svg>`;
fs.writeFileSync(path.join(raiz, 'logo-blanco.svg'), logoBlanco);

const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
${grad('g', '#312e81', '#0891b2')}
<rect width="1200" height="700" fill="url(#g)"/>
<circle cx="980" cy="120" r="260" fill="#ffffff" opacity="0.06"/>
<circle cx="140" cy="600" r="300" fill="#ffffff" opacity="0.05"/>
<circle cx="700" cy="560" r="140" fill="#ffffff" opacity="0.05"/>
<text x="90" y="300" font-family="Consolas,monospace" font-size="120" font-weight="700" fill="#ffffff" opacity="0.95">&lt;/&gt;</text>
<text x="90" y="420" font-family="Segoe UI,Arial,sans-serif" font-size="58" font-weight="700" fill="#ffffff">Informática Destaca</text>
<text x="90" y="480" font-family="Segoe UI,Arial,sans-serif" font-size="30" fill="#e0f2fe">Talento, eventos y trayectoria estudiantil</text>
</svg>`;
fs.writeFileSync(path.join(raiz, 'hero.svg'), hero);

const avDefault = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
${grad('g', '#64748b', '#334155')}
<rect width="320" height="320" rx="160" fill="url(#g)"/>
<circle cx="160" cy="126" r="50" fill="#ffffff" opacity="0.85"/>
<path d="M160 192c-54 0-88 30-96 68a160 160 0 0 0 192 0c-8-38-42-68-96-68z" fill="#ffffff" opacity="0.85"/>
</svg>`;
fs.writeFileSync(path.join(raiz, 'avatars', 'default.svg'), avDefault);

/* Avatares */
avatar('AR', '#4f46e5', '#7c3aed', 'avatar-ana.svg');
avatar('DM', '#0891b2', '#2563eb', 'avatar-diego.svg');
avatar('VH', '#db2777', '#9333ea', 'avatar-valeria.svg');
avatar('ET', '#0d9488', '#059669', 'avatar-emiliano.svg');
avatar('RO', '#d97706', '#dc2626', 'avatar-renata.svg');
avatar('SC', '#2563eb', '#4f46e5', 'avatar-sebastian.svg');
avatar('ME', '#7c3aed', '#db2777', 'avatar-mariana.svg');

/* Portadas de eventos */
portada('CodeFest UTV 2026', '🏆', '#4f46e5', '#7c3aed', 'ev-codefest.svg');
portada('CONATE 2026', '🎓', '#0891b2', '#2563eb', 'ev-conate.svg');
portada('Feria de Proyectos 2026', '🛠️', '#d97706', '#db2777', 'ev-feria.svg');
portada('Maratón de Programación', '💻', '#0d9488', '#0891b2', 'ev-maraton.svg');
portada('Taller de Nube AWS', '☁️', '#2563eb', '#06b6d4', 'ev-taller-aws.svg');
portada('GitFest Software Libre', '🐧', '#334155', '#4f46e5', 'ev-gitfest.svg');
portada('Webinar Ciberseguridad', '🔐', '#9333ea', '#db2777', 'ev-webinar-ciber.svg');
portada('Sin imagen', '📅', '#64748b', '#334155', 'default.svg');

/* Evidencias */
evidencia('Maratón de Programación', '🥇', '#0d9488', '#0891b2', 'ev-maraton-equipo.svg');
evidencia('Ponencia en CONATE', '🎤', '#4f46e5', '#7c3aed', 'ev-conate-ponencia.svg');
evidencia('Proyecto GestorU', '📊', '#d97706', '#dc2626', 'ev-feria-gestoru.svg');
evidencia('Competencia CTF', '🛡️', '#db2777', '#9333ea', 'ev-ctf-conate.svg');
evidencia('Taller de Nube AWS', '☁️', '#2563eb', '#06b6d4', 'ev-taller-aws-grupo.svg');

console.log('Imágenes SVG generadas en', raiz);
