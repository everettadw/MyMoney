let menuContext = 0;
let menuBody = el("#menu-body");
let accountsBody = el("#accounts-body");
let incomeBody = el("#income-body");
let expensesBody = el("#expenses-body");

accountsBody.scrollIntoView();
el("#accounts-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    accountsBody.scrollIntoView();
    changeMenuTitle("create-menu-title", "Account");
    menuContext = 0;
}, false);
el("#income-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    incomeBody.scrollIntoView();
    changeMenuTitle("create-menu-title", "Income");
    menuContext = 1;
}, false);
el("#expenses-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    expensesBody.scrollIntoView();
    changeMenuTitle("create-menu-title", "Expense");
    menuContext = 2;
}, false);
Array.from(document.body.getElementsByClassName("field-edit-button")).forEach(button => {
    button.addEventListener("click", e => {
        if ( el(".field-open") != null && e.target.children[0].children[0].getAttribute("data-content") != "Save" ) {
            let oldOpenField = el(".field-open");
            changeMenuTitle(oldOpenField.children[0].children[1].children[0].children[0].children[0].getAttribute("id"), "Edit");
            oldOpenField.classList.remove("field-open");
        }
        e.target.parentNode.parentNode.parentNode.classList.toggle("field-open");
        if ( e.target.parentNode.parentNode.parentNode.classList.contains("field-open") ) {
            changeMenuTitle(e.target.children[0].children[0].getAttribute("id"), "Save");
        } else {
            changeMenuTitle(e.target.children[0].children[0].getAttribute("id"), "Edit");
        }
    }, false);
});

function changeMenuTitle(menuTitleId, newTitle) {
    el("#" + menuTitleId).classList.add("changing");
    setTimeout(() => {
        el("#" + menuTitleId).setAttribute("data-content", newTitle);
        el("#" + menuTitleId).classList.remove("changing");
    }, 300);
}