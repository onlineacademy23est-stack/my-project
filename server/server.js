const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
 
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});
 
// ─────────────────────────────────────────────
// 1. CORS Configuration
// ─────────────────────────────────────────────
app.use(cors({
    origin: ["https://client-agvm5y0e9-onlineacademy23est-stacks-projects.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
 
app.use(express.json());
 
// ─────────────────────────────────────────────
// 2. Environment Check on Startup
// ─────────────────────────────────────────────
console.log("🔍 Environment check:", {
    database_url: process.env.DATABASE_URL ? "✅ SET" : "❌ NOT SET",
    node_env: process.env.NODE_ENV
});
 
// ─────────────────────────────────────────────
// 3. Database Pool (PostgreSQL)
// ─────────────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
 
// Test DB connection on startup
pool.connect()
    .then(client => {
        console.log("✅ Successfully connected to the database!");
        client.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });
 
// ─────────────────────────────────────────────
// 4. Self-Ping para hindi matulog ang server
// ─────────────────────────────────────────────
const SELF_URL = process.env.RAILWAY_STATIC_URL
    ? `https://${process.env.RAILWAY_STATIC_URL}`
    : `http://localhost:${process.env.PORT || 10000}`;
 
setInterval(async () => {
    try {
        const res = await fetch(`${SELF_URL}/health`);
        console.log(`🏓 Self-ping OK — ${new Date().toISOString()}`);
    } catch (err) {
        console.warn("⚠️  Self-ping failed:", err.message);
    }
}, 10 * 60 * 1000); // Every 10 minutes
 
// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
 
/*
 | HEALTH CHECK
 | GET /health
*/
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
 
/*
 | LOGIN
 | POST /api/login
 | Body: { labCode, fbName }
*/
app.post('/api/login', async (req, res) => {
    console.log(`[LOGIN] ${new Date().toISOString()} — Body:`, req.body);
 
    const labCode = (req.body.labCode || '').trim().toUpperCase();
    const fbName  = (req.body.fbName  || '').trim();
 
    if (!labCode || !fbName) {
        return res.status(400).json({ success: false, msg: 'LAB Code and Facebook Name are required.' });
    }
 
    try {
        // PostgreSQL: $1 placeholder, result.rows
        const result = await pool.query(
            `SELECT id, lab_code, is_used, used_by, used_at FROM labcode WHERE lab_code = $1`,
            [labCode]
        );

        const rows = result.rows;
 
        if (rows.length === 0) {
            return res.status(404).json({ success: false, msg: 'Invalid LAB Code.' });
        }
 
        const code = rows[0];
 
        // First claim — walang naka-assign na owner
        if (!code.used_by) {
            await pool.query(
                `UPDATE labcode SET used_by = $1, used_at = NOW(), is_used = 1 WHERE id = $2`,
                [fbName, code.id]
            );
            console.log(`[LOGIN] ✅ Code claimed by: ${fbName}`);
            return res.json({ success: true, msg: 'Code claimed successfully.' });
        }
 
        // Same owner — welcome back
        if (code.used_by.trim().toLowerCase() === fbName.trim().toLowerCase()) {
            console.log(`[LOGIN] ✅ Welcome back: ${fbName}`);
            return res.json({ success: true, msg: 'Welcome back.' });
        }
 
        // Different owner — denied
        console.warn(`[LOGIN] ⛔ Name mismatch — stored: "${code.used_by}", provided: "${fbName}"`);
        return res.status(403).json({ success: false, msg: 'This code belongs to another Facebook account.' });
 
    } catch (err) {
        console.error('[LOGIN] ❌ DATABASE ERROR:', err.message);
        return res.status(500).json({ success: false, msg: 'Database connection error. Please try again later.' });
    }
});
 
/*
 | WITHDRAW
 | POST /api/withdraw
 | Body: { labCode, fbName, amount }
*/
app.post('/api/withdraw', async (req, res) => {
    console.log(`[WITHDRAW] ${new Date().toISOString()} — Body:`, req.body);
 
    const { labCode, fbName, amount } = req.body;
 
    if (!labCode || !fbName || !amount) {
        return res.status(400).json({ success: false, msg: 'Missing required fields: labCode, fbName, amount.' });
    }
 
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, msg: 'Invalid amount value.' });
    }
 
    try {
        const result = await pool.query(
            `SELECT id, used_by FROM labcode WHERE lab_code = $1`,
            [labCode.trim().toUpperCase()]
        );

        const rows = result.rows;
 
        if (rows.length === 0) {
            return res.status(404).json({ success: false, msg: 'LAB Code not found.' });
        }
 
        const code = rows[0];
 
        // Verify name match
        if (!code.used_by || code.used_by.trim().toLowerCase() !== fbName.trim().toLowerCase()) {
            console.warn(`[WITHDRAW] ⛔ Name mismatch — stored: "${code.used_by}", provided: "${fbName}"`);
            return res.status(403).json({ success: false, msg: 'Name mismatch. Unauthorized withdrawal.' });
        }
 
        console.log(`[WITHDRAW] 💸 ${fbName} | Code: ${labCode} | Amount: $${parsedAmount}`);

        await pool.query(
            `INSERT INTO withdrawals (lab_code, fb_name, amount) VALUES ($1, $2, $3)`,
            [labCode.trim().toUpperCase(), fbName.trim(), parsedAmount]
        );
 
        return res.json({
            success: true,
            msg: `Withdrawal of $${parsedAmount.toFixed(2)} has been submitted successfully.`
        });
 
    } catch (err) {
        console.error('[WITHDRAW] ❌ DATABASE ERROR:', err.message);
        return res.status(500).json({ success: false, msg: 'Database error during withdrawal. Please try again later.' });
    }
});
 
// ─────────────────────────────────────────────
// 5. 404 Catch-all
// ─────────────────────────────────────────────
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ success: false, msg: `Route not found: ${req.method} ${req.url}` });
});
 
// ─────────────────────────────────────────────
// 6. Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[UNHANDLED ERROR]', err);
    res.status(500).json({ success: false, msg: 'Internal server error.' });
});
 
// ─────────────────────────────────────────────
// 7. Server Start
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
 
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received — shutting down gracefully...');
    server.close(() => {
        pool.end();
        console.log('✅ Server closed.');
        process.exit(0);
    });
});
