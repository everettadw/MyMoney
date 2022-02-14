let navToggle = el("#nav-toggle");
let navBody = el("nav")
let contentBody = el("#content");

navToggle.addEventListener("click", e => {
    e.target.classList.toggle("open");
    contentBody.classList.toggle("blurred");
}, false);