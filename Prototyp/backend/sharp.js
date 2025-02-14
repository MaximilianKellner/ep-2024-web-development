import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import sharp from 'sharp';
import optimizationEventEmitter from './optimizationEventEmitter.js';
import OptimizationEventStatus from './optimizationEventStatus.js';
import { pool } from './db.js';
// TODO: Should be inside try-catch

function getCustomerData(filterworld) {

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const filePath = path.join(__dirname, 'customers', 'debug-kunde-1', 'customer-data.json');
        const data = JSON.parse(fs.readFileSync(filePath));
        //Es soll nur der Wert des angegebenen Schlüssels zurückgegeben werden
        if (filterworld === 'name') {
            console.log('Customer Data: ', data.customerData.name);
            return data[filterworld];
        }
        if (filterworld === 'max-file-size-kb') {
            console.log('Max Size: ', data.configSettings.maxFileInKB);
            let maxFileSize = data.configSettings.maxFileInKB;
            return maxFileSize;
        }
        console.log('Customer Data: ', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}


// TODO: Originale der bereits optimierten Dateien entfernen.
async function processAllFiles(customerID, fileNames) {

    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const uploadDir = path.join(__dirname, 'customers', customerID, 'uploaded');
        const optimizedDir = path.join(__dirname, 'customers', customerID, 'optimized');

        // Ensure optimized directory exists
        if (!fs.existsSync(optimizedDir)) {
            fs.mkdirSync(optimizedDir, { recursive: true });
        }
        const files = fs.readdirSync(uploadDir);
        const imageFiles = files.filter(file =>
            /\.(jpg|jpeg|png|svg)/i.test(file)
        );


        for (const file of fileNames) {
            const inputPath = path.join(uploadDir, file);
            const outputPath = path.join(optimizedDir, file);

           try {
                const done = await compressToSize(inputPath, outputPath, file);
                if (done) {
                    console.log(`Successfully processed: ${file}`);
                    await pool.query('UPDATE customer SET credits = credits - 1 WHERE customer_id = $1', [customerID]);
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
    }
}

// 
// Alte Version: Es wird ein Bild so lange komprimiert, bis es die gewünschte Größe erreicht hat. Allerdings passiert das ganze in einem ständigen Wechsel zwischen Client und Server
// 
// async function compressToSize(inputPath, outputPath, fileName) {
//     try {
//         let maxSizeInMB = getCustomerData('max-file-size-kb') / 1024; //Output ist eine Zahl
//         if (!maxSizeInMB) {
//             throw new Error('Max file size not found');
//         }
//         let quality = 100;
//         let currentSize = fs.statSync(inputPath).size / (1024 * 1024); // Convert to MB
    
//         console.log(`Original size: ${currentSize.toFixed(3)} MB`);

//         if (currentSize <= maxSizeInMB) {
//             await sharp(inputPath)
//                 .jpeg({ quality: 100 })
//                 .rotate()
//                 .toFile(outputPath);
//             console.log(`File already within size limit, copying to optimized folder`);
//             optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
//             return outputPath;
//         }

//         // while (currentSize > maxSizeInMB && quality > 0) {
//         //     await sharp(inputPath)
//         //         .jpeg({ quality: quality })
//         //         .rotate() // Auto-rotate based on EXIF data
//         //         .toFile(outputPath);

//         //     currentSize = fs.statSync(outputPath).size / (1024 * 1024); // Convert to MB
//         //     console.log(`Current size: ${currentSize.toFixed(3)} MB at quality: ${quality}`);
//         //     quality -= 5;
//         //     // TODO: Send file name
//         //     optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Active, fileName);
//         // }
//
//         if (currentSize <= maxSizeInMB) {
//             console.log(`Successfully compressed to ${currentSize.toFixed(3)} MB`);
//             optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
//             return outputPath;
//         } else {
//             optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error, fileName);
//             throw new Error('Konnte nicht zur gewünschten Größe komprimiert werden');
//         }
//     } catch (error) {
//         console.error('Compression error:', error);
//         throw error;
//     }
// }

async function compressToSize(inputPath, outputPath, fileName) {
    try {
        let maxSizeInMB = getCustomerData('max-file-size-kb') / 1024;
        if (!maxSizeInMB) {
            throw new Error('Max file size not found');
        }

        let quality = 100;
        let currentSize = fs.statSync(inputPath).size / (1024 * 1024); // Convert to MB

        console.log(`Original size: ${currentSize.toFixed(3)} MB`);

        // SVG Verarbeitung
        if (inputPath.includes('.svg')) {
            console.log('SVG erkannt');
            // Temporärer Pfad für Zwischenschritte
            const tempPngPath = outputPath.replace('.svg', '_temp.png');
            
            // Konvertiere SVG zu PNG
            await xmltopng(inputPath, tempPngPath);
            
            // Aktualisiere Input-Pfad und Größe für weitere Verarbeitung
            inputPath = tempPngPath;
            currentSize = fs.statSync(inputPath).size / (1024 * 1024);
            console.log(`Nach SVG zu PNG Konvertierung: ${currentSize.toFixed(3)} MB`);
        }

        // If file is already small enough, just copy it
        if (currentSize <= maxSizeInMB) {
            await sharp(inputPath)
                .jpeg({ quality: 100 })
                .rotate()
                .toFile(outputPath);
            console.log(`File already within size limit, copying to optimized folder`);
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
            return outputPath;
        }

        // Erstellen einer Sharp-Instanz für Mehrfachzugriff
        const image = sharp(inputPath).rotate();
        let buffer;

        // Binäre Suche für optimale Qualität
        let minQuality = 0;
        let maxQuality = 100;
        
        while (minQuality <= maxQuality) {
            quality = Math.floor((minQuality + maxQuality) / 2);
            
            buffer = await image
                .jpeg({ quality: quality })
                .toBuffer();
            
            currentSize = buffer.length / (1024 * 1024); 
            console.log(`Momentane Größe: ${currentSize.toFixed(3)} MB. Momentane Qualität: ${quality}`);
            
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Active, fileName);

            if (currentSize > maxSizeInMB) {
                maxQuality = quality - 1;
            } else if (currentSize < maxSizeInMB * 0.95) {
                minQuality = quality + 1;
            } else {
                break;
            }
        }

        // Speichern des finalen Ergebnisses
        if (currentSize <= maxSizeInMB) {
            await fs.promises.writeFile(outputPath, buffer);
            console.log(`Erfolgreich zu folgender Größe komprimiert: ${currentSize.toFixed(3)} MB! Die Qualität beträgt: ${quality}/100!`);
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
            return outputPath;
        } else {
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error, fileName);
            throw new Error(`Konnte nicht zur gewünschten Größe komprimiert werden (Letzte Größe: ${currentSize.toFixed(3)} MB)`);
        }
    } catch (error) {
        console.error('Komprimierungsfehler:', error);
        throw error;
    }
}

async function svgtoxml(inputPath, outputPath){
    try{
        await sharp(inputPath)
            .png()
            .toFile(outputPath)

        return new Promise((resolve, reject) => {
            potrace.trace('./temp.png', {
                threshold: 120,
                color: '#000000'
            }, (err, svg) => {
                if(err) reject(err);
                fs.writeFileSync(outputPath, svg)
                resolve('Zu SVG komprimiert. Output:' + outputPath)
            })
        });
    } catch (error){
        console.log('Fehler bei SVG nach XML:' + error)
        throw error
    }
}

async function xmltopng(inputPath, outputPath){
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


// Replace the example usage with:
/*
processAllFiles('debug-kunde-1')
    .then(() => console.log('All files processed'))
    .catch(err => console.error('Error:', err));
*/

