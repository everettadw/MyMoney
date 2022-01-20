class Ledger {

    constructor(finances) {
        this.accounts = finances.accounts;
        this.moneyMoves = finances.moneyMoves;
        this.memo = {};
    }

    // This function happens every time the Calendar object updates,
    // and every time the next or previous month buttons are clicked.
    calculateBalances(todayDate, displayDate) {

        // Object.keys(this.accounts).forEach(account => {
        //     this.accounts[account].resetBalanceTenses(this.memo);
        // });

        let moneyMoveList = [];
        
        this.moneyMoves.forEach(moneyMove => moneyMoveList.push(...moneyMove.generateDateList(todayDate, displayDate)));
        moneyMoveList = MoneyMove.consolidateDateList(moneyMoveList);
        moneyMoveList = mergeSort(moneyMoveList);

        let contentsDetails = [];

        // Set the date to process balances from at a different point
        // depending on if the months are in the past, present, or future
        let reversedPastMoneyMoveList = [];
        let futureMoneyMoveList = [];
        let currentMoneyMove = [];
        
        let futMML = moneyMoveList.filter(moneyMove => decodeDateTag(moneyMove.dateTag) > todayDate);
        if ( futMML.length ) { // Today is somewhere in the months being calculated
            reversedPastMoneyMoveList = moneyMoveList.splice(0, (moneyMoveList.length - 1) - (futMML.length - 1));
            if ( decodeDateTag(moneyMoveList[0].dateTag) == todayDate ) currentMoneyMove = moneyMoveList.splice(0, 1);
            futureMoneyMoveList = moneyMoveList.splice(0, moneyMoveList.length - 1);
        } else if ( decodeDateTag(moneyMoveList[0].dateTag) > todayDate ) { // Today is behind the months being calculated
            futureMoneyMoveList = moneyMoveList.splice(0, moneyMoveList.length - 1);
        } else { // Today is farther into the future than the current months being calculated
            reversedPastMoneyMoveList = moneyMoveList.splice(0, moneyMoveList.length - 1);
        }

        reversedPastMoneyMoveList.reverse();
        while ( reversedPastMoneyMoveList.length ) {
            if ( reversedPastMoneyMoveList[0].dateTag in this.memo ) {
                contentsDetails.push(this.memo[reversedPastMoneyMoveList[0].dateTag]);
                reversedPastMoneyMoveList.shift();
                continue;
            }
            reversedPastMoneyMoveList[0].contents.balance = this.accounts["Capital One Checkings"].pastBalance;
            reversedPastMoneyMoveList[0].details.forEach(detail => {
                if ( detail.type == "income" ) {
                    this.accounts[detail.account].processIncome(detail.amount, -1)
                } else if ( detail.type == "loss" ) {
                    this.accounts[detail.account].processPayment(detail.amount, this.accounts[detail.appliedTo], -1);
                }
            });
            let balancesTotal = {};
            Object.keys(this.accounts).forEach(account => {
                balancesTotal[account] = this.accounts[account].pastBalance;
            })
            reversedPastMoneyMoveList[0]['balances'] = balancesTotal;
            this.memo[reversedPastMoneyMoveList[0].dateTag] = reversedPastMoneyMoveList[0];
            contentsDetails.push(reversedPastMoneyMoveList.shift());
        }

        while ( currentMoneyMove.length ) {
            currentMoneyMove[0].details.forEach(detail => {
                if ( detail.type == "income" ) {
                    this.accounts[detail.account].processIncome(detail.amount)
                } else if ( detail.type == "loss" ) {
                    this.accounts[detail.account].processPayment(detail.amount, this.accounts[detail.appliedTo]);
                }
            });
            currentMoneyMove[0].contents.balance = this.accounts["Capital One Checkings"].futureBalance;
            let balancesTotal = {};
            Object.keys(this.accounts).forEach(account => {
                balancesTotal[account] = this.accounts[account].futureBalance;
            })
            currentMoneyMove[0]['balances'] = balancesTotal;
            contentsDetails.push(currentMoneyMove.shift());
        }

        while ( futureMoneyMoveList.length ) {
            if ( futureMoneyMoveList[0].dateTag in this.memo ) {
                contentsDetails.push(this.memo[futureMoneyMoveList[0].dateTag]);
                futureMoneyMoveList.shift();
                continue;
            }
            futureMoneyMoveList[0].details.forEach(detail => {
                if ( detail.type == "income" ) {
                    this.accounts[detail.account].processIncome(detail.amount)
                } else if ( detail.type == "loss" ) {
                    this.accounts[detail.account].processPayment(detail.amount, this.accounts[detail.appliedTo]);
                }
            });
            futureMoneyMoveList[0].contents.balance = this.accounts["Capital One Checkings"].futureBalance;
            let balancesTotal = {};
            Object.keys(this.accounts).forEach(account => {
                balancesTotal[account] = this.accounts[account].futureBalance;
            })
            futureMoneyMoveList[0]['balances'] = balancesTotal;
            this.memo[futureMoneyMoveList[0].dateTag] = futureMoneyMoveList[0];
            contentsDetails.push(futureMoneyMoveList.shift());
        }

        return contentsDetails;
    }

}