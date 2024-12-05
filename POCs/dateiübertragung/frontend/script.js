document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    const files = fileInput.files;

    //redundant wegen --> HTML "Required" tag
    if (files.length === 0) {
        messageDiv.textContent = 'Bitte mindestens eine Datei auswählen.';
        messageDiv.style.color = 'red';
        return;
    }

    //-------- Upload Limitationen --------

    if(files.length > 10) {
        messageDiv.textContent = 'Maximal 10 Dateien auswählen.';
        messageDiv.style.color = 'red';
        return;
    }

    const maxFileSize = 10 * 1024 * 1024; // 10 MB in Bytes

    for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxFileSize) {
            messageDiv.textContent = `Die Datei ${files[i].name} überschreitet die maximale Größe von 10 MB.`;
            messageDiv.style.color = 'red';
            return;
        }
    }

    //-------- Anfrage und Antwort --------

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        });

        const responseText = await response.text();

        if (response.ok) {
            messageDiv.textContent = responseText;
            messageDiv.style.color = 'green';
            fileInput.value = ''; // Eingabefeld zurücksetzen
        } else {
            messageDiv.textContent = `Fehler beim Hochladen: ${responseText}`;
            messageDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Detaillierter Fehler:', error);
        messageDiv.textContent = `Netzwerkfehler: ${error.message}`;
        messageDiv.style.color = 'red';
    }
});