
// Add this file to your GitHub repo at: api/prices.js
// It deploys automatically as a serverless function at: https://solarhash.vercel.app/api/prices
// Fetches BTC and ZAR server-side (no CORS issue) and returns with open CORS headers

export const config = { runtime: 'edge' };

export default async function handler() {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json',
    'Cache-Control': 's-maxage=30, stale-while-revalidate=60',
  };

  try {
    const [btcRes, fxRes] = await Promise.all([
      fetch('https://blockchain.info/ticker'),
      fetch('https://open.er-api.com/v6/latest/USD'),
    ]);

    if (!btcRes.ok) throw new Error('BTC API returned ' + btcRes.status);
    if (!fxRes.ok)  throw new Error('FX API returned '  + fxRes.status);

    const btc = await btcRes.json();
    const fx  = await fxRes.json();

    return new Response(JSON.stringify({
      btc: Math.round(btc.USD.last),
      zar: +fx.rates.ZAR.toFixed(2),
      ts:  new Date().toISOString(),
    }), { headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}
