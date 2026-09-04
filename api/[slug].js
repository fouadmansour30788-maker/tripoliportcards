const fs = require('fs');
const path = require('path');

function loadContacts() {
  const dataPath = path.join(process.cwd(), 'data', 'contacts.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw);
}

function buildVCard(c) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${c.lastName};${c.firstName};;;`,
    `FN:${c.fullName}`,
    `ORG:${c.org};${c.orgSub || ''}`,
    `TITLE:${c.title}`,
    `TEL;TYPE=CELL:${c.mobile.replace(/\s+/g, '')}`,
    `TEL;TYPE=WORK,VOICE:${c.phone.replace(/\s+/g, '')}`,
    `EMAIL;TYPE=WORK:${c.email}`,
    `ADR;TYPE=WORK:;;${c.address};;;;`,
    `URL:${c.website}`,
    'END:VCARD'
  ];
  return lines.join('\r\n');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderPage(c, slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(c.fullName)} — Port of Tripoli</title>
<style>
  :root {
    --ink: #1c2a2e;
    --slate: #3f565b;
    --slate-light: #6b8489;
    --gold: #c9a24b;
    --paper: #f6f4ee;
    --line: rgba(28,42,46,0.12);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: var(--slate);
    background: linear-gradient(160deg, #3f565b 0%, #2a3d41 100%);
    font-family: 'Georgia', 'Iowan Old Style', serif;
    color: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
  }
  .card {
    width: 100%;
    max-width: 420px;
    background: rgba(246,244,238,0.03);
    border: 1px solid rgba(246,244,238,0.18);
    border-radius: 4px;
    padding: 40px 32px;
  }
  .eyebrow {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.04em;
    color: var(--slate-light);
    line-height: 1.6;
    margin: 0 0 28px;
  }
  h1 {
    font-size: 30px;
    margin: 0 0 6px;
    color: var(--gold);
    font-weight: 400;
    line-height: 1.2;
  }
  .title {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-style: italic;
    font-size: 16px;
    color: var(--paper);
    margin: 0 0 28px;
  }
  .field {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 15px;
    padding: 12px 0;
    border-top: 1px solid rgba(246,244,238,0.14);
    color: var(--paper);
  }
  .field a { color: var(--paper); text-decoration: none; }
  .field a:hover { color: var(--gold); }
  .label {
    display: block;
    font-size: 11px;
    letter-spacing: 0.03em;
    color: var(--slate-light);
    margin-bottom: 3px;
  }
  .save-btn {
    display: block;
    width: 100%;
    text-align: center;
    margin-top: 32px;
    padding: 16px;
    background: var(--gold);
    color: var(--ink);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    border-radius: 3px;
    border: none;
    cursor: pointer;
  }
  .save-btn:active { opacity: 0.85; }
  .footer {
    margin-top: 22px;
    text-align: center;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: var(--slate-light);
  }
</style>
</head>
<body>
  <div class="card">
    <p class="eyebrow">Lebanese Republic<br/>Ministry of Public Works and Transport<br/>Office d'Exploitation du Port de Tripoli</p>
    <h1>${escapeHtml(c.fullName)}</h1>
    <p class="title">${escapeHtml(c.title)}</p>

    <div class="field"><span class="label">Mobile</span><a href="tel:${c.mobile.replace(/\s+/g, '')}">${escapeHtml(c.mobile)}</a></div>
    <div class="field"><span class="label">Office</span><a href="tel:${c.phone.replace(/\s+/g, '')}">${escapeHtml(c.phone)}</a></div>
    <div class="field"><span class="label">Email</span><a href="mailto:${c.email}">${escapeHtml(c.email)}</a></div>
    <div class="field"><span class="label">Address</span>${escapeHtml(c.address)}</div>
    <div class="field"><span class="label">Website</span><a href="${c.website}">${escapeHtml(c.website.replace(/^https?:\/\//, ''))}</a></div>

    <a class="save-btn" href="/api/${slug}?format=vcf">Save Contact</a>
    <p class="footer">Port of Tripoli · Board of Directors</p>
  </div>
</body>
</html>`;
}

module.exports = (req, res) => {
  const { slug } = req.query;
  const format = req.query.format;

  let contacts;
  try {
    contacts = loadContacts();
  } catch (err) {
    res.status(500).send('Could not load contacts data.');
    return;
  }

  const contact = contacts[slug];
  if (!contact) {
    res.status(404).send('Contact not found.');
    return;
  }

  if (format === 'vcf') {
    const vcard = buildVCard(contact);
    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    // "inline" (not "attachment") lets iOS/Android open this straight into
    // the native "Add Contact" screen instead of just downloading a file.
    res.setHeader('Content-Disposition', `inline; filename="${contact.firstName}_${contact.lastName}.vcf"`);
    res.status(200).send(vcard);
    return;
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(renderPage(contact, slug));
};
