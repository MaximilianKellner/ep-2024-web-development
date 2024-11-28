document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Bitte eine Datei auswählen.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            document.getElementById('message').textContent = 'Datei erfolgreich hochgeladen!';
        } else {
            document.getElementById('message').textContent = 'Fehler beim Hochladen.';
            document.getElementById('message').style.color = 'red';
        }
    } catch (error) {
        console.error('Fehler:', error);
        document.getElementById('message').textContent = 'Fehler beim Hochladen.';
    }
});
