//-------- Drag and Drop  --------
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
const messageDiv = document.getElementById('message');


//-------- Highlight  --------

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

// -------- add files  --------

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    console.log("drop event");
    
    const validFiles = checkFileType(files);

    handleFiles(validFiles);
}

fileInput.addEventListener('change', function(e) {
    console.log("file selector event");
    const validFiles = checkFileType(this.files);
    handleFiles(validFiles);
});

function handleFiles(files) {

    if (files.length > 10) {
        messageDiv.textContent = 'Maximal 10 Dateien auswählen.';
        messageDiv.style.color = 'red';
        return;
    }
    
    const maxFileSize = 10 * 1024 * 1024; // 10 MB
    for (let file of files) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
    
        const reader = new FileReader();
        reader.onload = function(e) {
            fileItem.innerHTML = `
            <button class="remove-button" onclick="removeFile(this)">✕</button>
            <img src="${e.target.result}" alt="File preview" class="file-preview" title="${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)" />
        `;
        };
        reader.readAsDataURL(file);
        
        if (file.size > maxFileSize) {
            fileItem.style.color = 'red';
            fileItem.textContent += ' - Datei zu groß (max. 10 MB)';
        }
        
        fileList.insertBefore(fileItem, fileList.firstChild); // Anhängen an den Anfang der Liste
    }
}

    //-------- check file type (.jpg, jpeg, png) and remove unallowed file--------

    function checkFileType(files) {
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const validFiles = [];
    
        for (let i = 0; i < files.length; i++) {
            if (allowedFileTypes.includes(files[i].type)) {
                validFiles.push(files[i]);
            } else {
                messageDiv.textContent = `Mindestens  Datei hat ein unerlaubtes Format und wurde entfernt. Bitte nur .jpg, .jpeg oder .png Dateien hochladen.`;
                messageDiv.style.color = 'red';
                console.log(files[i]);
            }
        }
        return validFiles;
    }