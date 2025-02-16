const loginButton = document.querySelector('.loginButton');
const logoutButton = document.querySelector('.logoutButton');

loginButton.addEventListener("click", () => {
    let username = document.querySelector(".username").value;
    let password = document.querySelector(".password").value;

    fetch("http://localhost:4050/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login Response:', data);
        
        if(data.accessToken && data.refreshToken) {
            // Speichere die Tokens im localStorage
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            console.log('Access Token:', data.accessToken);
            console.log('Refresh Token:', data.refreshToken);
            
            // Weiterleitung zum Dashboard
            window.location.href = "http://localhost:5500/Prototyp/frontend/admin-panel.html";
        } else {
            alert("Login failed - No tokens received");
        }
    })
    .catch(error => {
        console.error('Login Error:', error);
        alert("Login failed");
    });
});

//Wenn auf login geklickt wird soll 