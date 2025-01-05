const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // Importiere multer für den Datei-Upload

const app = express();
const PORT = 3000;

let optimizationEventActive = false;
let optimizationProgressCounter = 1;
const optimizationEventData = {
    "active": `data: The optimization is in progress.\n\n`,
    "error": `data: The optimization failed!\n\n`,
    "complete": `data: The optimization is complete!\n\n`
}
const optimizationEventStatus = {
    "ok": "ok",
    "error": "error"
};

let status = optimizationEventStatus.ok;

app.use(cors());

// Setze den Speicherort und die Dateibenennung für hochgeladene Dateien mit multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Zielordner für die hochgeladenen Dateien
        cb(null, './data/');
    },
    filename: function (req, file, cb) {
        // Definiere den Dateinamen (hier: Originalname der Datei)
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res, next) => {
    // `image` ist der Name des Feldes im FormData-Objekt (s. Client-Code)
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    res.status(204).send('File uploaded successfully.');

    //Simulate optimization with Error after 5000 ms -> Will interrupt SSE
    optimizationEventActive = true;
    setInterval(() => {
        status = optimizationEventStatus.error;
    }, 50000);

});



//Endpoint for SSE progress indication 
app.get('/progress', (req, res) => {

    if (optimizationEventActive === true) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        let progressInterval = setInterval(() => {
            console.log(`Progress: ${optimizationProgressCounter}%`);
            if (status === optimizationEventStatus.error) {
                optimizationProgressCounter = 0;
                console.error("Optimization failed!");
                optimizationEventActive = false;
                res.write(optimizationEventData.error);
                clearInterval(progressInterval);
                return;
            } else if (optimizationProgressCounter <= 1000) {
                optimizationProgressCounter += 10;
                res.write(optimizationEventData.active);
            }
        }, 1000);

        // Simulate full optimization 
        setTimeout(() => {
            optimizationProgressCounter = 0;
            console.log("Optimization completed successfully.");
            optimizationEventActive = false;
            res.write(optimizationEventData.complete);
            clearInterval(progressInterval);
            //res.end();
        }, 15000);

    }
});

app.get('/download', (req, res, next) => {

    const image = 'architecture.png'; // Dateiname für den Download
    const filePath = `${__dirname}/data/${image}`;

    const fileStream = fs.createReadStream(filePath);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            next(err);
            return;
        }

        // Notwendige Header
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${image}"`);

        // Sende die Datei zum Download
        fileStream.pipe(res);
    });

    fileStream.on('error', err => {
        console.log(err);
        next(err);
    });
});

app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`),
);
