function createImageRequest(image) {
    return axios.get(`http://localhost:5000/debug-kunde-1/download/${image}`, {
        responseType: 'blob',
    });
}

function calculateHoursLeft(fileName) {
    const uniqueSuffix = fileName.split('-').pop();
    const timestamp = uniqueSuffix.split('_')[0];

    // Erstelle ein neues Date-Objekt
    const creationDate = new Date(parseInt(timestamp));

    // Überprüfe, ob das Datum gültig ist
    if (isNaN(creationDate.getTime())) {
        console.error(`Ungültiges Datum extrahiert aus: ${fileName}`);
        return 'Ungültiges Datum';
    }

    // Berechne die Differenz in Tagen
    const currentDate = new Date();
    const timeDifference = currentDate - creationDate;
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const hoursLeft = MAX_FILE_STORAGE_HOURS - hoursDifference;

    console.log(`Erstellt am: ${creationDate.toLocaleString()}`);
    console.log(`Vergangene Stunden: ${hoursDifference}`);

    return hoursLeft;
}

function getFileNameWithoutSuffix(fileName) {
    const parts = fileName.split('-');
    parts.pop(); // Entferne den letzten Teil nach dem letzten "-"
    return parts.join('-'); // Füge die Teile wieder zusammen
}

function createTableRow(fileData) {
    const { url, fileName, fileNameWithoutSuffix, blob, creationDate, hoursLeft } = fileData;
    
    return `
        <tr>
            <td>
                <input type="checkbox" name="selector">
            </td>
            <td>
                <img class="preview-mid" src="${url}" alt="${fileNameWithoutSuffix}">
            </td>
            <td class="limited-text" >${fileNameWithoutSuffix}</td>
            <td>${(blob.size / 1024).toFixed(2)} KB</td>
            <td>${creationDate.toLocaleString()}</td>
            <td>${hoursLeft}h</td>
            <td>
                <button class="download-btn" data-url="${url}" data-filename="${fileNameWithoutSuffix}">
                    <img src="./img/icon/download.svg" alt="download" onclick="this.parentElement.click()" />
                </button>
            </td>
        </tr>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    loadOptimizedTable();
});

function loadOptimizedTable() {

    const tbody = document.getElementById('image-table-body');
    const table = document.getElementById('image-table');
    const downloadButton = document.getElementById('download-selected-btn');

    if (fileNames.length === 0) {
        table.classList.add('hidden');
        downloadButton.classList.add('hidden');
        return;
    }

    // Event Delegation für Download Buttons
    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('download-btn')) {
            const url = e.target.dataset.url;
            const filename = e.target.dataset.filename;
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    });

    axios.get('http://localhost:5000/debug-kunde-1/optimized-images')
        .then((response) => {
            const fileNames = response.data;

            const imageRequests = fileNames.map(fileName => createImageRequest(fileName));
            const fileNamesWithoutSuffix = fileNames.map(getFileNameWithoutSuffix);

            Promise.all(imageRequests)
                .then(responses => {
                    const tableContent = responses.map((response, index) => {
                        const { data, headers } = response;
                        const contentType = headers['content-type'];
                        const blob = new Blob([data], { type: contentType });
                        const url = URL.createObjectURL(blob);
                        const uniqueSuffix = fileNames[index].split('-').pop();
                        const timestamp = uniqueSuffix.split('_')[0];
                        const creationDate = new Date(parseInt(timestamp));
                        const hoursLeft = calculateHoursLeft(fileNames[index]);

                        return createTableRow({
                            url,
                            fileName: fileNames[index],
                            fileNameWithoutSuffix: fileNamesWithoutSuffix[index],
                            blob,
                            creationDate,
                            hoursLeft
                        });
                    }).join('');

                    tbody.innerHTML = tableContent;
                    table.classList.remove('hidden');
                    downloadButton.classList.remove('hidden');
                })
                .catch(err => console.error('Fehler beim Laden der Bilder:', err));
        })
        .catch(err => console.error('Fehler beim Abrufen der Dateiliste:', err));
}

// ------ checkbox selection ------
document.getElementById('select-all').addEventListener('change', function() {
    const checkboxes = document.getElementsByName('selector');
    checkboxes.forEach(checkbox => checkbox.checked = this.checked);
});

// ------ download selected ------
document.getElementById('download-selected-btn').addEventListener('click', downloadSelectedFiles);

function downloadSelectedFiles() {
    const checkboxes = document.querySelectorAll('input[name="selector"]:checked');
    checkboxes.forEach(checkbox => {
        const row = checkbox.closest('tr');
        const downloadBtn = row.querySelector('.download-btn');
        const url = downloadBtn.dataset.url;
        const filename = downloadBtn.dataset.filename;
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    });
}