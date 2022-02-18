class AccountField {

    #fieldElement;
    #accountId;
    #fieldRowTitle;
    #fieldRowTitleValue;
    #accountTypeRadio1;
    #accountTypeRadio2;
    #nameInput;
    #balanceInput;
    #accountTypeValue;
    #creditLimitInput;

    constructor(fieldContainer, accountDetails, creating = false) {
        if ( creating ) {
            postTo("/accounts/new", {
                "name": accountDetails['name'],
                "type": accountDetails['type'],
                "balance": accountDetails['balance']
            })
            .then(response => {
                if ( response.status == 200 ) return response.json();
            })
            .then(json => {
                this.#accountId = json['id'];
                this.#fieldElement.setAttribute("id", json['id']);
                fieldEditButton.children[0].children[0].setAttribute("id", "edit-menu-title_account-" + json['id']);
                this.#nameInput.setAttribute("id", "name_account-" + json['id']);
                this.#nameInput.parentNode.children[0].setAttribute("for", "name_account-" + json['id']);
                this.#balanceInput.setAttribute("id", "balance_account-" + json['id']);
                this.#balanceInput.parentNode.children[0].setAttribute("for", "balance_account-" + json['id']);
                this.#accountTypeRadio1.setAttribute('id', 'debit_account-' + json['id']);
                this.#accountTypeRadio1.parentNode.children[1].setAttribute('for', 'debit_account-' + json['id']);
                this.#accountTypeRadio2.setAttribute("id", "credit_account-" + json['id']);
                this.#accountTypeRadio2.parentNode.children[3].setAttribute("for", "credit_account-" + json['id']);
                this.#creditLimitInput.setAttribute("id", "credit-limit_account-" + json['id']);
                this.#creditLimitInput.parentNode.children[0].setAttribute("for", "credit-limit_account-" + json['id']);
            });
        }

        this.#fieldElement = AccountFieldHTMLClone.cloneNode(true);
        let fieldEditButton = this.#fieldElement.children[0].children[1].children[0];
        let fieldDeleteButton = this.#fieldElement.children[0].children[1].children[1];
        
        this.#fieldRowTitleValue = accountDetails['name'] + " - $" + accountDetails['balance'];
        this.#fieldRowTitle = this.#fieldElement.children[0].children[0].children[0];

        this.#fieldRowTitle.innerHTML = this.#fieldRowTitleValue;

        this.#nameInput = this.#fieldElement.children[1].children[0].children[0].children[0].children[0].children[1];
        this.#nameInput.value = accountDetails['name'];

        this.#balanceInput = this.#fieldElement.children[1].children[0].children[0].children[0].children[1].children[1];
        this.#balanceInput.value = accountDetails['balance'];

        this.#accountTypeValue = accountDetails['type'];
        this.#creditLimitInput = this.#fieldElement.children[1].children[0].children[0].children[1].children[1].children[1];

        this.#accountTypeRadio1 = this.#fieldElement.children[1].children[0].children[0].children[1].children[0].children[0].children[0];
        this.#accountTypeRadio2 = this.#fieldElement.children[1].children[0].children[0].children[1].children[0].children[0].children[2];
        
        if ( this.#accountTypeValue == "Credit" ) {
            this.#accountTypeRadio1.setAttribute("checked", false);
            this.#accountTypeRadio2.setAttribute("checked", true);

            this.#creditLimitInput.disabled = false;
            this.#creditLimitInput.parentNode.classList.remove("disabled");
            this.#creditLimitInput.value = accountDetails['credit_limit'];
        }

        if ( !creating ) {
            this.#accountId = accountDetails['id'];
            this.#fieldElement.setAttribute("id", accountDetails['id']);
            fieldEditButton.children[0].children[0].setAttribute("id", "edit-menu-title_account-" + accountDetails['id']);
            this.#nameInput.setAttribute("id", "name_account-" + accountDetails['id']);
            this.#nameInput.parentNode.children[0].setAttribute("for", "name_account-" + accountDetails['id']);
            this.#balanceInput.setAttribute("id", "balance_account-" + accountDetails['id']);
            this.#balanceInput.parentNode.children[0].setAttribute("for", "balance_account-" + accountDetails['id']);
            this.#accountTypeRadio1.setAttribute('id', 'debit_account-' + accountDetails['id']);
            this.#accountTypeRadio1.parentNode.children[1].setAttribute('for', 'debit_account-' + accountDetails['id']);
            this.#accountTypeRadio2.setAttribute("id", "credit_account-" + accountDetails['id']);
            this.#accountTypeRadio2.parentNode.children[3].setAttribute("for", "credit_account-" + accountDetails['id']);
            this.#creditLimitInput.setAttribute("id", "credit-limit_account-" + accountDetails['id']);
            this.#creditLimitInput.parentNode.children[0].setAttribute("for", "credit-limit_account-" + accountDetails['id']);
        }

        fieldEditButton.addEventListener("click", e => {
            if ( el(".field-open") != null && e.target.children[0].children[0].getAttribute("data-content") != "Save" ) {
                let oldOpenField = el(".field-open");
                changeMenuTitle(oldOpenField.children[0].children[1].children[0].children[0].children[0].getAttribute("id"), "Edit");
                oldOpenField.classList.remove("field-open");
            }
            e.target.parentNode.parentNode.parentNode.classList.toggle("field-open");
            if ( e.target.parentNode.parentNode.parentNode.classList.contains("field-open") ) {
                changeMenuTitle(e.target.children[0].children[0].getAttribute("id"), "Save");
            } else {
                postTo("/accounts/update", {
                    'id': e.target.parentNode.parentNode.parentNode.getAttribute("id"),
                    'name': this.#nameInput.value,
                    'balance': this.#balanceInput.value,
                    'type': this.#accountTypeValue,
                    'credit_limit': this.#creditLimitInput.value
                })
                .then(response => {
                    if ( response.status == 200 ) return response.json();
                })
                .then(json => {
                    if ( json['Status'] == "SUCCESS" ) {
                        this.#fieldRowTitleValue = this.#nameInput.value + " - $" + this.#balanceInput.value;
                        this.#fieldRowTitle.innerHTML = this.#fieldRowTitleValue;
                    }
                })
                changeMenuTitle(e.target.children[0].children[0].getAttribute("id"), "Edit");
            }
        }, false);

        fieldDeleteButton.addEventListener("click", e => {
            postTo("/accounts/delete", {
                "id": e.target.parentNode.parentNode.parentNode.parentNode.getAttribute("id")
            })
            .then(response => {
                if ( response.status == 200 ) return response.json();
            })
            .then(json => {
                if ( json['Status'] == 'SUCCESS' ) {
                    this.#fieldElement.remove();
                }
            });
        })

        this.#accountTypeRadio1.addEventListener("click", e => {
            this.#accountTypeValue = "Debit";
            this.#creditLimitInput.value = "";
            this.#creditLimitInput.disabled = true;
            this.#creditLimitInput.parentNode.classList.add("disabled");
        }, false)

        this.#accountTypeRadio2.addEventListener("click", e => {
            this.#accountTypeValue = "Credit";
            this.#creditLimitInput.value = "";
            this.#creditLimitInput.disabled = false;
            this.#creditLimitInput.parentNode.classList.remove("disabled");
        }, false);

        fieldContainer.appendChild(this.#fieldElement);
    }
}

let AccountFieldHTMLClone = null;
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
el("#create-field").addEventListener("click", e => {
    let newField = new AccountField(el("#accounts-body"), {'name': 'Example', 'type': 'Debit', 'balance': 1000.00}, creating = true);
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

AccountFieldHTMLClone = el("#account-field-template").cloneNode(true);
el("#account-field-template").remove();

postTo("/accounts")
.then(response => {
    if ( response.status == 200 ) return response.json();
})
.then(json => {
    json.forEach(account => {
        let newAccountField = new AccountField(el('#accounts-body'), account, false);
    })
})