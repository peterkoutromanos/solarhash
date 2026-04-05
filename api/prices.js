// api/prices.js — Vercel serverless function (CommonJS)
// Fetches BTC/USD and USD/ZAR server-side, returns JSON with CORS headers

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const [btcRes, fxRes] = await Promise.all([
      fetch('https://blockchain.info/ticker'),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ]);

    if (!btcRes.ok) throw new Error('BTC API ' + btcRes.status);
    if (!fxRes.ok)  throw new Error('FX API '  + fxRes.status);

    const btc = await btcRes.json();
    const fx  = await fxRes.json();

    res.status(200).json({
      btc: Math.round(btc.USD.last),
      zar: +fx.rates.ZAR.toFixed(2),
      ts:  new Date().toISOString(),
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
