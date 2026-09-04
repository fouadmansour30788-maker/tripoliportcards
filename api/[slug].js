const fs = require('fs');
const path = require('path');
const assets = require('./assets');

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
    --bg: #3e535b;
    --bg-dark: #28383d;
    --gold: #c5a955;
    --paper: #f2efe6;
    --line: rgba(242,239,230,0.16);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    background: linear-gradient(165deg, var(--bg) 0%, var(--bg-dark) 100%);
    font-family: Georgia, 'Times New Roman', serif;
    color: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px 18px;
  }
  .card {
    width: 100%;
    max-width: 420px;
    padding: 8px 4px;
    position: relative;
  }
  .top-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 22px;
  }
  .eyebrow {
    font-style: italic;
    font-size: 13px;
    line-height: 1.55;
    color: var(--paper);
    opacity: 0.92;
    margin: 0;
    max-width: 250px;
  }
  .logo {
    width: 54px;
    height: auto;
    flex-shrink: 0;
    margin-left: 12px;
  }
  h1 {
    font-family: Georgia, serif;
    font-style: italic;
    font-weight: 700;
    font-size: 27px;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    margin: 0 0 4px;
    color: var(--gold);
    line-height: 1.15;
  }
  .title {
    font-style: italic;
    font-weight: 700;
    font-size: 15px;
    color: var(--gold);
    margin: 0 0 26px;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 11px 0;
  }
  .field img {
    width: 22px;
    height: 22px;
    object-fit: contain;
    flex-shrink: 0;
  }
  .field-text {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 14.5px;
    color: var(--paper);
  }
  .field a { color: var(--paper); text-decoration: none; }
  .field a:hover { color: var(--gold); }
  .save-btn {
    display: block;
    text-align: center;
    margin-top: 26px;
    padding: 15px;
    background: var(--gold);
    color: #24333a;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    font-size: 14.5px;
    letter-spacing: 0.02em;
    text-decoration: none;
    border-radius: 3px;
  }
  .save-btn:active { opacity: 0.85; }
  .footer {
    margin-top: 20px;
    text-align: center;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 11px;
    color: var(--paper);
    opacity: 0.65;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="top-row">
      <p class="eyebrow">Lebanese Republic<br/>Ministry of Public Works and Transport<br/>Office d'Exploitation du Port de Tripoli</p>
      <img class="logo" src="data:image/png;base64,${assets.logo}" alt="Port of Tripoli" />
    </div>

    <h1>${escapeHtml(c.fullName)}</h1>
    <p class="title">${escapeHtml(c.title)}</p>

    <div class="field">
      <img src="data:image/png;base64,${assets.iconMobile}" alt="" />
      <span class="field-text"><a href="tel:${c.mobile.replace(/\s+/g, '')}">M: ${escapeHtml(c.mobile)}</a> | <a href="tel:${c.phone.replace(/\s+/g, '')}">T: ${escapeHtml(c.phone)}</a></span>
    </div>
    <div class="field">
      <img src="data:image/png;base64,${assets.iconEmail}" alt="" />
      <span class="field-text"><a href="mailto:${c.email}">${escapeHtml(c.email)}</a></span>
    </div>
    <div class="field">
      <img src="data:image/png;base64,${assets.iconAddress}" alt="" />
      <span class="field-text">${escapeHtml(c.address)}</span>
    </div>
    <div class="field">
      <img src="data:image/png;base64,${assets.iconWebsite}" alt="" />
      <span class="field-text"><a href="${c.website}">${escapeHtml(c.website.replace(/^https?:\/\//, ''))}</a></span>
    </div>

    <a class="save-btn" href="/api/${slug}?format=vcf">Save Contact</a>
    <p class="footer">Port of Tripoli · Board of Directors</p>
  </div>
  <iframe id="autosave" style="display:none" src="/api/${slug}?format=vcf"></iframe>
</body>
</html>`;
}

module.exports = (req, res) => {
  const { slug } = req.query;
  // Default (plain QR-code URL, no query string) shows the branded page,
  // which auto-triggers the "Save Contact" prompt via a hidden iframe.
  // ?format=vcf serves the raw vCard directly (used by the iframe and the
  // visible "Save Contact" button as a manual fallback).
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
