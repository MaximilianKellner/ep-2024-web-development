document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const messageDiv = document.getElementById('message');
    const files = fileInput.files;

    //redundant wg HTML Required
    if (files.length === 0) {
        messageDiv.textContent = 'Bitte mindestens eine Datei auswählen.';
        messageDiv.style.color = 'red';
        return;
    }

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