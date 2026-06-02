const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool(process.env.DB_URL);

app.post('/api/login', async (req, res) => {
    const { labCode, fbName } = req.body;

    try {
        const [rows] = await pool.execute(
            "SELECT * FROM labcode WHERE lab_code = ? AND (used_by IS NULL OR used_by = ?)",
            [labCode.trim().toUpperCase(), fbName.trim()]
        );

        if (rows.length > 0) {
            return res.json({ success: true });
        }

        return res.status(401).json({
            success: false,
            msg: "Invalid code or already taken"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            msg: "DB Error"
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
});