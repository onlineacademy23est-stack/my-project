const express = require('express');
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📡 REQUEST: ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
});
// Ito ay isang test endpoint
app.post('/api/login', (req, res) => {
    console.log("🔥 TESTING VERSION: 2026-JUNE-02-V1");
    return res.status(404).json({ success: false, msg: "❌ BLOCKING ALL ACCESS" });
});

app.listen(10000, () => console.log("🚀 Server is running on 10000"));