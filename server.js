const express = require('express');
const compression = require('compression');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3457;

// Generate a version hash from static files at startup
function generateVersionHash() {
  const hash = crypto.createHash('md5');
  const publicDir = path.join(__dirname, 'public');
  const files = ['style.css', 'script.js'];
  for (const file of files) {
    try {
      hash.update(fs.readFileSync(path.join(publicDir, file)));
    } catch (e) {
      // ignore missing files
    }
  }
  return hash.digest('hex').slice(0, 8);
}

const VERSION = generateVersionHash();
console.log(`Asset version: ${VERSION}`);

// Enable gzip compression
app.use(compression());

// Security headers
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Serve index.html with versioned asset URLs (no cache)
app.get('/', (req, res) => {
  let html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
  html = html.replace('href="style.css"', `href="style.css?v=${VERSION}"`);
  html = html.replace('src="script.js"', `src="script.js?v=${VERSION}"`);
  res.set('Cache-Control', 'no-cache');
  res.type('html').send(html);
});

// Static assets with long-term cache (query string busts cache on redeploy)
app.use(express.static('public', {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`VPS Calculator running on http://localhost:${PORT}`);
});
