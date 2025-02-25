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
import jwt from "jsonwebtoken";
import EmailNotificationManager from "../../EmailNotificationManager.js";
import NotificationMessageType from "./../../NotificationMessageType.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();



let refreshTokens = [];
// Temporäre Lösung aus Demozwecken. Normalerweise sollten Nutzername und Passwort in einer Datenbank gespeichert werden
const admins = [
    {username: "admin", password: "admin1"}
]

router.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken})
    })
})
//Hier stand post
router.delete('/logout', authenticateToken, async (req, res) => {
    await new Promise(resolve => {
    // Extrahieren des refreshTokens aus dem Body (siehe Anfrage) und entfernen des Tokens aus dem Array
        refreshTokens = refreshTokens.filter(refreshToken => refreshToken !== req.body.token);
        resolve()
    })
    res.sendStatus(204);
});

router.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    for(let i = 0; i < admins.length; i++){
        if(username === admins[i].username && password === admins[i].password){
            // Erstellen eines Nutzerobjekts, das in den Token eingebettet wird
            const user = {username: username, password: password}
            const accessToken = generateAccessToken(user)
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
            // Hinzufügen des refreshTokens zum Array, mit Verzögerung, um den Token zu speichern. Ohne Verzögerung wird der Token nicht schnell genug für das admin-panel gespeichert
            await new Promise(resolve => {
                refreshTokens.push(refreshToken)
                resolve()
            })
            res.json({accessToken: accessToken, refreshToken: refreshToken})
            return
        }
    }
    res.status(403).send("Benutzername oder Passwort nicht richtig")
})

function generateAccessToken(user) {
    //Session-Wert aus Demozwecken auf 10s gesetzt. Zu empfehlen ist höherer Wert :)
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'})
}

router.get('/verify-token', authenticateToken, (req, res) => {
    //Wenn die Überprüfung (authenticateToken) erfolgreich ist, wird ein Status 200 zurückgegeben und der Token ist gültig
    res.status(200).json({valid: true});
});

// Serve Create customer page
router.get('/create-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/handle-customer.html'));
});

//serve Update Customer page
router.get('/update-customer', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../frontend/handle-customer.html'));
});

router.get('/load-customers', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT customer_name, customer_id, expiration_date, credits, email, img_url, link_token  FROM customer');

        if (result.rows.length > 0) {
            const customers = result.rows.map(customer => ({
                customerName: customer.customer_name,
                customerId: customer.customer_id,
                expirationDate: customer.expiration_date,
                credits: customer.credits,
                email: customer.email,
                imgUrl: customer.img_url,
                linkToken: customer.link_token
            }));
            res.json({customers});
        }
    } catch (error) {
        next(error);
    }
});

router.post('/create-customer', async (req, res, next) => {
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
        const customerName = req.body.customerName
        const email = req.body.email
        const newAccessLink = `${process.env.URI}/customers/${linkToken}`

        EmailNotificationManager.sendMail(NotificationMessageType.NEW_ACCESS_LINK, customerName, email, newAccessLink, req.body.expirationDate);

        const customerUploadsDir = `customers/${linkToken}/uploaded`;
        const customerOptimizedDir = `customers/${linkToken}/optimized`;

        await fs.promises.mkdir(customerUploadsDir, {recursive: true});
        await fs.promises.mkdir(customerOptimizedDir, {recursive: true});
        res.status(201).send("Customer created")
    } catch (error) {
        next(error);
    }
});

router.get('/get-customer', async (req, res) => {
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
                maxWidthInPX: result.rows[0].max_file_width_px,
                linkToken: result.rows[0].link_token
            };

            res.json(customer);
        }
    } catch (error) {
        throw ApiError.internal('Fehler beim Laden des Kunden');
    }
});

router.put('/update-customer', async (req, res) => {
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
        throw ApiError.internal("Fehler beim Aktualisieren des Kunden");
    }
});

router.delete('/customers/:customerId/delete', async (req, res, next) => {
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

export default router;