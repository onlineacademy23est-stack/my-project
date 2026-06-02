const express = require('express');
const mysql = require('mysql2/promise'); // Gamitin ang mysql2
const app = express();
app.use(express.json());

// I-setup ang database connection gamit ang iyong Environment Variables
const pool = mysql.createPool(process.env.DATABASE_URL);

app.post('/api/login', async (req, res) => {
    const { labCode, fbName } = req.body;
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM labcode WHERE lab_code = ? AND (used_by IS NULL OR used_by = ?)",
            [labCode.trim().toUpperCase(), fbName.trim()]
        );
        
        if (rows.length > 0) {
            return res.json({ success: true, msg: "Login Success" });
        } else {
            return res.status(401).json({ success: false, msg: "Invalid code or already taken" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: "DB Error" });
    }
});

app.listen(10000, () => console.log("🚀 Server running on 10000"));