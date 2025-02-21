import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import apiErrorHandler from "./apiErrorHandler.js";
import adminRoutes from "./routes/admin/admin.js";
import customerRoutes from "./routes/customers/customers.js";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// TODO: Ablaufender Kundenlink -> u.a. Kunde benachrichtigen mit neuem Kundenlink !!!
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

app.use("", apiErrorHandler);
app.listen(process.env.DEV_PORT, () =>
    console.log(`Server listening on port ${process.env.DEV_PORT}`),
);