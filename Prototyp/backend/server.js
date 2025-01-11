'use strict';

// TODO: Was soll getCustomerData() machen, wenn das codeword name ist??
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processAllFiles } from './sharp.js';
import optimizationEventEmitter from './optimizationEventEmitter.js';

const app = express();
const PORT = 5000;

const UPLOAD_DIR = './customers/debug-kunde-1/uploaded';

let optimizationEventActive = false;

// TODO: Felder in der JSON überarbeiten -> maxFileinKB, maxWidthInPX sind irreführend.
// TODO: Endpunkt, um über die zum Download bereiten Dateien zu informieren (/available-downloads).

// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(cors());

// TODO: Dateien mit nicht validem oder fehlendem Dateityp sollen abgelehnt werden.
// TODO: Dateien, die das Credit-Limit übersteigen, sollen abgelehnt werden.
// TODO: Uploads, die das Storage-Limit übersteigen, sollen abgelehnt werden.
// TODO: Dateien mit dem gleichen Dateinamen sollen akzeptiert werden.
// TODO: Regeln, was passiert, wenn durch Abbruch des Uploads/ Downloads ein Fehler auftritt.
//-------- Speicherort und die Dateibenennung für hochgeladene Dateien --------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '' + Math.round(Math.random() * 1E9);
        console.log("Unique suffix: ", uniqueSuffix);
        cb(null, `${file.originalname}-${uniqueSuffix}`);
    }
});

const upload = multer({ storage: storage });

// TODO: Sicherstellen, dass der Key "images" im <form> definiert ist.
// TODO: Sollen einzelne und mehrere Dateien hochgeladen werden? Sollen diese unterschiedlich behandelt werden?
app.post('/:id/upload', upload.array('images'), (req, res, next) => {

    if (!req.files) {
        return res.status(400).send('No file uploaded.');
    }

    console.log(req.files);
    res.status(204).send('File uploaded successfully.');
    const userId = req.params.id;
    console.log(userId);

    //TODO: Das Verzeichnis muss automatisch erstellt werden, wenn es nicht existiert(?)
    optimizationEventActive = true;
    processAllFiles(userId)
        .then(() => console.log('Done!'))
        .catch(error => console.error('Error processing files:', error));
});

app.get('/debug-kunde-1/progress', (req, res) => {

   
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        res.write('');
        
        optimizationEventEmitter.on('progress', (progress) => {
            console.log("Progress from emitter: ", progress);
            res.write(progress);
        })
    
});

app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`),
);