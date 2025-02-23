document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    try {
        event.preventDefault();

        const linkToken = window.location.pathname.replace("/", ""); // Entfernt das "/"
        console.log("Aktueller linkToken create image:", linkToken);


        const fileInput = document.getElementById('fileInput');
        const messageDiv = document.getElementById('message');
        const fileList = document.getElementById('file-list');
        const uploadStatusList = document.querySelector('.upload-status-list');
        const files = fileInput.files;
        console.log("Files: " + files);

        console.log("File input: " + fileInput.value)

        // check credits and return if not enough
        const response = await axios.get(`/${linkToken}/credits`);
        const credits = response.data.credits;
        console.log('Credits:', credits);

        if (credits < files.length) {
            messageDiv.textContent = `Für den Upload fehlen ${files.length - credits} Credits.`;
            messageDiv.classList.add('error');
            return;
        }

        if (files.length <= 0) {
            //clear classlist
            messageDiv.textContent = 'Bitte mindestens eine Datei auswählen.';
            messageDiv.classList.add('error');
            return;

        }
        //Upload Limitationen
        if (files.length > MAX_FILE_COUNT) {
            messageDiv.textContent = `Maximal ${MAX_FILE_COUNT} Dateien auswählen.`;
            messageDiv.classList.add('error');
            return;

        }
        for (let i = 0; i < files.length; i++) {
            if (files[i].size > MAX_FILE_SIZE) {
                messageDiv.textContent = `Die Datei ${files[i].name} überschreitet die maximale Größe von ${MAX_FILE_SIZE / 1024 / 1024} MB.`;
                messageDiv.classList.add('error');
                return;
            }
        }


        const MAX_BATCH_SIZE = 6; // Maximal 6 Dateien pro Upload
        const fileBatches = [];

        // Dateien in 6er-Chunks aufteilen
        const filesArr = Array.from(files);
        for (let i = 0; i < files.length; i += MAX_BATCH_SIZE) {
            fileBatches.push(filesArr.slice(i, i + MAX_BATCH_SIZE));
        }

        console.log("Dateien in Batches aufgeteilt:", fileBatches);

        // Upload-Request

        for (let batchIndex = 0; batchIndex < fileBatches.length; batchIndex++) {
            const batch = fileBatches[batchIndex];

            const singleFormData = new FormData();
            batch.forEach(file => singleFormData.append('images', file));

            const response = await axios.post(`/${linkToken}/upload`, singleFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: function (progressEvent) {
                    const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);

                    batch.forEach((file, fileIndex) => {
                        const globalIndex = batchIndex * MAX_BATCH_SIZE + fileIndex; // Korrekte Indexierung
                        const progressBarContainers = document.querySelectorAll('.progress-bar-container');
                        const progressLabels = document.querySelectorAll('.circle-label');
                        const progressCircles = document.querySelectorAll('#progress-circle circle:nth-child(2)');

                        if (progressBarContainers[globalIndex]) {
                            progressBarContainers[globalIndex].classList.remove('hidden');
                            progressLabels[globalIndex].textContent = `${percentCompleted}%`;
                            progressCircles[globalIndex].style.strokeDashoffset = 282.6 - (282.6 * percentCompleted / 100);
                        }
                    });
                },
            });

            console.log("Status: " + response.status);

            if (response.status === 204) {
                messageDiv.textContent = 'Upload erfolgreich!';
                messageDiv.classList.remove('error');
            }
        }
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        messageDiv.textContent = `Fehler beim Hochladen: ${error.message}`;
        messageDiv.classList.add('error');
    } finally {
        resetFiles();
    }
});

//Check Credits on load
document.addEventListener('DOMContentLoaded', async () => {
    loadCredits() 
});

// load credits function
async function loadCredits() {
    try {
        const linkToken = window.location.pathname.replace("/", ""); // Entfernt das "/"
        console.log("Aktueller linkToken create image:", linkToken);

        const response = await axios.get(`/${linkToken}/credits`);
        const credits = response.data.credits;
        console.log('Credits on Load:', credits);
        document.getElementById('credits-current').textContent = `${credits} Credits`;
    } catch (error) {
        document.getElementById('credits-current').textContent = `-1 Credits`;

        console.error('Error getting credits:', error);
    }
}