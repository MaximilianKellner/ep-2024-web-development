function createImageRequest(image) {
    return axios.get(`http://localhost:5000/debug-kunde-1/download/${image}`, {
        responseType: 'blob',
    });
}

function calculateDaysSinceCreation(fileName) {
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
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    console.log(`Erstellt am: ${creationDate.toLocaleString()}`);
    console.log(`Vergangene Tage: ${daysDifference}`);

    return daysDifference;
}

function getFileNameWithoutSuffix(fileName) {
    const parts = fileName.split('-');
    parts.pop(); // Entferne den letzten Teil nach dem letzten "-"
    return parts.join('-'); // Füge die Teile wieder zusammen
}

document.addEventListener('DOMContentLoaded', () => {
    axios.get('http://localhost:5000/debug-kunde-1/optimized-images')
        .then((response) => {
            const fileNames = response.data;

            const imageRequests = fileNames.map(fileName => createImageRequest(fileName));
            const fileNamesWithoutSuffix = fileNames.map(getFileNameWithoutSuffix);

            Promise.all(imageRequests)
                .then(responses => {
                    const tbody = document.getElementById('image-table-body');
                    responses.forEach(({ data, headers }, index) => {
                        const contentType = headers['content-type'];
                        const blob = new Blob([data], { type: contentType });
                        const url = URL.createObjectURL(blob);

                        const row = document.createElement('tr');

                        const checkboxCell = document.createElement('td');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = 'selector';
                        checkboxCell.appendChild(checkbox);

                        const previewCell = document.createElement('td');
                        const img = document.createElement('img');
                        img.className = 'preview-mid';
                        img.src = url;
                        previewCell.appendChild(img);

                        const nameCell = document.createElement('td');
                        const fileNameWithoutSuffix = getFileNameWithoutSuffix(fileNames[index]);
                        nameCell.textContent = fileNameWithoutSuffix;

                        const sizeCell = document.createElement('td');
                        sizeCell.textContent = `${(blob.size / 1024).toFixed(2)} KB`;

                        const uploadDateCell = document.createElement('td');
                        const uniqueSuffix = fileNames[index].split('-').pop(); // assuming the uniqueSuffix is part of the filename
                        const timestamp = uniqueSuffix.split('_')[0];
                        const creationDate = new Date(parseInt(timestamp));
                        uploadDateCell.textContent = creationDate.toLocaleString();

                        const remainingTimeCell = document.createElement('td');
                        const daysDifference = calculateDaysSinceCreation(fileNames[index]);
                        remainingTimeCell.textContent = `${daysDifference} Tage`;

                        const downloadCell = document.createElement('td');
                        const downloadButton = document.createElement('button');
                        downloadButton.textContent = 'Download';
                        downloadButton.addEventListener('click', () => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', fileNamesWithoutSuffix[index]);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                        });
                        downloadCell.appendChild(downloadButton);

                        row.appendChild(checkboxCell);
                        row.appendChild(previewCell);
                        row.appendChild(nameCell);
                        row.appendChild(sizeCell);
                        row.appendChild(uploadDateCell);
                        row.appendChild(remainingTimeCell);
                        row.appendChild(downloadCell);

                        tbody.appendChild(row);
                    });
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});
