const logoutButton = document.querySelector('.logoutButton');

const twentyFiveMinutes = 1000 * 60 * 25;

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
    logoutButton.addEventListener('click', () => {
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
    const tokenExpiry = parseInt(localStorage.getItem('tokenExpiry')); // Parse Zeit zu einem Integer
    const refreshToken = localStorage.getItem('refreshToken');

    if (!tokenExpiry || !refreshToken) return;

    const currentTime = Date.now();
    const timeUntilExpiry = tokenExpiry - currentTime;

    if (timeUntilExpiry < 0) {
        console.log('Token ist abgelaufen, lösche...');
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

const intervalId = setInterval(checkAndRefreshToken, twentyFiveMinutes);

// Intervall stoppen, wenn die Seite verlassen wird
window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
});