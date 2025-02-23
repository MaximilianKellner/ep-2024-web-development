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
    const a = decodedToken.exp * 1000;
    localStorage.setItem('tokenExpiry', decodedToken.exp * 1000);
}

// Token-Gültigkeit überprüfen und ggf. erneuern
checkAndRefreshToken();
    
    // Token verifizieren
    fetch('/verify-token', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (response.status !== 200) {
            // If token is invalid, try refreshing
            if (refreshToken) {
                return fetch('/token', {
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
    console.log('Logout Button gefunden');
    logoutButton.addEventListener("click", event => {
        console.log('Logout Button wurde geklickt');
        event.preventDefault();
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        // Nur weitermachen wenn Access Token vorhanden ist
        if (!accessToken) {
            alert('No active session found');
            window.location.href = '/index.html';
            return;
        }
        
        // Logout Request an Server senden
        fetch('/logout', {
            method: 'DELETE', 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ token: refreshToken })  // Refresh Token soll gelöscht werden
        })
        .then(response => {
            if (response.status === 204) {
                // Beim Logout sollen alle Tokens aus dem Local Storage gelöscht werden
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('password');
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

// Token dekodieren um Zeitangabe für seine Gültigkeit zu erhalten
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}



function checkAndRefreshToken() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const decodedToken = parseJwt(accessToken);
    const expiryTime = decodedToken.exp * 1000; // Konvertiere zu Millisekunden
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;

    console.log('Aktuelle Zeit in ms:', currentTime);
    console.log('Ablaufzeit des Tokens in ms:', expiryTime);
    console.log('Zeit bis Rauswurf in ms:', timeUntilExpiry);

    // Wenn weniger als 2 Sekunden übrig sind oder Token abgelaufen ist
    if (timeUntilExpiry < 2000) {
        console.log('Token läuft ab oder ist abgelaufen');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
            // Versuche Token zu erneuern
            fetch('/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: refreshToken })
            })
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Token refresh failed');
            })
            .then(data => {
                localStorage.setItem('accessToken', data.accessToken);
                console.log('Token erfolgreich erneuert');
            })
            .catch(error => {
                console.error('Token refresh failed:', error);
                localStorage.clear();
                window.location.href = '/login.html';
            });
        } else {
            console.log('Kein Refresh Token vorhanden, leite um...');
        }
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

const intervalId = setInterval(checkAndRefreshToken, 2000);

// Intervall stoppen, wenn die Seite verlassen wird
window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
});