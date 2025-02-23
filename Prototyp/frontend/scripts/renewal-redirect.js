window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const isRenewalRedirect = urlParams.get('action');

    if (isRenewalRedirect==='redirect') {
        // Zeige das Popup an, weil der Nutzer über einen Redirect kam
        alert("Ihr Zugang wurde um 30 Tage verlängert.");
    }
};
