let sortOrder = 1; // 1 aufsteigend, -1 absteigend
let currentColumn = -1;

function sortTable(columnIndex, tableId = "image-table") {
  
  const table = document.querySelector(`#${tableId}`);
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.rows); // Nur tbody

  // rm Sortierindikatoren
  if (currentColumn !== -1) {
    const previousTh = table.querySelector(`th:nth-child(${currentColumn + 1})`);
    previousTh.innerHTML = previousTh.innerHTML.replace(/ ▴| ▾/, '');
  }

  const sortedRows = rows.sort((a, b) => {
    let cellA = a.cells[columnIndex].querySelector('.customer-row p')?.innerText.toLowerCase() || a.cells[columnIndex].innerText.toLowerCase();
    let cellB = b.cells[columnIndex].querySelector('.customer-row p')?.innerText.toLowerCase() || b.cells[columnIndex].innerText.toLowerCase();

    // Versuche, die Zellenwerte als Zahlen zu behandeln
    const numA = parseFloat(cellA.replace(/,/g, ''));
    const numB = parseFloat(cellB.replace(/,/g, ''));

    if (!isNaN(numA) && !isNaN(numB)) {
      // Als Zahlen
      return (numA - numB) * sortOrder;
    } else {
      // als Strings
      if (cellA < cellB) {
        return -1 * sortOrder;
      }
      if (cellA > cellB) {
        return 1 * sortOrder;
      }
      return 0;
    }
  });

  // tbody leeren
  while (tbody.rows.length > 0) {
    tbody.deleteRow(0);
  }

  // tbody füllen
  sortedRows.forEach(row => tbody.appendChild(row));

  // Sortierindikator
  const th = table.querySelector(`th:nth-child(${columnIndex + 1})`);
  th.innerHTML += sortOrder === 1 ? ' ▴' : ' ▾';

  sortOrder *= -1;
  currentColumn = columnIndex;
}