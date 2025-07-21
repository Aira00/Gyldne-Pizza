const REDIRECTPATH = "/sales.html";

/*Checks if user is already logged in*/
if (backend.user.username !== null) {
    redirectTo(REDIRECTPATH);
}

/*Login function*/
function login(e) {
    e.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (username.trim() !== "" && password.trim() !== "") {
        backend.user.username = username;
        saveBackend();
        redirectTo(REDIRECTPATH);
    } else {
        alert(ALERT.danger, "Ugyldig brukernavn eller passord!");
    }
}