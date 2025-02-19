const loginButton = document.querySelector(".login-button");

const admins = [
    {name : "max", password : "max1"},
    {name : "olli", password : "olli1"},
    {name : "yassin", password : "yassin1"}
]

if(loginButton){
    loginButton.addEventListener("click", () => {
        let username = document.querySelector(".username").value;
        let password = document.querySelector(".password").value;
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        console.log('Username:', username);
        console.log('Password:', password);

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
            
            if(data.accessToken && data.refreshToken) {
                for (let i = 0; i < admins.length; i++) {
                    if (admins[i].name === username && admins[i].password === password) {
                        // Speichere die Tokens im localStorage
                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);
                        console.log('Access Token nach Login: '+localStorage.getItem('accessToken'));
                        
                        
                        // Weiterleitung zum Dashboard
                        window.location.href = "http://127.0.0.1:5000/admin-panel.html";
                    }
                    else{
                        console.log("Login failed, due to wrong credentials");
                    }
                }
                
            } else {
                alert("Login failed - No tokens received");
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
            alert("Login failed");
        });
    });
}


