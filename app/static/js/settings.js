class AccountField {

    static #fieldTemplate;

    static setFieldTemplate(element) {
        this.#fieldTemplate = element;
    }

    #fieldElement;
    #accountFieldDetails;
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
                else console.log(response.status);
            })
            .then(json => {
                this.#accountFieldDetails = json;
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

        this.#fieldElement = AccountField.#fieldTemplate.cloneNode(true);
        let fieldEditButton = this.#fieldElement.children[0].children[1].children[0];
        let fieldDeleteButton = this.#fieldElement.children[0].children[1].children[1];
        
        this.#fieldRowTitleValue = accountDetails['name'] + " - $" + accountDetails['balance'];
        this.#fieldRowTitle = this.#fieldElement.children[0].children[0].children[0];

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

            this.#fieldRowTitleValue += " / $" + accountDetails['credit_limit'];
        }

        this.#fieldRowTitle.innerHTML = this.#fieldRowTitleValue;

        if ( !creating ) {
            this.#accountFieldDetails = accountDetails;
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
            if ( el(".field-open") != null && e.target.children[0].children[0].innerHTML != "Save" ) {
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
                    else console.log(response.status);
                })
                .then(json => {
                    if ( json['Status'] == "SUCCESS" ) {
                        this.#fieldRowTitleValue = this.#nameInput.value + " - $" + this.#balanceInput.value + ( this.#accountTypeValue == "Credit" ? " / $" + this.#creditLimitInput.value : "" );
                        this.#fieldRowTitle.innerHTML = this.#fieldRowTitleValue;
                        this.#accountFieldDetails['name'] = this.#nameInput.value;
                        this.#accountFieldDetails['balance'] = this.#balanceInput.value;
                        this.#accountFieldDetails['type'] = this.#accountTypeValue;
                        this.#accountFieldDetails['credit_limit'] = this.#creditLimitInput.value;
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
                else console.log(response.status);
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



// Init up menu context variable.
let menuContext = 0;
el("#accounts-body").scrollIntoView();



// Event listeners for all of the context menu links.
// Also event listeners for context actions above the context
// menu body.
el("#accounts-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    el("#accounts-body").scrollIntoView();
    changeMenuTitle("create-menu-title", "Account");
    menuContext = 0;
}, false);
el("#income-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    el("#income-body").scrollIntoView();
    changeMenuTitle("create-menu-title", "Income");
    menuContext = 1;
}, false);
el("#expenses-link").addEventListener("click", e => {
    el('.active').classList.remove('active');
    e.target.classList.add("active");
    el("#expenses-body").scrollIntoView();
    changeMenuTitle("create-menu-title", "Expense");
    menuContext = 2;
}, false);

el("#create-field").addEventListener("click", e => {
    let newField = new AccountField(el("#accounts-body"), {'name': 'Example', 'type': 'Debit', 'balance': 1000.00}, creating = true);
}, false);



// Create clones of the template fields, and store them in their respective
// field classes. Delete them after they've been assigned their class.
AccountField.setFieldTemplate(el("#account-field-template").cloneNode(true));
el("#account-field-template").remove();



// Load all accounts, income, and expenses and populate the tables with the results
// in their own field classes.

// == ACCOUNTS ==
postTo("/accounts")
.then(response => {
    if ( response.status == 200 ) return response.json();
    else console.log(response.status);
})
.then(json => {
    json.forEach(account => {
        let _ = new AccountField(el('#accounts-body'), account, false);
    })
})



// Utility class for animations on text that changes between contexts in the menu.
function changeMenuTitle(menuTitleId, newTitle) {
    el("#" + menuTitleId).classList.add("changing");
    setTimeout(() => {
        el("#" + menuTitleId).innerHTML = newTitle;
        el("#" + menuTitleId).classList.remove("changing");
    }, 250);
}