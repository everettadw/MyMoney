class Modal {

    #modalContainer;
    #modalClose;
    #modalEl;
    #isOpen;
    #ready = false;
    #width;
    #height;

    constructor(modalContainer, width, height) {
        this.#modalContainer = modalContainer;
        this.#modalEl = document.createElement("div");
        this.#modalClose = document.createElement("div");
        this.#modalContainer.appendChild(this.#modalEl);
        this.#modalEl.appendChild(this.#modalClose);
        this.#width = width;
        this.#height = height;
        
        this.#modalContainer.style.opacity = "0";
        this.#modalContainer.style.width = "100vw";
        this.#modalContainer.style.height = "100vh";
        this.#modalContainer.style.position = "fixed";
        this.#modalContainer.style.display = "none";
        this.#modalContainer.style.pointerEvents = "none";
        this.#modalContainer.style.left = "0";
        this.#modalContainer.style.top = "0";
        this.#modalContainer.style.zIndex = "989";
        this.#modalContainer.style.justifyContent = "center";
        this.#modalContainer.style.alignItems = "center";
        this.#modalContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        this.#modalContainer.style.transition = "opacity .3s ease";

        this.#modalEl.setAttribute("id", "modal-element");
        this.#modalEl.style.transform = "scale(0.85)";
        this.#modalEl.style.width = width;
        this.#modalEl.style.height = height;
        this.#modalEl.style.backgroundColor = "white";
        this.#modalEl.style.zIndex = "999";
        this.#modalEl.style.padding = "25px";
        this.#modalEl.style.position = "relative";
        this.#modalEl.style.transition = "transform .3s ease";

        this.#modalClose.setAttribute("id", "modal-close");
        this.#modalClose.innerHTML = "+";
        this.#modalClose.style.position = "fixed";
        this.#modalClose.style.transform = "rotate(45deg) scale(0.8)";
        this.#modalClose.style.transformOrigin = "center center";
        this.#modalClose.style.transition = "transform .25s cubic-bezier(0.311, 0.441, 0.444, 1.649)";
        this.#modalClose.style.fontWeight = "bold";
        this.#modalClose.style.fontSize = "36px";
        this.#modalClose.style.top = "20px";
        this.#modalClose.style.right = "20px";
        this.#modalClose.style.width = "40px";
        this.#modalClose.style.height = "40px";
        this.#modalClose.style.color = "red";
        this.#modalClose.style.display = "flex";
        this.#modalClose.style.justifyContent = "center";
        this.#modalClose.style.alignItems = "center";
        this.#modalClose.style.zIndex = "10";
        this.#modalClose.style.cursor = "pointer";
        this.#modalClose.addEventListener("click", e => {
            this.hide();
        }, false);
        this.#modalClose.addEventListener("mouseover", e => {
            this.#modalClose.style.transform = "rotate(45deg) scale(1.1)";
        }, false);
        this.#modalClose.addEventListener("mouseleave", e => {
            this.#modalClose.style.transform = "rotate(45deg) scale(0.8)";
        }, false);

        setTimeout(() => {
            this.#modalContainer.style.display = "flex";
            this.#ready = true;
            this.#isOpen = false;
        }, 100);
    }

    content(...elements) {
        elements.forEach(element => {
            if ( element == null ) return;
            this.#modalEl.appendChild(element);
        });
    }
    clear() {
        Array.from(this.#modalEl.children).forEach(child => {
            if ( child.getAttribute("id") != "modal-close" ) {
                child.remove();
            }
        })
    }

    show() {
        if ( this.#ready && !this.#isOpen ) {
            this.#modalContainer.style.pointerEvents = "auto";
            this.#modalContainer.style.opacity = "1";
            this.#modalEl.style.transform = "scale(1)";
            this.#isOpen = true;
        }
    }
    hide() {
        if ( this.#ready && this.#isOpen ) {
            this.#modalContainer.style.opacity = "0";
            this.#modalContainer.style.pointerEvents = "none";
            this.#modalEl.style.transform = "scale(0.85)";
            setTimeout(() => {
                this.clear();
                this.#isOpen = false;
            }, 200);
        }
    }

    get height() {
        return this.#height;
    }
    get width() {
        return this.#width;
    }
    
}