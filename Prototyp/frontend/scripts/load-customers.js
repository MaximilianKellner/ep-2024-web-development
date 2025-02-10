// fill customer table with data from database
window.onload = function() {
    console.log('loading customers');

    fetch('/loadCustomers')
        .then(response => response.json())
        .then(data => {
            const customerTable = document.querySelector('.admin-table tbody');
            data.forEach(customer => {
                const row = document.createElement('tr');

                // farmat exp date and color code
                const expirationDate = customer.expiration_date ? new Date(customer.expiration_date).toLocaleDateString('de-DE') : 'N/A';
                const expirationDateObj = new Date(customer.expiration_date);
                const currentDate = new Date();
                const timeDiff = expirationDateObj - currentDate;
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                let dateClass = '';
                if (daysDiff <= 5) {
                    dateClass = 'red';
                } else if (daysDiff <= 30) {
                    dateClass = 'amber';
                }

                row.innerHTML = `
                    <td class="customer-row">
                        <!-- Favicon der Kundenseite -->
                        <img src="${customer.picture_url}" alt="Kundenbild" onerror="this.onerror=null;this.src='img/icon/user.svg';" />
                        <a href="#">${customer.name}</a>
                    </td>
                    <td>${customer.customer_id}</td>
                    <td class="${dateClass}">${expirationDate || 'N/A'}</td>
                    <td>${customer.credits}</td>
                    <td>
                        <button class="icon-btn delete-btn" title="Löschen">    
                            <img src="img/icon/delete.svg" alt="Löschen" />
                        </button>
                        <button class="icon-btn" title="Kontaktieren">
                            <img src="img/icon/mail.svg" alt="Kontaktieren" />
                        </button>
                        <button class="icon-btn" title="Bearbeiten">
                            <img src="img/icon/edit.svg" alt="Bearbeiten" />
                        </button>
                    </td>
                `;
                customerTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Kundendaten:', error);
        });
};