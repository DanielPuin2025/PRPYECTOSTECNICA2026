'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const MAX_UPLOAD = 4 * 1024 * 1024;

if (!ADMIN_PASSWORD) console.warn('ADVERTENCIA: define ADMIN_PASSWORD o nadie podrá administrar.');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const defaultContent = {
  header: {
    siteTitle: 'Sustentaciones 2026 | Técnica en Programación de Software - Megacolegio El Progreso & SENA',
    siteDescription: 'Proyectos de los estudiantes de la Técnica en Programación de Software, Megacolegio El Progreso & SENA Yopal. Sustentaciones 21 de octubre de 2026.',
    schoolLogo: 'img/logo_mega_ok.png',
    senaLogo: 'img/logo_sena_ok.png',
    technicalLogo: 'img/LOGO TECNICA 2026 SIN FONDO.png',
    kicker: 'Articulación Media',
    programName: 'Programación de Software'
  },
  hero: {
    eyebrow: 'Megacolegio El Progreso & SENA Yopal',
    titlePrefix: 'Técnica en',
    titleEmphasis: 'Programación de Software',
    description: 'Crea, innova y desarrolla el futuro digital. Formamos profesionales con habilidades clave en diseño, desarrollo y pruebas de sistemas informáticos bajo metodologías ágiles en Yopal, Casanare.',
    primaryButton: 'Ver Proyectos 21 de Octubre',
    secondaryButton: 'Conocer Más',
    image: 'img/publicidad-cusiana.jpg',
    slogan: '¡Tu esfuerzo hoy, abre grandes oportunidades para mañana!',
    cardTitle: 'Programación Megacolegio Digital',
    cardDescription: 'Articulación con la Educación Media - SENA Regional Casanare'
  },
  about: {
    title: '¿De qué se trata la técnica?',
    description: 'El Técnico en Programación de Software forma estudiantes con competencias de alta demanda en el sector tecnológico actual.',
    features: [
      { icon: 'fa-laptop-code', title: 'Desarrollo de Software', description: 'Aprende a diseñar, construir y desplegar aplicaciones web y de escritorio eficientes, aplicando lógica de programación y buenas prácticas de ingeniería.' },
      { icon: 'fa-database', title: 'Bases de Datos & SQL', description: 'Gestiona y almacena información de manera segura utilizando motores de bases de datos relacionales y consultas optimizadas para sistemas robustos.' },
      { icon: 'fa-gamepad', title: 'Videojuegos & Apps', description: 'Desarrolla tus propios proyectos interactivos y videojuegos experimentando con creatividad y lógica computacional avanzada.' }
    ],
    technologyTitle: 'Tecnologías y Lenguajes que Dominamos',
    technologies: [
      { icon: 'fa-brands fa-python text-amber-400', name: 'Python' },
      { icon: 'fa-brands fa-java text-red-500', name: 'Java' },
      { icon: 'fa-solid fa-code text-blue-500', name: 'C++' },
      { icon: 'fa-solid fa-server text-sky-400', name: 'SQL / DB' },
      { icon: 'fa-brands fa-node-js text-emerald-500', name: 'Node.js' }
    ]
  },
  projects: {
    badge: 'Evento Especial: 21 de Octubre',
    title: 'Proyectos a Presentar',
    description: 'Conoce los proyectos desarrollados por los estudiantes de la técnica. Haz clic en cualquier tarjeta para abrir la página de cada equipo.',
    eventDate: '2026-10-21',
    countdownLabel: 'Faltan para las sustentaciones',
    countdownToday: '¡Hoy es el día de las sustentaciones!',
    countdownDone: 'Las sustentaciones ya se realizaron. ¡Gracias por participar!',
    countdownDays: 'Días',
    countdownHours: 'Horas',
    countdownMinutes: 'Min',
    countdownSeconds: 'Seg',
    searchPlaceholder: 'Buscar proyecto o estudiante...',
    projectLinkLabel: 'Visitar',
    emptyNoProjects: 'Pronto publicaremos los proyectos del 21 de octubre.',
    emptyNoResults: 'No hay proyectos que coincidan con la búsqueda.',
    visibilityEnabled: false,
    visibilityDate: '2026-10-21',
    visibilityTime: '08:00',
    visibilityMessage: 'Los proyectos estarán disponibles el día del evento.'
  },
  gallery: {
    title: 'Galería de Momentos',
    description: 'Salidas pedagógicas, prácticas técnicas, trabajo en equipo y vivencias de nuestros grupos en el Megacolegio El Progreso y SENA Yopal.'
  },
  spotlight: {
    eyebrow: 'Propuesta de identidad',
    title: 'Un nuevo diseño para nuestra técnica',
    description: 'Queremos incluir este nuevo diseño para la Técnica en Programación de Software del SENA, articulada con la I.E. Megacolegio El Progreso. Una identidad que representa el talento, la creatividad y el futuro digital de nuestros estudiantes.',
    image: 'img/LOGO TECNICA 2026 SIN FONDO.png'
  },
  profile: {
    eyebrow: 'Articulación con la Educación Media',
    title: 'Perfil Profesional del Egresado',
    description: 'Al finalizar el programa en el Megacolegio El Progreso con el SENA, estarás en capacidad de desempeñarte con éxito en el mundo digital y continuar tu formación superior.',
    points: [
      'Analizar y desarrollar software de acuerdo con las necesidades del cliente.',
      'Implementar soluciones tecnológicas y bases de datos robustas.',
      'Realizar pruebas de software y asegurar altos estándares de calidad.',
      'Trabajar en equipos ágiles de desarrollo con metodologías modernas.'
    ],
    benefitsTitle: 'Bondades de ser Egresado SENA',
    benefits: [
      { title: 'Doble Titulación', description: 'Título de Bachiller Técnico y Técnico SENA simultáneamente.' },
      { title: 'Continuidad Académica', description: 'Acceso preferencial a tecnologías y carreras profesionales universitarias.' },
      { title: 'Mayor Empleabilidad', description: 'Conexión directa con el sector productivo y tecnológico regional y nacional.' }
    ]
  },
  footer: {
    title: 'Técnica en Programación de Software - Megacolegio El Progreso & SENA',
    location: 'Yopal, Casanare, Colombia.',
    copyright: '© 2026 Todos los derechos reservados.',
    creator: 'Creador: Daniel Puin Instructor Sena',
    creatorImage: ''
  }
};

const defaultDb = {
  projects: [],
  content: defaultContent,
  spotlightVotes: [],
  gallery: [
    { id: 'g1', title: 'Práctica en Laboratorio de Cómputo', image: 'img/4.jpeg', category: 'Práctica Técnica' },
    { id: 'g2', title: 'Estudiantes Técnica Programación', image: 'img/grupo.jpg', category: 'Grupos' },
    { id: 'g3', title: 'Salida Pedagógica Agencia Pública de Empleo', image: 'img/salida-agencia.jpg', category: 'Salida Pedagógica' },
    { id: 'g4', title: 'Programación Megacolegio Digital', image: 'img/publicidad-cusiana.jpg', category: 'Información' },
    { id: 'g5', title: 'Trabajo en equipo', image: 'img/1.jpeg', category: 'Grupos' },
    { id: 'g6', title: 'Jornada de formación', image: 'img/2.jpeg', category: 'Práctica Técnica' }
  ]
};

let db;
try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
catch { db = defaultDb; save(); }
if (!db.content) {
  db.content = defaultContent;
  save();
}
if (!Array.isArray(db.spotlightVotes)) {
  db.spotlightVotes = [];
  save();
}

function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

const sessions = new Map(); // token -> expiry
const attempts = new Map(); // ip -> {n, t}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json'
};
const IMG_EXT = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif' };

function send(res, code, body, headers = {}) {
  const isObj = typeof body === 'object' && !Buffer.isBuffer(body);
  res.writeHead(code, Object.assign({
    'Content-Type': isObj ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff'
  }, headers));
  res.end(isObj ? JSON.stringify(body) : body);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(new Error('too_large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function isAuth(req) {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  const exp = sessions.get(t);
  if (!exp) return false;
  if (exp < Date.now()) { sessions.delete(t); return false; }
  return true;
}

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function cleanUrl(u) {
  try {
    const p = new URL(String(u).trim());
    return ['http:', 'https:'].includes(p.protocol) ? p.href : null;
  } catch { return null; }
}

// Imágenes: ruta local simple (sin traversal) o http(s)
function cleanImage(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return cleanUrl(u) || '';
  if (/^[\w\-. %/]+$/.test(u) && !u.includes('..')) return u;
  return '';
}

const str = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

function normalizeContent(input) {
  const value = input && typeof input === 'object' ? input : {};
  const text = (section, key, max = 500) => str(value[section]?.[key] ?? defaultContent[section][key], max);
  const image = (section, key) => {
    const path = cleanImage(value[section]?.[key] ?? defaultContent[section][key]) || defaultContent[section][key];
    return path === 'img/logotecnicaok.jpeg' && (section === 'header' && key === 'technicalLogo' || section === 'spotlight' && key === 'image')
      ? 'img/LOGO TECNICA 2026 SIN FONDO.png'
      : path;
  };
  const date = str(value.projects?.eventDate ?? defaultContent.projects.eventDate, 10);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00`).getTime())
    && new Date(`${date}T00:00:00`).toISOString().slice(0, 10) === date ? date : defaultContent.projects.eventDate;
  const lines = (section, key, maxItems, maxLength) => {
    const source = value[section]?.[key];
    if (!Array.isArray(source)) return defaultContent[section][key].slice();
    return source.slice(0, maxItems).map(item => str(item, maxLength)).filter(Boolean);
  };
  const cards = (section, key, maxItems, titleMax, descriptionMax) => {
    const source = value[section]?.[key];
    const defaults = defaultContent[section][key];
    if (!Array.isArray(source)) return defaults.map(item => ({ ...item }));
    return source.slice(0, maxItems).map((item, index) => ({
      icon: defaults[index]?.icon || defaults[0].icon,
      title: str(item?.title, titleMax),
      description: str(item?.description, descriptionMax)
    })).filter(item => item.title || item.description);
  };

  const technologies = Array.isArray(value.about?.technologies)
    ? value.about.technologies.slice(0, 15).map((item, index) => ({
      icon: defaultContent.about.technologies[index]?.icon || 'fa-solid fa-code text-senaGreen',
      name: str(item?.name, 40)
    })).filter(item => item.name)
    : defaultContent.about.technologies.map(item => ({ ...item }));

  return {
    header: {
      siteTitle: text('header', 'siteTitle', 180),
      siteDescription: text('header', 'siteDescription', 300),
      schoolLogo: image('header', 'schoolLogo'),
      senaLogo: image('header', 'senaLogo'),
      technicalLogo: image('header', 'technicalLogo'),
      kicker: text('header', 'kicker', 80),
      programName: text('header', 'programName', 100)
    },
    hero: {
      eyebrow: text('hero', 'eyebrow', 120),
      titlePrefix: text('hero', 'titlePrefix', 100),
      titleEmphasis: text('hero', 'titleEmphasis', 120),
      description: text('hero', 'description', 600),
      primaryButton: text('hero', 'primaryButton', 80),
      secondaryButton: text('hero', 'secondaryButton', 80),
      image: image('hero', 'image'),
      slogan: text('hero', 'slogan', 160),
      cardTitle: text('hero', 'cardTitle', 120),
      cardDescription: text('hero', 'cardDescription', 200)
    },
    about: {
      title: text('about', 'title', 120),
      description: text('about', 'description', 500),
      features: cards('about', 'features', 9, 100, 400),
      technologyTitle: text('about', 'technologyTitle', 120),
      technologies
    },
    projects: {
      badge: text('projects', 'badge', 100),
      title: text('projects', 'title', 120),
      description: text('projects', 'description', 500),
      eventDate: validDate,
      countdownLabel: text('projects', 'countdownLabel', 120),
      countdownToday: text('projects', 'countdownToday', 160),
      countdownDone: text('projects', 'countdownDone', 160),
      countdownDays: text('projects', 'countdownDays', 30),
      countdownHours: text('projects', 'countdownHours', 30),
      countdownMinutes: text('projects', 'countdownMinutes', 30),
      countdownSeconds: text('projects', 'countdownSeconds', 30),
      searchPlaceholder: text('projects', 'searchPlaceholder', 120),
      projectLinkLabel: text('projects', 'projectLinkLabel', 40),
      emptyNoProjects: text('projects', 'emptyNoProjects', 200),
      emptyNoResults: text('projects', 'emptyNoResults', 200),
      visibilityEnabled: value.projects?.visibilityEnabled === true,
      visibilityDate: str(value.projects?.visibilityDate, 10) || defaultContent.projects.visibilityDate,
      visibilityTime: str(value.projects?.visibilityTime, 5) || defaultContent.projects.visibilityTime,
      visibilityMessage: text('projects', 'visibilityMessage', 200)
    },
    gallery: {
      title: text('gallery', 'title', 120),
      description: text('gallery', 'description', 500)
    },
    spotlight: {
      eyebrow: text('spotlight', 'eyebrow', 100),
      title: text('spotlight', 'title', 120),
      description: text('spotlight', 'description', 600),
      image: image('spotlight', 'image')
    },
    profile: {
      eyebrow: text('profile', 'eyebrow', 120),
      title: text('profile', 'title', 120),
      description: text('profile', 'description', 500),
      points: lines('profile', 'points', 8, 240),
      benefitsTitle: text('profile', 'benefitsTitle', 120),
      benefits: cards('profile', 'benefits', 6, 100, 300)
    },
    footer: {
      title: text('footer', 'title', 180),
      location: text('footer', 'location', 120),
      copyright: text('footer', 'copyright', 120),
      creator: text('footer', 'creator', 120),
      creatorImage: image('footer', 'creatorImage')
    }
  };
}

const normalizedContent = normalizeContent(db.content);
if (JSON.stringify(db.content) !== JSON.stringify(normalizedContent)) {
  db.content = normalizedContent;
  save();
}

function buildProject(b, existing) {
  const url = cleanUrl(b.url);
  if (!str(b.name, 100)) return { error: 'El nombre es obligatorio.' };
  if (!url) return { error: 'El enlace debe ser una URL válida (http o https).' };
  return {
    item: {
      id: existing ? existing.id : crypto.randomUUID(),
      name: str(b.name, 100),
      url,
      logo: cleanImage(b.logo),
      description: str(b.description, 400),
      author: str(b.author, 150)
    }
  };
}

function buildGallery(b, existing) {
  if (!str(b.title, 120)) return { error: 'El título es obligatorio.' };
  const image = cleanImage(b.image);
  if (!image) return { error: 'La imagen es obligatoria.' };
  return { item: { id: existing ? existing.id : crypto.randomUUID(), title: str(b.title, 120), image, category: str(b.category, 40) } };
}

function spotlightVoteSummary(voterKey) {
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  let count = 0;
  let userRating = null;
  for (const vote of db.spotlightVotes) {
    if (!Number.isInteger(vote.rating) || vote.rating < 1 || vote.rating > 5) continue;
    distribution[vote.rating - 1]++;
    total += vote.rating;
    count++;
    if (voterKey && vote.voterKey === voterKey) userRating = vote.rating;
  }
  return {
    count,
    average: count ? Number((total / count).toFixed(1)) : 0,
    distribution,
    userRating
  };
}

const collections = { projects: buildProject, gallery: buildGallery };

async function handleApi(req, res, url) {
  const method = req.method;

  if (url.pathname === '/api/data' && method === 'GET') {
    return send(res, 200, { projects: db.projects, gallery: db.gallery, content: db.content }, { 'Cache-Control': 'no-store' });
  }

  if (url.pathname === '/api/spotlight-votes' && method === 'GET') {
    const voterId = url.searchParams.get('voterId') || '';
    const voterKey = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(voterId)
      ? crypto.createHash('sha256').update(voterId).digest('hex')
      : '';
    return send(res, 200, spotlightVoteSummary(voterKey), { 'Cache-Control': 'no-store' });
  }

  if (url.pathname === '/api/spotlight-votes' && method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req, 2000)); } catch { return send(res, 400, { error: 'Solicitud inválida' }); }
    const voterId = String(body.voterId || '');
    const rating = body.rating;
    if (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(voterId)
      || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return send(res, 400, { error: 'Voto inválido. Selecciona entre 1 y 5 estrellas.' });
    }
    const voterKey = crypto.createHash('sha256').update(voterId).digest('hex');
    if (db.spotlightVotes.some(vote => vote.voterKey === voterKey)) {
      return send(res, 409, { error: 'Ya registraste una votación desde este navegador.', ...spotlightVoteSummary(voterKey) });
    }
    db.spotlightVotes.push({ voterKey, rating });
    save();
    return send(res, 201, spotlightVoteSummary(voterKey));
  }

  if (url.pathname === '/api/login' && method === 'POST') {
    const ip = req.socket.remoteAddress;
    const a = attempts.get(ip) || { n: 0, t: Date.now() };
    if (Date.now() - a.t > 15 * 60 * 1000) { a.n = 0; a.t = Date.now(); }
    if (a.n >= 8) return send(res, 429, { error: 'Demasiados intentos. Espera unos minutos.' });
    let body;
    try { body = JSON.parse(await readBody(req, 2000)); } catch { return send(res, 400, { error: 'Solicitud inválida' }); }
    if (!ADMIN_PASSWORD || !safeEqual(String(body.password || ''), ADMIN_PASSWORD)) {
      a.n++; attempts.set(ip, a);
      return send(res, 401, { error: 'Clave incorrecta.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + 8 * 3600 * 1000);
    return send(res, 200, { token });
  }

  if (!isAuth(req)) return send(res, 401, { error: 'No autorizado' });

  if (url.pathname === '/api/content' && method === 'PUT') {
    let body;
    try { body = JSON.parse(await readBody(req, 30000)); } catch { return send(res, 400, { error: 'Solicitud inválida' }); }
    db.content = normalizeContent(body);
    save();
    return send(res, 200, db.content);
  }

  if (url.pathname === '/api/upload' && method === 'POST') {
    let body;
    try { body = JSON.parse(await readBody(req, MAX_UPLOAD * 1.4)); }
    catch (e) { return send(res, e.message === 'too_large' ? 413 : 400, { error: 'Imagen demasiado grande (máx. 4 MB) o inválida.' }); }
    const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/.exec(String(body.data || ''));
    if (!m) return send(res, 400, { error: 'Formato no permitido. Usa PNG, JPG, WEBP o GIF.' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > MAX_UPLOAD) return send(res, 413, { error: 'Imagen demasiado grande (máx. 4 MB).' });
    const name = crypto.randomBytes(12).toString('hex') + IMG_EXT[m[1]];
    fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
    return send(res, 200, { url: '/uploads/' + name });
  }

  const m = /^\/api\/(projects|gallery)(?:\/([\w-]+))?$/.exec(url.pathname);
  if (!m) return send(res, 404, { error: 'No encontrado' });
  const [, col, id] = m;
  const build = collections[col];

  if (method === 'POST' && !id) {
    let b; try { b = JSON.parse(await readBody(req, 20000)); } catch { return send(res, 400, { error: 'Solicitud inválida' }); }
    const r = build(b);
    if (r.error) return send(res, 400, { error: r.error });
    db[col].push(r.item); save();
    return send(res, 201, r.item);
  }
  if (method === 'PUT' && id) {
    const idx = db[col].findIndex(x => x.id === id);
    if (idx < 0) return send(res, 404, { error: 'No encontrado' });
    let b; try { b = JSON.parse(await readBody(req, 20000)); } catch { return send(res, 400, { error: 'Solicitud inválida' }); }
    const r = build(b, db[col][idx]);
    if (r.error) return send(res, 400, { error: r.error });
    db[col][idx] = r.item; save();
    return send(res, 200, r.item);
  }
  if (method === 'DELETE' && id) {
    db[col] = db[col].filter(x => x.id !== id); save();
    return send(res, 200, { ok: true });
  }
  if (method === 'POST' && id === 'reorder') return send(res, 400, { error: 'No soportado' });
  return send(res, 405, { error: 'Método no permitido' });
}

function serveFile(res, base, rel) {
  let p;
  try { p = path.normalize(path.join(base, decodeURIComponent(rel))); } catch { return send(res, 400, 'Bad request'); }
  if (!p.startsWith(base + path.sep) && p !== base) return send(res, 403, 'Prohibido');
  fs.stat(p, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'No encontrado');
    const ext = path.extname(p).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': st.size,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    fs.createReadStream(p).pipe(res);
  });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    if (url.pathname.startsWith('/uploads/')) return serveFile(res, UPLOAD_DIR, url.pathname.slice(9));
    return serveFile(res, PUBLIC_DIR, url.pathname === '/' ? 'index.html' : url.pathname.slice(1));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: 'Error interno' });
  }
}).listen(PORT, () => console.log('Servidor en puerto ' + PORT));
