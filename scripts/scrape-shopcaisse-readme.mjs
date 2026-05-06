import fs from 'node:fs/promises';

const BASE = 'https://easyshop-v1.readme.io';
const INTRO = `${BASE}/reference/introduction`;

function abs(href) {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('/')) return `${BASE}${href}`;
  return `${BASE}/${href}`;
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractReferenceLinks(html) {
  const links = new Map();
  const re = /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    if (!href.includes('/reference/')) continue;
    const url = abs(href.split('#')[0]);
    if (!url) continue;
    const label = stripTags(m[2]);
    if (url.includes('/login?')) continue;
    if (!links.has(url)) links.set(url, label || '');
  }
  return links;
}

function normalizeLabel(label) {
  return (label || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return '';
  return stripTags(m[1]).replace(/\s*\|\s*Shopcaisse API.*$/i, '').trim();
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return '';
  return stripTags(m[1]);
}

function inferMethodFromLabel(label) {
  const t = label.toLowerCase();
  if (t.endsWith(' get') || /\bget\b/.test(t)) return 'GET';
  if (t.endsWith(' post') || /\bpost\b/.test(t)) return 'POST';
  if (t.endsWith(' put') || /\bput\b/.test(t)) return 'PUT';
  if (t.endsWith(' del') || /\bdel\b/.test(t) || /\bdelete\b/.test(t)) return 'DELETE';
  if (t.endsWith(' patch') || /\bpatch\b/.test(t)) return 'PATCH';
  return '';
}

function inferPathFromLabel(label) {
  const m = label.match(/(\/v\d+\/[\w\-./{}]+)/i);
  return m ? m[1] : '';
}

const introHtml = await fetch(INTRO).then((r) => r.text());
const links = extractReferenceLinks(introHtml);

const pages = [];
for (const [url, navLabel] of links.entries()) {
  try {
    const html = await fetch(url).then((r) => r.text());
    const title = extractTitle(html);
    const h1 = extractH1(html);
    const method = inferMethodFromLabel(navLabel) || inferMethodFromLabel(title) || inferMethodFromLabel(h1);
    const path = inferPathFromLabel(navLabel) || inferPathFromLabel(title) || inferPathFromLabel(h1);
    pages.push({
      url,
      navLabel,
      title,
      h1,
      method,
      path,
      category: '',
    });
  } catch {
    pages.push({
      url,
      navLabel,
      title: '',
      h1: '',
      method: '',
      path: '',
      category: '',
    });
  }
}

const categoryOrder = [
  'getting started',
  'authentication',
  'applications',
  'webhooks',
  'main resources',
  'customers',
  'customers - loyalty',
  'items',
  'item families',
  'item prices',
  'orders (from pos)',
  'orders (external)',
  'sales',
  'seating plan',
  'stocks',
  'faq',
  'shopcaisse api',
];

let current = '';
for (const p of pages) {
  const lbl = normalizeLabel(p.navLabel);
  if (categoryOrder.includes(lbl)) current = p.navLabel.trim();
  p.category = current;
}

pages.sort((a, b) => a.url.localeCompare(b.url));

const endpoints = pages.filter((p) => p.method);
const stats = {
  pages: pages.length,
  endpointsDetected: endpoints.length,
  byMethod: endpoints.reduce((acc, e) => {
    acc[e.method] = (acc[e.method] || 0) + 1;
    return acc;
  }, {}),
  byCategory: pages.reduce((acc, p) => {
    const key = p.category || 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
};

await fs.writeFile('docs/scraped/shopcaisse-readme-pages.json', JSON.stringify({ generatedAt: new Date().toISOString(), source: INTRO, stats, pages }, null, 2));

const csvHeader = ['category','method','path','title','navLabel','url'];
const csvRows = pages.map((p) => [p.category,p.method,p.path,p.title || p.h1,p.navLabel,p.url].map((v) => '"' + String(v || '').replaceAll('"','""') + '"').join(','));
await fs.writeFile('docs/scraped/shopcaisse-readme-pages.csv', [csvHeader.join(','), ...csvRows].join('\n'));

const md = [];
md.push('# Shopcaisse ReadMe v1 - Synthese');
md.push('');
md.push(`Source: ${INTRO}`);
md.push(`Generation: ${new Date().toISOString()}`);
md.push('');
md.push('## Chiffres cles');
md.push(`- Pages reference detectees: ${stats.pages}`);
md.push(`- Endpoints detectes (methode explicite): ${stats.endpointsDetected}`);
md.push(`- Repartition methodes: ${Object.entries(stats.byMethod).map(([k,v]) => `${k}=${v}`).join(', ') || 'N/A'}`);
md.push('');
md.push('## Domaines fonctionnels couverts');
md.push('- Authentification et permissions (tokens JWT, access levels, app permissions).');
md.push('- Applications (creation, rotation token, suppression, logo, detail).');
md.push('- Ressources coeur (organisations, companies, stores, POS).');
md.push('- Catalogue (items, familles, boards, menus, modificateurs).');
md.push('- Prix (price lists, prix par item, TVA).');
md.push('- Clients et fidelite.');
md.push('- Commandes POS et commandes externes (creation, verification, paiement, annulation, statuts).');
md.push('- Ventes, shifts caisse, plan de salle, stocks.');
md.push('- Webhooks de notifications.');
md.push('');
md.push('## Endpoints e-commerce prioritaires (MVP)');
md.push('- Items: liste/lecture/mise a jour d\'article, familles, prix, TVA.');
md.push('- Stocks: lecture du stock magasin.');
md.push('- Orders external: verification panier, creation commande, commande avec paiement, statuts.');
md.push('- Customers: CRUD client + fidelite (si besoin).');
md.push('- Stores opening hours / order slots pour click & collect.');
md.push('');
md.push('## Limites du scraping');
md.push('- Cette extraction s\'appuie sur la navigation ReadMe publique et les labels des pages.');
md.push('- Certains chemins exacts peuvent etre affiches dans le corps de page et non dans le titre/navigation.');
md.push('- Pour une integration stricte, valider chaque endpoint cible avec schema request/response et permissions requises.');
md.push('');
md.push('## Fichiers generes');
md.push('- `docs/scraped/shopcaisse-readme-pages.json`');
md.push('- `docs/scraped/shopcaisse-readme-pages.csv`');
md.push('- `docs/scraped/shopcaisse-readme-synthese.md`');

await fs.writeFile('docs/scraped/shopcaisse-readme-synthese.md', md.join('\n'));

console.log(JSON.stringify(stats));
