'use strict';

/**
 * سيرفر بسيط بدون أي مكتبات خارجية:
 *  - يقدّم ملفات الموقع الثابتة (HTML/CSS/JS/الصور)
 *  - POST /api/lead  → يحفظ طلبات عرض السعر في data/leads.json
 *  - GET  /api/health → فحص سريع
 *
 * التشغيل:  node server.js   (أو npm start)
 */

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const MAX_BODY = 16 * 1024;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const STATIC_MAX_AGE = 0; // أثناء التطوير: لا كاش، عشان أي تعديل يظهر فوراً

/* ------------------------------- أدوات مساعدة ------------------------------ */

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function sendText(res, status, text, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(text),
    'Cache-Control': 'no-store',
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('too_large'), { code: 'TOO_LARGE' }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function normalizePhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('966')) digits = '0' + digits.slice(3);
  if (digits.startsWith('5') && digits.length === 9) digits = '0' + digits;
  return digits;
}

function clean(value, max = 400) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

function newLeadId() {
  return 'L' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function readLeads() {
  try {
    const raw = await fsp.readFile(LEADS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    console.error('[leads] تعذّر قراءة الملف، سيتم البدء بقائمة جديدة:', err.message);
    return [];
  }
}

async function saveLead(lead) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const leads = await readLeads();
  leads.push(lead);
  const tmp = `${LEADS_FILE}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(leads, null, 2), 'utf8');
  await fsp.rename(tmp, LEADS_FILE);
}

async function handleLead(req, res) {
  let payload;
  try {
    const raw = await readBody(req);
    payload = raw ? JSON.parse(raw) : {};
  } catch (err) {
    if (err.code === 'TOO_LARGE') return sendJson(res, 413, { success: false, message: 'الطلب كبير جداً.' });
    return sendJson(res, 400, { success: false, message: 'صيغة الطلب غير صحيحة.' });
  }

  const name = clean(payload.name, 80);
  const phone = normalizePhone(payload.phone);
  const city = clean(payload.city, 60);
  const service = clean(payload.service, 80);
  const area = clean(payload.area, 40);
  const notes = clean(payload.notes, 600);
  const source = clean(payload.source, 40) || 'form';

  const errors = {};
  if (name.length < 2) errors.name = 'الاسم مطلوب.';
  if (!/^05\d{8}$/.test(phone)) errors.phone = 'رقم الجوال غير صحيح (مثال: 0555000000).';
  if (!city) errors.city = 'المدينة مطلوبة.';
  if (!service) errors.service = 'اختر الخدمة المطلوبة.';

  if (Object.keys(errors).length) {
    return sendJson(res, 400, { success: false, message: 'تحقّق من البيانات المدخلة.', errors });
  }

  const lead = {
    id: newLeadId(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    city,
    service,
    area,
    notes,
    source,
  };

  try {
    await saveLead(lead);
  } catch (err) {
    console.error('[leads] تعذّر حفظ الطلب:', err.message);
    return sendJson(res, 500, { success: false, message: 'حدث خطأ أثناء الحفظ، جرّب مرة أخرى أو تواصل معنا على الواتساب.' });
  }

  console.log(`[leads] طلب جديد ${lead.id} — ${lead.city} — ${lead.service}`);
  return sendJson(res, 200, { success: true, id: lead.id, message: 'تم استلام طلبك بنجاح.' });
}

/* ------------------------------ الملفات الثابتة ----------------------------- */

async function serveStatic(req, res, pathname) {
  let relative = decodeURIComponent(pathname);
  if (relative.endsWith('/')) relative += 'index.html';

  const filePath = path.join(ROOT, path.normalize(relative));
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, 'index.html')) {
    return sendText(res, 403, 'غير مسموح');
  }

  let stats;
  try {
    stats = await fsp.stat(filePath);
    if (stats.isDirectory()) return serveStatic(req, res, path.join(pathname, 'index.html'));
  } catch {
    return sendNotFound(res);
  }

  const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stats.size,
    'Cache-Control': STATIC_MAX_AGE ? `public, max-age=${STATIC_MAX_AGE}` : 'no-cache',
  });

  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(filePath).pipe(res);
}

function sendNotFound(res) {
  const html = `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>الصفحة غير موجودة</title>
<style>body{font-family:'Tajawal',system-ui,sans-serif;background:#f7f4ec;color:#14211c;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center}
a{color:#14624a;font-weight:700}</style></head>
<body><div><h1>٤٠٤</h1><p>ما وجدنا الصفحة اللي تدور عليها.</p><p><a href="/">الرجوع للصفحة الرئيسية</a></p></div></body></html>`;
  sendText(res, 404, html, 'text/html; charset=utf-8');
}

/* --------------------------------- السيرفر -------------------------------- */

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const method = req.method || 'GET';

  try {
    if (pathname === '/api/lead') {
      if (method !== 'POST') return sendJson(res, 405, { success: false, message: 'استخدم POST.' });
      return await handleLead(req, res);
    }

    if (pathname === '/api/health') {
      if (method !== 'GET' && method !== 'HEAD') return sendJson(res, 405, { success: false, message: 'استخدم GET.' });
      return sendJson(res, 200, { ok: true, uptime: Math.round(process.uptime()) });
    }

    if (method !== 'GET' && method !== 'HEAD') return sendText(res, 405, 'استخدم GET.');

    return await serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[server] خطأ غير متوقع:', err);
    if (!res.headersSent) sendText(res, 500, 'خطأ في السيرفر');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`\n  🌿  صفحة تنسيق الحدائق تعمل على http://${HOST}:${PORT}`);
  console.log(`  📥  طلبات عرض السعر تُحفظ في ${LEADS_FILE}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
