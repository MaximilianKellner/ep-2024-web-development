// Search functionality
const searchInput = document.getElementById("search");
const customerTable = document.querySelector('.admin-table tbody');

searchInput.addEventListener("input", function () {

  const searchTerm = searchInput.value.toLowerCase();
  const rows = customerTable.querySelectorAll("tr");
  rows.forEach((row) => {
    const customerName = row
      .querySelector(".customer-row p")
      .textContent.toLowerCase();
    if (customerName.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});
