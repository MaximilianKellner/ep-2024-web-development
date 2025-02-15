const messageDiv = document.getElementById('message');

//exp date > Current date
function checkExpirationDate() {
    const expirationDate = new Date(document.getElementById('expirationDate').value);
    const currentDate = new Date();

    if (expirationDate <= currentDate) {
        messageDiv.classList.add('error');
        messageDiv.style.margin = '0px';
        messageDiv.innerHTML = 'Das Ablaufdatum muss in der Zukunft liegen.';
        return false;
    }
    return true;
}

// create customer fill Json, send Json. (Json ist effizienter als FormData wenn man keine Dateien hochladen will.) 
document.getElementById('createCustomerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (!checkExpirationDate()) {
        return;
    }

    event.preventDefault();

    const form = document.getElementById('createCustomerForm');
    const formData = new FormData(form);

    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    //log json file 
    console.log('Data:', data);

    fetch('/createCustomer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            messageDiv.classList.remove('error');
            messageDiv.innerHTML = 'Kunde erfolgreich erstellt.';
            form.reset();
        } else {
            return response.text().then(err => { throw new Error(err); });
        }
    })
    .catch(error => {
        messageDiv.classList.add('error');
        console.error("Error creating customer:", error);
        messageDiv.innerHTML = 'Kunde konnte nicht erstellt werden: ' + error.message;
    });
});
