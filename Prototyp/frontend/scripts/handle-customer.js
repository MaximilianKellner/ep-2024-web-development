/* --------------------- Handle Customer (create/edit)--------------------- */
const messageDiv = document.getElementById('message');
const form = document.getElementById('customerForm');
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get('id');
const customerIdField = document.getElementById('customerId');


messageDiv.style.margin = '0px';

//exp date > Current date
function checkExpirationDate() {
    const expirationDate = new Date(document.getElementById('expirationDate').value);
    const currentDate = new Date();

    if (expirationDate <= currentDate) {
        messageDiv.classList.add('error');
        messageDiv.innerHTML = 'Das Ablaufdatum muss in der Zukunft liegen.';
        return false;
    }
    return true;
}

// -------------------------------------- edit Customer --------------------------------------
if (customerId) {
    document.querySelector("h2").textContent = `Kunden bearbeiten`;
    document.querySelector("button[type='submit']").textContent = `Speichern`;
    loadCustomerData(customerId);
    // Kunden-ID-Feld anzeigen
    customerIdField.style.display = 'block';
} 

//Kundendaten für das Formular laden
function loadCustomerData(customerId) {
    fetch(`/getCustomer?id=${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Der Kunde mit der ID ${customerId} existiert noch nicht, kann aber erstellt werden.`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                customerIdField.textContent = `ID: ${customerId}`;

                document.getElementById('customerName').value = data.customer_name || '';
                document.getElementById('email').value = data.email || '';

                // Formatieren des Ablaufdatums
                const expirationDate = new Date(data.expiration_date);
                const formattedDate = expirationDate.toISOString().split('T')[0];
                document.getElementById('expirationDate').value = formattedDate || '';

                document.getElementById('credits').value = data.credits || '';
                document.getElementById('pictureUrl').value = data.img_url || '';
                document.getElementById('maxFileInKB').value = data.max_file_size_kb || '';
                document.getElementById('maxWidthInPX').value = data.max_file_width_px || '';
            }
        })
        .catch(error => {
            console.error("Fehler beim Laden des Kunden:", error);
            messageDiv.classList.add('error');
            messageDiv.innerHTML = error.message;
        });
}

//Formular absenden
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (!checkExpirationDate()) return;

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => data[key] = value);

    if (customerId) {
        data.id = customerId; // Kunden-ID zum Datenobjekt hinzufügen
    }

    const method = customerId ? 'PUT' : 'POST';
    const url = customerId ? `/updateCustomer` : '/createCustomer';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            messageDiv.classList.remove('error');
            messageDiv.innerHTML = customerId ? 'Kunde erfolgreich aktualisiert.' : 'Kunde erfolgreich erstellt.';
            if (!customerId) form.reset();
            window.location.href = '/admin-panel';
        } else {
            return response.text().then(err => { throw new Error(err); });
        }
    })
    .catch(error => {
        messageDiv.classList.add('error');
        messageDiv.innerHTML = 'Fehler: ' + error.message;
    });
});