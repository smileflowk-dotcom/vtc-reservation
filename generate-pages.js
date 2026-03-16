#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  generate-pages.js — Générateur de pages SEO VTC Paris
//  Usage : node generate-pages.js
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const CSV_FILE      = path.join(__dirname, 'routes.csv');
const TEMPLATE_FILE = path.join(__dirname, 'template.html');
const OUTPUT_DIR    = path.join(__dirname, 'pages');
const SITEMAP_FILE  = path.join(__dirname, 'sitemap-pages.xml');
const INDEX_FILE    = path.join(__dirname, 'index-trajets.html');
const BASE_URL      = 'https://smileflowk-dotcom.github.io/vtc-reservation';

// ── Créer le dossier pages/ ──────────────────────────────────
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Lire le template ─────────────────────────────────────────
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// ── Parser le CSV ────────────────────────────────────────────
function parseCSV(filePath) {
  const lines  = fs.readFileSync(filePath, 'utf8').trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    header.forEach((h, i) => obj[h] = (values[i] || '').trim());
    return obj;
  });
}

// ── Générer un slug SEO propre ────────────────────────────────
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Générer l'intro contextuelle ──────────────────────────────
function generateIntro(depart, arrivee, prix, duree, typeClient) {
  const intros = {
    'CDG': `Vous venez d'atterrir à l'aéroport Charles de Gaulle et vous souhaitez rejoindre ${arrivee} rapidement et sereinement ?`,
    'Orly': `Vous arrivez à l'aéroport d'Orly et vous souhaitez rejoindre ${arrivee} sans stress ?`,
    'Beauvais': `Vous arrivez à l'aéroport de Beauvais-Tillé et vous devez rejoindre ${arrivee} ?`,
    'Disneyland Paris': `Vous souhaitez un transfert confortable depuis Disneyland Paris vers ${arrivee} ?`,
    'Versailles': `Vous souhaitez un transfert depuis Versailles vers ${arrivee} ?`,
  };
  const defaultIntro = `Vous recherchez un VTC fiable pour votre trajet ${depart} → ${arrivee} ?`;
  const base = intros[depart] || defaultIntro;
  return `${base} Notre service VTC propose des tarifs à partir de ${prix}€ pour ce trajet d'environ ${duree} minutes. Appelez le 07 45 62 40 32 ou envoyez un WhatsApp pour obtenir votre devis en 30 secondes. Chauffeur professionnel disponible 24h/24, véhicule confortable, aide bagages incluse.`;
}

// ── Générer la description longue ────────────────────────────
function generateDescription(depart, arrivee, prix, duree, typeClient) {
  const clientDesc = {
    'Famille':   'Idéal pour les familles, vans spacieux disponibles avec sièges enfants sur demande.',
    'Business':  'Service ponctuel pour voyageurs d\'affaires avec facturation entreprise disponible.',
    'Luxe':      'Service premium pour une clientèle exigeante. Véhicules haut de gamme, accueil personnalisé.',
    'Touriste':  'Service adapté aux touristes internationaux. Chauffeur parlant français, anglais et arabe.',
    'Tous':      'Service disponible pour tous les profils de voyageurs — touristes, familles, professionnels.',
    'Événement': 'Service disponible pour tous vos événements — mariages, séminaires, sorties.',
  };
  const clientStr = clientDesc[typeClient] || clientDesc['Tous'];
  return `Le trajet VTC ${depart} vers ${arrivee} est l'une de nos courses les plus fréquentes en Île-de-France. La durée estimée est d'environ ${duree} minutes. Appelez le 07 45 62 40 32 ou envoyez un message WhatsApp pour obtenir votre tarif personnalisé en 30 secondes. ${clientStr} Notre chauffeur suit votre vol en temps réel pour les départs depuis les aéroports et ajuste l'heure de prise en charge en cas de retard — attente jusqu'à 60 minutes incluse sans supplément.`;
}

// ── Générer les liens relatifs ────────────────────────────────
function generateRelatedLinks(routes, currentSlug) {
  const related = routes
    .filter(r => r._slug !== currentSlug)
    .filter(r => r.demande === 'fort')
    .slice(0, 8);
  return related.map(r =>
    `<a href="${r._slug}.html" class="related-link">VTC ${r.depart} → ${r.arrivee}</a>`
  ).join('\n      ');
}

// ── Générer le sitemap ────────────────────────────────────────
function generateSitemap(routes) {
  const urls = routes.map(r => `
  <url>
    <loc>${BASE_URL}/pages/${r._slug}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r.demande === 'fort' ? '0.8' : r.demande === 'moyen' ? '0.6' : '0.4'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>${urls}
</urlset>`;
}

// ── Générer la page index des trajets ────────────────────────
function generateIndexTrajets(routes) {
  const rows = routes.map(r => `
    <tr>
      <td><a href="pages/${r._slug}.html">${r.depart} → ${r.arrivee}</a></td>
      <td>${r.prix}€</td>
      <td>${r.duree} min</td>
      <td>${r.type_client}</td>
      <td>${r.demande}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tous les trajets VTC Paris — ${routes.length} pages SEO</title>
<meta name="robots" content="noindex">
<style>
body{font-family:sans-serif;background:#080808;color:#F5F0E8;padding:40px;max-width:1200px;margin:0 auto}
h1{color:#C8A96E;margin-bottom:8px;font-size:1.5rem}
p{color:#888;margin-bottom:24px;font-size:.9rem}
table{width:100%;border-collapse:collapse;font-size:.85rem}
th{text-align:left;padding:10px;border-bottom:1px solid #C8A96E44;color:#C8A96E}
td{padding:10px;border-bottom:1px solid #1a1a14;color:#ccc}
a{color:#C8A96E;text-decoration:none}
a:hover{text-decoration:underline}
tr:hover td{background:#111}
</style>
</head>
<body>
<h1>📋 Liste des ${routes.length} pages SEO générées</h1>
<p>Cette page est exclue de l'indexation (noindex). Elle sert uniquement de référence interne.</p>
<table>
  <thead>
    <tr><th>Trajet</th><th>Prix</th><th>Durée</th><th>Client</th><th>Demande</th></tr>
  </thead>
  <tbody>${rows}
  </tbody>
</table>
</body>
</html>`;
}

// ── MAIN ─────────────────────────────────────────────────────
console.log('🚀 Génération des pages SEO VTC Paris...\n');

const routes = parseCSV(CSV_FILE);

// Ajouter le slug à chaque route
routes.forEach(r => {
  r._slug = `vtc-${toSlug(r.depart)}-${toSlug(r.arrivee)}`;
});

let generated = 0;
let skipped   = 0;

routes.forEach(r => {
  const { depart, arrivee, prix, duree, type_client, _slug } = r;

  if (!depart || !arrivee) { skipped++; return; }

  const intro       = generateIntro(depart, arrivee, prix, duree, type_client);
  const description = generateDescription(depart, arrivee, prix, duree, type_client);
  const relatedLinks = generateRelatedLinks(routes, _slug);
  const departUrl   = encodeURIComponent(depart);
  const arriveeUrl  = encodeURIComponent(arrivee);

  const titleSeo   = `VTC ${depart} → ${arrivee} — Tarif fixe ${prix}€ · Chauffeur privé 24h/24`;
  const metaDesc   = `Transfert VTC ${depart} vers ${arrivee} à partir de ${prix}€. Tarif fixe, sans compteur, disponible 24h/24. Réservation rapide : 07 45 62 40 32.`;
  const metaKw     = `vtc ${depart.toLowerCase()} ${arrivee.toLowerCase()}, transfert ${depart.toLowerCase()} ${arrivee.toLowerCase()}, chauffeur privé ${depart.toLowerCase()} ${arrivee.toLowerCase()}, taxi ${depart.toLowerCase()} ${arrivee.toLowerCase()}`;
  const h1         = `VTC <em>${depart}</em> → <em>${arrivee}</em>`;

  let html = template
    .replace(/{TITLE_SEO}/g,     titleSeo)
    .replace(/{META_DESC}/g,     metaDesc)
    .replace(/{META_KEYWORDS}/g, metaKw)
    .replace(/{SLUG}/g,          _slug)
    .replace(/{H1}/g,            h1)
    .replace(/{DEPART}/g,        depart)
    .replace(/{ARRIVEE}/g,       arrivee)
    .replace(/{PRIX}/g,          prix)
    .replace(/{DUREE}/g,         duree)
    .replace(/{INTRO}/g,         intro)
    .replace(/{DESCRIPTION}/g,   description)
    .replace(/{DEPART_URL}/g,    departUrl)
    .replace(/{ARRIVEE_URL}/g,   arriveeUrl)
    .replace(/{RELATED_LINKS}/g, relatedLinks);

  const outPath = path.join(OUTPUT_DIR, `${_slug}.html`);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`  ✅ ${_slug}.html`);
  generated++;
});

// Générer le sitemap
const sitemap = generateSitemap(routes.filter(r => r.depart && r.arrivee));
fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf8');
console.log(`\n  📋 sitemap-pages.xml généré`);

// Générer l'index
const indexHtml = generateIndexTrajets(routes.filter(r => r.depart && r.arrivee));
fs.writeFileSync(INDEX_FILE, indexHtml, 'utf8');
console.log(`  📋 index-trajets.html généré`);

console.log(`\n✨ Terminé ! ${generated} pages générées, ${skipped} ignorées.`);
console.log(`📁 Dossier : ${OUTPUT_DIR}`);
