document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    const fileList = document.getElementById('file-list');
    const uploadStatusList = document.querySelector('.upload-status-list');
    const files = fileInput.files;

    if (files.length <= 0) {

        //clear classlist 
        messageDiv.textContent = 'Bitte mindestens eine Datei auswählen.';
        messageDiv.classList.add('error');
        return;
    }

    //-------- Upload Limitationen --------
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

    // Upload-Request
    try {
        for (let i = 0; i < files.length; i++) {
            const singleFormData = new FormData();
            singleFormData.append('images', files[i]);

            const progressBarContainers = document.querySelectorAll('.progress-bar-container');
            const progressLabels = document.querySelectorAll('.circle-label');
            const progressCircles = document.querySelectorAll('#progress-circle circle:nth-child(2)');

            const response = await axios.post('http://localhost:5000/debug-kunde-1/upload', singleFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: function (progressEvent) {
                    progressBarContainers[i].classList.remove('hidden');
                    const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    progressLabels[i].textContent = `${percentCompleted}%`;
                    progressCircles[i].style.strokeDashoffset = 282.6 - (282.6 * percentCompleted / 100);
                },
            });

            if (response.status === 204) {
                messageDiv.textContent = 'Upload erfolgreich!';
                messageDiv.classList.remove('error');
                fileInput.value = '';

                //SSE Handling
                // Optimierungsüberwachung mit EventSource (Server-Sent Events)
                const eventSource = new EventSource('http://localhost:5000/debug-kunde-1/progress');

                if (eventSource) {     
                    eventSource.onmessage = (event) => {

                        messageDiv.innerHTML = `Optimization status: ${event.data}`;

                        const eventObject = JSON.parse(event.data);
                        const status = eventObject.status;
                        const fileName = eventObject.fileName;
                        console.log("Status: ", status, "Filename: ", fileName);

                        if (event.data === 'complete' || event.data === 'done' || event.data === ' complete') {
                            uploadStatusList.innerHTML += '<li>debug.jpg optimiert</li>';
                            eventSource.close();
                        }

                        else if (event.data === 'error') {
                            console.log('Optimization error');
                            uploadStatusList.innerHTML += '<li class="error">debug.jpg optimiert</li>';
                            eventSource.close();
                        }                        
                    };
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        messageDiv.textContent = `Fehler beim Hochladen: ${error.message}`;
        messageDiv.classList.add('error');
    }
});