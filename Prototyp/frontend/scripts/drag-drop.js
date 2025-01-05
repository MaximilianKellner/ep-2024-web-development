//-------- Drag and Drop  --------
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('file-list');
const messageDiv = document.getElementById('message');
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

        if (file.size > MAX_FILE_SIZE) {
            fileItem.style.border = '3px solid var(--c-red)';
            messageDiv.textContent = `Die farblich markierten Dateien überschreitet die maximale Größe von ${MAX_FILE_SIZE / 1024/1024} MB.`;
            messageDiv.style.color = 'red';

        }
        
        fileList.insertBefore(fileItem, fileList.firstChild); // Anhängen an den ANFANG der Liste
        allFiles.push(file); // Add file to allFiles array
    }
    updateFileInput(); // Update fileInput with allFiles array
    calculateCredits()
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
}