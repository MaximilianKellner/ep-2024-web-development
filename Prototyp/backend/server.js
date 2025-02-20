// TODO: Was soll getCustomerData() machen, wenn das codeword name ist??
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {processAllFiles} from './sharp.js';
import optimizationEventEmitter from './optimizationEventEmitter.js';
import fs from 'fs';
import path from 'path';
import {pool} from './db.js';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import apiErrorHandler from "./apiErrorHandler.js";
import ApiError from './ApiError.js';
import {checkTokenExpired} from "./tokenExpiration.js";
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const uploadedFilesToDelete = [];
// TODO: Ablaufender Kundenlink -> u.a. Kunde benachrichtigen mit neuem Kundenlink !!!

// TODO: Auf verschieden Browsern testen -> Multiple download funktioniert nicht auf Chrome
// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

let refreshTokens = [];
// Temporäre Lösung aus Demozwecken. Normalerweise sollten Nutzername und Passwort in einer Datenbank gespeichert werden
const admins = [
    {username: "admin", password: "admin1"}
]

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})

app.delete('/logout', authenticateToken, (req, res) => {
    // Extrahieren des refreshTokens aus dem Body (siehe Anfrage)und entfernen des Tokens aus dem Array
    refreshTokens = refreshTokens.filter(refreshToken => refreshToken !== req.body.token);
    res.sendStatus(204);
});

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    for(let i = 0; i < admins.length; i++){
        if(username === admins[i].username && password === admins[i].password){
            // Erstellen eines Nutzerobjekts, das in den Token eingebettet wird
            const user = {username: username, password: password}
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken)
            res.json({accessToken: accessToken, refreshToken: refreshToken})
            return
        }
    }
    res.status(403).send("Username or password incorrect")
})

function generateAccessToken(user) {
    //Session-Wert aus Demozwecken auf 10s gesetzt. Zu empfehlen ist höherer Wert :)
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})
}

app.get('/verify-token', authenticateToken, (req, res) => {
    //Wenn die Überprüfung (authenticateToken) erfolgreich ist, wird ein Status 200 zurückgegeben und der Token ist gültig
    res.status(200).json({valid: true});
});

app.get('/:linkToken', async (req, res, next) => {
    try {
        const { linkToken } = req.params;

        const result = await pool.query('SELECT link_token FROM customer WHERE link_token = $1', [linkToken]);

        if (result.rows.length > 0) {
            console.log('Link token:', linkToken);

            // Sende die HTML-Seite (danach lädt der Client die statischen Dateien selbst)
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        } else {
            res.status(404).send("Ungültiger Token");
        }
    } catch (error) {
        next(error);
    }
});

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

// TODO: Serve all Web Pages

//serve Admin Panel
app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin-panel.html'));
});

// Serve Create customer page
app.get('/create-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/handle-customer.html'));
});

//serve Update Customer page
app.get('/update-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/handle-customer.html'));
});

// TODO: Fehlerbehandlung von Multer Errors in /uploaded
app.post('/:linkToken/upload', upload.array('images'), async (req, res, next) => {
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

        // TODO: Remove, not needed!!!
        uploadedFilesToDelete.push({
            linkToken: linkToken,
            fileNames: fileNames
        });

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

app.get('/:linkToken/progress', async (req, res, next) => {

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

app.get('/:linkToken/download/:imageName', async (req, res, next) => {

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

app.get('/:linkToken/optimized-images', async (req, res, next) => {
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

app.get('/:linkToken/credits', async (req, res, next) => {
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

app.get('/load-customers', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT customer_name, customer_id, expiration_date, credits, email, img_url  FROM customer');

        if (result.rows.length > 0) {
            const customers = result.rows.map(customer => ({
                customerName: customer.customer_name,
                customerId: customer.customer_id,
                expirationDate: customer.expiration_date,
                credits: customer.credits,
                email: customer.email,
                imgUrl: customer.img_url
            }));
            res.json({customers});
        }
    } catch (error) {
        next(error);
    }
});

app.post('/create-customer', async (req, res, next) => {
    try {
        const result = await pool.query(
            `INSERT INTO customer (customer_name, email, expiration_date, credits, img_url, max_file_size_kb,
                                   max_file_width_px)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING link_token`,
            [
                req.body.customerName,
                req.body.email,
                req.body.expirationDate,
                req.body.credits,
                req.body.imgUrl,
                req.body.maxFileInKB,
                req.body.maxWidthInPX
            ]
        );

        const linkToken = result.rows[0].link_token;
        console.log("Customer id: " + linkToken);

        const customerUploadsDir = `customers/${linkToken}/uploaded`;
        const customerOptimizedDir = `customers/${linkToken}/optimized`;

        await fs.promises.mkdir(customerUploadsDir, {recursive: true});
        await fs.promises.mkdir(customerOptimizedDir, {recursive: true});
        res.status(201).send("Customer created")
    } catch (error) {
        next(error);
    }
});

app.get('/get-customer', async (req, res) => {
    const {id} = req.query;

    // Überprüfen ob die ID vorhanden und eine Zahl ist
    if (!id || isNaN(id)) {
        return res.status(400).json({error: "Ungültige Kunden-ID"});
    }

    try {
        const result = await pool.query('SELECT * FROM customer WHERE customer_id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({error: `Kunde ${id} nicht gefunden`});
        }

        if (result.rows.length === 1) {

            const customer = {
                customerName: result.rows[0].customer_name,
                customerId: result.rows[0].customer_id,
                expirationDate: result.rows[0].expiration_date,
                credits: result.rows[0].credits,
                email: result.rows[0].email,
                imgUrl: result.rows[0].img_url,
                maxFileInKB: result.rows[0].max_file_size_kb,
                maxWidthInPX: result.rows[0].max_file_width_px
            };

            res.json(customer);
        }
    } catch (error) {
        console.error('Fehler beim Laden des Kunden:', error);
        res.status(500).json({error: 'Interner Serverfehler'});
    }
});

app.put('/update-customer', async (req, res) => {
    const id = req.body.customerId;

    // Überprüfen ob die ID vorhanden und eine Zahl ist
    if (!id || isNaN(id)) {
        return res.status(400).json({error: "Ungültige Kunden-ID"});
    }

    try {
        const result = await pool.query(
            `UPDATE customer
             SET customer_name = $1,
                 email = $2,
                 expiration_date = $3,
                 credits = $4,
                 img_url = $5,
                 max_file_size_kb = $6,
                 max_file_width_px = $7
             WHERE customer_id = $8 RETURNING customer_id`,
            [
                req.body.customerName,
                req.body.email,
                req.body.expirationDate,
                req.body.credits,
                req.body.imgUrl,
                req.body.maxFileInKB,
                req.body.maxWidthInPX,
                req.body.customerId // Hier wird die Kunden-ID hinzugefügt, um den richtigen Datensatz zu aktualisieren
            ]
        );
        res.status(200).send('Kunde erfolgreich aktualisiert');
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Kunden:', error);
        res.status(500).send('Fehler beim Aktualisieren des Kunden');
    }
});

app.delete('/customers/:id/delete', async (req, res, next) => {
    try {
        const {customerId} = req.params;
        const result = await pool.query('DELETE FROM customer WHERE customer_id = $1', [customerId]);
        if (result.rowCount > 0) {
            res.status(200).send('Kunde erfolgreich gelöscht');
        } else {
            throw ApiError.internal();
        }
    } catch (error) {
        next(error);
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
app.listen(process.env.DEV_PORT, () =>
    console.log(`Server listening on port ${process.env.DEV_PORT}`),
);