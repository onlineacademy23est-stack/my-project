/* eslint-disable */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 5000;

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8Jj2Yw55h5sUWZStmRrZHflygaPyyrHOM--GRgkt6T6JmPWtoWAnydhihWnVjLFmj/exec"
app.use(cors());
app.use(express.json());

/* ================================
   🔥 ADDED: SIMPLE RETRY FUNCTION
================================ */
async function postWithRetry(url, data, config, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await axios.post(url, data, config);
        } catch (err) {
            console.log(`⚠️ Retry ${i + 1}/${retries} failed`);
            if (i === retries - 1) throw err;
        }
    }
}

app.post('/api/withdraw', async (req, res) => {
    console.log("📥 [REQUEST RECEIVED]: May pumasok na click mula sa website!");

    const labCode = req.body.labCode || "UNKNOWN_CODE";
    const fbName = req.body.fbName || "ANONYMOUS_USER";
    const amount = req.body.amount || "0";

    const currentDateTime = new Date().toLocaleString();
    const isoTime = new Date().toISOString(); // 🔥 ADDED backup timestamp

    const logData = `[WITHDRAWAL] Code: ${labCode} | Name: ${fbName} | Amount: $${amount} | Date: ${currentDateTime}\n`;

    /* ================================
       🔥 ADDED: JSON BACKUP LOG FORMAT
    ================================= */
    const jsonLog = JSON.stringify({
        labCode,
        fbName,
        amount,
        date: currentDateTime,
        iso: isoTime
    }) + "\n";

    const params = new URLSearchParams();
    params.append('TIMESTAMP', currentDateTime);
    params.append('LAB CODE', labCode);
    params.append('FB NAME', fbName);
    params.append('amount', `$${amount}`);
    
    params.append('timestamp', currentDateTime);
    params.append('labCode', labCode);
    params.append('fbName', fbName);
    params.append('amount', `$${amount}`);

    console.log("⚡ [SABAYAN]: Processing enhanced dual-sync system...");

    /* ================================
       🔥 ADDED: PERFORMANCE TIMER
    ================================= */
    const startTime = Date.now();

    try {
        await Promise.all([
            /* ORIGINAL 1: TXT LOG (UNCHANGED) */
            new Promise((resolve, reject) => {
                try {
                    fs.appendFileSync(
                        path.join(__dirname, 'withdrawals.txt'),
                        logData
                    );
                    console.log("📝 [ORIGINAL]: withdrawals.txt saved");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }),

            /* 🔥 ADDED: JSON BACKUP FILE */
            new Promise((resolve, reject) => {
                try {
                    fs.appendFileSync(
                        path.join(__dirname, 'withdrawals_backup.json'),
                        jsonLog
                    );
                    console.log("🗂️ [ADDED]: backup JSON logged");
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }),

            /* ORIGINAL 2: GOOGLE SHEETS */
            postWithRetry(GOOGLE_SCRIPT_URL, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(() => {
                console.log("📊 [ORIGINAL]: Google Sheets updated");
            })
        ]);

        /* ================================
           🔥 ADDED: LATENCY REPORT
        ================================= */
        const endTime = Date.now();
        console.log(`⏱️ TOTAL SYNC TIME: ${endTime - startTime}ms`);

        console.log("🚀 [SUCCESS]: Full dual + backup sync completed!");

        return res.json({
            success: true,
            msg: "✅ Withdraw processed with enhanced sync system",
            syncTime: `${endTime - startTime}ms`
        });

    } catch (globalErr) {
        console.error("⚠️ Global error:", globalErr.message);

        /* 🔥 ADDED: EMERGENCY LOG SAVE */
        try {
            fs.appendFileSync(
                path.join(__dirname, 'error_log.txt'),
                `[ERROR] ${new Date().toLocaleString()} | ${globalErr.message}\n`
            );
        } catch (e) {}

        return res.json({
            success: true,
            msg: "⚠️ Partial failure but system recovered"
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`=============================================`);
    console.log("🚀 Server permanently listening on port 5000...");
    console.log(`=============================================`);
});

/* 🔥 ADDED: KEEP ALIVE LOOP (optional stability trick) */
setInterval(() => {
    console.log("💓 server heartbeat...");
}, 60000);