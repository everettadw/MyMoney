class Calendar {

    constructor(dateObj, calendarElement, ledger, today = new Date()) {
        this.ledger = ledger;
        this.today = today;
        this.today.setHours(0, 0, 0, 0);
        this.dateObj = dateObj;
        this.year = this.dateObj.getFullYear();
        this.month = this.dateObj.getMonth();
        this.date = this.dateObj.getDate();
        this.day = this.dateObj.getDay();
        this.cal = {};
        this.cal["data"] = {};

        let calRows = Array.from(calendarElement.children);
        for ( let i = 0; i < 8; i++ ) {
            if ( i == 0 ) {
                this.cal["info"] = [...calRows[i].children];
            } else if ( i > 1 ) {
                this.cal[i - 2] = [...calRows[i].children];
            }
        }

        this.update();
    }

    setDate(newDate) {
        this.dateObj.setDate(newDate);
        this.setDateVars();
    }
    setMonth(newMonth, newDate = 1) {
        this.dateObj.setMonth(newMonth, newDate);
        this.setDateVars();
    }
    setDateVars() {
        this.day = this.dateObj.getDay();
        this.month = this.dateObj.getMonth();
        this.year = this.dateObj.getFullYear();
        this.date = this.dateObj.getDate();
    }
    setDateMeta(row, col, dateObj) {
        this.cal[row][col].setAttribute("data-day", dateObj.getDate());
        this.cal[row][col].setAttribute("data-month", dateObj.getMonth());
        this.cal[row][col].setAttribute("data-year", dateObj.getFullYear());
    }

    update() { // Update the calendar squares and their html/css when new data is put into the calendar

        // Reset the entire calendar for new data
        this.cal.data = {};
        for ( let i = 0; i < 6; i++ ) {
            for ( let j = 0; j < 7; j++ ) {
                this.cal[i][j].innerHTML = "";
            }
        }

        // Take the dates and amounts provided by the ledger and put them into the calendar data
        let datesBalances = this.ledger.calculateBalances(this.today, this.dateObj);

        if ( datesBalances != null ) {
            for ( let i = 0; i < datesBalances.length; i++ ) {
                this.setDateProperties(datesBalances[i].dateTag, datesBalances[i].contents, datesBalances[i].details, datesBalances[i].balances);
            }
        }

        let monthStart = new Date(this.year, this.month, 1);
        let monthEnd = new Date(this.year, this.month + 1, 0);
        let prevMonth = new Date(this.year, this.month, 0);
        let nextMonth = new Date(this.year, this.month + 2, 0);
        let dateTracker = 1;
        let currMonth = -1;
        let dayRange = monthEnd.getDate();
        let offset = monthStart.getDay() - 1;

        // Change the calendar header info each time the calendar is updated
        this.cal["info"][0].innerHTML = monthStart.getFullYear();
        this.cal["info"][1].innerHTML = monthStart.toLocaleString("default", { month: "long" });

        // Create a date tag for each calendar date from last month through next
        // month if there isn't already data present. These data stores are where
        // the financial information will be stored once calculated.
        for ( let i = 1; i <= prevMonth.getDate(); i++ ) {
            let tag = getDateTag(prevMonth.getFullYear(), prevMonth.getMonth(), i);
            if ( this.cal["data"][tag] == undefined ) {
                this.cal["data"][tag] = {contents: {}};
            }
        }
        for ( let i = 1; i <= dayRange; i++ ) {
            let tag = getDateTag(this.year, this.month, i);
            if ( this.cal["data"][tag] == undefined ) {
                this.cal["data"][tag] = {contents: {}};
            }
        }
        for ( let i = 1; i <= nextMonth.getDate(); i++ ) {
            let tag = getDateTag(nextMonth.getFullYear(), nextMonth.getMonth(), i);
            if ( this.cal["data"][tag] == undefined ) {
                this.cal["data"][tag] = {contents: {}};
            }
        }

        // Update the calendar html/css by looping through each calendar square
        // and assigning each sqaure different classes and changing the innerHTML.
        // Eventually want to move to a more modular approach where data can be styled
        // depending on what it is so multiple little details can still make sense in
        // each calendar square.
        for ( let i = 0; i < 6; i++ ) {
            for ( let j = 0; j < 7; j++ ) {
                // Reset the classname of each calendar square so that active/out-of-month classes can be removed.
                this.cal[i][j].className = "calendar-square";

                if ( j == monthStart.getDay() && currMonth == -1 ) { // If the first day of the current month matches the day of the week we are on
                    currMonth = 0;
                }
                if ( dateTracker > monthEnd.getDate() ) { // If we get past the end of the current month
                    currMonth = 1;
                }

                if ( currMonth == -1 ) {
                    this.cal[i][j].innerHTML = "<p class='date-number'>" + (prevMonth.getDate() - offset).toString() + "</p>";
                    this.cal[i][j].classList.add("out-of-current-month");
                    
                    let detailsNode = document.createElement("div");
                    detailsNode.className = 'square-contents';
                    detailsNode.innerHTML = this.getDateContents(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - offset);
                    this.cal[i][j].appendChild(detailsNode);

                    this.setDateMeta(i, j, new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonth.getDate() - offset));
                    offset -= 1;
                }

                if ( currMonth == 0 ) {
                    if ( dateTracker == this.today.getDate() && this.month == this.today.getMonth() && this.year == this.today.getFullYear() ) {
                        this.cal[i][j].classList.add("today");
                    }
                    this.cal[i][j].innerHTML = "<p class='date-number'>" + dateTracker.toString() + "</p>";

                    let detailsNode = document.createElement("div");
                    detailsNode.className = 'square-contents';
                    detailsNode.innerHTML = this.getDateContents(this.year, this.month, dateTracker);
                    this.cal[i][j].appendChild(detailsNode);

                    this.setDateMeta(i, j, new Date(this.year, this.month, dateTracker));
                    dateTracker += 1;
                }

                if ( currMonth == 1 ) {
                    this.cal[i][j].innerHTML = "<p class='date-number'>" + (dateTracker - dayRange).toString() + "</p>";
                    this.cal[i][j].classList.add("out-of-current-month");

                    let detailsNode = document.createElement("div");
                    detailsNode.className = 'square-contents';
                    detailsNode.innerHTML = this.getDateContents(nextMonth.getFullYear(), nextMonth.getMonth(), dateTracker - monthEnd.getDate());
                    this.cal[i][j].appendChild(detailsNode);

                    this.setDateMeta(i, j, new Date(nextMonth.getFullYear(), nextMonth.getMonth(), dateTracker - monthEnd.getDate()));
                    dateTracker += 1;
                }
            }
        }
    }
    
    getMonthBalances(year, month) {
        let monthBalancesEl = document.createElement("div");
        let monthBlancesElTitle = document.createElement("h2");
        let totalIncomeEl = document.createElement("h3");
        let totalLossEl = document.createElement("h3");
        let budgetEl = document.createElement("h3");
        monthBalancesEl.classList.add("month-balances-list");
        monthBalancesEl.appendChild(monthBlancesElTitle);
        monthBalancesEl.appendChild(totalIncomeEl);
        monthBalancesEl.appendChild(totalLossEl);
        monthBalancesEl.appendChild(budgetEl);
        totalIncomeEl.classList.add("income-number");
        totalLossEl.classList.add("loss-number");
        monthBlancesElTitle.innerHTML = new Date(year, month, 1).toLocaleString("default", { month: "long" }) + " Income, Loss, and Profit";
        let thisMonthDateTags = Object.keys(this.cal.data).filter(dateTag => {
            let dateTagDate = decodeDateTag(dateTag);
            return dateTagDate.getFullYear() == year && dateTagDate.getMonth() == month;
        });

        let totalIncome = 0;
        let totalLoss = 0;

        for ( const dateTag of thisMonthDateTags ) {
            if ( this.cal.data[dateTag].contents['loss'] != undefined ) {
                totalLoss += this.cal.data[dateTag].contents.loss;
            }
            if ( this.cal.data[dateTag].contents['income'] != undefined ) {
                totalIncome += this.cal.data[dateTag].contents.income;
            }
        }

        if ( totalIncome == 0 && totalLoss == 0 ) return null;

        let budget = totalIncome - totalLoss;

        totalIncomeEl.innerHTML = "$" + roundToTwo(totalIncome);
        totalLossEl.innerHTML = "-$" + roundToTwo(totalLoss);
        budgetEl.innerHTML = ( budget < 0 ? "-$" + roundToTwo(budget).slice(1,) : "$" + roundToTwo(budget) );

        return monthBalancesEl;
    }
    getDateContents(year, month, date) { // Get contents of a specific day
        // NEED TO FLUSH THIS OUT
        if ( this.cal["data"][getDateTag(year, month, date)] == undefined || this.cal["data"][getDateTag(year, month, date)].contents == {} ) {
            console.warn("That dateTag - " + getDateTag(year, month, date) + ", is not in the dateTag datastore or it's empty.");
            return "";
        }
    
        let dateContentsKeys = Object.keys(this.cal["data"][getDateTag(year, month, date)].contents);

        if ( dateContentsKeys.length == 0 ) {
            return "";
        }

        let detailsString = "";
        if ( "balance" in this.cal["data"][getDateTag(year, month, date)].contents ) {
            detailsString += "<p class='date-detail'>" + ( this.cal["data"][getDateTag(year, month, date)].contents.balance < 0 ? "-$" + roundToTwo(this.cal["data"][getDateTag(year, month, date)].contents.balance).slice(1,) : "$" + roundToTwo(this.cal["data"][getDateTag(year, month, date)].contents.balance) ) + "</p>";
        }
        if ( "loss" in this.cal["data"][getDateTag(year, month, date)].contents ) {
            detailsString += "<p class='date-detail loss-number'>$" + roundToTwo(this.cal["data"][getDateTag(year, month, date)].contents.loss) + "</p>";
        }
        if ( "income" in this.cal["data"][getDateTag(year, month, date)].contents ) {
            detailsString += "<p class='date-detail income-number'>$" + roundToTwo(this.cal["data"][getDateTag(year, month, date)].contents.income) + "</p>";
        }
        return detailsString;
    }
    getDateBalances(year, month, date) { // Show all account balances for a specific day
        let walkingDate = new Date(year, month, date);
        let walkingDateTag = getDateTag(walkingDate.getFullYear(), walkingDate.getMonth(), walkingDate.getDate());
        if ( walkingDateTag in this.cal.data && this.cal.data[walkingDateTag]['balances'] != undefined ) {
            let balancesEl = document.createElement("div");
            let balancesElTitle = document.createElement("h2");
            balancesEl.className = "balances-list";
            balancesElTitle.innerHTML = new Date(year, month, date).toLocaleString("default", { month: "short", day: "numeric" }) + " Account Balances";
            balancesEl.appendChild(balancesElTitle);

            Object.keys(this.cal["data"][walkingDateTag].balances).forEach(account => {
                let accountBal = document.createElement("p");

                accountBal.innerHTML = account + ": " + ( this.cal["data"][walkingDateTag].balances[account] < 0 ? "-$" + roundToTwo(this.cal["data"][walkingDateTag].balances[account]).slice(1,) : "$" + roundToTwo(this.cal["data"][walkingDateTag].balances[account])) + ( this.ledger.accounts[account].type == "credit" ? " / $" + this.ledger.accounts[account].creditLimit : "" );
                balancesEl.appendChild(accountBal);
            })

            return balancesEl;
        } else {
            return null;
        }
    }
    getDateDetails(year, month, date) { // Show all transactions for a specific day
        let walkingDate = new Date(year, month, date);
        let walkingDateTag = getDateTag(walkingDate.getFullYear(), walkingDate.getMonth(), walkingDate.getDate());
        if ( walkingDateTag in this.cal.data && this.cal.data[walkingDateTag]['details'] != undefined ) {
            let detailsEl = document.createElement("div");
            let detailsElTitle = document.createElement("h2");
            detailsEl.className = "details-list";
            detailsElTitle.innerHTML = new Date(year, month, date).toLocaleString("default", { month: "short", day: "numeric" }) + " Income and Loss Details";
            detailsEl.appendChild(detailsElTitle);

            let detailMemo = [];

            this.cal["data"][walkingDateTag].details.forEach(detail => {
                let detailEl = document.createElement("p");
                detailEl.classList.add(( detail.type == "income" ? "income-detail" : "loss-detail" ));

                if ( detailMemo.find(detailname => detailname == detail.name) != undefined ) return;
                detailMemo.push(detail.name);

                detailEl.innerHTML = detail.name + ": $" + roundToTwo(detail.amount) + ( detail.type == "income" ? " into " : " out of ") + detail.account;
                detailsEl.appendChild(detailEl);
            })

            return detailsEl;
        } else {
            return null;
        }
    }

    setDateProperties(dateTag, newContents, newDetails, newBalances) { // Edit contents of one calendar square in dateTag datastore
        if ( !(dateTag in this.cal["data"]) ) {
            this.cal["data"][dateTag] = {};
        }
        if ( this.cal["data"][dateTag]['balances'] == undefined ) {
            this.cal["data"][dateTag]['balances'] = {};
        }
        if ( this.cal["data"][dateTag]['contents'] == undefined ) {
            this.cal["data"][dateTag]['contents'] = {};
        }
        if ( this.cal["data"][dateTag]['details'] == undefined ) {
            this.cal["data"][dateTag]['details'] = [];
        }

        // Only update the contents
        Object.keys(newContents).forEach(content => {
            if ( content == "income" || content == "loss" ) newContents[content] = Math.abs(newContents[content]);
            this.cal.data[dateTag].contents[content] = newContents[content];
        })
        newDetails.forEach(detail => {
            if ( detail.amount < 0 ) detail.amount = Math.abs(detail.amount);
            this.cal.data[dateTag].details.push(detail);
        })
        Object.keys(newBalances).forEach(account => {
            this.cal.data[dateTag].balances[account] = newBalances[account];
        })
    }

    // Calendar getter functions
    get currentYear() {
        return this.year;
    }
    get currentMonth() {
        return this.month;
    }
    get currentDate() {
        return this.date;
    }
    get currentDay() {
        return this.day;
    }
    get currentDateObj() {
        return this.dateObj;
    }

}