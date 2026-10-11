const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const root = path.join(__dirname, '..');
const sitemapPath = path.join(root, 'public', 'sitemap.xml');
const sitemapGzipPath = path.join(root, 'public', 'sitemap.xml.gz');
const robotsPath = path.join(root, 'public', 'robots.txt');

// Domain produksi. Bisa dioverride lewat env SITE_URL; default domain live (bukan baseURL pages.dev).
const SITE_URL = (process.env.SITE_URL || 'https://readymixkita.com').replace(/\/$/, '');

function ensureRobotsTxt() {
  const robots = `User-agent: *
Allow: /

Disallow: /categories/*/page/
Disallow: /tags/*/page/
Disallow: /page/

Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap.xml.gz
`;
  fs.writeFileSync(robotsPath, robots);
  console.log('robots.txt berhasil dibuat/diperbarui.');
}

function compressSitemap() {
  if (!fs.existsSync(sitemapPath)) { console.warn('sitemap.xml tidak ditemukan, lewati kompresi.'); return; }
  fs.createReadStream(sitemapPath).pipe(zlib.createGzip()).pipe(fs.createWriteStream(sitemapGzipPath))
    .on('finish', () => console.log('sitemap.xml.gz berhasil dibuat.'))
    .on('error', err => console.error('Error kompresi sitemap:', err));
}

ensureRobotsTxt();
compressSitemap();
