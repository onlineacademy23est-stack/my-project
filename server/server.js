/* eslint-disable */
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 5000;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8Jj2Yw55h5sUWZStmRrZHflygaPyyrHOM--GRgkt6T6JmPWtoWAnydhihWnVjLFmj/exec";

app.use(cors());
app.use(express.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123', // Ilagay ang password mo kung meron sa XAMPP
    database: 'OnlineLearningAcademy'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
    } else {
        console.log('✅ Connected to MySQL Database (OnlineLearningAcademy)!');
    }
});

// Retry function para sa Google Sheets
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

    // 1. MySQL: I-save sa database ang payout request
    const sql = "INSERT INTO withdrawals (fb_name, amount, status) VALUES (?, ?, ?)";
    
    try {
        // I-execute ang query
        await new Promise((resolve, reject) => {
            db.query(sql, [fbName, amount, 'pending'], (err, result) => {
                if (err) reject(err);
                else {
                    console.log("📝 [MySQL]: Payout saved to database!");
                    resolve(result);
                }
            });
        });

        // 2. Google Sheets: I-sync pa rin para sa backup
        const params = new URLSearchParams();
        params.append('timestamp', new Date().toLocaleString());
        params.append('labCode', labCode || "N/A");
        params.append('fbName', fbName);
        params.append('amount', `$${amount}`);

        await postWithRetry(GOOGLE_SCRIPT_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        console.log("🚀 [SUCCESS]: Data synced to MySQL and Google Sheets!");
        return res.json({ success: true, msg: "✅ Withdraw processed successfully!" });

    } catch (err) {
        console.error("⚠️ Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to process withdrawal" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log(`🚀 Server running on port ${PORT}...`);
    console.log(`=============================================`);
});

// Heartbeat
setInterval(() => {
    console.log("💓 server heartbeat...");
}, 60000);