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

async function compressToSize(inputPath, outputPath, fileName) {
    try {
        let maxSizeInMB = getCustomerData('max-file-size-kb') / 1024; //Output ist eine Zahl
        if (!maxSizeInMB) {
            throw new Error('Max file size not found');
        }
        let quality = 100;
        let currentSize = fs.statSync(inputPath).size / (1024 * 1024); // Convert to MB

        console.log(`Original size: ${currentSize.toFixed(3)} MB`);

        if (currentSize <= maxSizeInMB) {
            await sharp(inputPath)
                .jpeg({ quality: 100 })
                .rotate()
                .toFile(outputPath);
            console.log(`File already within size limit, copying to optimized folder`);
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
            return outputPath;
        }

        while (currentSize > maxSizeInMB && quality > 0) {
            await sharp(inputPath)
                .jpeg({ quality: quality })
                .rotate() // Auto-rotate based on EXIF data
                .toFile(outputPath);

            currentSize = fs.statSync(outputPath).size / (1024 * 1024); // Convert to MB
            console.log(`Current size: ${currentSize.toFixed(3)} MB at quality: ${quality}`);
            quality -= 5;
            // TODO: Send file name
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Active, fileName);
        }

        if (currentSize <= maxSizeInMB) {
            console.log(`Successfully compressed to ${currentSize.toFixed(3)} MB`);
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Complete, fileName);
            return outputPath;
        } else {
            optimizationEventEmitter.sendProgressStatus(OptimizationEventStatus.Error, fileName);
            throw new Error('Konnte nicht zur gewünschten Größe komprimiert werden');
        }
    } catch (error) {
        console.error('Compression error:', error);
        throw error;
    }
}



// Replace the example usage with:
/*
processAllFiles('debug-kunde-1')
    .then(() => console.log('All files processed'))
    .catch(err => console.error('Error:', err));
*/
export { getCustomerData, compressToSize, processAllFiles };

