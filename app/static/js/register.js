document.addEventListener("submit", e => {
    e.preventDefault();

    postTo('/register', {
        "first_name": el("#first-name").value,
        "last_name": el("#last-name").value,
        "email": el("#email").value,
        "username": el("#username").value,
        "password": el("#password").value,
        "password_confirm": el("#confirm-password").value
    })
    .then(response => {
        if (response.status == 200) return response.json();
        return response;
    })
    .then(json => {
        if (json['Status'] == "SUCCESS") {
            window.location = "http://127.0.0.1:5000/";
        } else if (json['Status'] == "FAILURE") {
            el("#error-text").innerHTML = json["Error"];
        }
    })
}, false)