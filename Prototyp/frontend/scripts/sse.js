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

    // Set Credit Banner if credits are not undefined and not null
    if (credits !== undefined && credits >= 0) {    
        document.getElementById('credits-current').textContent = `${credits} Credits`;
    }
    
    messageDiv.innerHTML = `${fileNameNoSuffix} status: ${status}`;
    loadOptimizedContent();
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

    loadOptimizedContent();
    self.console.log('Connection closed');
    eventSource.close();
});