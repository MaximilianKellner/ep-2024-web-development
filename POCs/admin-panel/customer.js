function getParameterByName(filterword){
    const urlParams = window.location.href;
    return new URL(urlParams).searchParams.get(filterword);
}

const uuid = getParameterByName('id');
const fh = getParameterByName('height');
const fw = getParameterByName('width');
const blackAndWhite = getParameterByName('sw');
document.getElementById('uuidPlaceholder').innerHTML = uuid ? uuid : 'No UUID provided';
document.getElementById('format-height').innerHTML = fh? fh : 'No FH provided';
document.getElementById('format-width').innerHTML = fw? fw : 'No FW provided';
document.getElementById('black-and-white').innerHTML = blackAndWhite? blackAndWhite : 'No SW provided';

