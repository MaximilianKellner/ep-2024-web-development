'use strict';

// TODO: Was soll getCustomerData() machen, wenn das codeword name ist??
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {processAllFiles} from './sharp.js';
import optimizationEventEmitter from './optimizationEventEmitter.js';
import fs from 'fs';
import {pool} from './db.js';


const app = express();
const PORT = 5000;

const OPTIMIZED_DIR = './customers/debug-kunde-1/optimized';
const uploadedFilesToDelete = [];

// TODO: Auf verschieden Browsern testen -> Multiple download funktioniert nicht auf Chrome
// TODO: Felder in der JSON überarbeiten -> maxFileinKB, maxWidthInPX sind irreführend.

// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(cors());
app.use(express.static('../frontend'));

// TODO: Regeln, was passiert, wenn durch Abbruch des Uploads/ Downloads ein Fehler auftritt.

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const customer = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [req.params.userId]);
        if (customer.rows.length > 0) {
            const customerUploadsDir = `customers/${req.params.userId}/uploaded`;
            cb(null, customerUploadsDir);
        } else {
            cb(new Error("Dieser Kunde existiert nicht"));
        }
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const uniqueSuffix = `${timestamp}_${randomSuffix}`;
        console.log("Unique suffix: ", uniqueSuffix);
        cb(null, `${file.originalname}-${uniqueSuffix}`);
    }
});

const fileFilter = (req, file, cb) => {
    try {
        const acceptedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        console.log("Mime type: " + file.mimetype);
        if (acceptedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    } catch (err) {
        cb(err, false);
    }
};

// TODO: Dateien mit nicht validem oder fehlendem Dateityp sollen abgelehnt werden. -> DONE: Prüfung anhand des Mime-Types
// TODO: Dateien, die das Credit-Limit übersteigen, sollen abgelehnt werden. -> DONE: Passiert im Frontend
// TODO: Uploads, die das Storage-Limit übersteigen, sollen abgelehnt werden.
//  -> Prüfung nicht bei jedem Upload, sondern regelmäßige Checks und benachrichtigen des Content Managers, wenn ein bestimmter Wert unterschritten ist
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// TODO: Sollen einzelne und mehrere Dateien hochgeladen werden? Sollen diese unterschiedlich behandelt werden? Done: Nein.
// TODO: Der Ordner uploaded sollte nach der Optimierung geleert werden. -> Done.
// TODO: Fehlerbehandlung von Multer Errors in /uploaded
app.post('/:userId/upload', upload.array('images'), async (req, res, next) => {

    let fileNames;
    let userId;

    try {
        if (!req.files) {
            return res.status(400).send('No file uploaded.');
        }

        console.log(req.files);

        res.status(204).send('File uploaded successfully.');
        userId = req.params.userId;

        console.log('User ID:', userId);
        fileNames = req.files.map(file => file.filename);

        console.log('File names:', fileNames);

        // TODO: XMLs löschen.
        await processAllFiles(userId, fileNames)

        await deleteFiles(userId, fileNames);

        uploadedFilesToDelete.push({
            userId: userId,
            fileNames: fileNames
        });
        console.log("In uploadedFilesToDelete: " + uploadedFilesToDelete.entries().toArray());
    } catch (err) {
        console.log(err);
    }
});

async function deleteFiles(userId, fileNames) {
    try {
        for (const fileName of fileNames) {
            await fs.promises.unlink(`customers/${userId}/uploaded/${fileName}`);
            console.log(`customers/${userId}/uploaded/${fileName}`);
        }
    } catch (error) {
        console.error("Fehler beim Löschen der Dateien: ", error);
    }
}

app.get('/:userId/progress', async (req, res) => {

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    // TODO: Add error handling with callback
    res.write('');

    const userId = req.params.userId;

    let credits = undefined;
    try {
        const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        const credits = result.rows[0]?.credits; // Optional-Chaining, um null/undefined zu vermeiden
        console.log('Credits:', credits);
    } catch (error) {
        console.error('Error reading credits:', error);
        res.status(500).send('Error reading credits');
    }

    // TODO: Der Listener sollte mit einer Nutzer-ID verknüpft sein.
    const sendProgress = (status, fileName) => {
        const data = JSON.stringify({status, fileName, credits});
        res.write(`data: ${data}\n\n`);
    };

    optimizationEventEmitter.on('progress', sendProgress);

    const handleClosingConnection = async () => {
        console.log('Connection closed');
        optimizationEventEmitter.removeListener('progress', sendProgress);
    };

    req.on('close', handleClosingConnection);

});

app.get('/:userId/download/:imageName', (req, res, next) => {
    const contentDispositionType = req.query.cdtype ? 'inline' : 'attachment';

    // TODO: Mehrere Dateien könnten den gleichen Namen haben und sollten unterschieden werden.
    // TODO: Nutzer-ID einsetzen.
    const userId = req.params.userId;
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
    console.log(`Displaying credits for user:${userId}-`);
    try {
        const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        const credits = result.rows[0]?.credits; // Optional-Chaining, um null/undefined zu vermeiden
        res.json({credits});
    } catch (error) {
        console.error('Error reading credits:', error);
        res.status(500).send('Error reading credits');
    }
});

app.get('/load-customers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customer');
        res.json(result.rows);
    } catch (error) {
        console.error('Error reading from database:', error);
        res.status(500).send('Error reading from database');
    }
});

app.post('/create-customer', async (req, res) => {

});

app.delete('/customers/:id/delete', async (req, res) => {
    const {id} = req.params;  // Hole die Kunden-ID aus den URL-Parametern
    try {
        // Lösche den Kunden aus der Datenbank anhand der customer_id
        await pool.query('DELETE FROM customer WHERE customer_id = $1', [id]);
        res.status(200).send('Kunde erfolgreich gelöscht');
    } catch (error) {
        console.error('Fehler beim Löschen des Kunden:', error);
        res.status(500).send('Fehler beim Löschen des Kunden');
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

        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `${contentDispositionType}; filename="${imageName}"`);

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