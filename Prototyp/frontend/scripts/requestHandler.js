const loginButton = document.querySelector(".login-button");
const messageObject = document.querySelector("#message");

const admins = [
    {name : "admin", password : "admin1"}
]

if(loginButton){
    loginButton.addEventListener("click", () => {
        let username = document.querySelector(".username").value;
        let password = document.querySelector(".password").value;
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        console.log('Username:', username);
        console.log('Password:', password);
        for(let i = 0; i < admins.length; i++){
            if(username === admins[i].name && password === admins[i].password){
                console.log("Login successful");
                fetch("http://localhost:5000/login", {
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
                            // console.log('Login Response:', data);
                            // console.log(data.accessToken);
                            // console.log(data.refreshToken);
                            
                            console.log('Received Token:', data.accessToken);
                            if(data.accessToken && data.refreshToken) {
                                // Speichere die Tokens im localStorage
                                localStorage.setItem('accessToken', data.accessToken);
                                localStorage.setItem('refreshToken', data.refreshToken);
                                console.log('Access Token nach Login: '+localStorage.getItem('accessToken'));
                                // Weiterleitung zum admin-panel
                                window.location.href = "http://127.0.0.1:5000/admin-panel.html";
                            } else {
                                messageObject.innerHTML = "Login failed due to wrong Tokens. Try again or reach out to the administrator!";
                                messageObject.style="color:red";
                            }
                        })
                        .catch(error => {
                            messageObject.innerHTML = "Login failed. Please try again!";
                            messageObject.style="color:red";
                        });  
            }
            else{
                messageObject.innerHTML = "Login failed due to wrong credentials. Please try again!";
                messageObject.style="color:red";
            }
        }
    });
}