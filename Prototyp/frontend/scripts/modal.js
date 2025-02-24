document.addEventListener("DOMContentLoaded", (event) => {
  const modal = document.getElementById("deleteModal");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  cancelDelete.onclick = function () {
    modal.style.display = "none";
  };

  confirmDelete.onclick = function () {
    if (window.customerIdToDelete) {
      fetch(`/customers/${window.customerIdToDelete}/delete`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          location.reload(); // reload page
        } else {
          console.error('Fehler beim Löschen des Kunden');
        }
      })
      .catch(error => {
        console.error('Fehler beim Löschen des Kunden:', error);
      });
    }
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});