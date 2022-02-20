window.addEventListener("load", () => {
    let pageInputs = document.getElementsByTagName("input");
    Array.from(pageInputs).forEach(input => {
        if ( input.getAttribute("type") == "text" || input.getAttribute("type") == "password" ) {
            if ( input.value == "" ) input.classList.add("empty-evput");
            setTimeout(() => {
                input.parentNode.children[1].style.transition = "all .25s ease";
            }, 150);
            input.addEventListener("change", e => {
                if ( e.target.value == "" ) {
                    e.target.classList.add("empty-evput");
                } else {
                    e.target.classList.remove("empty-evput");
                }
            }, false);
        }
    });
});