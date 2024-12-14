const sharp = require('sharp');
const potrace = require('potrace')
const fs = require('fs');

async function base(){
    try{
        await sharp('./Ryanair2.png')
            //Definieren von Eigenschaften
            .resize(500, 500)
            .toFormat('png')
            .toFile('./Ryanair2-base.png')
    }
    catch(error){
        console.log('Base:' + error)
    }
}


// async function resizeImage(inputPath, outputPath, width, height) {
//     // Originalgröße
//     const ursprung = fs.statSync(inputPath).size / (1024 * 1024);
//     console.log(`Ursprüngliche Größe: ${ursprung.toFixed(2)} MB`);

//     await sharp(inputPath)
//         .resize(width, height)
//         .toFile(outputPath);

//     // Komprimierte Größe in MB
//     const komprimiert = fs.statSync(outputPath).size / (1024 * 1024);
//     console.log(`Komprimierte Größe in MB: ${komprimiert.toFixed(2)} MB`);
// }

// resizeImage('./Ryanair.jpg', 'Ryanair_resized.png', 500, 500)
//     .then(() => console.log('Bild erfolgreich komprimiert'))
//     .catch(err => console.error('Error:', err));





async function blackAndWhite(){
    try{
        await sharp("./Ryanair2.png")
            .threshold(120)
            .png()
            .toFile("./Ryanair2-sw.png")
    } catch (error){
        console.log('SW:' + error)
    }
}





async function transformer(){
    try{
        await sharp('./Ryanair2.png').modulate({
            brightness: 0.5,
            /*Für SW Effekt auf saturation: 0 setzen*/
            saturation: 0,	
            hue: 120
        }).toFile('./Ryanair2-transformed.png')
    } catch (error){
        console.log('Transformer:'+ error)   
    }
}



async function comprimize(){
    try{
        await sharp('./Ryanair2.png').webp({quality: 1}).toFile('./Ryanair2-comprimized.webp')
    } catch (error){
        console.log('Comprimize:' + error)
    }
}


async function webpTosvg(){
    try{
        await sharp('./webp-for-wordpress.webp')
            .png()
            .toFile('./temp.png')

        return new Promise((resolve, reject) => {
            potrace.trace('./temp.png', {
                threshold: 120,
                color: '#000000'
            }, (err, svg) => {
                if(err) reject(err);
                fs.writeFileSync('./output.xml', svg)
                fs.unlinkSync('./temp.png')
                resolve('Zu SVG komprimiert. Output: output.xml')
            })
        });
    } catch (error){
        console.log('WebpToSvg:' + error)
        throw error
    }
}


//base()
webpTosvg()

/*
blackAndWhite()
transformer()
comprimize()
*/