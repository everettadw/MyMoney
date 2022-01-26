class MoneyMove {

    static calculateHourlyPaycheck(rate, regularHours, overtimeHours, taxRate, retirementContribution, benefitsDeductions) {
        return ( rate * regularHours + rate * 1.5 * overtimeHours ) * ( 1.0 - retirementContribution ) * ( 1.0 - taxRate ) - benefitsDeductions;
    }

    static consolidateDateList(dateList) {
        let consolidatedArr = [];
        let blackList = [];
        for ( let i = 0; i < dateList.length; i++ ) {
            if ( blackList.indexOf(dateList[i].dateTag) > -1 ) continue;
            blackList.push(dateList[i].dateTag);
            let sameDateDetails = dateList.filter(dateDetails => dateDetails.dateTag == dateList[i].dateTag);
            if ( sameDateDetails.length ) {
                let newDateDetails = {
                    dateTag: dateList[i].dateTag,
                    contents: {},
                    details: []
                };
                let totalLoss = 0;
                let totalIncome = 0;
                sameDateDetails.forEach(dateDetails => {
                    if ( "loss" in dateDetails.contents ) totalLoss += dateDetails.contents.loss;
                    if ( "income" in dateDetails.contents ) totalIncome += dateDetails.contents.income;
                    newDateDetails.details.push(...dateDetails.details);
                });
                if ( Math.abs(totalIncome) > 0 ) newDateDetails.contents.income = totalIncome;
                if ( Math.abs(totalLoss) > 0 ) newDateDetails.contents.loss = totalLoss;
                consolidatedArr.push(newDateDetails);
            } else {
                consolidatedArr.push(dateList[i]);
            }
        }
        return consolidatedArr;
    }

    constructor(instanceDetails) {
        this.name = instanceDetails.name;
        this.type = instanceDetails.type;
        this.freq = instanceDetails.frequency;
        this.date = instanceDetails.date;
        this.end = instanceDetails.endFrom;
        this.start = instanceDetails.startFrom;
        this.account = instanceDetails.account;
        this.basedOnDate = instanceDetails.basedOnDate;

        if ( this.type == "expense" ) {
            this.amount = instanceDetails.amount;
            this.appliedTo = instanceDetails.appliedTo;
        } else if ( this.type == "income" ) { 
            if ( instanceDetails.incomeType == "hourly" ) {
                this.amount = MoneyMove.calculateHourlyPaycheck(instanceDetails.wage,
                    instanceDetails.hours,
                    instanceDetails.overtimeHours,
                    instanceDetails.taxRate,
                    instanceDetails.preTaxDeductionsTotal,
                    instanceDetails.postTaxDeductionsTotal);
            } else if ( instanceDetails.incomeType == "exact" ) {
                this.amount = instanceDetails.amount;
            }
        }
    }

    generateDateList(todayDate, displayDate) {
        let startCalculationsFromDate = new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1);
        let endCalculationsFromDate = new Date(displayDate.getFullYear(), displayDate.getMonth() + 2, 0);
        let walkingDate = new Date(startCalculationsFromDate.getFullYear(), startCalculationsFromDate.getMonth(), startCalculationsFromDate.getDate());

        let dateList = [];

        if ( this.basedOnDate ) {
            let months = monthsBetween(startCalculationsFromDate, endCalculationsFromDate);
            let moneyMoveDate = null;

            for ( let i = 0; i < months; i++ ) {
                if ( this.date == "start" ) {
                    moneyMoveDate = new Date(walkingDate.getFullYear(), walkingDate.getMonth(), 1);
                } else if ( this.date == "end" ) {
                    moneyMoveDate = new Date(walkingDate.getFullYear(), walkingDate.getMonth() + 1, 0);
                } else {
                    moneyMoveDate = new Date(walkingDate.getFullYear(), walkingDate.getMonth(), this.date);
                }

                if ( this.start != null && moneyMoveDate < this.start ) {
                    walkingDate.setMonth(walkingDate.getMonth() + 1, 1);
                    continue;
                }
                if ( this.end != null && moneyMoveDate > this.end ) {
                    walkingDate.setMonth(walkingDate.getMonth() + 1, 1);
                    continue;
                }

                let dateDetailsAmount = 0;
                dateDetailsAmount = this.amount;
                if ( moneyMoveDate < todayDate ) dateDetailsAmount = -(this.amount);

                let dateDetails = {
                    dateTag: getDateTag(moneyMoveDate.getFullYear(), moneyMoveDate.getMonth(), moneyMoveDate.getDate()),
                    contents: {},
                    details: []
                }
                if ( this.type == "income" ) {
                    dateDetails.contents.income = dateDetailsAmount;
                    dateDetails.details.push({
                        name: this.name,
                        amount: dateDetailsAmount,
                        account: this.account,
                        type: 'income'
                    })
                } else if ( this.type == "expense" ) {
                    dateDetails.contents.loss = dateDetailsAmount;
                    dateDetails.details.push({
                        name: this.name,
                        amount: dateDetailsAmount,
                        appliedTo: this.appliedTo,
                        account: this.account,
                        type: 'loss'
                    });
                }
                dateList.push(dateDetails);
                walkingDate.setMonth(walkingDate.getMonth() + 1, 1);
            }
        } else {
            if ( walkingDate <= this.start && this.start < endCalculationsFromDate ) {
                walkingDate = new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate());
            } else if ( walkingDate > this.start && walkingDate < endCalculationsFromDate ) {
                let calibrate = new Date(this.start.getFullYear(), this.start.getMonth(), this.start.getDate());
                while ( walkingDate > calibrate ) {
                    calibrate.setDate(calibrate.getDate() + this.freq );
                }
                if ( calibrate < endCalculationsFromDate ) {
                    walkingDate = new Date(calibrate.getFullYear(), calibrate.getMonth(), calibrate.getDate());
                } else return [];
            } else return [];
            while ( walkingDate < endCalculationsFromDate && (this.end == null ? true : walkingDate < this.end )) {
                let dateDetailsAmount = 0;
                dateDetailsAmount = this.amount;
                if ( walkingDate < todayDate ) dateDetailsAmount = -(this.amount);

                let dateDetails = {
                    dateTag: getDateTag(walkingDate.getFullYear(), walkingDate.getMonth(), walkingDate.getDate()),
                    contents: {},
                    details: []
                };
                if ( this.type == "income" ) {
                    dateDetails.contents.income = dateDetailsAmount;
                    dateDetails.details.push({
                        name: this.name,
                        amount: dateDetailsAmount,
                        account: this.account,
                        type: 'income'
                    })
                } else if ( this.type == "expense" ) {
                    dateDetails.contents.loss = dateDetailsAmount;
                    dateDetails.details.push({
                        name: this.name,
                        amount: dateDetailsAmount,
                        appliedTo: this.appliedTo,
                        account: this.account,
                        type: 'loss'
                    });
                }
                dateList.push(dateDetails);
                walkingDate.setDate(walkingDate.getDate() + this.freq);
            }
        }

        return dateList;
    }

}

class Account {

    constructor(name, type, originalBalance, creditLimit = null) {
        this.name = name;
        this.type = type;
        this.originalBalance = originalBalance;
        this.pastBalance = originalBalance;
        this.futureBalance = originalBalance;
        if ( creditLimit != null ) this.creditLimit = creditLimit;
    }

    processCreditPayment(amount, principleAmount = null, tense = 1) {
        if ( this.type == "credit" && principleAmount == null ) {
            if ( tense > 0 ) this.futureBalance -= amount;
            if ( tense < 0 ) this.pastBalance -= amount;
        }
        else if ( this.type == "credit" ) {
            if ( tense > 0 ) this.futureBalance -= principleAmount;
            if ( tense < 0 ) this.pastBalance -= principleAmount;
        }
    }

    processIncome(amount, tense = 1) {
        if ( tense > 0 ) this.futureBalance += amount;
        if ( tense < 0 ) this.pastBalance += amount;
    }

    processPayment(amount, accountToCredit = null, tense = 1, principleAmount = null) {
        if ( accountToCredit != null && accountToCredit != undefined ) {
            accountToCredit.processCreditPayment(amount, principleAmount, tense);
        }
        if ( this.type == "credit" ) {
            if ( tense > 0 ) this.futureBalance += amount;
            if ( tense < 0 ) this.pastBalance += amount;
        } else if ( this.type == "debit" ) {
            if ( tense > 0 ) this.futureBalance -= amount;
            if ( tense < 0 ) this.pastBalance -= amount;
        }
    }

    // resetBalanceTenses(memo, pastInd, futureInd) {
    //     if ( memo != undefined && memo != null && Object.keys(memo).length ) {
    //         this.futureBalance = memo[Object.keys(memo)[futureInd]].balances[this.name];
    //         this.pastBalance = memo[Object.keys(memo)[pastInd]].balances[this.name];
    //     } else {
    //         this.futureBalance = this.originalBalance;
    //         this.pastBalance = this.originalBalance;
    //     }
    // }

}

var finances = {
    accounts: {
        "Capital One Checkings": new Account(
            "Capital One Checkings",
            "debit",
            1359.99 - 55 - 40
        ),
        "Capital One Platinum": new Account(
            "Capital One Platinum",
            "credit",
            3294.52,
            3300.00
        ),
        "Capital One Quicksilver": new Account(
            "Capital One Quicksilver",
            "credit",
            0,
            500.00
        ),
        "Discover It": new Account(
            "Discover It",
            "credit",
            1741.66,
            1750.00
        ),
        "Apple Card": new Account(
            "Apple Card",
            "credit",
            0,
            4000.00
        )
    },
    moneyMoves: [
        new MoneyMove({
            name: "Rent",
            type: "expense",
            amount: 1100.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: new Date(2022, 7, 2),
            frequency: null,
            date: "start",
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Rent",
            type: "expense",
            amount: 700.00,
            basedOnDate: true,
            startFrom: new Date(2022, 7, 2),
            endFrom: null,
            frequency: null,
            date: "start",
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Phone Bill",
            type: "expense",
            amount: 81.33,
            basedOnDate: true,
            startFrom: null,
            endFrom: new Date(2023, 4, 18),
            frequency: null,
            date: 17,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Phone Bill",
            type: "expense",
            amount: 60,
            basedOnDate: true,
            startFrom: new Date(2023, 4, 18),
            endFrom: null,
            frequency: null,
            date: 17,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Discover Credit Payment",
            type: "expense",
            amount: 51.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 22,
            account: "Capital One Checkings",
            appliedTo: "Discover It"
        }),
        new MoneyMove({
            name: "Spotify",
            type: "expense",
            amount: 10.59,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 22,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Car Insurance",
            type: "expense",
            amount: 249.55,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 23,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Food",
            type: "expense",
            amount: 40.00,
            basedOnDate: false,
            startFrom: new Date(2022, 0, 3),
            endFrom: null,
            frequency: 7,
            date: null,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Car Note",
            type: "expense",
            amount: 378.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 23,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Internet",
            type: "expense",
            amount: 94.83,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 27,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Electricity",
            type: "expense",
            amount: 65.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 28,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Klarna",
            type: "expense",
            amount: 89.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 26,
            account: "Capital One Checkings"
        }),
        new MoneyMove({
            name: "Capital One Platinum Payment",
            type: "expense",
            amount: 35.00,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 2,
            account: "Capital One Checkings",
            appliedTo: "Capital One Platinum"
        }),
        new MoneyMove({
            name: "Netflix",
            type: "expense",
            amount: 14.83,
            basedOnDate: true,
            startFrom: null,
            endFrom: null,
            frequency: null,
            date: 2,
            account: "Capital One Checkings"
        }),

        // === === === === === === === === === ===
        // === INCOME SOURCES AFTER THIS POINT ===
        // === === === === === === === === === ===

        new MoneyMove({
            name: "Employment MRA",
            incomeType: "hourly",
            type: "income",
            basedOnDate: false,
            date: null,
            account: "Capital One Checkings",
            startFrom: new Date(2022, 0, 7),
            endFrom: new Date(2022, 3, 2),
            frequency: 14,
            wage: 17,
            hours: 80,
            overtimeHours: 0,
            taxRate: 0.1823,
            preTaxDeductionsTotal: 0.06,
            postTaxDeductionsTotal: 21.54
        }),
        new MoneyMove({ // With $2.00 shift differential
            name: "Employment MRAOJL",
            incomeType: "hourly",
            type: "income",
            basedOnDate: false,
            date: null,
            account: "Capital One Checkings",
            startFrom: new Date(2022, 3, 15),
            endFrom: new Date(2023, 2, 1),
            frequency: 14,
            wage: 23.80,
            hours: 80,
            overtimeHours: 0,
            taxRate: 0.219,
            preTaxDeductionsTotal: 0.06,
            postTaxDeductionsTotal: 21.54
        }),
        new MoneyMove({ // With $2.00 shift differential
            name: "Employment MJT",
            incomeType: "hourly",
            type: "income",
            basedOnDate: false,
            date: null,
            account: "Capital One Checkings",
            startFrom: new Date(2023, 2, 3),
            endFrom: null,
            frequency: 14,
            wage: 33.40,
            hours: 80,
            overtimeHours: 0,
            taxRate: 0.248,
            preTaxDeductionsTotal: 0.06,
            postTaxDeductionsTotal: 21.54
        }),
        new MoneyMove({
            name: "Food Stipend",
            incomeType: "exact",
            type: "income",
            basedOnDate: false,
            date: null,
            account: "Capital One Checkings",
            startFrom: new Date(2022, 0, 3),
            endFrom: new Date(2022, 2, 25),
            frequency: 14,
            amount: 630.00
        }),
        // new MoneyMove({
        //     name: "Helium Miner",
        //     incomeType: "exact",
        //     type: "income",
        //     basedOnDate: false,
        //     date: null,
        //     account: "Capital One Checkings",
        //     startFrom: new Date(2022, 0, 7),
        //     endFrom: null,
        //     frequency: 14,
        //     amount: 120.00
        // })
    ]
};