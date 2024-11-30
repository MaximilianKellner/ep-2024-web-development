const express = require('express');
const app = express();
const PORT = 5000;


app.get("/", (req, res) => {
    res.send("Hello Worldd!");
});

// Dateiupload


app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

