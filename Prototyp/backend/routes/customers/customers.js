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
import ActionType from "../../ActionType.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const customer = await pool.query('SELECT * FROM active_customer WHERE link_token = $1', [req.params.linkToken]);
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
            cb(null, `${file.originalname}-${uniqueSuffix}`);
        } catch (error) {
            cb(ApiError.internal());
        }
    }
});

const fileFilter = (req, file, cb) => {
    try {
        const acceptedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
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


router.get("/:linkToken/renewal-link", async (req, res, next) => {

    try {
        const {linkToken} = req.params;

        const result = await pool.query('SELECT link_token FROM active_customer WHERE link_token = $1', [linkToken]);
        if (result.rows.length > 0) {
            // Weiterleitung zur eigentlichen Zielseite
            res.redirect(`${process.env.URI}/customers/${linkToken}`);
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:linkToken', async (req, res, next) => {
    try {
        const {linkToken} = req.params;
        const {action} = req.query;

        const result = await pool.query('SELECT link_token FROM active_customer WHERE link_token = $1', [linkToken]);

        if (result.rows.length > 0) {
            switch (action) {
                case ActionType.RENEWAL: {
                    await pool.query(
                        `UPDATE active_customer
                         SET expiration_date = expiration_date + INTERVAL '30 days'
                         WHERE link_token = $1 
                        AND expiration_date > NOW() 
                        AND expiration_date <= NOW() + INTERVAL '3 days'
                             RETURNING *`, // Gibt alle Felder der betroffenen Zeile zurück
                        [linkToken]
                    );
                    res.redirect(`${process.env.URI}/customers/${linkToken}?action=${ActionType.REDIRECT}`);
                }
                    break;
                default:
                    res.sendFile(path.join(__dirname, '../../../frontend/index.html'));
                    break;
            }
        } else {
            res.status(404).send("Ungültiger Token");
        }
    } catch (error) {
        next(error);
    }
});

router.post('/:linkToken/upload', upload.array('images'), async (req, res, next) => {

    let fileNames;
    let linkToken;

    try {
        if (!req.files) {
            next(ApiError.badRequest("No files sent"));
        }

        linkToken = req.params.linkToken;

        fileNames = req.files.map(file => file.filename);

        // TODO: XMLs löschen.
        // TODO: Error handling inside Functions with new Error handling class (after server.js is done), also test for async Errors!
        await processAllFiles(linkToken, fileNames)
        await deleteFiles(linkToken, fileNames);

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
        res.write('');

        const linkToken = req.params.linkToken;

        // TODO: Der Listener sollte mit einer Nutzer-ID verknüpft sein.
        const sendProgress = (status, fileName, credits) => {
            const data = JSON.stringify({status, fileName, credits});
            res.write(`data: ${data}\n\n`);
        };

        optimizationEventEmitter.on('progress', sendProgress);

        const handleClosingConnection = async () => {
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
    try {
        const result = await pool.query('SELECT credits FROM active_customer WHERE link_token = $1', [linkToken]);
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