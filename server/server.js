/* eslint-disable */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8Jj2Yw55h5sUWZStmRrZHflygaPyyrHOM--GRgkt6T6JmPWtoWAnydhihWnVjLFmj/exec";

app.use(cors());
app.use(express.json());

// ✅ MySQL Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'OnlineLearningAcademy',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ✅ Google Sheets retry helper
async function postWithRetry(url, data, config, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.post(url, data, config);
        } catch (err) {
            if (i === retries - 1) throw err;
        }
    }
}

// ==========================================
// ✅ LOGIN / REGISTRATION VALIDATION (LOCKED DOWN)
// ==========================================
app.post('/api/login', async (req, res) => {
    const { labCode, fbName } = req.body;

    if (!labCode || !fbName) {
        return res.status(400).json({ success: false, msg: "Missing fields" });
    }

    const trimmedCode = labCode.trim().toUpperCase();
    const trimmedName = fbName.trim();
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Check strict existence in database
        const [rows] = await connection.execute(
            "SELECT used_by FROM labcode WHERE lab_code = ? FOR UPDATE",
            [trimmedCode]
        );

        // 2. REJECT if code does not exist in table
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, msg: "❌ Invalid code." });
        }

        const codeEntry = rows[0];

        // 3. Ownership Check
        if (codeEntry.used_by && codeEntry.used_by.trim() !== "") {
            if (codeEntry.used_by.trim() === trimmedName) {
                await connection.commit();
                return res.json({ success: true, msg: "✅ Welcome back." });
            } else {
                await connection.rollback();
                return res.status(403).json({ success: false, msg: "❌ This code belongs to another Facebook account." });
            }
        }

        // 4. Register new owner
        await connection.execute(
            "UPDATE labcode SET used_by = ?, used_at = NOW(), is_used = 1 WHERE lab_code = ?",
            [trimmedName, trimmedCode]
        );

        await connection.execute(
            "INSERT INTO users (lab_code, fb_name, coins, created_at, last_seen) VALUES (?, ?, 0, NOW(), NOW()) ON DUPLICATE KEY UPDATE last_seen = NOW()",
            [trimmedCode, trimmedName]
        );

        await connection.commit();
        return res.json({ success: true, msg: "✅ Registration successful." });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(500).json({ success: false, msg: "Server error." });
    } finally {
        if (connection) connection.release();
    }
});

// ✅ WITHDRAW
app.post('/api/withdraw', async (req, res) => {
    const { labCode, fbName, amount } = req.body;
    if (!fbName || !amount) return res.status(400).json({ success: false, msg: "Missing data" });

    const trimmedCode = (labCode || "N/A").trim().toUpperCase();
    const trimmedName = fbName.trim();

    try {
        await pool.query("INSERT INTO withdrawals (lab_code, fb_name, amount, status) VALUES (?, ?, ?, 'pending')", [trimmedCode, trimmedName, amount]);
        await pool.query("INSERT INTO users (lab_code, fb_name, coins, created_at, last_seen) VALUES (?, ?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE coins = coins + VALUES(coins), last_seen = NOW()", [trimmedCode, trimmedName, parseFloat(amount)]);
        
        const params = new URLSearchParams();
        params.append('labCode', trimmedCode);
        params.append('fbName', trimmedName);
        params.append('amount', `$${amount}`);
        await postWithRetry(GOOGLE_SCRIPT_URL, params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        return res.json({ success: true, msg: "✅ Success" });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Failed" });
    }
});

// ✅ GETS
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users ORDER BY last_seen DESC");
        return res.json({ success: true, users: rows });
    } catch (err) { return res.status(500).json({ success: false }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on ${PORT}`));