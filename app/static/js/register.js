document.addEventListener("submit", e => {
    e.preventDefault();

    postTo('/register', {
        "first_name": el("#first-name").value,
        "last_name": el("#last-name").value,
        "email": el("#email").value,
        "password": el("#password").value,
        "password_confirm": el("#confirm-password").value
    })
    .then(response => {
        if (response.status == 200) return response.json();
        console.log(response.status);
    })
    .then(json => {
        if (json['Status'] == "SUCCESS") {
            window.location = "http://127.0.0.1:5000/";
        } else if (json['Status'] == "FAILURE") {
            if ( el("#form-errors").classList.contains("error-present") ) {
                if ( json['Error'] == el("#error-text").innerHTML ) {
                    el("#error-text").classList.add("shaking");
                    setTimeout(() => { el("#error-text").classList.remove("shaking"); }, 500);
                } else {
                    el("#error-text").classList.add("changing");
                    setTimeout(() => {
                        el("#error-text").innerHTML = json['Error'];
                    }, 200);
                    setTimeout(() => {
                        el("#error-text").classList.remove("changing");
                    }, 500);
                }
            } else {
                el("#form-errors").classList.add("error-present");
                el("#error-text").innerHTML = json['Error'];
            }
        }
    })
}, false)