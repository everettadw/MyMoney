let navToggle = el("#nav-toggle");
let navBody = el("nav")

navToggle.addEventListener("click", e => {
    e.target.classList.toggle("open");
}, false);