import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import sharp from 'sharp';
import optimizationEventEmitter from './OptimizationEventEmitter.js';
import OptimizationEventStatus from './OptimizationEventStatus.js';
import { pool } from './db.js';
// TODO: Should be inside try-catch

const CONVERT = 1024

sharp.cache(false);


async function getCustomerData(linkToken, optimizationParameter = 'max_file_size_kb') {

    try {
        const data = await pool.query(`SELECT ${[optimizationParameter]} FROM active_customer WHERE link_token = $1`, [linkToken]);
        console.log('Customer Data: ', data.rows[0]?.[optimizationParameter]);
        return data.rows[0]?.[optimizationParameter];
    } catch (error) {
        throw error;
    }
}


// TODO: Originale der bereits optimierten Dateien entfernen.
async function processAllFiles(linkToken, fileNames) {

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const uploadDir = path.join(__dirname, 'customers', linkToken, 'uploaded');
        const optimizedDir = path.join(__dirname, 'customers', linkToken, 'optimized');

        // Ensure optimized directory exists
        if (!fs.existsSync(optimizedDir)) {
            fs.mkdirSync(optimizedDir, { recursive: true });
        }
        const files = fs.readdirSync(uploadDir);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|svg)/i.test(file)
        );

        // TODO: Check all naming -> for example file should be fileName
        for (const file of fileNames) {
            const inputPath = path.join(uploadDir, file);
            const outputPath = path.join(optimizedDir, file);

           try {
                const done = await compressToSize(inputPath, outputPath, file, linkToken);
                if (done) {
                    console.log(`Successfully processed: ${file}`);
                    const result = await pool.query('UPDATE customer SET credits = credits - 1 WHERE link_token = $1 RETURNING credits', [linkToken]);
                    const remainingCredits = result.rows[0]?.credits;
                    optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, file, remainingCredits);
                    console.log('Verbleibende Credits:', remainingCredits);
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
                optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error);
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
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
            await sharp(inputPath)
                .jpeg({ quality: 100 })
                .rotate()
                .toFile(outputPath);
            console.log(`File already within size limit, copying to optimized folder`);
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
                        .jpeg({ quality: quality })
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
        console.error('Komprimierungsfehler:', error);
        throw error;
    }
}

async function xmlToPng(inputPath, outputPath){
    try{
        await sharp(inputPath)
            .png()
            .toFile(outputPath)
    } catch (error){
        console.log('Fehler bei XML nach PNG:' + error)
        throw error
    }
}
export { getCustomerData, compressToSize, processAllFiles };