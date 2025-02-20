const loginButton = document.getElementById("login-button");
const messageObject = document.querySelector("#message");

if(loginButton){
    loginButton.addEventListener("click", event => {
        event.preventDefault();
        let username = document.querySelector(".username").value;
        let password = document.querySelector(".password").value;
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        console.log('Username: '+username);

        fetch("/login", {
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
            if(data.accessToken && data.refreshToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                console.log('Access Token nach Login: '+localStorage.getItem('accessToken'));
                window.location.href = "/admin-panel.html";
            } else {
                messageObject.innerHTML = "Login fehlgeschlagen, auf Grund von internem Fehler. Bitte melden Sie sich bei einem Administrator!";
                messageObject.style="color:red";
            }
        })
        .catch(error => {
            ('Error:', error);
            messageObject.innerHTML = "Login fehlgeschlagen, auf Grund von fehlerhaftem Benutzernamen/Passwort!";
            messageObject.style="color:red";
        });
    });
}