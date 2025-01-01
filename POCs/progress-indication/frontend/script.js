const formUl = document.getElementById('form-ul');
const buttonDl = document.getElementById('file-dl');
const barUl = document.getElementById('progress-bar-ul');
const barDl = document.getElementById('progress-bar-dl');

// Für Upload-Daten
const uploadLoaded = document.getElementById('upload-loaded');
const uploadTotal = document.getElementById('upload-total');
const uploadProgress = document.getElementById('upload-progress');
const uploadBytes = document.getElementById('upload-bytes');
const uploadEstimated = document.getElementById('upload-estimated');
const uploadRate = document.getElementById('upload-rate');

// Für Download-Daten
const downloadLoaded = document.getElementById('download-loaded');
const downloadTotal = document.getElementById('download-total');
const downloadProgress = document.getElementById('download-progress');
const downloadBytes = document.getElementById('download-bytes');
const downloadEstimated = document.getElementById('download-estimated');
const downloadRate = document.getElementById('download-rate');

formUl.addEventListener('submit', function (e) {

    const formData = new FormData();
    const file = document.getElementById('file-ul');
    const img = file.files[0];
    formData.append('image', img);

    const config = {
        onUploadProgress: function (progressEvent) {
            const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            barUl.setAttribute('value', percentCompleted);
            barUl.previousElementSibling.textContent = `${percentCompleted}%`
            if (percentCompleted === 100) {
                barUl.previousElementSibling.textContent = `Upload complete!`
            }

            // Zeige alle anderen Upload-Daten an
            uploadLoaded.textContent = progressEvent.loaded;
            uploadTotal.textContent = progressEvent.total;
            uploadProgress.textContent = `${Math.round(progressEvent.progress * 100)}%`;
            uploadBytes.textContent = progressEvent.bytes;
            uploadEstimated.textContent = progressEvent.estimated ? progressEvent.estimated.toFixed() : 'N/A'; // Falls nicht verfügbar
            uploadRate.textContent = progressEvent.rate || 'N/A'; // Falls nicht verfügbar
        }
    }

    axios.post('http://localhost:3000/upload', formData, config)
        .then(res => console.log(res))
        .catch(err => console.log(err))
})

buttonDl.addEventListener('click', function (e) {

    const options = {

        responseType: 'blob',

        onDownloadProgress: function (progressEvent) {
            const percentCompleted = Math.floor((progressEvent.loaded / progressEvent.total) * 100);

            barDl.setAttribute('value', percentCompleted);
            barDl.previousElementSibling.textContent = `${percentCompleted}%`
            if (percentCompleted === 100) {
                barDl.previousElementSibling.textContent = `Download complete!`
            }

            // Zeige alle anderen Download-Daten an
            downloadLoaded.textContent = progressEvent.loaded;
            downloadTotal.textContent = progressEvent.total;
            downloadProgress.textContent = `${Math.floor(progressEvent.progress * 100)}%`;
            downloadBytes.textContent = progressEvent.bytes;
            downloadEstimated.textContent = progressEvent.estimated ? progressEvent.estimated.toFixed() : 'N/A'; // Falls nicht verfügbar
            downloadRate.textContent = progressEvent.rate || 'N/A'; // Falls nicht verfügbar
        }

    }


    //https://picsum.photos/800/800
    axios.get('http://localhost:3000/download', options)
        .then(({ data, headers }) => {

            const contentDisposition = headers['content-disposition'];
            const fileName = contentDisposition
                ? contentDisposition.split('filename=')[1].replace(/"/g, '') // Entfernen der Anführungszeichen
                : 'downloaded_file'; // Falls kein Dateiname vorhanden ist

            const downloadUrl = window.URL.createObjectURL(new Blob([data]));

            const link = document.createElement('a');

            link.href = downloadUrl;

            link.setAttribute('download', fileName); //any other extension

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(downloadUrl);

        })
        .catch(err => console.log(err))
});