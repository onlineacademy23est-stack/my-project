const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
 
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});
 
// ─────────────────────────────────────────────
// 1. CORS Configuration
// ─────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ["https://client-eight-lyart-25.vercel.app"];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
 
app.use(express.json());
 
// ─────────────────────────────────────────────
// 2. Environment Check on Startup
// ─────────────────────────────────────────────
console.log("🔍 Environment check:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    node_env: process.env.NODE_ENV
});
 
// ─────────────────────────────────────────────
// 3. Database Pool
// ─────────────────────────────────────────────
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000
});
 
// Test DB connection on startup
pool.getConnection()
    .then(connection => {
        console.log("✅ Successfully connected to the database!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
    });
 
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
        const [rows] = await pool.execute(
            `SELECT id, lab_code, is_used, used_by, used_at FROM labcode WHERE lab_code = ?`,
            [labCode]
        );
 
        if (rows.length === 0) {
            return res.status(404).json({ success: false, msg: 'Invalid LAB Code.' });
        }
 
        const code = rows[0];
 
        // First claim — walang naka-assign na owner
        if (!code.used_by) {
            await pool.execute(
                `UPDATE labcode SET used_by = ?, used_at = NOW(), is_used = 1 WHERE id = ?`,
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
        const [rows] = await pool.execute(
            `SELECT id, used_by FROM labcode WHERE lab_code = ?`,
            [labCode.trim().toUpperCase()]
        );
 
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

        await pool.execute(
            `INSERT INTO withdrawals (lab_code, fb_name, amount) VALUES (?, ?, ?)`,
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
// 4. 404 Catch-all
// ─────────────────────────────────────────────
app.use((req, res) => {
    console.warn(`[404] ${req.method} ${req.url}`);
    res.status(404).json({ success: false, msg: `Route not found: ${req.method} ${req.url}` });
});
 
// ─────────────────────────────────────────────
// 5. Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[UNHANDLED ERROR]', err);
    res.status(500).json({ success: false, msg: 'Internal server error.' });
});
 
// ─────────────────────────────────────────────
// 6. Server Start
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
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
