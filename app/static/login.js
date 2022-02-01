document.addEventListener("submit", e => {
    e.preventDefault();

    postTo('/login', {
        "testing": el("#testing").value
    })
    .then(response => {
        console.log(response);
    })

    console.log(e);
}, false)