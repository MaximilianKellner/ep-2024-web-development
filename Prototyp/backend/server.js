import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import handleApiError from "./handleApiError.js";
import adminRoutes from "./routes/admin/admin.js";
import customerRoutes from "./routes/customers/customers.js";
import dotenv from 'dotenv';
import {checkTokenExpired} from "./link-renewal/checkTokenExpired.js";
import deleteExpiredFiles from "./deleteExpiredFiles.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// TODO: Anpassen des Stils (z.B. Anführungszeichen)
// TODO: Auf verschieden Browsern testen -> Multiple download funktioniert nicht auf Chrome
// TODO: Definiere erlaubte Origins und weitere Spezifikationen, wenn der Service bereit für Auslieferung ist.
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/customers", express.static(path.join(__dirname, '../frontend')));
app.use('/customers', customerRoutes);
app.use("/", express.static(path.join(__dirname, '../frontend')));
app.use('/', adminRoutes);

//await checkTokenExpired();
await deleteExpiredFiles();

app.use(handleApiError);
app.listen(process.env.DEV_PORT, () =>
    console.log(`Server listening on port ${process.env.DEV_PORT}`),
);