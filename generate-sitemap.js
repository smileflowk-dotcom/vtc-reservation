const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://smileflowk-dotcom.github.io/vtc-reservation';

const ROOT_DIR = __dirname;

// récupérer tous les fichiers HTML
function getAllHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      // exclure fichiers inutiles
      if (
        file.includes('template') ||
        file.includes('google') ||
        file.includes('test')
      ) {
        return;
      }

      results.push(filePath);
    }
  });

  return results;
}

// 🎯 PRIORITY SEO optimisée
function getPriority(url) {
  // homepage
  if (url === 'index.html') return '1.0';

  // pages principales (gros SEO)
  if (
    url.includes('transfert-aeroport') ||
    url.includes('chauffeur-prive') ||
    url.includes('vtc-paris-aeroport-24h')
  ) {
    return '0.9';
  }

  // pages importantes (CDG / Orly)
  if (
    url === 'vtc-cdg.html' ||
    url === 'vtc-orly.html' ||
    url === 'vtc-cdg-prix.html'
  ) {
    return '0.8';
  }

  // pages locales (gros volume SEO)
  if (
    url.includes('/pages/')
  ) {
    return '0.5';
  }

  // reste
  return '0.6';
}

const files = getAllHtmlFiles(ROOT_DIR);

let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

files.forEach(filePath => {
  let relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');

  let url = relativePath === 'index.html'
    ? `${BASE_URL}/`
    : `${BASE_URL}/${relativePath}`;

  // vraie date fichier
  const stats = fs.statSync(filePath);
  const lastmod = stats.mtime.toISOString();

  xml += `  <url>\n`;
  xml += `    <loc>${url}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <priority>${getPriority(relativePath)}</priority>\n`;
  xml += `  </url>\n`;
});

xml += `</urlset>`;

fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), xml);

console.log('✅ Sitemap SEO optimisé généré !');