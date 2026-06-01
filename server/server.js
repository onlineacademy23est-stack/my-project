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

// ✅ MySQL Pool - may PORT na para sa Railway
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'OnlineLearningAcademy',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// ✅ Google Sheets retry
async function postWithRetry(url, data, config, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.post(url, data, config);
        } catch (err) {
            console.log(`⚠️ Google Sheets Retry ${i + 1}/${retries} failed`);
            if (i === retries - 1) throw err;
        }
    }
}

// ✅ Track user + coins
async function upsertUser(labCode, fbName, amount) {
    const sql = `
        INSERT INTO users (lab_code, fb_name, coins)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
            coins = coins + VALUES(coins),
            last_seen = CURRENT_TIMESTAMP
    `;
    await pool.query(sql, [labCode, fbName, parseFloat(amount) || 0]);
}

// ✅ Withdraw endpoint - may labCode na
app.post('/api/withdraw', async (req, res) => {
    console.log("📥 [REQUEST RECEIVED]: Processing payout...");
    const { labCode, fbName, amount } = req.body;

    if (!fbName || !amount) {
        return res.status(400).json({ success: false, msg: "fbName and amount are required." });
    }

    try {
        // Save withdrawal with labCode
        const sql = "INSERT INTO withdrawals (lab_code, fb_name, amount, status) VALUES (?, ?, ?, 'pending')";
        await pool.query(sql, [labCode || "N/A", fbName, amount]);
        console.log("📝 [MySQL]: Withdrawal saved!");

        // Track user
        await upsertUser(labCode || "N/A", fbName, amount);
        console.log("👤 [MySQL]: User tracked!");

        // Send to Google Sheets
        const params = new URLSearchParams();
        params.append('timestamp', new Date().toLocaleString());
        params.append('labCode', labCode || "N/A");
        params.append('fbName', fbName);
        params.append('amount', `$${amount}`);

        await postWithRetry(GOOGLE_SCRIPT_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        return res.json({ success: true, msg: "✅ Withdraw processed successfully!" });

    } catch (err) {
        console.error("⚠️ Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to process withdrawal" });
    }
});

// ✅ Monitor users - buksan sa browser para makita lahat ng users
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT lab_code, fb_name, coins AS total_coins, last_seen, created_at
            FROM users
            ORDER BY last_seen DESC
        `);
        return res.json({ success: true, total_users: rows.length, users: rows });
    } catch (err) {
        console.error("⚠️ Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to fetch users" });
    }
});

// ✅ Withdrawal history
app.get('/api/withdrawals', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT id, lab_code, fb_name, amount, status, created_at
            FROM withdrawals
            ORDER BY created_at DESC
            LIMIT 100
        `);
        return res.json({ success: true, data: rows });
    } catch (err) {
        console.error("⚠️ Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to fetch withdrawals" });
    }
});

// ✅ Health check - para hindi matulog ang Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});

setInterval(() => {
    console.log("💓 server heartbeat...");
}, 60000);
