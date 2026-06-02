const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool(process.env.DB_URL);

app.post('/api/login', async (req, res) => {

    return res.status(418).json({
        success: false,
        msg: "BES TEST"
    });


    const labCode = (req.body.labCode || '').trim().toUpperCase();
    const fbName = (req.body.fbName || '').trim();

    if (!labCode || !fbName) {
        return res.status(400).json({
            success: false,
            msg: "LAB Code and Facebook Name are required."
        });
    }

    try {

        // VERIFY CODE EXISTS
        const [rows] = await pool.execute(
            `
            SELECT
                id,
                lab_code,
                is_used,
                used_by,
                used_at
            FROM labcode
            WHERE lab_code = ?
            `,
            [labCode]
        );

        // RANDOM CODE
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "Invalid LAB Code."
            });
        }

        const code = rows[0];

        // FIRST CLAIM
        if (!code.used_by) {

            await pool.execute(
                `
                UPDATE labcode
                SET
                    used_by = ?,
                    used_at = NOW(),
                    is_used = 1
                WHERE id = ?
                `,
                [fbName, code.id]
            );

            return res.json({
                success: true,
                msg: "Code claimed successfully."
            });
        }

        // SAME OWNER
        if (
            code.used_by.trim().toLowerCase() ===
            fbName.trim().toLowerCase()
        ) {

            return res.json({
                success: true,
                msg: "Welcome back."
            });
        }

        // DIFFERENT OWNER
        return res.status(403).json({
            success: false,
            msg: "This code belongs to another Facebook account."
        });

    } catch (err) {

        console.error("LOGIN ERROR:", err);

        return res.status(500).json({
            success: false,
            msg: "Database error."
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
});