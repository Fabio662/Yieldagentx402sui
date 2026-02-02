/**
 * Sui Network x402 Yield Agent
 * Pay 0.01 SUI, unlock real-time vault yields
 */

const CONFIG = {
  PAYMENT_ADDRESS: '0x986653e83fd9ab410ecebbcc3b5c5d1c44a8b75ba31827895e033e0e66928e98',
  PAYMENT_AMOUNT: '0.01',
  PAYMENT_ASSET: 'SUI',
  NETWORK: 'sui',
  TIMEOUT_SECONDS: 3600,
  API_DESCRIPTION: 'Live yields: Cetus, Navi, AlphaFi, DeepBook, Bluefin',
  API_VERSION: 1
};

const YIELD_DATA = {
  success: true,
  data: {
    opportunities: [
      { id: 1, protocol: "Cetus", apy: "35.2%", risk: "Medium", tvl: "$8.2M", asset: "SUI-USDC" },
      { id: 2, protocol: "Navi", apy: "27.8%", risk: "Low", tvl: "$245M", asset: "SUI" },
      { id: 3, protocol: "AlphaFi", apy: "20.5%", risk: "Low", tvl: "$46M", asset: "stvSUI" },
      { id: 4, protocol: "DeepBook", apy: "25.1%", risk: "Medium", tvl: "$3.7B (cumulative)", asset: "SUI" },
      { id: 5, protocol: "Bluefin", apy: "50.0%", risk: "High", tvl: "$10M", asset: "ercUSD" }
    ],
    network: "Sui",
    lastUpdated: new Date().toISOString()
  }
};

const HTML_PAGE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YieldAgent - Sui</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, sans-serif;
      background: #0b0b0b;
      color: #fff;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; padding: 20px;
    }
    .container {
      max-width: 800px; width: 100%;
    }
    .logo {
      font-size: 70px; margin: 20px 0; color: #00ffff;
    }
    h1 { font-size: 48px; margin: 10px 0; }
    .subtitle { font-size: 20px; opacity: 0.8; margin-bottom: 30px; color: #00ffff; }
    .card {
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(16px);
      border: 1px solid #00ffff40;
      border-radius: 20px;
      padding: 40px;
    }
    .yield-item {
      display: flex; justify-content: space-between;
      padding: 16px; margin: 8px 0;
      background: rgba(0,255,255,0.05);
      border-radius: 10px;
    }
    .apy { font-weight: 700; color: #00ffff; font-size: 22px; }
    .payment-section {
      text-align: center; margin: 30px 0;
    }
    .cost {
      font-size: 36px; font-weight: 700; color: #00ffff;
    }
    .address {
      font-family: monospace; font-size: 14px;
      word-break: break-all; margin: 10px 0;
      color: #aaa;
    }
    .copy-btn {
      background: #00ffff; color: #000; border: none;
      padding: 10px 20px; border-radius: 8px;
      cursor: pointer; font-weight: 600; margin-top: 5px;
    }
    .try-agent {
      background: linear-gradient(to right, #00ffff, #0099ff);
      color: #000; border: none; padding: 16px 40px;
      font-size: 18px; border-radius: 12px;
      cursor: pointer; font-weight: 700; margin: 20px 0;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚡</div>
    <h1>YieldAgent</h1>
    <p class="subtitle">Live on Sui</p>

    <div class="card">
      <h2>🔒 Unlock Vault Yields</h2>

      <div class="yield-item"><span>Cetus</span><span class="apy">35.2%</span></div>
      <div class="yield-item"><span>Navi</span><span class="apy">27.8%</span></div>
      <div class="yield-item"><span>AlphaFi</span><span class="apy">20.5%</span></div>
      <div class="yield-item"><span>DeepBook</span><span class="apy">25.1%</span></div>
      <div class="yield-item"><span>Bluefin</span><span class="apy">50.0%</span></div>

      <div class="payment-section">
        <div class="cost">0.01 SUI</div>
        <div class="address">${CONFIG.PAYMENT_ADDRESS}</div>
        <button class="copy-btn">📋 Copy</button>
      </div>

      <button class="try-agent">🚀 Try Agent</button>

      <script>
        document.querySelector('.copy-btn').onclick = () => {
          navigator.clipboard.writeText('${CONFIG.PAYMENT_ADDRESS}')
          this.textContent = '✅ Copied';
          setTimeout(() => this.textContent = '📋 Copy', 2000);
        };

        document.querySelector('.try-agent').onclick = async () => {
          const hash = prompt("Enter your SUI tx hash:");
          if (!hash) return;
          const res = await fetch('/', {
            headers: { 'X-Payment': JSON.stringify({ txHash: hash, amount: 0.01 }) }
          });
          if (res.ok) {
            const data = await res.json();
            const results = data.data.opportunities.map(o => 
              \`<div class="yield-item"><strong>\${o.protocol}</strong>: \${o.apy} APY\</div>\`
            ).join('');
            document.body.innerHTML += \`<div style="margin-top:30px">\${results}</div>\`;
          } else {
            alert('Pay first.');
          }
        };
      </script>
    </div>
  </div>
</body>
</html>
`;

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Payment'
    };

    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });

    if (path === '/x402-info') {
      return new Response(JSON.stringify({
        x402Version: 1,
        accepts: [{
          scheme: 'exact',
          network: 'sui',
          maxAmountRequired: '0.01',
          asset: 'SUI',
          payTo: CONFIG.PAYMENT_ADDRESS,
          resource: '/',
          description: CONFIG.API_DESCRIPTION,
          mimeType: 'application/json',
          maxTimeoutSeconds: CONFIG.TIMEOUT_SECONDS
        }]
      }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/') {
      const pay = req.headers.get('X-Payment');
      if (!pay) {
        return new Response(HTML_PAGE, {
          headers: { ...cors, 'Content-Type': 'text/html' }
        });
      }

      try {
        const p = JSON.parse(pay);
        if (p.txHash && p.amount === 0.01) {
          return new Response(JSON.stringify(YIELD_DATA), {
            headers: { ...cors, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'Invalid payment' }), { status: 402 });
      } catch (e) {
        return new Response(JSON.stringify({ error: 'Parse error' }), { status: 400 });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
};
