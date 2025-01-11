document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    const fileList = document.getElementById('file-list');
    const uploadStatusList = document.querySelector('.upload-status-list');
    const files = fileInput.files;

    if (files.length <= 0) {
        messageDiv.textContent = 'Bitte mindestens eine Datei auswählen.';
        messageDiv.style.color = 'var(--c-red)';
        return;
    }

    //-------- Upload Limitationen --------
    if (files.length > MAX_FILE_COUNT) {
        messageDiv.textContent = `Maximal ${MAX_FILE_COUNT} Dateien auswählen.`;
        messageDiv.style.color = 'var(--c-red)';
        return;
    }

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_FILE_SIZE) {
            messageDiv.textContent = `Die Datei ${files[i].name} überschreitet die maximale Größe von ${MAX_FILE_SIZE / 1024 / 1024} MB.`;
            messageDiv.style.color = 'var(--c-red)';
            return;
        }
    }

    //-------- Anfrage und Antwort --------

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);

        const filePreview = document.querySelector('.file-preview');
        const progressBar = document.querySelector('progress');
        const progressLabel = document.querySelector('label');

        filePreview.src = URL.createObjectURL(files[i]);
        progressBar.value = 0;
    }

    // Upload-Request
    try {
        for (let i = 0; i < files.length; i++) {
            const singleFormData = new FormData();
            singleFormData.append('images', files[i]);

            const response = await axios.post('http://localhost:5000/debug-kunde-1/upload', singleFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: function (progressEvent) {
                    const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    const progressBars = document.querySelectorAll('#file-list .file-item progress');
                    const progressLabels = document.querySelectorAll('#file-list .file-item label');

                    // Fortschrittsanzeige update
                    progressBars[i].value = percentCompleted;
                    progressLabels[i].textContent = `${percentCompleted}%`;
                },
            });

            if (response.status === 204) {
                messageDiv.textContent = 'Upload erfolgreich!';
                messageDiv.style.color = 'var(--c-green)';
                fileInput.value = '';

                //SSE Handling
                // Optimierungsüberwachung mit EventSource (Server-Sent Events)
                const eventSource = new EventSource('http://localhost:5000/debug-kunde-1/progress');

                if (eventSource) {     
                    eventSource.onmessage = (event) => {

                        if (event.data === 'done') {
                            uploadStatusList.innerHTML += '<li>Optimization done</li>';
                            eventSource.close();
                        }

                        if (event.data === 'error') {
                            uploadStatusList.innerHTML += '<li class="error" >Optimization error</li>';
                            eventSource.close();
                        }                        
                    };
                }
            }
        }
    } catch (error) {
        console.error('Fehler beim Hochladen:', error);
        messageDiv.textContent = `Fehler beim Hochladen: ${error.message}`;
        messageDiv.style.color = 'var(--c-red)';
    }
});