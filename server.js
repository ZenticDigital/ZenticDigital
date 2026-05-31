/* ==============================
   SERVER.JS — ZenticDigital
   Express server — static files + secret admin dashboard
   ============================== */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------- CONFIG ----------
const SECRET_PATH = '/dashboard-secret-xyz';
const LEADS_FILE = path.join(__dirname, 'data', 'leads.json');

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (the entire ZenticDigital site)
app.use(express.static(__dirname));

// ---------- API: Capture leads from contact form ----------
app.post('/api/leads', (req, res) => {
  const { name, business, city, email, phone, message } = req.body;

  if (!name || !business || !city || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const lead = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    business,
    city,
    email,
    phone: phone || '',
    message: message || '',
    source: req.headers.referer || 'direct',
    createdAt: new Date().toISOString()
  };

  let leads = [];
  if (fs.existsSync(LEADS_FILE)) {
    try {
      leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    } catch { leads = []; }
  }

  leads.unshift(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));

  res.json({ success: true, id: lead.id });
});

// ---------- API: Get leads (for admin dashboard) ----------
app.get('/api/leads', (req, res) => {
  if (!fs.existsSync(LEADS_FILE)) return res.json([]);
  try {
    const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
    res.json(leads);
  } catch {
    res.json([]);
  }
});

// ---------- SECRET ADMIN DASHBOARD ----------
app.get(SECRET_PATH, (req, res) => {
  let leads = [];
  if (fs.existsSync(LEADS_FILE)) {
    try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8')); } catch { leads = []; }
  }

  const totalLeads = leads.length;
  const todayLeads = leads.filter(l =>
    l.createdAt && l.createdAt.startsWith(new Date().toISOString().slice(0, 10))
  ).length;
  const uniqueCities = [...new Set(leads.map(l => l.city).filter(Boolean))].length;

  const leadsRows = leads.map(l => `
    <tr>
      <td>${escHtml(l.name)}</td>
      <td>${escHtml(l.business)}</td>
      <td>${escHtml(l.city)}</td>
      <td><a href="mailto:${escHtml(l.email)}">${escHtml(l.email)}</a></td>
      <td>${l.phone ? escHtml(l.phone) : '—'}</td>
      <td class="msg-cell">${escHtml(l.message || '—')}</td>
      <td class="date-cell">${l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '—'}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin — ZenticDigital</title>
  <meta name="robots" content="noindex, nofollow">
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', sans-serif; background: #050505; color: #fff; padding: 40px 24px; }
    .admin-wrap { max-width: 1400px; margin: 0 auto; }
    .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; flex-wrap: wrap; gap: 16px; }
    .admin-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 600; }
    .admin-logo span { color: #C9A84C; font-style: italic; }
    .admin-badge { font-size: 0.7rem; background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.2); color: #E8C97A; padding: 6px 14px; border-radius: 100px; letter-spacing: 1px; text-transform: uppercase; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
    .stat-card { background: #0f0f0f; border: 1px solid rgba(201,168,76,0.12); border-radius: 12px; padding: 28px 24px; }
    .stat-number { font-family: 'Cormorant Garamond', serif; font-size: 2.8rem; font-weight: 700; color: #C9A84C; }
    .stat-label { font-size: 0.8rem; color: #888; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
    h2 { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; color: #E8C97A; }
    .table-wrap { background: #0f0f0f; border: 1px solid rgba(201,168,76,0.12); border-radius: 12px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    th { text-align: left; padding: 14px 16px; background: rgba(201,168,76,0.04); border-bottom: 1px solid rgba(201,168,76,0.1); color: #888; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap; }
    td { padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); color: #ccc; }
    tr:hover td { background: rgba(201,168,76,0.02); }
    .msg-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #888; }
    .date-cell { white-space: nowrap; color: #666; font-size: 0.75rem; }
    a { color: #C9A84C; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .empty { text-align: center; padding: 60px 20px; color: #555; }
    .empty-icon { font-size: 2rem; margin-bottom: 12px; }
    .security-note { margin-top: 24px; padding: 12px 16px; background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.1); border-radius: 8px; font-size: 0.75rem; color: #666; text-align: center; }
    @media (max-width: 768px) { .stats-grid { grid-template-columns: 1fr; } .table-wrap { overflow-x: auto; } }
  </style>
</head>
<body>
  <div class="admin-wrap">
    <div class="admin-header">
      <div class="admin-logo">Zentic<span>Digital</span> <span class="admin-badge">Admin</span></div>
      <div class="admin-badge">🔒 Secret Dashboard</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">${totalLeads}</div><div class="stat-label">Total Leads</div></div>
      <div class="stat-card"><div class="stat-number">${todayLeads}</div><div class="stat-label">Today</div></div>
      <div class="stat-card"><div class="stat-number">${uniqueCities}</div><div class="stat-label">Cities Reached</div></div>
    </div>

    <h2>Lead Submissions</h2>
    <div class="table-wrap">
      ${totalLeads === 0 ? `
        <div class="empty">
          <div class="empty-icon">📭</div>
          <p>No leads yet. Leads from the contact form will appear here.</p>
        </div>
      ` : `
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Business</th>
              <th>City</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>${leadsRows}</tbody>
        </table>
      `}
    </div>
    <div class="security-note">🔒 This page is intentionally hidden and not linked from the public site. Accessible only via the secret URL.</div>
  </div>
</body>
</html>`;

  res.send(html);
});

// ---------- START ----------
app.listen(PORT, () => {
  console.log(`\n  🚀  ZenticDigital server running at http://localhost:${PORT}`);
  console.log(`  🔒  Admin dashboard at http://localhost:${PORT}${SECRET_PATH}\n`);
});

// ---------- HELPERS ----------
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
