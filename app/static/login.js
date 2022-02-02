document.addEventListener("submit", e => {
    e.preventDefault();

    postTo('/', {
        "username": el("#username").value,
        "password": el("#password").value
    })
    .then(response => {
        if (response.status == 200) return response.json();
    })
    .then(json => {
        if (json['Status'] == "SUCCESS") {
            window.location = "http://127.0.0.1:5000/calendar";
        } else if (json['Status'] == "FAILURE") {
            console.log("Invalid credentials.");
        }
    })

    console.log(e);
}, false)