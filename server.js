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

app.use(express.static('public'));
app.use(express.json());

// API endpoint to get exchange rates
app.get('/api/rates', async (req, res) => {
  try {
    // Check cache
    const now = Date.now();
    if (ratesCache.rates && ratesCache.timestamp && (now - ratesCache.timestamp < ratesCache.ttl)) {
      return res.json(ratesCache.rates);
    }

    // Fetch from exchangerate-api.com (free tier)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    // Update cache
    ratesCache.rates = data;
    ratesCache.timestamp = now;
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`VPS Calculator running on http://localhost:${PORT}`);
});
