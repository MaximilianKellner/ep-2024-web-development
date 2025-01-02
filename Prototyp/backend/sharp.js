const fs = require('fs');
const { get } = require('http');
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

// getCustomerData('max-file-size-kb');

async function compressToSize(inputPath, outputPath) {
    try {
        let maxSizeInMB = getCustomerData('max-file-size-kb')/1024;
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

// Usage example:
compressToSize('./customers/debug-kunde-1/uploaded/debug2.jpg', './customers/debug-kunde-1/optimized/debug2-opt.jpg')
    .then(path => console.log('Compressed file saved at:', path))
    .catch(err => console.error('Error:', err));

