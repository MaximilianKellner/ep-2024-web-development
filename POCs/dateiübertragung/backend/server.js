const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

//debug
app.get("/", (req, res) => {
    const queryParam = req.query.param || "";
    res.send(`Hello World! ${queryParam}`);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') //Ordner für die Uploads
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //einzigartiger Filename
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB File Limit pro Datei
        files: 10 // Maximale Anzahl von Dateien
    },
    fileFilter: (req, file, cb) => {
        // Erlaubte Dateitypen definieren
        const allowedTypes = ['image/jpeg', 'image/png',];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Ungültiger Dateityp. Nur JPEG, PNG, sind erlaubt.'), false);
        }
    }
});

app.post('/upload', (req, res) => {
    upload.array('files', 10)(req, res, (err) => {  // Maximum 10 Dateien
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send('Eine oder mehrere Dateien sind zu groß. Maximale Dateigröße: 10MB pro Datei');
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).send(`Zu viele Dateien. Maximal 10 Dateien erlaubt.`);
            }
            return res.status(400).send(`Upload-Fehler: ${err.message}`);
        } else if (err) {
            return res.status(500).send(`Serverfehler: ${err.message}`);
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Keine Dateien hochgeladen');
        }

        // Erstellen Sie eine Liste der hochgeladenen Dateinamen
        const uploadedFiles = req.files.map(file => file.filename);
        res.status(200).send(`Dateien erfolgreich hochgeladen: ${uploadedFiles.join(', ')}`);
    });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});