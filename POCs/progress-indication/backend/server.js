const express = require('express');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // Importiere multer für den Datei-Upload

const app = express();
const PORT = 3000;

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

    res.status(200).send({ message: 'File uploaded successfully!', file: req.file });
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
