//-------- Drag and Drop  --------
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    handleFiles(files);
}

fileInput.addEventListener('change', function(e) {
    handleFiles(this.files);
});

function handleFiles(files) {
    const messageDiv = document.getElementById('message');
    
    if (files.length > 10) {
        messageDiv.textContent = 'Maximal 10 Dateien auswählen.';
        messageDiv.style.color = 'red';
        return;
    }
    
    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    for (let file of files) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        
        if (file.size > maxFileSize) {
            fileItem.style.color = 'red';
            fileItem.textContent += ' - Datei zu groß';
        }
        
        fileList.appendChild(fileItem);
    }
    
    fileInput.files = files;
}