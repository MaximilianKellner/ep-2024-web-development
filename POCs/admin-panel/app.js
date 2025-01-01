const fh = document.getElementById('fh')
const fw = document.getElementById('fw')
const sw = document.getElementById('options')
const button = document.getElementById('submit')
const result = document.getElementById('copyURL')

const imageData = {
    width: 0,
    height: 0,
    sw: false
}

fh.addEventListener('input', (event) => {
    imageData.height = parseInt(event.target.value)
});

fw.addEventListener('input', (event) => {
    imageData.width = parseInt(event.target.value)
});

sw.addEventListener('change', (event) => {
    imageData.sw = event.target.value === 'yes'
});

button.addEventListener('click', (event) => {
    event.preventDefault()
    console.log(imageData)
    // uuid wird hier generiert
    const url = `http://127.0.0.1:5500/POCs/admin-panel/customerSite.html?id=${generateUUID()}&width=${imageData.width}&height=${imageData.height}&sw=${imageData.sw}`
    linkElement = document.getElementById('copyURL')
    linkElement.href = url
    result.innerText = url
    return imageData
});

function generateUUID(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}