#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  generate-sitemap.js — Générateur de sitemap.xml automatique
//  Usage : node generate-sitemap.js
// ─────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const BASE_URL    = 'https://smileflowk-dotcom.github.io/vtc-reservation';
const ROOT_DIR    = __dirname;
const OUTPUT_FILE = path.join(ROOT_DIR, 'sitemap.xml');
const TODAY       = new Date().toISOString().split('T')[0];

// Dossiers et fichiers à ignorer
const IGNORE_DIRS  = new Set(['node_modules', '.git', '.github', '.vscode']);
const IGNORE_FILES = new Set([
  'sitemap.xml',
  'sitemap-pages.xml',
  'robots.txt',
  'generate-sitemap.js',
  'generate-pages.js',
  'template.html',
  'index-trajets.html',
  'googlea74594cdc943801f.html',
]);

// Priorités par type de page
function getPriority(urlPath) {
  if (urlPath === '/')                          return '1.0';
  if (urlPath.match(/\/(vtc-cdg|vtc-orly|vtc-disneyland|vtc-gares|transfert-aeroport)\.html$/)) return '0.9';
  if (urlPath.match(/\/(chauffeur-prive|vtc-famille|vtc-paris-aeroport|transfert-disneyland|vtc-cdg-prix)\.html$/)) return '0.8';
  if (urlPath.includes('/pages/'))              return '0.7';
  return '0.5';
}

function getChangefreq(urlPath) {
  if (urlPath === '/')                          return 'weekly';
  if (!urlPath.includes('/pages/'))             return 'weekly';
  return 'monthly';
}

// Parcourir récursivement les dossiers
function findHtmlFiles(dir, baseDir) {
  if (!baseDir) baseDir = dir;
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        results.push(...findHtmlFiles(path.join(dir, entry.name), baseDir));
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      if (!IGNORE_FILES.has(entry.name)) {
        results.push(path.join(dir, entry.name));
      }
    }
  }

  return results;
}

// Convertir un chemin fichier en URL publique
function fileToUrl(filePath) {
  const relative = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  if (relative === 'index.html') return '/';
  return '/' + relative;
}

// ── MAIN ────────────────────────────────────────────────────

console.log('🚀 Génération du sitemap.xml...\n');

const htmlFiles = findHtmlFiles(ROOT_DIR);
const urls = htmlFiles
  .map(f => fileToUrl(f))
  .sort((a, b) => {
    if (a === '/') return -1;
    if (b === '/') return 1;
    if (!a.includes('/pages/') && b.includes('/pages/')) return -1;
    if (a.includes('/pages/') && !b.includes('/pages/')) return 1;
    return a.localeCompare(b);
  });

const urlEntries = urls.map(urlPath => `
  <url>
    <loc>${BASE_URL}${urlPath}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${getChangefreq(urlPath)}</changefreq>
    <priority>${getPriority(urlPath)}</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

fs.writeFileSync(OUTPUT_FILE, sitemap, 'utf8');

console.log('✅ sitemap.xml généré avec ' + urls.length + ' URLs');
console.log('📁 Fichier : ' + OUTPUT_FILE);
console.log('\n📋 Aperçu des premières URLs :');
urls.slice(0, 10).forEach(u => console.log('   ' + BASE_URL + u));
if (urls.length > 10) console.log('   ... et ' + (urls.length - 10) + ' autres');
console.log('\n✨ Prêt à soumettre dans Google Search Console !');
