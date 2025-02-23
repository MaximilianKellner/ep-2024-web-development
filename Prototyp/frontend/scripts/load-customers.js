// fill customer table with data from database
window.onload = function() {

    fetch('/load-customers')
        .then(response => response.json())
        .then(data => {
            const customerTable = document.querySelector('.admin-table tbody');
            data.customers.forEach(customer => {

                const row = document.createElement('tr');
                
                // farmat exp date and color code
                const expirationDate = customer.expirationDate ? new Date(customer.expirationDate).toLocaleDateString('de-DE') : 'N/A';
                const expirationDateObj = new Date(customer.expirationDate );
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
                <td>
                    <div class="customer-row">
                        <img src="${customer.imgUrl}" alt="Kundenbild" onerror="this.onerror=null;this.src='img/icon/user.svg';" />
                        <p>${customer.customerName}</p>
                    </div>
                    </td>
                    <td>${customer.linkToken}</td>
                    <td>${customer.customerId}</td>
                    <td class="${dateClass}">${expirationDate || 'N/A'}</td>
                    <td>${customer.credits}</td>
                    <td>
                        <button class="icon-btn delete-btn" title="Löschen">    
                            <img src="img/icon/delete.svg" alt="Löschen" />
                        </button>
                        <button class="icon-btn" title="E-Mail an ${customer.email}" onclick="location.href='mailto:${customer.email}'">
                            <img src="img/icon/mail.svg" alt="Kontaktieren" />
                        </button>
                        <button class="icon-btn" title="Bearbeiten" onclick="location.href='/update-customer?id=${customer.customerId}'">
                            <img src="img/icon/edit.svg" alt="Bearbeiten" />
                        </button>
                    </td>
                `;
                customerTable.appendChild(row);
            });

            // Reinitialize delete buttons after loading customers
            const modal = document.getElementById("deleteModal");
            const btns = document.querySelectorAll(".delete-btn");
            btns.forEach((btn) => {
                btn.onclick = function () {
                    window.customerIdToDelete = this.closest('tr').querySelector('td:nth-child(3)').textContent;
                    modal.style.display = "block";
                };
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Kundendaten:', error);
        });
};