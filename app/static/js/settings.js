let menuBody = el("#menu-body");
let accountsBody = el("#accounts-body");
let incomeBody = el("#income-body");
let expensesBody = el("#expenses-body");

accountsBody.scrollIntoView();
el("#accounts-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    accountsBody.scrollIntoView();
}, false);
el("#income-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    incomeBody.scrollIntoView();
}, false);
el("#expenses-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    expensesBody.scrollIntoView();
}, false);