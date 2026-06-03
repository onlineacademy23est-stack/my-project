const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Mas istriktong CORS para maiwasan ang blocking issues
app.use(cors({
    origin: '*', // Subukan muna natin 'all' para ma-isolate kung CORS ang problema
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 2. Debugging: I-log kung nabasa ba ang ports (para makita sa Render Logs)
console.log("Environment check:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    node_env: process.env.NODE_ENV
});

// Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306, // Ginawang integer
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
app.post('/api/login', async (req, res) => {
    // Siguraduhin na may request body
    if (!req.body) return res.status(400).json({ success: false, msg: 'No data provided' });

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

        if (!code.used_by) {
            await pool.execute(
                `UPDATE labcode SET used_by = ?, used_at = NOW(), is_used = 1 WHERE id = ?`,
                [fbName, code.id]
            );
            return res.json({ success: true, msg: 'Code claimed successfully.' });
        }

        if (code.used_by.trim().toLowerCase() === fbName.trim().toLowerCase()) {
            return res.json({ success: true, msg: 'Welcome back.' });
        }

        return res.status(403).json({ success: false, msg: 'This code belongs to another Facebook account.' });

    } catch (err) {
        console.error('DATABASE ERROR:', err);
        return res.status(500).json({ success: false, msg: 'Database connection error.' });
    }
});

// Server Initialization
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});