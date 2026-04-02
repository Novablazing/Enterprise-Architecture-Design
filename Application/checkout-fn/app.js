const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json({ limit: '50kb' }));

function getReqId(req) { return req.header('X-Request-Id') || crypto.randomUUID(); }
app.use((req, res, next) => {
  const rid = getReqId(req);
  req.requestId = rid;
  res.setHeader('X-Request-Id', rid); // Echo back request ID in response header for tracing
  console.log(`[rid=${rid}] ${req.method} ${req.path}`);
  next();
});

const PRICING_URL = process.env.PRICING_URL || 'http://pricing-fn:3001';
const INVENTORY_URL = process.env.INVENTORY_URL || 'http://inventory-fn:3002';
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 1500);

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-svc',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'shop',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => console.error('Unexpected connection pool error:', err));

function withTimeout(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, cancel: () => clearTimeout(t) };
}

// Initialize orders table for postgres sql for persistence of orders
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        sku INTEGER NOT NULL,
        subtotal NUMERIC(10, 2),
        total NUMERIC(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Orders table ready');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/checkout', async (req, res) => {
  const { sku, subtotal } = req.body;
  const skuNum = Number(sku);
  const subNum = Number(subtotal);

  if (!Number.isInteger(skuNum)) {
    return res.status(400).json({ error: 'sku must be an integer' });
  }
  if (!Number.isFinite(subNum) || subNum < 0) {
    return res.status(400).json({ error: 'subtotal must be a non-negative number' });
  }

  const pricingCtl = withTimeout(TIMEOUT_MS);
  const invCtl = withTimeout(TIMEOUT_MS);

  try {
    const [priceRes, stockRes] = await Promise.all([
      fetch(`${PRICING_URL}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Request-Id': req.requestId }, //Add request ID header for tracing
        body: JSON.stringify({ subtotal: subNum }),
        signal: pricingCtl.signal,
      }),
      fetch(`${INVENTORY_URL}/stock/${skuNum}`, { headers: { 'Content-Type': 'application/json', 'X-Request-Id': req.requestId }, signal: invCtl.signal }),
    ]);

    if (!priceRes.ok) {
      const body = await priceRes.json().catch(() => ({}));
      return res.status(502).json({ error: body.error || 'pricing failed' });
    }
    if (!stockRes.ok) {
      const body = await stockRes.json().catch(() => ({}));
      return res.status(502).json({ error: body.error || 'inventory failed' });
    }

    const price = await priceRes.json();
    const stock = await stockRes.json();

    if (!stock.inStock) {
      return res.status(409).json({ error: 'out of stock', sku: skuNum, price });
    }

    // Save order to database
    const orderQuery = `
      INSERT INTO orders (sku, subtotal, total, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, created_at;
    `;
    const orderResult = await pool.query(orderQuery, [skuNum, subNum, price.total, 'completed']);
    const orderId = orderResult.rows[0].id;

    return res.json({ ok: true, orderId, sku: skuNum, price, stock });
  } catch (e) {
    console.error('Checkout error:', e.message);
    return res.status(503).json({ error: 'dependency timeout/unavailable' });
  } finally {
    pricingCtl.cancel();
    invCtl.cancel();
  }
});

app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`checkout-fn on ${PORT}`);
});

process.on('SIGTERM', () => {
  pool.end();
  process.exit(0);
});