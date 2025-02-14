const messageDiv = document.getElementById('message');

//exp date > Current date
document.getElementById('createCustomerForm').addEventListener('submit', function(event) {
    const expirationDate = new Date(document.getElementById('expirationDate').value);
    const currentDate = new Date();

    if (expirationDate <= currentDate) {
        messageDiv.classList.add('error');
        messageDiv.style.margin = '0px';
        messageDiv.innerHTML = 'Das Ablaufdatum muss in der Zukunft liegen.';
        event.preventDefault();
    }
});

// create customer
document.getElementById('createCustomerForm').addEventListener('submit', function(event) {
    const form = document.getElementById('createCustomerForm');
    const formData = new FormData(form);

    fetch('/createCustomers', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            messageDiv.classList.remove('error');
            messageDiv.innerHTML = 'Kunde erfolgreich erstellt.';
            form.reset();
        } else {
            messageDiv.classList.add('error');
            messageDiv.innerHTML = 'Kunde konnte nicht erstellt werden.';
        }
    })
    .catch(error => {
        messageDiv.classList.add('error');
        messageDiv.innerHTML = 'Kunde konnte nicht erstellt werden.';
    });

    event.preventDefault();
});