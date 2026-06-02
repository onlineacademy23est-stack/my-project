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
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// ✅ Google Sheets retry helper
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

// ==========================================
// ✅ API Endpoints
// ==========================================

// ✅ LOGIN / REGISTRATION VALIDATION
app.post('/api/login', async (req, res) => {
    
    console.log('LOGIN ROUTE HIT', req.body);

    const connection = await pool.getConnection();

    try {

        const { labCode, fbName } = req.body;

        if (!labCode || !fbName) {
            return res.status(400).json({
                success: false,
                msg: "Lab code and Facebook name are required."
            });
        }

        const trimmedCode = labCode.trim().toUpperCase();
        const trimmedName = fbName.trim();

        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `
            SELECT *
            FROM labcode
            WHERE lab_code = ?
            FOR UPDATE
            `,
            [trimmedCode]
        );

        // Code not found
        if (rows.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                msg: "❌ Invalid registration code."
            });
        }

        const code = rows[0];

        console.log('LOGIN CHECK', {
    lab_code: code.lab_code,
    status: code.status,
    used_by: code.used_by,
    fbName: trimmedName
});

       // Code already claimed
if (code.status === 'used') {

    if (code.used_by === trimmedName) {

        await connection.commit();

        return res.json({
            success: true,
            msg: "Login successful!"
        });
    }

    await connection.rollback();

    return res.status(403).json({
        success: false,
        msg: "❌ This code belongs to another Facebook account."
    });
}

        // First successful registration
        await connection.execute(
            `
            UPDATE labcode
            SET
                status = 'used',
                used_by = ?,
                used_at = NOW(),
                is_used = 1,
                assigned_at = COALESCE(assigned_at, NOW())
            WHERE lab_code = ?
            `,
            [trimmedName, trimmedCode]
        );
        console.log("BEFORE UPDATE", trimmedCode, trimmedName);

const [updateResult] = await connection.execute(
    `
    UPDATE labcode
    SET
        status = 'used',
        used_by = ?,
        used_at = NOW(),
        is_used = 1,
        assigned_at = COALESCE(assigned_at, NOW())
    WHERE lab_code = ?
    `,
    [trimmedName, trimmedCode]
);

console.log("UPDATE RESULT", updateResult);

        // Create / update user
        await connection.execute(
            `
            INSERT INTO users
            (
                lab_code,
                fb_name,
                coins,
                created_at,
                last_seen
            )
            VALUES
            (
                ?, ?, 0, NOW(), NOW()
            )
            ON DUPLICATE KEY UPDATE
                fb_name = VALUES(fb_name),
                last_seen = NOW()
            `,
            [trimmedCode, trimmedName]
        );

        await connection.commit();

        console.log(`✅ Registered: ${trimmedName} / ${trimmedCode}`);

        return res.json({
            success: true,
            msg: "✅ Registration successful."
        });

    } catch (err) {

        await connection.rollback();

        console.error("⚠️ Login Error:", err);

        return res.status(500).json({
            success: false,
            msg: "Database error. Try again later."
        });

    } finally {

        connection.release();

    }
});
// ✅ WITHDRAW — saves to MySQL + Google Sheets
app.post('/api/withdraw', async (req, res) => {
    console.log("📥 [REQUEST RECEIVED]: Processing payout...");
    const { labCode, fbName, amount } = req.body;

    if (!fbName || !amount) {
        return res.status(400).json({ success: false, msg: "fbName and amount are required." });
    }

    const trimmedCode = (labCode || "N/A").trim().toUpperCase();
    const trimmedName = fbName.trim();

    try {
        // Save withdrawal record
        await pool.query(
            "INSERT INTO withdrawals (lab_code, fb_name, amount, status) VALUES (?, ?, ?, 'pending')",
            [trimmedCode, trimmedName, amount]
        );
        console.log("📝 [MySQL]: Withdrawal saved!");

        // Update user coin total
        await pool.query(`
            INSERT INTO users (lab_code, fb_name, coins, created_at, last_seen)
            VALUES (?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
                fb_name = VALUES(fb_name),
                coins = coins + VALUES(coins),
                last_seen = NOW()
        `, [trimmedCode, trimmedName, parseFloat(amount) || 0]);
        console.log("👤 [MySQL]: User tracked!");

        // Send to Google Sheets
        const params = new URLSearchParams();
        params.append('timestamp', new Date().toLocaleString());
        params.append('labCode', trimmedCode);
        params.append('fbName', trimmedName);
        params.append('amount', `$${amount}`);

        await postWithRetry(GOOGLE_SCRIPT_URL, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log("📊 [Google Sheets]: Sent!");

        return res.json({ success: true, msg: "✅ Withdraw processed successfully!" });

    } catch (err) {
        console.error("⚠️ Withdraw Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to process withdrawal." });
    }
});

// ✅ GET ALL USERS — for your MySQL Workbench view / admin dashboard
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.lab_code,
                u.fb_name,
                u.coins AS total_coins,
                u.last_seen,
                u.created_at,
                lc.assigned_at AS first_login
            FROM users u
            LEFT JOIN labcode lc ON u.lab_code = lc.lab_code
            ORDER BY u.last_seen DESC
        `);
        return res.json({ success: true, total_users: rows.length, users: rows });
    } catch (err) {
        console.error("⚠️ Error:", err.message);
        return res.status(500).json({ success: false, msg: "Failed to fetch users." });
    }
});

// ✅ GET WITHDRAWAL HISTORY
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
        return res.status(500).json({ success: false, msg: "Failed to fetch withdrawals." });
    }
});

// ✅ Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});

setInterval(() => {
    console.log("💓 server heartbeat...");
}, 60000);
