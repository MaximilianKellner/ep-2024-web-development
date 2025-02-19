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
app.use(express.json());
app.use(cors());
app.use(express.static('../frontend'));
app.use(express.urlencoded({extended: false}));

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
    } catch (error) {
        cb(error, false);
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
    } catch (error) {
        console.log(error);
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

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        // TODO: Add error handling with callback
        res.write('');

        const userId = req.params.userId;

        const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        const credits = result.rows[0]?.credits; // Optional-Chaining, um null/undefined zu vermeiden
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

    } catch (error) {
        console.error('Error reading credits:', error);
        res.status(500).send('Error reading credits');
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

    }
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
        // const result = await pool.query('SELECT credits FROM customer WHERE customer_id = $1', [userId]);
        const credits = 1; // Optional-Chaining, um null/undefined zu vermeiden
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
        console.log(error);
    }
});


app.post('/createCustomer', async (req, res) => {
    const { customer_name, email, expiration_date, credits, img_url, max_file_size_kb, max_file_width_px } = req.body;
    try {
        await pool.query('INSERT INTO customer (customer_name, email, expiration_date, credits, img_url, max_file_size_kb, max_file_width_px) VALUES ($1, $2, $3, $4, $5, $6, $7)', [customer_name, email, expiration_date, credits, img_url, max_file_size_kb, max_file_width_px]);
        res.status(201).send('Kunde erfolgreich erstellt');
    } catch (error) {
        console.error('Fehler beim Erstellen des Kunden:', error);
        res.status(500).send('Fehler beim Erstellen des Kunden');
    }
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
    } catch (error) {
        console.error(error);
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
                res.status(404).send('File not found');
                return;
            }

            res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');  //Very important!
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', `${contentDispositionType}; filename="${imageName}"`);

            fileStream.pipe(res);
        });

        fileStream.on('error', error => {
            console.log(error);
            res.status(500).send('Error downloading file');
        });
    } catch (error) {
        console.log(error);
    }
}

async function handleImageRequest(imageName, res, contentDispositionType) {

    try {
        let image = await findImage(imageName);
        console.log("Gefunden Bild: ", image);
        if (image) {
            await sendImage(image, res, contentDispositionType);
        } else {
            res.status(404).send('Image not found');
        }
    } catch (error) {
        console.log(error);
    }
}












// JWT Code
dotenv.config();
// require('dotenv').config()

// const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
// import { title } from 'process';

app.use(express.json());

//Sollten am besten in einer Datenbank gespeichert werden.
const customers = [
    {username: 'Edgar', title: 1000},
    {username: 'Antonio', title: 2000}
]

app.get('/customers', authenticateToken, (req, res) =>{
    // Hier werden customers angezeigt, die alle Admins angelegt haben. Wenn nur bestimmte angezeigt werden sollenn, dann filtern.
    console.log(res.json(customers))

})

// app.post('/login', (req, res) =>{
//     //Authenticate User
//     const username = req.body.username
//     const user = {name: username}

//     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
//     res.json({accessToken: accessToken})
// })

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null){
        return res.sendStatus(401)
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) =>{
        if(err){
            return res.sendStatus(403)
        }
        req.user = user
        next()
    })
}

app.get('/verify-token', authenticateToken, (req, res) => {
    // If we get here, the token is valid (authenticateToken middleware passed)
    res.status(200).json({ valid: true });
});


//Authentifizierung

// import dotenv from 'dotenv';
// import express from 'express';
// import jwt from 'jsonwebtoken';
// import cors from 'cors';  // Füge cors import hinzu

let refreshTokens = [];

// Aktiviere CORS
app.use(cors());
app.use(express.json());

app.post('/token', (req, res) =>{
    const refreshToken = req.body.token
    if(refreshToken == null) return res.sendStatus(401)
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) =>{
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})

// app.delete('/logout', (req, res) =>{
//     refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//     res.sendStatus(204)
// })

app.delete('/logout', authenticateToken, (req, res) => {
    const token = req.headers['authorization'].split(' ')[1];
    refreshTokens = refreshTokens.filter(refreshToken => refreshToken !== req.body.token);
    // Invalidate the access token by adding it to a blacklist or similar mechanism
    // For simplicity, we are just sending a response here
    res.sendStatus(204);
});

app.post('/login', (req, res) =>{
    //Authenticate User
    const username = req.body.username
    const user = {name: username}
    console.log('-------------------------'+user)

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

function generateAccessToken(user){
    //Session-Wert in auf 10s gesetzt. Zu empfehlenist höherer Wert :)
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})
}











app.listen(PORT, () =>
    console.log(`Server listening on port ${PORT}`)
);