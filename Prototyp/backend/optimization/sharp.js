import fs from 'fs';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import path from 'path';
import sharp from 'sharp';
import optimizationEventEmitter from './../events/OptimizationEventEmitter.js';
import OptimizationEventStatus from './../events/OptimizationEventStatus.js';
import {pool} from '../persistence/db.js';
import ApiError from "../errors/ApiError.js";

sharp.cache(false);


async function getCustomerData(linkToken, optimizationParameter = 'max_file_size_kb') {

    try {
        const data = await pool.query(`SELECT ${[optimizationParameter]}
                                       FROM active_customer
                                       WHERE link_token = $1`, [linkToken]);
        return data.rows[0]?.[optimizationParameter];
    } catch (error) {
        throw error;
    }
}


async function processAllFiles(linkToken, fileNames) {

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const uploadDir = path.join(__dirname, '..', 'customers', linkToken, 'uploaded');
        const optimizedDir = path.join(__dirname, '..', 'customers', linkToken, 'optimized');

        console.log("uploadDir: " + uploadDir);
        console.log("optimizedDir: " + optimizedDir);

        // Ensure optimized directory exists
        if (!fs.existsSync(optimizedDir)) {
            fs.mkdirSync(optimizedDir, {recursive: true});
        }
        //const files = fs.readdirSync(uploadDir);

        for (const file of fileNames) {
            const inputPath = path.join(uploadDir, file);
            const outputPath = path.join(optimizedDir, file);

            try {
                const done = await compressToSize(inputPath, outputPath, file, linkToken);
                if (done) {
                    const result = await pool.query('UPDATE customer SET credits = credits - 1 WHERE link_token = $1 RETURNING credits', [linkToken]);
                    const remainingCredits = result.rows[0]?.credits;
                    optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, file, remainingCredits);
                }
            } catch (error) {
                optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error);
                throw ApiError.internal("Something went wrong when optimizing image");
            }
        }
    } catch (error) {
        optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error)
        throw error;
    } finally {
        optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Close);
    }
}

async function compressToSize(inputPath, outputPath, fileName, userId) {
    try {
        const maxSizeInKB = await getCustomerData(userId);
        if (!maxSizeInKB) {
            throw new Error('Max file size not found');
        }

        let quality = 100;
        const currentSizeKB = fs.statSync(inputPath).size / 1024;

        console.log(`Original size: ${currentSizeKB.toFixed(2)} KB (Target: ${maxSizeInKB} KB)`);

        // SVG Verarbeitung
        if (inputPath.includes('.svg')) {
            console.log('SVG erkannt');
            const tempPngPath = outputPath.replace('.svg', '_temp.png');
            await xmlToPng(inputPath, tempPngPath);
            inputPath = tempPngPath;
        }

        if (currentSizeKB <= maxSizeInKB) {
            fs.copyFileSync(inputPath, outputPath);
            console.log(`Datei bereits unter der maximalen Größe: ${currentSizeKB.toFixed(2)} KB`);
            return outputPath;
        }

        // Initialisierung der Bildverarbeitung
        const metadata = await sharp(inputPath).metadata();
        let width = metadata.width;
        let height = metadata.height;
        let resizeFactor = 1;

        // Äußere Schleife für Größenreduktion
        while (resizeFactor >= 0.1) { // Nicht kleiner als 10% der Originalgröße
            console.log(`\nTesting with resize factor: ${resizeFactor.toFixed(2)}`);

            const newWidth = Math.floor(width * resizeFactor);
            const newHeight = Math.floor(height * resizeFactor);

            // Sharp-Instanz für aktuelle Größe
            const image = sharp(inputPath)
                .rotate()
                .resize(newWidth, newHeight);

            // Binäre Suche für Qualität
            let minQuality = 1;
            let maxQuality = 100;
            const maxIterations = 40;
            let iterations = 0;

            while (minQuality <= maxQuality && iterations < maxIterations) {
                iterations++;
                quality = Math.floor((minQuality + maxQuality) / 2);

                try {
                    const buffer = await image
                        .png({quality: quality})
                        .toBuffer();

                    const currentSizeKB = buffer.length / 1024;
                    console.log(`Iteration ${iterations}: Size: ${currentSizeKB.toFixed(2)} KB, Quality: ${quality}, Dimensions: ${newWidth}x${newHeight}`);

                    optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Active, fileName);

                    // Wenn die Größe unter dem Maximum ist, nehmen wir dieses Ergebnis sofort
                    if (currentSizeKB <= maxSizeInKB) {
                        // Speichere das Ergebnis
                        await fs.promises.writeFile(outputPath, buffer);
                        console.log(`
                            Komprimierung erfolgreich!
                            - Finale Größe: ${currentSizeKB.toFixed(2)} KB
                            - Qualität: ${quality}/100
                            - Dimensionen: ${newWidth}x${newHeight}
                            - Original Dimensionen: ${width}x${height}
                        `);
                        return outputPath;
                    }

                    // Wenn die Größe noch zu groß ist, reduziere die Qualität
                    maxQuality = quality - 1;

                } catch (error) {
                    console.error(`Error during compression attempt at quality ${quality}:`, error);
                    maxQuality = quality - 1;
                }
            }

            // Reduziere die Bildgröße um 20% für den nächsten Durchlauf
            resizeFactor *= 0.8;
        }

        // Wenn wir hier ankommen, haben wir keine passende Größe gefunden
        optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error, fileName);
        throw new Error(`Konnte nicht zur gewünschten Größe komprimiert werden`);

    } catch (error) {
        throw error;
    }
}

async function xmlToPng(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .png()
            .toFile(outputPath)
    } catch (error) {
        throw error
    }
}

export {getCustomerData, compressToSize, processAllFiles};