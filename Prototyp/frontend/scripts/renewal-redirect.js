window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectStatus = urlParams.get('redirect');

    if (redirectStatus === 'true') {
        // Zeige das Popup an, weil der Nutzer über einen Redirect kam
        alert("Willkommen, Sie wurden über einen speziellen Link weitergeleitet!");
    }
};
