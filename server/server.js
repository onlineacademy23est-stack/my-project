const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors'); // Import cors
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // Allow requests from all origins (pwede mong i-restrict kung kailangan)
app.use(express.json());

// Database Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
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
    console.log("LOGIN HIT", req.body);

    const labCode = (req.body.labCode || '').trim().toUpperCase();
    const fbName = (req.body.fbName || '').trim();

    if (!labCode || !fbName) {
        return res.status(400).json({
            success: false,
            msg: 'LAB Code and Facebook Name are required.'
        });
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
        console.error('LOGIN ERROR:', err);
        return res.status(500).json({ success: false, msg: 'Database error.' });
    }
});

/*
|--------------------------------------------------------------------------
| VERIFY SESSION
|--------------------------------------------------------------------------
*/
app.post('/api/verify', async (req, res) => {
    const labCode = (req.body.labCode || '').trim().toUpperCase();
    const fbName = (req.body.fbName || '').trim();

    if (!labCode || !fbName) return res.json({ success: false });

    try {
        const [rows] = await pool.execute(
            `SELECT lab_code, used_by FROM labcode WHERE lab_code = ?`,
            [labCode]
        );

        if (rows.length === 0 || !rows[0].used_by || rows[0].used_by.trim().toLowerCase() !== fbName.trim().toLowerCase()) {
            return res.json({ success: false });
        }

        return res.json({ success: true });
    } catch (err) {
        console.error('VERIFY ERROR:', err);
        return res.status(500).json({ success: false });
    }
});

// Server Initialization
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => { // Dito idinagdag ang '0.0.0.0'
    console.log(`🚀 Server running on port ${PORT}`);
});