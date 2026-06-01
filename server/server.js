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

// MySQL Pool setup: Ito ang mag-aayos ng "Connection closed" issue
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'OnlineLearningAcademy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true, // Importante para hindi maputol ang connection
    keepAliveInitialDelay: 10000
});

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

app.post('/api/withdraw', async (req, res) => {
    console.log("📥 [REQUEST RECEIVED]: Processing payout...");
    const { labCode, fbName, amount } = req.body;

    const sql = "INSERT INTO withdrawals (fb_name, amount, status) VALUES (?, ?, ?)";
    
    try {
        // Gamit ang pool, kusa itong kukuha ng active connection
        await pool.query(sql, [fbName, amount, 'pending']);
        console.log("📝 [MySQL]: Payout saved to database!");

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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});

setInterval(() => {
    console.log("💓 server heartbeat...");
}, 60000);