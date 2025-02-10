document.addEventListener("DOMContentLoaded", (event) => {
  const modal = document.getElementById("deleteModal");
  const btns = document.querySelectorAll(".delete-btn");
  const confirmDelete = document.getElementById("confirmDelete");
  const cancelDelete = document.getElementById("cancelDelete");

  btns.forEach((btn) => {
    btn.onclick = function () {
      modal.style.display = "block";
    };
  });

  cancelDelete.onclick = function () {
    modal.style.display = "none";
  };

  confirmDelete.onclick = function () {
    console.log("Eintrag löschen");
    // TODO löschschvorgang
    modal.style.display = "none";
  };

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});
