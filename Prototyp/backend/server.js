'use strict';

// TODO: Was soll getCustomerData() machen, wenn das codeword name ist??
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {processAllFiles} from './sharp.js';
import optimizationEventEmitter from './optimizationEventEmitter.js';
import fs from 'fs';
import {pool} from './db.js';
import apiErrorHandler from "./apiErrorHandler.js";
import ApiError from './ApiError.js';

const app = express();
const PORT = 5000;

const OPTIMIZED_DIR = './customers/debug-kunde-1/optimized';
const uploadedFilesToDelete = [];
// TODO: Ablaufender Kundenlink -> u.a. Kunde benachrichtigen mit neuem Kundenlink !!!

// TODO: Auf verschieden Browsern testen -> Multiple download funktioniert nicht auf Chrome
// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(express.json());
app.use(cors());
app.use(express.static('../frontend'));
app.use(express.urlencoded({extended: false}));
// TODO: Regeln, was passiert, wenn durch Abbruch des Uploads/ Downloads ein Fehler auftritt.
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const customer = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [req.params.userId]);
            if (customer.rows.length > 0) {
                const customerUploadsDir = `customers/${req.params.userId}/uploaded`;
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

// TODO: Fehlerbehandlung von Multer Errors in /uploaded
app.post('/:userId/upload', upload.array('images'), async (req, res, next) => {

    let fileNames;
    let userId;

    try {
        if (!req.files) {
            next(ApiError.badRequest("No files sent"));
        }

        console.log(req.files);

        userId = req.params.userId;
        console.log('User ID:', userId);

        fileNames = req.files.map(file => file.filename);
        console.log('File names:', fileNames);

        // TODO: XMLs löschen.
        // TODO: Error handling inside Functions with new Error handling class (after server.js is done), also test for async Errors!
        await processAllFiles(userId, fileNames)
        await deleteFiles(userId, fileNames);

        // TODO: Remove, not needed!!!
        uploadedFilesToDelete.push({
            userId: userId,
            fileNames: fileNames
        });

        console.log("In uploadedFilesToDelete: " + uploadedFilesToDelete.entries().toArray());
        res.status(204).send('File uploaded successfully.');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

async function deleteFiles(userId, fileNames) {

    try {
        for (const fileName of fileNames) {
            await fs.promises.unlink(`customers/${userId}/uploaded/${fileName}`);
            console.log(`customers/${userId}/uploaded/${fileName}`);
        }
    } catch (error) {
        throw error;
    }
}

app.get('/:userId/progress', async (req, res, next) => {

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        // TODO: Add error handling with callback
        res.write('');

        const userId = req.params.userId;

        const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        if (result.rows.length > 0) {
            const credits = result.rows[0]?.credits;
            console.log('Credits:', credits);

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
        }
    } catch (error) {
        next(error);
    }
});

app.get('/:userId/download/:imageName', (req, res, next) => {

    try {
        const contentDispositionType = req.query.cdtype ? 'inline' : 'attachment';

        // TODO: Mehrere Dateien könnten den gleichen Namen haben und sollten unterschieden werden.
        // TODO: Nutzer-ID einsetzen.
        const userId = req.params.userId;
        const imageName = req.params.imageName;

        handleImageRequest(imageName, res, contentDispositionType);
    } catch (error) {
        next(error);
    }
});

app.get('/:userId/optimized-images', async (req, res, next) => {
    const userId = req.params.userId;

    try {
        // TODO: Update datatypes -> Create separate util file to manage allowed datatypes/ mime-types
        // TODO: Update optimized path -> user specific
        const files = (await fs.promises.readdir(OPTIMIZED_DIR)).filter(file =>
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

app.get('/:userId/credits', async (req, res, next) => {
    const userId = req.params.userId;
    console.log(`Displaying credits for user:${userId}-`);
    try {
        const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        if (result.rows.length > 0) {
            const credits = result.rows[0]?.credits; // Optional-Chaining, um null/undefined zu vermeiden
            res.json({credits});
        } else {
            throw new ApiError.internal();
        }
    } catch (error) {
        next(error)
    }
});

// TODO: Endpoint should be secured -> Auth
app.get('/load-customers', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM customer');
        if (result.rows.length > 0) {
            res.json(result.rows);
        }
    } catch (error) {
        next(error);
    }
});

app.post('/create-customer', async (req, res, next) => {
    // TODO: Bezeichnungen sollten im Front- und Backend vereinheitlicht werden!!!
    try {
        const result = await pool.query(
            `INSERT INTO customer (customer_name, email, expiration_date, credits, img_url, max_file_size_kb,
                                   max_file_width_px)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING customer_id`,
            [
                req.body.customerName,
                req.body.customerEmail,
                req.body.expirationDate,
                req.body.credits,
                req.body.pictureUrl,
                req.body.maxFileInKB,
                req.body.maxWidthInPX
            ]
        );

        const customerId = result.rows[0].customer_id;
        console.log("Customer id: " + customerId);

        const customerUploadsDir = `customers/${customerId}/uploaded`;
        const customerOptimizedDir = `customers/${customerId}/optimized`;

        await fs.promises.mkdir(customerUploadsDir, {recursive: true});
        await fs.promises.mkdir(customerOptimizedDir, {recursive: true});
    } catch (error) {
        next(error);
    }
});

app.delete('/customers/:id/delete', async (req, res, next) => {
    try {
        const {id} = req.params;
        const result = await pool.query('DELETE FROM customer WHERE customer_id = $1', [id]);
        if (result.rowCount > 0) {
            res.status(200).send('Kunde erfolgreich gelöscht');
        } else {
            throw ApiError.internal();
        }
    } catch (error) {
        next(error);
    }
});

async function findImage(imageName) {

    try {
        const files = await fs.promises.readdir(OPTIMIZED_DIR);
        const image = files.find(file => file.includes(imageName));
        return image;
    } catch (error) {
        return null;
    }
}

// TODO: Suffix sollte wieder entfernt werden.

async function sendImage(imageName, res, contentDispositionType) {
    try {
        const filePath = `${OPTIMIZED_DIR}/${imageName}`;
        const fileStream = fs.createReadStream(filePath);

        fs.stat(filePath, (error, stats) => {
            if (error) {
                throw ApiError.internal();
            }

            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `${contentDispositionType}; filename="${imageName}"`);

            fileStream.pipe(res);
        });

        fileStream.on('error', error => {
            console.log(error);
            throw ApiError.internal();
        });
    } catch (error) {
        throw error;
    }
}

async function handleImageRequest(imageName, res, contentDispositionType) {
    // TODO: Should error be handled here or propagated
    try {
        let image = await findImage(imageName);
        console.log("Gefunden Bild: ", image);
        if (image) {
            await sendImage(image, res, contentDispositionType);
        } else {
            throw ApiError.internal();
        }
    } catch (error) {
        throw error;
    }
}

// JWT Code


dotenv.config();
// require('dotenv').config()
// const jwt = require('jsonwebtoken');

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

app.use(express.json());

//Sollten am besten in einer Datenbank gespeichert werden.

const posts = [
    {username: 'Kyle', title: 'Post 1'},
    {username: 'Jim', title: 'Post 2'}
]
app.get('/posts', authenticateToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})

app.post('/login', (req, res) => {
    //Authenticate User
    const username = req.body.username
    const user = {name: username}

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({accessToken: accessToken})
})

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })

}

app.use(apiErrorHandler);
app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`),
);
