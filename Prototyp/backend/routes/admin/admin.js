import express from 'express';
import cors from 'cors';
import multer from 'multer';
import {processAllFiles} from '../../sharp.js';
import optimizationEventEmitter from '../../optimizationEventEmitter.js';
import fs from 'fs';
import path from 'path';
import {pool} from '../../db.js';
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import apiErrorHandler from "../../apiErrorHandler.js";
import ApiError from '../../ApiError.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();




export default router;