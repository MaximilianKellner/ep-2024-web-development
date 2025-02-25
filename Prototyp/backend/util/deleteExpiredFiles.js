import {fileURLToPath} from "url";
import fs from "fs";
import path from "path";

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

async function deleteExpiredFiles() {
    try {
        const __thisFilePath = fileURLToPath(import.meta.url);
        const uploadDir = path.resolve(__thisFilePath, '../../customers');
        console.log("Verzeichnis: " + uploadDir);

        const customers = await fs.promises.readdir(uploadDir);

        for (const customerUUID of customers) {
            const uploadedPath = path.join(uploadDir, customerUUID, 'optimized');

            try {
                const files = await fs.promises.readdir(uploadedPath);

                for (const file of files) {

                    const filePath = path.join(uploadedPath, file);
                    const stats = await fs.promises.stat(filePath);
                    const now = Date.now();

                    if (now - stats.birthtimeMs > TWENTY_FOUR_HOURS) { // Älter als 24 Stunden?
                        await fs.promises.unlink(filePath);
                    }
                }
            } catch (error) {
                if (error.code !== 'ENOENT') {
                    throw new Error("Error processing directory ${uploadedPath}: ${error.message}");
                }
            }
            setTimeout(deleteExpiredFiles, TWELVE_HOURS);
        }
    } catch (error) {
        throw error;
    }
}

export default deleteExpiredFiles;

