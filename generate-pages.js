#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
//  generate-pages.js — Générateur de pages SEO VTC Paris
//  Version 2.0 — Variations de contenu anti-duplicate
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

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// ─────────────────────────────────────────────────────────────
//  VARIATIONS DE CONTENU
// ─────────────────────────────────────────────────────────────

const introVariations = [
  (d, a) => `Vous avez besoin d'un transfert VTC de ${d} vers ${a} ? Notre service de chauffeur privé est disponible 24h/24, 7j/7. Obtenez votre devis en 30 secondes par téléphone ou WhatsApp.`,
  (d, a) => `Besoin d'un VTC fiable entre ${d} et ${a} ? Profitez d'un service de chauffeur privé professionnel, disponible à toute heure. Réservation rapide et simple par appel ou WhatsApp.`,
  (d, a) => `Votre transfert ${d} → ${a} mérite un service à la hauteur. Chauffeur privé ponctuel, véhicule confortable, aide bagages incluse. Appelez-nous pour un devis immédiat.`,
  (d, a) => `Planifiez votre trajet ${d} vers ${a} en toute sérénité. Notre chauffeur VTC vous prend en charge à l'heure exacte, avec suivi en temps réel et attente garantie.`,
  (d, a) => `Pour votre transfert ${d} → ${a}, faites confiance à un chauffeur privé expérimenté. Disponible 24h/24 y compris les vols de nuit et les départs tôt le matin.`,
  (d, a) => `Réservez votre VTC ${d} → ${a} en 2 minutes. Un appel ou un message WhatsApp suffit. Votre chauffeur sera là à l'heure, peu importe le créneau.`,
  (d, a) => `Vous arrivez ou partez via ${d} et souhaitez rejoindre ${a} confortablement ? Notre service VTC vous garantit ponctualité, confort et tranquillité d'esprit.`,
  (d, a) => `Le trajet ${d} → ${a} avec un chauffeur privé, c'est la garantie d'arriver à destination sans stress. Service disponible nuit et jour, 365 jours par an.`,
];

const descVariations = [
  (d, a, prix, duree, clientStr) => `Le trajet VTC ${d} vers ${a} est l'un de nos transferts les plus demandés en Île-de-France. La durée estimée est d'environ ${duree} minutes selon la circulation. ${clientStr} Votre chauffeur suit votre vol en temps réel pour les départs depuis les aéroports et ajuste l'heure de prise en charge en cas de retard — attente jusqu'à 60 minutes incluse sans supplément. Appelez le 07 45 62 40 32 pour obtenir votre tarif en 30 secondes.`,
  (d, a, prix, duree, clientStr) => `Nos chauffeurs réalisent quotidiennement le trajet ${d} → ${a} et connaissent parfaitement les itinéraires optimaux selon les horaires. Comptez environ ${duree} minutes de trajet en conditions normales. ${clientStr} Réservation disponible 24h/24 par téléphone ou WhatsApp — votre devis est confirmé en moins d'une minute.`,
  (d, a, prix, duree, clientStr) => `Le transfert ${d} vers ${a} se déroule dans un véhicule spacieux et climatisé, avec aide bagages incluse. Durée estimée : ${duree} minutes. ${clientStr} En cas de retard de vol ou d'imprévus, votre chauffeur adapte automatiquement l'heure de prise en charge. Aucun stress, aucune surprise.`,
  (d, a, prix, duree, clientStr) => `Chaque trajet ${d} → ${a} est pris en charge par un chauffeur professionnel avec une expérience confirmée des routes d'Île-de-France. Durée moyenne : ${duree} minutes. ${clientStr} Service disponible à toute heure, y compris les départs à 4h du matin ou les retours à minuit. Contactez-nous pour un devis immédiat.`,
  (d, a, prix, duree, clientStr) => `Pour votre transfert ${d} → ${a}, notre équipe s'engage sur la ponctualité et le confort. Trajet d'environ ${duree} minutes avec un chauffeur dédié. ${clientStr} Nous couvrons tous les terminaux des aéroports parisiens et assurons un accueil personnalisé à l'arrivée. Devis gratuit par téléphone ou WhatsApp.`,
  (d, a, prix, duree, clientStr) => `Le transfert ${d} vers ${a} fait partie de nos prestations les plus fréquentes. Avec une durée estimée de ${duree} minutes, c'est le moyen le plus confortable et le plus fiable pour ce trajet. ${clientStr} Votre chauffeur vous attend avec une pancarte à votre nom dans le hall d'arrivée. Appelez le 07 45 62 40 32 pour réserver.`,
];

const faqVariations = [
  (d, a, prix, duree) => `
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Quel est le tarif pour un VTC ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Le tarif pour un transfert ${d} vers ${a} commence à partir de ${prix}€. Le prix exact vous est communiqué par téléphone ou WhatsApp avant la course. Appelez le 07 45 62 40 32 pour un devis en 30 secondes, sans engagement.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Combien de temps dure le trajet ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">La durée estimée du trajet ${d} vers ${a} est d'environ ${duree} minutes en conditions normales. Votre chauffeur optimise l'itinéraire en temps réel pour vous garantir la meilleure ponctualité possible.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Le service est-il disponible la nuit et tôt le matin ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Oui, notre service VTC ${d} → ${a} est disponible 24h/24, 7j/7 sans exception. Que votre vol soit à 4h du matin ou que vous rentriez à minuit, votre chauffeur sera là. Réservez la veille pour garantir la disponibilité.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Comment réserver mon VTC ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Appelez le 07 45 62 40 32 ou envoyez un message WhatsApp. Votre devis est confirmé en 30 secondes. Service disponible en français, anglais et arabe. Aucune application nécessaire.</div>
    </div>`,
  (d, a, prix, duree) => `
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Comment obtenir un devis pour le trajet ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Appelez le 07 45 62 40 32 ou envoyez un WhatsApp avec votre trajet, date et heure. Votre devis personnalisé vous est communiqué en moins d'une minute, sans engagement. Les tarifs commencent à partir de ${prix}€.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Que se passe-t-il si mon vol est retardé sur le trajet ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Votre chauffeur suit votre vol en temps réel et ajuste automatiquement l'heure de prise en charge. L'attente jusqu'à 60 minutes est incluse sans supplément. Vous n'avez rien à faire.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Avez-vous des véhicules adaptés aux familles pour ce trajet ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Oui, vans spacieux disponibles pour les familles nombreuses ou les groupes avec beaucoup de bagages. Sièges enfants disponibles sur demande sans supplément. Précisez vos besoins à la réservation.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Le chauffeur parle-t-il anglais ou arabe ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Oui, notre chauffeur parle français, anglais et arabe. Vous pouvez réserver et communiquer dans la langue de votre choix, y compris par WhatsApp en arabe au 07 45 62 40 32.</div>
    </div>`,
  (d, a, prix, duree) => `
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Le tarif ${d} → ${a} est-il fixe ou variable ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Votre tarif est communiqué avant la course et ne change pas en cours de route. Les prix commencent à partir de ${prix}€ pour ce trajet. Aucun compteur, aucune majoration surprise. Appelez le 07 45 62 40 32 pour votre devis.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Quelle est la durée du trajet ${d} → ${a} ?<span class="faq-icon">+</span></div>
      <div class="faq-a">En conditions normales, comptez environ ${duree} minutes pour ce trajet. Votre chauffeur choisit l'itinéraire le plus rapide selon le trafic en temps réel pour optimiser votre temps de trajet.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Puis-je réserver un VTC ${d} → ${a} pour un groupe ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Oui, nous disposons de vans pouvant accueillir jusqu'à 7 personnes avec leurs bagages. Idéal pour les familles, les groupes d'amis ou les équipes professionnelles. Contactez-nous pour un devis groupe adapté.</div>
    </div>
    <div class="faq-item">
      <div class="faq-q" onclick="toggleFaq(this)">Fournissez-vous des factures pour les voyageurs d'affaires ?<span class="faq-icon">+</span></div>
      <div class="faq-a">Oui, factures complètes disponibles pour notes de frais professionnelles. Wi-Fi disponible à bord sur demande. Service ponctuel idéal pour les déplacements professionnels réguliers. Appelez le 07 45 62 40 32.</div>
    </div>`,
];

const ctaVariations = [
  (d, a, prix) => ({ titre: `Réservez votre VTC ${d} → ${a}`, sous: `Disponible 24h/24 · À partir de ${prix}€ · Devis en 30 secondes` }),
  (d, a, prix) => ({ titre: `Votre transfert ${d} → ${a} en un appel`, sous: `Chauffeur professionnel · À partir de ${prix}€ · Sans application` }),
  (d, a, prix) => ({ titre: `Prêt pour votre trajet ${d} → ${a} ?`, sous: `Service 24h/24 · Devis immédiat · À partir de ${prix}€` }),
  (d, a, prix) => ({ titre: `Contactez-nous pour votre VTC ${d} → ${a}`, sous: `Réponse en 30 sec · À partir de ${prix}€ · Disponible nuit et jour` }),
  (d, a, prix) => ({ titre: `VTC ${d} → ${a} — Appelez maintenant`, sous: `Chauffeur disponible 24h/24 · À partir de ${prix}€ · Français, English, عربي` }),
];

const titleVariations = [
  (d, a, prix) => `VTC ${d} → ${a} — Chauffeur privé à partir de ${prix}€ · 07 45 62 40 32`,
  (d, a, prix) => `Transfert VTC ${d} ${a} — Devis immédiat · Disponible 24h/24`,
  (d, a, prix) => `VTC ${d} vers ${a} — Chauffeur professionnel · À partir de ${prix}€`,
  (d, a, prix) => `Chauffeur privé ${d} → ${a} — Tarif dès ${prix}€ · Réservation rapide`,
  (d, a, prix) => `VTC ${d} ${a} Paris — Service 24h/24 · Devis en 30 secondes`,
];

const metaVariations = [
  (d, a, prix, duree) => `Réservez votre VTC ${d} vers ${a} — à partir de ${prix}€, trajet d'environ ${duree} min. Chauffeur privé disponible 24h/24. Devis en 30 secondes : 07 45 62 40 32.`,
  (d, a, prix, duree) => `Transfert VTC ${d} → ${a} avec chauffeur professionnel. À partir de ${prix}€, durée estimée ${duree} min. Disponible nuit et jour. Appelez le 07 45 62 40 32.`,
  (d, a, prix, duree) => `VTC ${d} ${a} — service de chauffeur privé dès ${prix}€. Trajet ${duree} min environ. Réservation immédiate par téléphone ou WhatsApp. Disponible 24h/24.`,
  (d, a, prix, duree) => `Chauffeur privé ${d} vers ${a} à partir de ${prix}€. Durée : ${duree} min. Service VTC ponctuel et confortable, disponible 24h/24. Devis gratuit : 07 45 62 40 32.`,
];

// ─────────────────────────────────────────────────────────────
//  PAGES PRIORITAIRES — contenu enrichi Phase 8
// ─────────────────────────────────────────────────────────────

const PRIORITY_SLUGS = new Set([
  'vtc-cdg-paris-centre',
  'vtc-cdg-paris-8e',
  'vtc-cdg-disneyland-paris',
  'vtc-cdg-versailles',
  'vtc-cdg-la-defense',
  'vtc-orly-paris-centre',
  'vtc-orly-disneyland-paris',
  'vtc-disneyland-paris-cdg',
  'vtc-paris-versailles',
  'vtc-cdg-ritz-paris',
  'vtc-cdg-four-seasons-george-v',
]);

const temoignages = [
  { stars: '★★★★★', text: 'Vol retardé de 45 minutes, le chauffeur était toujours là avec ma pancarte. Professionnel, véhicule impeccable, prix confirmé avant la course.', author: 'Mohammed A.' },
  { stars: '★★★★★', text: 'Parfait pour notre famille de 5 avec 6 valises. Van spacieux, sièges enfants installés. La magie a commencé dès la voiture !', author: 'Sarah M.' },
  { stars: '★★★★★', text: 'Toujours à l\'heure, facture pour ma note de frais. Mon VTC de confiance pour tous mes déplacements professionnels à Paris.', author: 'Jean-Philippe L.' },
  { stars: '★★★★★', text: 'Chauffeur arabophone, accueil personnalisé, prix transparent. Nous revenons chaque année à Paris et reprendrons ce service.', author: 'خالد العمري' },
  { stars: '★★★★★', text: 'Retour à minuit depuis CDG après un long vol. Chauffeur frais et souriant, trajet silencieux. Prix exact comme convenu.', author: 'David K.' },
];

function generateEnrichi(depart, arrivee, slug) {
  if (!PRIORITY_SLUGS.has(slug)) return '';
  
  // Sélectionner 3 avis basés sur le slug
  const hash = slug.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const t1 = temoignages[Math.abs(hash) % temoignages.length];
  const t2 = temoignages[Math.abs(hash + 1) % temoignages.length];
  const t3 = temoignages[Math.abs(hash + 2) % temoignages.length];

  return `
  <div style="margin-top:40px;border-top:1px solid #1a1a14;padding-top:32px">
    <div style="font-size:.75rem;letter-spacing:3px;text-transform:uppercase;color:var(--gold);margin-bottom:16px">Avis clients — ${depart} → ${arrivee}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:2px">
      <div style="background:#111;border:1px solid #1a1a14;padding:22px;border-radius:4px">
        <div style="color:var(--gold);font-size:.9rem;margin-bottom:10px;letter-spacing:2px">${t1.stars}</div>
        <p style="font-size:.85rem;color:#ccc;font-style:italic;margin-bottom:10px">"${t1.text}"</p>
        <div style="font-size:.75rem;color:var(--gold);font-weight:500">${t1.author}</div>
      </div>
      <div style="background:#111;border:1px solid #1a1a14;padding:22px;border-radius:4px">
        <div style="color:var(--gold);font-size:.9rem;margin-bottom:10px;letter-spacing:2px">${t2.stars}</div>
        <p style="font-size:.85rem;color:#ccc;font-style:italic;margin-bottom:10px">"${t2.text}"</p>
        <div style="font-size:.75rem;color:var(--gold);font-weight:500">${t2.author}</div>
      </div>
      <div style="background:#111;border:1px solid #1a1a14;padding:22px;border-radius:4px">
        <div style="color:var(--gold);font-size:.9rem;margin-bottom:10px;letter-spacing:2px">${t3.stars}</div>
        <p style="font-size:.85rem;color:#ccc;font-style:italic;margin-bottom:10px">"${t3.text}"</p>
        <div style="font-size:.75rem;color:var(--gold);font-weight:500">${t3.author}</div>
      </div>
    </div>
  </div>`;
}



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

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Sélection déterministe basée sur le slug (pas aléatoire — stable entre générations)
function pick(arr, slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) & 0xffffffff;
  return arr[Math.abs(hash) % arr.length];
}

function getClientDesc(typeClient) {
  const map = {
    'Famille':   'Idéal pour les familles, vans spacieux disponibles avec sièges enfants sur demande.',
    'Business':  'Service ponctuel pour voyageurs d\'affaires avec facturation entreprise et Wi-Fi disponibles.',
    'Luxe':      'Service premium pour une clientèle exigeante. Véhicules haut de gamme, accueil personnalisé.',
    'Touriste':  'Service adapté aux touristes internationaux. Chauffeur parlant français, anglais et arabe.',
    'Tous':      'Service disponible pour tous les profils de voyageurs — touristes, familles, professionnels.',
    'Événement': 'Service disponible pour tous vos événements — mariages, séminaires, sorties culturelles.',
  };
  return map[typeClient] || map['Tous'];
}

// Détecter la page HUB correspondante
function getHubLink(depart, arrivee) {
  const hubs = {
    'CDG':             { url: '../vtc-cdg.html',              label: '✈️ Hub VTC CDG' },
    'Orly':            { url: '../vtc-orly.html',             label: '✈️ Hub VTC Orly' },
    'Disneyland Paris':{ url: '../vtc-disneyland.html',       label: '🏰 Hub VTC Disneyland' },
    'Gare du Nord':    { url: '../vtc-gares-paris.html',      label: '🚄 Hub Gares Paris' },
    'Gare de Lyon':    { url: '../vtc-gares-paris.html',      label: '🚄 Hub Gares Paris' },
    'Gare Montparnasse':{ url: '../vtc-gares-paris.html',     label: '🚄 Hub Gares Paris' },
    'Gare de l\'Est':  { url: '../vtc-gares-paris.html',      label: '🚄 Hub Gares Paris' },
    'Gare Saint-Lazare':{ url: '../vtc-gares-paris.html',     label: '🚄 Hub Gares Paris' },
  };
  return hubs[depart] || hubs[arrivee] || { url: '../transfert-aeroport-paris.html', label: '🗼 Transferts Aéroport Paris' };
}

function generateRelatedLinks(routes, currentSlug, depart, arrivee) {
  // Trajet inverse
  const inverseSlug = `vtc-${toSlug(arrivee)}-${toSlug(depart)}`;
  const inverseRoute = routes.find(r => r._slug === inverseSlug);
  const inverseLink = inverseRoute
    ? `<a href="${inverseSlug}.html" class="related-link">↩️ Trajet inverse : VTC ${arrivee} → ${depart}</a>`
    : '';

  // Page HUB
  const hub = getHubLink(depart, arrivee);
  const hubLink = `<a href="${hub.url}" class="related-link">${hub.label}</a>`;

  // Accueil
  const accueilLink = `<a href="https://smileflowk-dotcom.github.io/vtc-reservation/" class="related-link">🏠 Accueil</a>`;

  // Trajets similaires à forte demande
  const similar = routes
    .filter(r => r._slug !== currentSlug && r._slug !== inverseSlug && r.demande === 'fort')
    .slice(0, 6)
    .map(r => `<a href="${r._slug}.html" class="related-link">VTC ${r.depart} → ${r.arrivee}</a>`);

  return [inverseLink, hubLink, accueilLink, ...similar].filter(Boolean).join('\n      ');
}

function generateSitemap(routes) {
  const urls = routes.map(r => `
  <url>
    <loc>${BASE_URL}/pages/${r._slug}.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${r.demande === 'fort' ? '0.8' : r.demande === 'moyen' ? '0.6' : '0.4'}</priority>
  </url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${BASE_URL}/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>${urls}\n</urlset>`;
}

function generateIndexTrajets(routes) {
  const rows = routes.map(r => `
    <tr>
      <td><a href="pages/${r._slug}.html">${r.depart} → ${r.arrivee}</a></td>
      <td>${r.prix}€</td>
      <td>${r.duree} min</td>
      <td>${r.type_client}</td>
      <td>${r.demande}</td>
    </tr>`).join('');
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trajets VTC Paris — ${routes.length} pages SEO</title><meta name="robots" content="noindex"><style>body{font-family:sans-serif;background:#080808;color:#F5F0E8;padding:40px;max-width:1200px;margin:0 auto}h1{color:#C8A96E;margin-bottom:8px}p{color:#888;margin-bottom:24px;font-size:.9rem}table{width:100%;border-collapse:collapse;font-size:.85rem}th{text-align:left;padding:10px;border-bottom:1px solid #C8A96E44;color:#C8A96E}td{padding:10px;border-bottom:1px solid #1a1a14;color:#ccc}a{color:#C8A96E;text-decoration:none}tr:hover td{background:#111}</style></head><body><h1>📋 ${routes.length} pages SEO générées</h1><p>Page interne (noindex) — liste de référence.</p><table><thead><tr><th>Trajet</th><th>Prix</th><th>Durée</th><th>Client</th><th>Demande</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

// ─────────────────────────────────────────────────────────────
//  MAIN
// ─────────────────────────────────────────────────────────────

console.log('🚀 Génération des pages SEO VTC Paris v2.0...\n');

const routes = parseCSV(CSV_FILE);
routes.forEach(r => { r._slug = `vtc-${toSlug(r.depart)}-${toSlug(r.arrivee)}`; });

let generated = 0, skipped = 0;

routes.forEach(r => {
  const { depart, arrivee, prix, duree, type_client, _slug } = r;
  if (!depart || !arrivee) { skipped++; return; }

  const clientStr    = getClientDesc(type_client);
  const intro        = pick(introVariations, _slug)(depart, arrivee);
  const description  = pick(descVariations, _slug)(depart, arrivee, prix, duree, clientStr);
  const faqHtml      = pick(faqVariations, _slug)(depart, arrivee, prix, duree);
  const cta          = pick(ctaVariations, _slug)(depart, arrivee, prix);
  const titleSeo     = pick(titleVariations, _slug)(depart, arrivee, prix);
  const metaDesc     = pick(metaVariations, _slug)(depart, arrivee, prix, duree);
  const metaKw       = `vtc ${depart.toLowerCase()} ${arrivee.toLowerCase()}, transfert ${depart.toLowerCase()} ${arrivee.toLowerCase()}, chauffeur privé ${depart.toLowerCase()} ${arrivee.toLowerCase()}, taxi ${depart.toLowerCase()} ${arrivee.toLowerCase()}, vtc paris ${arrivee.toLowerCase()}`;
  const h1           = `VTC <em>${depart}</em> → <em>${arrivee}</em>`;
  const relatedLinks = generateRelatedLinks(routes, _slug, depart, arrivee);
  const enrichi      = generateEnrichi(depart, arrivee, _slug);
  const departUrl    = encodeURIComponent(depart);
  const arriveeUrl   = encodeURIComponent(arrivee);

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
    .replace(/{FAQ_ITEMS}/g,     faqHtml)
    .replace(/{CTA_TITRE}/g,     cta.titre)
    .replace(/{CTA_SOUS}/g,      cta.sous)
    .replace(/{DEPART_URL}/g,    departUrl)
    .replace(/{ARRIVEE_URL}/g,   arriveeUrl)
    .replace(/{RELATED_LINKS}/g, relatedLinks)
    .replace(/{ENRICHI}/g,       enrichi);

  fs.writeFileSync(path.join(OUTPUT_DIR, `${_slug}.html`), html, 'utf8');
  console.log(`  ✅ ${_slug}.html`);
  generated++;
});

fs.writeFileSync(SITEMAP_FILE, generateSitemap(routes.filter(r => r.depart && r.arrivee)), 'utf8');
fs.writeFileSync(INDEX_FILE, generateIndexTrajets(routes.filter(r => r.depart && r.arrivee)), 'utf8');

console.log(`\n  📋 sitemap-pages.xml généré`);
console.log(`  📋 index-trajets.html généré`);
console.log(`\n✨ Terminé ! ${generated} pages générées, ${skipped} ignorées.`);
console.log(`📁 Dossier : ${OUTPUT_DIR}`);
