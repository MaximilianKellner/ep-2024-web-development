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
    fetch(`/get-customer?id=${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Der Kunde mit der ID ${customerId} existiert noch nicht, kann aber erstellt werden.`);
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                customerIdField.textContent = `ID: ${customerId}`;

                document.getElementById('customerName').value = data.customerName || '';
                document.getElementById('email').value = data.email || '';

                // Formatieren des Ablaufdatums
                const expirationDate = new Date(data.expirationDate);
                const formattedDate = expirationDate.toISOString().split('T')[0];
                document.getElementById('expirationDate').value = formattedDate || '';

                document.getElementById('credits').value = data.credits || '';
                document.getElementById('imgUrl').value = data.imgUrl || '';
                document.getElementById('maxFileInKB').value = data.maxFileInKB || '';
                document.getElementById('maxWidthInPX').value = data.maxWidthInPX || '';
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
        formData.append('customerId', customerId); // Kunden-ID zum Datenobjekt hinzufügen
    }

    const method = customerId ? 'PUT' : 'POST';
    const url = customerId ? `/update-customer` : '/create-customer';

    const urlEncoded = new URLSearchParams(formData).toString();

    fetch(url, {
        method: method,
        body: urlEncoded,
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        }
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