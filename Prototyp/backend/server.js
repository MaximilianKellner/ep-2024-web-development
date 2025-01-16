'use strict';

// TODO: Was soll getCustomerData() machen, wenn das codeword name ist??
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { processAllFiles } from './sharp.js';
import optimizationEventEmitter from './optimizationEventEmitter.js';
import fs from 'fs';
import path from 'path';
import OptimizationEventStatus from './optimizationEventStatus.js';


const app = express();
const PORT = 5000;

const UPLOAD_DIR = './customers/debug-kunde-1/uploaded';
const OPTIMIZED_DIR = './customers/debug-kunde-1/optimized';

let optimizationEventActive = false;

// TODO: Credit Points an Client mitschicken. -> DONE
// TODO: Die Bilder sollten nach der Optimierung aus ./uploaded gelöscht werden. -> DONE
// TODO: Der Ordner uploaded sollte nach der Optimierung geleert werden.
// TODO: Felder in der JSON überarbeiten -> maxFileinKB, maxWidthInPX sind irreführend.
// TODO: Endpunkt, um über die zum Download bereiten Dateien zu informieren (/available-downloads).

// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(cors());
app.use(express.static('../frontend'));

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
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const uniqueSuffix = `${timestamp}_${randomSuffix}`;
        console.log("Unique suffix: ", uniqueSuffix);
        cb(null, `${file.originalname}-${uniqueSuffix}`);
    }
});

const upload = multer({ storage: storage });

// TODO: Sicherstellen, dass der Key "images" im <form> definiert ist.
// TODO: Sollen einzelne und mehrere Dateien hochgeladen werden? Sollen diese unterschiedlich behandelt werden?
app.post('/:id/upload', upload.array('images'), async (req, res, next) => {

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
        .then(async () => {
            console.log('Done!');
        })
        .catch(error => console.error('Error processing files:', error));


});

app.get('/debug-kunde-1/progress', async (req, res) => {

    //TODO: Work with user id from request
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // TODO: Add error handling with callback
    res.write('');

    // Get credits from user

    let credits = undefined;
    try {
        const customerData = await fs.promises.readFile('./customers/debug-kunde-1/customer-data.json', 'utf8');
        credits = JSON.parse(customerData).configSettings.credits;
        console.log('Credits:', credits);
    } catch (error) {
        console.error('Error reading credits:', error);
        res.status(500).send('Error reading credits');
    }

    // TODO: Der Listener sollte mit einer Nutzer-ID verknüpft sein.
    // TODO: Der Listener sollte nach der Optimierung zerstört werden
    const sendProgress = (status, fileName) => {
        const data = JSON.stringify({ status, fileName, credits });
        res.write(`data: ${data}\n\n`);
    };

    optimizationEventEmitter.on('progress', sendProgress);

    const handleClosingConnection = async () => {
        console.log('Connection closed');
        optimizationEventEmitter.removeListener('progress', sendProgress);
    };

    req.on('close', handleClosingConnection);

});


async function removeFiles(directory) {
    try {
        const files = (await fs.promises.readdir(directory)).filter(file => !/\.gitkeep$/i.test(file)); 
        for (const file of files) {
            console.log(`Deleting ${file}`);
            const filePath = path.join(directory, file);
            try {
                await fs.promises.unlink(filePath);
                console.log(`Successfully deleted ${filePath}`);
            } catch (err) {
                if (err.code === 'EBUSY' || err.code === 'EPERM') {
                    console.warn(`File is busy or permission error, retrying: ${filePath}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await fs.promises.unlink(filePath);
                } else {
                    console.error(`Error deleting file: ${filePath}`, err);
                }
            }
        }
    } catch (err) {
        console.error('Error reading uploaded directory:', err);
    }
}

app.get('/:id/download/:imageName', (req, res, next) => {
    const contentDispositionType = req.query.cdtype ? 'inline' : 'attachment';

    // TODO: Mehrere Dateien könnten den gleichen Namen haben und sollten unterschieden werden.
    // TODO: Nutzer-ID einsetzen.
    const userId = req.params.id;
    const imageName = req.params.imageName;

    handleImageRequest(imageName, res, contentDispositionType);

});

app.get('/:userId/optimized-images', async (req, res) => {
    const userId = req.params.userId;


    try {
        const files = (await fs.promises.readdir(OPTIMIZED_DIR)).filter(file =>
            /\.(jpg|jpeg|png)/i.test(file)
        );
        res.json(files);
    } catch (error) {
        console.error('Error reading optimized directory:', error);
        res.status(500).send('Error reading optimized directory');
    }
});

app.get('/:userId/credits', async (req, res) => {
    const userId = req.params.userId;

    try {
        const customerData = await fs.promises.readFile(`./customers/${userId}/customer-data.json`, 'utf8');
        const credits = JSON.parse(customerData).configSettings.credits;
        res.json({ credits });
    } catch (error) {
        console.error('Error reading credits:', error);
        res.status(500).send('Error reading credits');
    }
});

async function findImage(imageName) {
    try {
        const files = await fs.promises.readdir(OPTIMIZED_DIR);
        const image = files.find(file => file.includes(imageName));
        return image;
    } catch (err) {
        console.error(err);
        return null;
    }
}
// TODO: Suffix sollte wieder entfernt werden.
async function sendImage(imageName, res, contentDispositionType) {
    const filePath = `${OPTIMIZED_DIR}/${imageName}`;
    const fileStream = fs.createReadStream(filePath);

    fs.stat(filePath, (err, stats) => {
        if (err) {
            res.status(404).send('File not found');
            return;
        }

        // Notwendige Header
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `${contentDispositionType}; filename="${imageName}"`);

        // Sende die Datei zum Download
        fileStream.pipe(res);
    });

    fileStream.on('error', err => {
        console.log(err);
        res.status(500).send('Error downloading file');
    });
}

async function handleImageRequest(imageName, res, contentDispositionType) {
    let image = await findImage(imageName);
    console.log("Gefunden Bild: ", image);
    if (image) {
        await sendImage(image, res, contentDispositionType);
    } else {
        res.status(404).send('Image not found');
    }
}

app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`),
);