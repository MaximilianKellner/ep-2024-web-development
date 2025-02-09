//-------- Drag and Drop  --------
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
const messageDiv = document.getElementById('message');
const uploadCard = document.querySelector('.card');
let allFiles = []; // Array to store all files

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

//Drag and Drop Event
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    const validFiles = checkFileType(files);
    handleFiles(validFiles);
}

//File selection Event
fileInput.addEventListener('change', function(e) {
    const validFiles = checkFileType(this.files);
    handleFiles(validFiles);
});

function handleFiles(files) {

    if (files.length > MAX_FILE_COUNT) {
        messageDiv.textContent = `Maximal ${MAX_FILE_COUNT} Dateien auswählen.`;
        messageDiv.classList.add('error');
        return;
    }
    
    for (let file of files) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
    
        const reader = new FileReader();
        reader.onload = function(e) {
            fileItem.innerHTML = `
            <button class="remove-button" onclick="removeFile(this)">✕</button>

            <div class="progress-bar-container blur hidden">
                  <label for="progress-circle" class="circle-label">0%</label>
                  <svg id="progress-circle" width="50" height="50" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" stroke="#010015" stroke-width="2" fill="none"/>
                      <circle cx="50" cy="50" r="45" stroke="#c0d8ff" stroke-width="8" fill="none" stroke-dasharray="282.6" stroke-dashoffset="282.6"/>
                  </svg>
                  </div>

            <img class="file-preview" src="${e.target.result}" alt="File preview" title="${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)" />
            
        `;
        };
        reader.readAsDataURL(file);

        if (file.size > MAX_FILE_SIZE) {
            fileItem.style.border = '3px solid var(--c-red)';
            messageDiv.textContent = `Die farblich markierten Dateien überschreitet die maximale Größe von ${MAX_FILE_SIZE / 1024/1024} MB.`;
            messageDiv.classList.add('error');

        }
        
        fileList.insertBefore(fileItem, fileList.firstChild); // Anhängen an den ANFANG der Liste
        allFiles.push(file); // Add file to allFiles array
    }
    updateFileInput(); // Update fileInput with allFiles array
    calculateCredits()
}

//-------- check file type (.jpg, jpeg, png) and remove unallowed file--------

function checkFileType(files) {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg, image/svg+xml'];
    const validFiles = [];
    
    for (let i = 0; i < files.length; i++) {
        if (allowedFileTypes.includes(files[i].type)) {
            validFiles.push(files[i]);
        } else {
            messageDiv.textContent = `Mindestens eine Datei hat ein unerlaubtes Format und wurde entfernt. Bitte nur .jpg, .jpeg oder .png Dateien hochladen.`;
            messageDiv.classList.add('error');
            console.log(files[i]);
        }
    }
    return validFiles;
}

//-------- remove file  --------
function removeFile(button) {
    var fileItem = button.parentElement;
    const fileName = fileItem.querySelector('.file-preview').title.split(' ')[0];
    allFiles = allFiles.filter(file => file.name !== fileName); // Remove file from allFiles array
    fileItem.remove();
    updateFileInput(); // Update fileInput with allFiles array
    calculateCredits()
}

//-------- reset files  --------
function resetFiles() {
    fileList.innerHTML = '';
    allFiles = []; // Clear allFiles array
    fileInput.value = '';
    messageDiv.textContent = '';
    
    calculateCredits()

}

//-------- update file input --------
function updateFileInput() {
    const dataTransfer = new DataTransfer();
    allFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
}

//-------- calculate credits --------
//1 file = 1 credit

function calculateCredits() {
    let costCounter = document.querySelector('.credits');
    const credits = fileList.children.length;
    costCounter.textContent = `-${credits} cp`;

    if (credits > 0) {
        uploadCard.style.opacity = 1;
    } else {
        uploadCard.style.opacity = 0;
    }
}