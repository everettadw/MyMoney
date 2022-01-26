function tryMe(username, email) {
    fetch('/new/user', {method: 'POST', body: JSON.stringify({"username": username, "email": email}), headers: {"Content-Type": "application/json"}})
    .then(response => {
        return response.json();
    })
    .then(json => {
        console.log(json);
    })
}

window.onload = () => {

    // Grabbing all elements necessary for calendar operation
    let secondary = el('#secondary-pane');
    let calendarElement = el("#calendar");
    let nextMonthBtn = el("#next-month-button");
    let prevMonthBtn = el("#prev-month-button");

    // Creating a new ledger called personal finances
    let personalFinances = new Ledger(finances);
    
    // Creating the calendar object that will control the calendar element
    let myCal = new Calendar(new Date(), calendarElement, personalFinances);

    // Creating the modal for the date information
    let dateDetailsModal = new Modal(secondary, "600px", "500px", true);

    // Assigning functions to the calendar buttons and defining what happens
    // when a calendar square is clicked.
    nextMonthBtn.addEventListener("click", () => {
        myCal.setMonth(myCal.currentMonth + 1);
        myCal.update();
    }, false);
    prevMonthBtn.addEventListener("click", () => {
        myCal.setMonth(myCal.currentMonth - 1);
        myCal.update();
    }, false);
    calendarElement.addEventListener("click", e => { // Open the modal with the details and balances when a date with activity is clicked. When a date without activity is active, open modal for last known balances
        
        if ( !e.target.classList.contains("calendar-square") ) return;

        if ( e.target.classList.contains("active") ) {
            el(".active").classList.remove("active");
            return;
        }

        if ( el(".active") != null ) { // Remove the active class from any dates that had it prior
            el(".active").classList.remove("active");
        }
        e.target.classList.add("active"); 

    }, false);
    calendarElement.addEventListener("dblclick", e => { // Open the modal with the details and balances when a date with activity is clicked. When a date without activity is active, open modal for last known balances
        
        if ( !e.target.classList.contains("calendar-square") ) return;

        let balancesExistForDate = myCal.getDateBalances(e.target.getAttribute("data-year"), e.target.getAttribute("data-month"), e.target.getAttribute("data-day"));
        let detailsExistForDate = myCal.getDateDetails(e.target.getAttribute("data-year"), e.target.getAttribute("data-month"), e.target.getAttribute("data-day"));
        let monthBalancesExistForDate = myCal.getMonthBalances(e.target.getAttribute("data-year"), e.target.getAttribute("data-month"));

        dateDetailsModal.content(...[monthBalancesExistForDate, balancesExistForDate, detailsExistForDate]);
        dateDetailsModal.show();

        if ( el(".active") != null ) { // Remove the active class from any dates that had it prior
            el(".active").classList.remove("active");
        }
        e.target.classList.add("active"); 

    }, false);

}