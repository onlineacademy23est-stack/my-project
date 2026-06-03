const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. CORS Configuration
app.use(cors({
    origin: ["https://client-eight-lyart-25.vercel.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// 2. Debugging: I-log ang environment config sa startup
console.log("Environment check:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    node_env: process.env.NODE_ENV
});

// 3. Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
});

// Test connection sa startup
pool.getConnection()
    .then(connection => {
        console.log("✅ Successfully connected to the database!");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err);
    });

/*
|--------------------------------------------------------------------------
| HEALTH CHECK — Para hindi matulog ang Render free tier
|--------------------------------------------------------------------------
*/
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
app.post('/api/login', async (req, res) => {
    console.log("LOGIN HIT", req.body);

    const labCode = (req.body.labCode || '').trim().toUpperCase();
    const fbName = (req.body.fbName || '').trim();

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

        // FIRST CLAIM
        if (!code.used_by) {
            await pool.execute(
                `UPDATE labcode SET used_by = ?, used_at = NOW(), is_used = 1 WHERE id = ?`,
                [fbName, code.id]
            );
            return res.json({ success: true, msg: 'Code claimed successfully.' });
        }

        // SAME OWNER
        if (code.used_by.trim().toLowerCase() === fbName.trim().toLowerCase()) {
            return res.json({ success: true, msg: 'Welcome back.' });
        }

        // DIFFERENT OWNER
        return res.status(403).json({ success: false, msg: 'This code belongs to another Facebook account.' });

    } catch (err) {
        console.error('DATABASE ERROR:', err);
        return res.status(500).json({ success: false, msg: 'Database connection error.' });
    }
});

/*
|--------------------------------------------------------------------------
| WITHDRAW
|--------------------------------------------------------------------------
*/
app.post('/api/withdraw', async (req, res) => {
    console.log("WITHDRAW HIT", req.body);

    const { labCode, fbName, amount } = req.body;

    if (!labCode || !fbName || !amount) {
        return res.status(400).json({ success: false, msg: 'Missing required fields.' });
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
            return res.status(403).json({ success: false, msg: 'Name mismatch. Unauthorized withdrawal.' });
        }

        // Log the withdrawal request (optional: save to DB)
        console.log(`💸 Withdrawal request: ${fbName} | Code: ${labCode} | Amount: $${amount}`);

        return res.json({ success: true, msg: `Withdrawal of $${amount} has been submitted successfully.` });

    } catch (err) {
        console.error('WITHDRAW ERROR:', err);
        return res.status(500).json({ success: false, msg: 'Database error during withdrawal.' });
    }
});

// 4. Server Initialization
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
