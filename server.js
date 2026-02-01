const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3457;

// Cache for exchange rates
let ratesCache = {
  rates: null,
  timestamp: null,
  ttl: 3600000 // 1 hour cache
};

app.use(express.static('public', {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
  }
}));
app.use(express.json());

// API endpoint to get exchange rates
app.get('/api/rates', async (req, res) => {
  try {
    // Check cache
    const now = Date.now();
    if (ratesCache.rates && ratesCache.timestamp && (now - ratesCache.timestamp < ratesCache.ttl)) {
      return res.json(ratesCache.rates);
    }

    // Fetch from exchangerate-api.com (free tier) with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let data;
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      data = await response.json();
    } catch (fetchErr) {
      clearTimeout(timeout);
      // If we have stale cache, return it
      if (ratesCache.rates) {
        console.warn('API fetch failed, returning stale cache:', fetchErr.message);
        return res.json({ ...ratesCache.rates, stale: true });
      }
      throw fetchErr;
    }

    // Update cache
    ratesCache.rates = data;
    ratesCache.timestamp = now;

    res.json(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error.message);
    res.status(500).json({ error: 'Failed to fetch exchange rates', message: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`VPS Calculator running on http://localhost:${PORT}`);
});
