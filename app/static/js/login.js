document.addEventListener("submit", e => {
    e.preventDefault();

    postTo('/', {
        "email": el("#email").value,
        "password": el("#password").value
    })
    .then(response => {
        if (response.status == 200) return response.json();
    })
    .then(json => {
        if (json['Status'] == "SUCCESS") {
            window.location = "http://127.0.0.1:5000/calendar";
        } else if (json['Status'] == "FAILURE") {
            el("#error-text").innerHTML = "Invalid credentials, try again.";
        }
    })
}, false)