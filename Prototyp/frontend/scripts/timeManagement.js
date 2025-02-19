const logoutButton = document.querySelector('.logoutButton');


//Abfangen des Requests um auf diese Seite zu gelangen
   document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken) {
        window.location.href = '/login.html';
        return;
    }

// Token-Ablaufzeit überprüfen und ggf. setzen
if (!localStorage.getItem('tokenExpiry')) {
    const decodedToken = parseJwt(accessToken);
    localStorage.setItem('tokenExpiry', decodedToken.exp * 1000);
}

// Token-Gültigkeit überprüfen und ggf. erneuern
checkAndRefreshToken();
    
    // Verify token with server
    fetch('http://localhost:5000/verify-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status !== 200) {
            // If token is invalid, try refreshing
            if (refreshToken) {
                return fetch('http://localhost:5000/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                }).then(refreshResponse => {
                    if (refreshResponse.ok) {
                        return refreshResponse.json();
                    } else {
                        throw new Error('Failed to refresh token');
                    }
                }).then(data => {
                    // Store new access token
                    localStorage.setItem('accessToken', data.accessToken);
                    // Reload page to retry with new token
                    window.location.reload();
                }).catch(error => {
                    // If refresh fails, redirect to login
                    console.error('Token refresh failed:', error);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login.html';
                });
            } else {
                // No refresh token available, redirect to login
                localStorage.removeItem('accessToken');
                window.location.href = '/login.html';
            }
        }
    })
    .catch(error => {
        console.error('Error verifying token:', error);
        window.location.href = '/login.html';
    });
});

if(logoutButton){
    logoutButton.addEventListener('click', () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');
        
        console.log('Logout button clicked');
        
        // Only proceed if we have an access token
        if (!accessToken) {
            alert('No active session found');
            window.location.href = '/index.html';
            return;
        }
        
        // Send logout request to server
        fetch('http://localhost:5000/logout', {
            method: 'DELETE',  // Note the method is DELETE as per your server endpoint
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ token: refreshToken })  // Send refreshToken to be removed
        })
        .then(response => {
        console.log('Im response angekommen')
            if (response.status === 204) {
                // Clear tokens from localStorage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('password');
                // Könnte man schöner designen
                alert('Benutzer wurde abgemeldet und Access Token erfolgreich gelöscht');
                window.location.href = '/login.html';
            } else {
                throw new Error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
            alert('Es gab ein Problem beim Abmelden');
        });
    });
}


// Token dekodieren (ohne Signaturprüfung)
function parseJwt(token) {
const base64Url = token.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
}).join(''));

return JSON.parse(jsonPayload);
}

// Funktion zur proaktiven Überprüfung und Erneuerung des Tokens
function checkAndRefreshToken() {
const tokenExpiry = localStorage.getItem('tokenExpiry');
const refreshToken = localStorage.getItem('refreshToken');

if (!tokenExpiry || !refreshToken) return;

const currentTime = Date.now();
console.log('Token-Ablaufzeit:', tokenExpiry);
console.log('Aktuelle Zeit:', currentTime);
console.log('Zeit bis Ablauf:', tokenExpiry - currentTime);
const timeUntilExpiry = tokenExpiry - currentTime;

// Token erneuern, wenn er in weniger als 5 Sekunden abläuft
// if (timeUntilExpiry < 5000) {
//     console.log('Token läuft bald ab, erneuere...');
//     // Token-Erneuerung anfordern
//     fetch('http://localhost:5000/token', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ token: refreshToken })
//     })
//     .then(response => {
//         if (response.ok) return response.json();
//         throw new Error('Fehler beim Token-Refresh');
//     })
//     .then(data => {
//         // Neuen Token speichern
//         localStorage.setItem('accessToken', data.accessToken);
        
//         // Neuen Ablaufzeitpunkt berechnen und speichern
//         const decodedToken = parseJwt(data.accessToken);
//         localStorage.setItem('tokenExpiry', decodedToken.exp * 1000);
        
//         console.log('Token erfolgreich erneuert');
//     })
//     .catch(error => {
//         console.error('Token-Refresh fehlgeschlagen:', error);
//         // Bei Fehler zur Login-Seite umleiten
//         window.location.href = '/login.html';
//     });
// }
//Wenn die Zeit abgelaufen werden ist, wird der Token gelöscht und man wird zur login Seite weitergeleitet
if (timeUntilExpiry < 100) {
    console.log('Token ist abgelaufen, lösche...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    window.location.href = '/login.html';
}
}

// Die Prüfung regelmäßig durchführen (alle 2 Sekunden)
const intervalId = setInterval(checkAndRefreshToken, 1000);

// Intervall stoppen, wenn die Seite verlassen wird
window.addEventListener('beforeunload', () => {
clearInterval(intervalId);
});

