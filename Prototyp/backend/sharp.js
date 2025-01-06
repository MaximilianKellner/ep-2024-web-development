const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

function getCustomerData(filterworld){
    const filePath = path.join(__dirname, 'customers', 'debug-kunde-1', 'customer-data.json');
    const data = JSON.parse(fs.readFileSync(filePath));
    //Es soll nur der Wert des angegebenen Schlüssels zurückgegeben werden
    if(filterworld === 'name'){
        console.log('Customer Data: ', data.customerData.name);
        return data[filterworld];
    }
    if(filterworld === 'max-file-size-kb'){
        console.log('Max Size: ', data.configSettings.maxFileInKB);
        let maxFileSize = data.configSettings.maxFileInKB;
        return maxFileSize;
    }
    console.log('Customer Data: ', data);
    return data;
}



async function processAllFiles(customerID) {
    const uploadDir = path.join(__dirname, 'customers', customerID, 'uploaded');
    const optimizedDir = path.join(__dirname, 'customers', customerID, 'optimized');
    
    // Ensure optimized directory exists
    if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
    }

    try {
        const files = fs.readdirSync(uploadDir);
        const imageFiles = files.filter(file => 
            /\.(jpg|jpeg|png)$/i.test(file)
        );

        for (const file of imageFiles) {
            const inputPath = path.join(uploadDir, file);
            const outputPath = path.join(optimizedDir, file);
            
            try {
                await compressToSize(inputPath, outputPath);
                console.log(`Successfully processed: ${file}`);
            } catch (error) {
                console.error(`Error processing ${file}:`, error);
            }
        }
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
    }
}

async function compressToSize(inputPath, outputPath) {
    try {
        let maxSizeInMB = getCustomerData('max-file-size-kb')/1024; //Output ist eine Zahl
        if(!maxSizeInMB){
            throw new Error('Max file size not found');
        }
        let quality = 100;
        let currentSize = fs.statSync(inputPath).size / (1024 * 1024); // Convert to MB
        console.log(`Original size: ${currentSize.toFixed(3)} MB`);

        while (currentSize > maxSizeInMB && quality > 0) {
            await sharp(inputPath)
                .jpeg({ quality: quality })
                .toFile(outputPath); 

            currentSize = fs.statSync(outputPath).size / (1024 * 1024); // Convert to MB
            console.log(`Current size: ${currentSize.toFixed(3)} MB at quality: ${quality}`);
            quality -= 5;
        }

        if (currentSize <= maxSizeInMB) {
            console.log(`Successfully compressed to ${currentSize.toFixed(3)} MB`);
            return outputPath;
        } else {
            throw new Error('Konnte nicht zur gewünschten Größe komprimiert werden');
        }
    } catch (error) {
        console.error('Compression error:', error);
        throw error;
    }
}



// Replace the example usage with:
processAllFiles('debug-kunde-1')
    .then(() => console.log('All files processed'))
    .catch(err => console.error('Error:', err));

module.exports = { getCustomerData, compressToSize, processAllFiles };

