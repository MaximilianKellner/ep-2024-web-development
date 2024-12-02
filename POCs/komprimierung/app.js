const sharp = require('sharp');

/*
sharp('./Ryanair2.png')
    .resize(500, 500,{
        fit: 'contain',
        background: 'transparent'
    })
    .toFile('Ryanair_resized.png')
*/

async function resizeImage(inputPath, outputPath, width, height) {
    await sharp(inputPath)
        .resize(width, height)
        .toFile(outputPath)
}

/*Es können Ursparungsbild und der outputPath angegeben werden sowie gewünschte Größe. Nützlich für das Frontend*/
resizeImage('./Ryanair2.png', 'Ryanair_resized2.png', 500, 500)
    .then(() => {
        console.log('Image resized successfully');
    })
    .catch((err) => {
        console.error('resize:' +err);
    });




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

blackAndWhite()




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

transformer()