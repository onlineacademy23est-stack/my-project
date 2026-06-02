const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/login', (req, res) => {
    console.log("🔥 TEST: PUMASOK SA PINAKA-BAGONG VERSION NG CODE");
    return res.status(404).json({ success: false, msg: "Lahat ng random ay dapat block dito" });
});

app.listen(10000, () => console.log("🚀 Live on 10000"));