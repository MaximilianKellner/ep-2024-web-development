const linkToken = window.location.pathname.replace("/", ""); // Entfernt das "/"
console.log("Aktueller linkToken create image:", linkToken);
let source = new EventSource(`/${linkToken}/progress`);
const uploadStatusList = document.querySelector('.upload-status-list');


source.addEventListener('open', (event) => {
    self.console.log(`connection to '${source.url}' established`);
});

source.addEventListener('active', (event) => {
    self.console.log(`Active SSE: `, event.data);
});

source.addEventListener('message', (event) => {
    const credits = JSON.parse(event.data).credits;
    const fileName = JSON.parse(event.data).fileName;
    const fileNameNoSuffix = getFileNameWithoutSuffix(fileName);
    const status = JSON.parse(event.data).status;

    self.console.log("Message: ", event.data);

    // Set Credit Banner
    if (credits >= 0) {
        document.getElementById('credits-current').textContent = `${credits} Credits`;
    } else {
        document.getElementById('credits-current').textContent = `-1 Credits`;
    }

    messageDiv.innerHTML = `${fileNameNoSuffix} status: ${status}`;
    loadOptimizedTable();
});

source.addEventListener('complete', (event) => {
    const fileName = JSON.parse(event.data).fileName;
    const fileNameNoSuffix = removeSuffix(fileName);
    uploadStatusList.innerHTML += `<li>${fileNameNoSuffix} optimiert</li>`;
});

source.addEventListener('error', (event) => {
    const fileName = JSON.parse(event.data).fileName;
    const fileNameNoSuffix = getFileNameWithoutSuffix(fileName);
    self.console.error("received an error: ", event);
    uploadStatusList.innerHTML += `<li class="error">${fileNameNoSuffix} error</li>`;
});

source.addEventListener('close', (event) => {
    messageDiv.textContent = 'Vorgang abgeschlossen';
    messageDiv.classList.remove('error');

    loadOptimizedTable();
    self.console.log('Connection closed');
    eventSource.close();
});