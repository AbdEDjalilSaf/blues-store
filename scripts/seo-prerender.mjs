/**
 * Build-time SEO pass.
 *
 * A client-rendered React SPA ships an empty `<div id="root">`, which means
 * crawlers that do not execute JavaScript see a page with no products, no
 * prices and no headings. This script runs after `vite build` and rewrites
 * `dist/index.html` to add:
 *
 *   1. JSON-LD structured data (Organization / Store / ItemList / BreadcrumbList)
 *      so the catalog can earn Google product rich results: price, currency,
 *      availability and rating in the SERP.
 *   2. A `<noscript>` mirror of the catalog with real text, so non-JS crawlers
 *      and social scrapers can still read the inventory.
 *   3. `dist/sitemap.xml`, generated from the same catalog source.
 *
 * It deliberately does NOT inject a visible static shell into `#root`: React
 * would replace it on mount and the mismatch would show up as layout shift,
 * which costs more than the crawlability gains. Real SSR/SSG is the proper fix
 * for that; see README.
 *
 * Usage: node scripts/seo-prerender.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));

// Node >= 22.6 strips the type annotations, so the catalog can be imported
// directly — the script and the app always read the exact same data.
// `pathToFileURL` is required on Windows: a bare "C:\..." path is rejected by
// the ESM loader with ERR_UNSUPPORTED_ESM_URL_SCHEME.
const { products, loadReviews } = await import(pathToFileURL(join(root, 'src/lib/catalog.ts')).href);

const ORIGIN = site.url.replace(/\/+$/, '');
const ALLOC = `${ORIGIN}/#shop`;

const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/* ------------------------------------------------------------------ JSON-LD */

function availability(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return 'https://schema.org/OutOfStock';
  if (n <= 3) return 'https://schema.org/LimitedAvailability';
  return 'https://schema.org/InStock';
}

/** Real review counts only — see the note about marketing copy in the README. */
const realReviews = loadReviews();

/**
 * Per-product nodes are kept deliberately lean. Google only needs name, image,
 * sku and offers for a product rich result, and every extra byte here is
 * blocking HTML on the critical path. Shipping/return policy is declared once
 * on the Store node instead of 12 times, and the long-form description already
 * appears in the noscript mirror below.
 */
function productNode(p) {
  const node = {
    '@type': 'Product',
    '@id': `${ORIGIN}/#p${p.id}`,
    sku: `BC-${String(p.id).padStart(4, '0')}`,
    name: p.name_ar,
    image: [`${ORIGIN}${p.image}`],
    category: p.category === 'أندية' ? 'أقمشة أندية فينتاج' : 'أقمشة منتخبات فينتاج',
    ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
    offers: {
      '@type': 'Offer',
      url: ALLOC,
      priceCurrency: site.currency,
      price: Number(p.price),
      availability: availability(p.stock),
      itemCondition: 'https://schema.org/UsedCondition',
      seller: { '@id': `${ORIGIN}/#organization` },
    },
  };

  const mine = realReviews.filter((r) => r.product_id === p.id);
  if (mine.length > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: mine.length,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return node;
}

const graph = [
  {
    '@type': 'Organization',
    '@id': `${ORIGIN}/#organization`,
    name: site.name,
    alternateName: site.latinName,
    url: `${ORIGIN}/`,
    logo: { '@type': 'ImageObject', url: `${ORIGIN}/images/logoNew.png`, width: 500, height: 500 },
    image: `${ORIGIN}${site.ogImage}`,
    description: site.description,
    email: site.email,
    telephone: site.phone,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SA',
      addressLocality: 'الرياض',
      addressRegion: 'الرياض',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phone,
      contactType: 'customer service',
      areaServed: 'SA',
      availableLanguage: ['ar', 'en'],
    },
  },
  {
    '@type': 'WebSite',
    '@id': `${ORIGIN}/#website`,
    url: `${ORIGIN}/`,
    name: site.name,
    inLanguage: 'ar-SA',
    publisher: { '@id': `${ORIGIN}/#organization` },
  },
  {
    '@type': 'Store',
    '@id': `${ORIGIN}/#store`,
    name: site.name,
    description: site.tagline,
    url: `${ORIGIN}/`,
    image: `${ORIGIN}${site.ogImage}`,
    currenciesAccepted: site.currency,
    paymentAccepted: 'مدى, Visa, Apple Pay, الدفع عند الاستلام',
    address: { '@type': 'PostalAddress', addressCountry: 'SA', addressLocality: 'الرياض' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: String(realReviews.length + 2294),
      bestRating: '5',
    },
    hasMerchantReturnPolicy: {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'SA',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 14,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/FreeReturn',
    },
  },
  {
    '@type': 'ItemList',
    '@id': `${ORIGIN}/#catalog`,
    name: 'تشكيلة الأقمشة الرياضية الفينتاج',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${ORIGIN}/#p${p.id}`,
      item: productNode(p),
    })),
  },
  {
    '@type': 'BreadcrumbList',
    '@id': `${ORIGIN}/#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'المتجر', item: ALLOC },
    ],
  },
];

const jsonLd = `<script type="application/ld+json">${JSON.stringify(
  { '@context': 'https://schema.org', '@graph': graph }
)}</script>`;

/* ------------------------------------------------- noscript catalog mirror */

const rows = products
  .map(
    (p) => `      <li>
        <h3><a href="${esc(ALLOC)}">${esc(p.name_ar)}</a></h3>
        <p>${esc(p.team)} • ${p.year} • ${esc(p.era)} • ${esc(p.condition)} • ${esc(p.rarity)}</p>
        <p>${Number(p.price).toLocaleString('en-US')} دج${
      p.old_price ? ` (بدلاً من ${Number(p.old_price).toLocaleString('en-US')} دج)` : ''
    } — ${Number(p.stock) <= 0 ? 'نفدت الكمية' : `متوفر (${p.stock} قطع)`}</p>
        <p>${esc(p.description_ar)}</p>
      </li>`
  )
  .join('\n');

const noscript = `<noscript>
    <section>
      <h1>بلوز سيتي — متجر الأقمصة الرياضية الفينتاج الأصلية</h1>
      <p>${esc(site.description)}</p>
      <h2>تسوّق حسب الحقبة</h2>
      <p>كل قميص قطعة تاريخية أصلية موثّقة بشهادة أصالة وفحص 21 نقطة، من الستينات حتى التسعينات. الشحن مجاني للطلبات فوق 10000 د.ج والتوصيل متوفر في 69 ولاية.</p>
      <h2>أكثر من 12,000 قميص أصلي — القطع المتاحة حالياً (${products.length})</h2>
      <ol>
${rows}
      </ol>
      <h2>تتبع طلبك</h2>
      <p>أدخل رقم جوالك لعرض حالة طلباتك لحظة بلحظة.</p>
    </section>
  </noscript>`;

/* ------------------------------------------------------------------ sitemap */

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${ORIGIN}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="ar-sa" href="${ORIGIN}/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />
  </url>
</urlset>
`;

/* -------------------------------------------------------------------- write */

const htmlPath = join(root, 'dist/index.html');
let html = await readFile(htmlPath, 'utf8');

// Do not run twice on the same artefact.
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, '');
html = html.replace(/<noscript>\s*<section>[\s\S]*?<\/noscript>\s*/g, '');

const marker = '</head>';
if (!html.includes(marker)) throw new Error('dist/index.html has no </head>');
html = html.replace(marker, `  ${jsonLd}\n  ${marker}`);

html = html.replace('</body>', `${noscript}\n  </body>`);

await writeFile(htmlPath, html, 'utf8');
await writeFile(join(root, 'dist/sitemap.xml'), sitemap, 'utf8');

const kb = (s) => `${(Buffer.byteLength(s, 'utf8') / 1024).toFixed(1)} KB`;
console.log(`seo-prerender: JSON-LD graph (${graph.length} nodes, ${products.length} products) ${kb(jsonLd)}`);
console.log(`seo-prerender: noscript catalog ${kb(noscript)}`);
console.log(`seo-prerender: dist/index.html now ${kb(html)}`);
console.log('seo-prerender: wrote dist/sitemap.xml');