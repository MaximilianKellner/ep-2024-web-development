import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {processAllFiles} from '../../sharp.js';
import optimizationEventEmitter from '../../OptimizationEventEmitter.js';
import fs from 'fs';
import path from 'path';
import {pool} from '../../db.js';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import handleApiError from "../../handleApiError.js";
import ApiError from '../../ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// TODO: Regeln, was passiert, wenn durch Abbruch des Uploads/ Downloads ein Fehler auftritt.
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const customer = await pool.query('SELECT * FROM customer WHERE link_token = $1', [req.params.linkToken]);
            if (customer.rows.length > 0) {
                const customerUploadsDir = `customers/${req.params.linkToken}/uploaded`;
                cb(null, customerUploadsDir);
            } else {
                // Sicherheitsrelevante Entscheidung -> Client sollte nicht wissen, wie die DB-Einträge aussehen
                cb(ApiError.internal());
            }
        } catch (error) {
            cb(error)
        }
    },
    filename: function (req, file, cb) {
        try {
            const timestamp = Date.now();
            const randomSuffix = Math.round(Math.random() * 1E9);
            const uniqueSuffix = `${timestamp}_${randomSuffix}`;
            console.log("Unique suffix: ", uniqueSuffix);
            cb(null, `${file.originalname}-${uniqueSuffix}`);
        } catch (error) {
            cb(ApiError.internal());
        }
    }
});

const fileFilter = (req, file, cb) => {
    try {
        const acceptedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
        console.log("Mime type: " + file.mimetype);
        if (acceptedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(ApiError.badRequest("File type not accepted"), false);   // In diesem Falle werden alle Dateien abgelehnt
        }
    } catch (error) {
        cb(ApiError.internal(), false);
    }
};
// TODO: Uploads, die das Storage-Limit übersteigen, sollen abgelehnt werden.

//  -> Prüfung nicht bei jedem Upload, sondern regelmäßige Checks und benachrichtigen des Content Managers, wenn ein bestimmter Wert unterschritten ist
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


router.get('/:linkToken', async (req, res, next) => {
    try {
        const { linkToken } = req.params;

        const result = await pool.query('SELECT link_token FROM customer WHERE link_token = $1', [linkToken]);

        if (result.rows.length > 0) {
            console.log('Link token:', linkToken);

            // Sende die HTML-Seite (danach lädt der Client die statischen Dateien selbst)
            res.sendFile(path.join(__dirname, '../../../frontend/index.html'));
        } else {
            res.status(404).send("Ungültiger Token");
        }
    } catch (error) {
        next(error);
    }
});

// TODO: Fehlerbehandlung von Multer Errors in /uploaded
router.post('/:linkToken/upload', upload.array('images'), async (req, res, next) => {

    let fileNames;
    let linkToken;

    try {
        if (!req.files) {
            next(ApiError.badRequest("No files sent"));
        }

        console.log(req.files);

        linkToken = req.params.linkToken;
        console.log('Link token:', linkToken);

        fileNames = req.files.map(file => file.filename);

        console.log('File names:', fileNames);

        // TODO: XMLs löschen.
        // TODO: Error handling inside Functions with new Error handling class (after server.js is done), also test for async Errors!
        await processAllFiles(linkToken, fileNames)
        await deleteFiles(linkToken, fileNames);

        // console.log("In uploadedFilesToDelete: " + uploadedFilesToDelete.entries().toArray());
        res.status(204).send('File uploaded successfully.');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

async function deleteFiles(linkToken, fileNames) {

    try {
        for (const fileName of fileNames) {
            await fs.promises.unlink(`customers/${linkToken}/uploaded/${fileName}`);
            console.log(`customers/${linkToken}/uploaded/${fileName}`);
        }
    } catch (error) {
        throw error;
    }
}

router.get('/:linkToken/progress', async (req, res, next) => {

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        // TODO: Add error handling with callback
        res.write('');

        const linkToken = req.params.linkToken;

        // TODO: Der Listener sollte mit einer Nutzer-ID verknüpft sein.
        const sendProgress = (status, fileName, credits) => {
            const data = JSON.stringify({status, fileName, credits});
            console.log("Send progress data: " + data);
            res.write(`data: ${data}\n\n`);
        };

        optimizationEventEmitter.on('progress', sendProgress);

        const handleClosingConnection = async () => {
            console.log('Connection closed');
            optimizationEventEmitter.removeListener('progress', sendProgress);
        };

        req.on('close', handleClosingConnection);

    } catch (error) {
        next(error);
    }
});

router.get('/:linkToken/download/:imageName', async (req, res, next) => {

    try {
        const contentDispositionType = req.query.cdtype ? 'inline' : 'attachment';

        // TODO: Mehrere Dateien könnten den gleichen Namen haben und sollten unterschieden werden.
        const linkToken = req.params.linkToken;
        const imageName = req.params.imageName;

        await handleImageRequest(imageName, linkToken, res, contentDispositionType);
    } catch (error) {
        next(error);
    }
});

router.get('/:linkToken/optimized-images', async (req, res, next) => {
    const linkToken = req.params.linkToken;

    try {
        // TODO: Update datatypes -> Create separate util file to manage allowed datatypes/ mime-types
        // TODO: Update optimized path -> user specific
        const files = (await fs.promises.readdir(`customers/${linkToken}/optimized`)).filter(file =>
            /\.(jpg|jpeg|png)/i.test(file)
        );
        if (files.length > 0) {
            res.json(files);
        } else {
            res.status(200).send("No images found");
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:linkToken/credits', async (req, res, next) => {
    const linkToken = req.params.linkToken;
    console.log(`Displaying credits for user:${linkToken}-`);
    try {
        const result = await pool.query('SELECT credits FROM customer WHERE link_token = $1', [linkToken]);
        if (result.rows.length > 0) {
            const credits = result.rows[0]?.credits; // Optional-Chaining, um null/undefined zu vermeiden
            res.json({credits});
        } else {
            throw ApiError.internal();
        }
    } catch (error) {
        next(error)
    }
});

async function findImage(imageName, linkToken) {

    try {
        const files = await fs.promises.readdir(`customers/${linkToken}/optimized`);
        const image = files.find(file => file.includes(imageName));
        if (!image) {
            throw ApiError.badRequest();
        }
        return image;
    } catch (error) {
        throw error;
    }
}

// TODO: Suffix sollte wieder entfernt werden.
async function sendImage(imageName, linkToken, res, contentDispositionType) {
    try {
        const filePath = `customers/${linkToken}/optimized/${imageName}`;
        const fileStream = fs.createReadStream(filePath);

        fs.stat(filePath, (error, stats) => {
            if (error) {
                throw ApiError.internal("Fehler beim Lesen aus dem Dateisystem")
            }

            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `${contentDispositionType}; filename="${imageName}"`);

            fileStream.pipe(res);
        });

        fileStream.on('error', error => {
            console.log(error);
            throw ApiError.internal("Fehler beim Übertragen der Datei")
        });
    } catch (error) {
        throw error;
    }
}

async function handleImageRequest(imageName, linkToken, res, contentDispositionType) {

    try {
        const image = await findImage(imageName, linkToken);
        await sendImage(image, linkToken, res, contentDispositionType);
    } catch (error) {
        throw error;
    }
}

export default router;