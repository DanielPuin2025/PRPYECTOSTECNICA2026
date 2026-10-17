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

const defaultDb = {
  projects: [],
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

const collections = { projects: buildProject, gallery: buildGallery };

async function handleApi(req, res, url) {
  const method = req.method;

  if (url.pathname === '/api/data' && method === 'GET') {
    return send(res, 200, db, { 'Cache-Control': 'no-store' });
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
