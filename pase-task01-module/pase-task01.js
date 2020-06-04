const inputClientsOperations = require('../input.json');
const commissionFeesOptions = require('./constants/commissionFees.json');
let weekAmountUsage = [];

const commissionFees = inputClientsOperations.forEach( clientOperation => commissionFeeCounter(clientOperation));

function commissionFeeCounter( data ){
    const operationDate = data.date;
    const operationUser = data.user_id;
    const userType = data.user_type.toLowerCase();
    const operationType = data.type.toLowerCase();
    const operationAmount = data.operation.amount;
    let result = 0;

    if (operationType === 'cash_in'){
        const commissionFeeInPercents = commissionFeesOptions.cash_in.percents;
        const commissionFeeInMaxAmount = commissionFeesOptions.cash_in.max.amount;

        const commissionFeeIn = operationAmount * commissionFeeInPercents;
        const commissionFeeInRoundUp = Math.ceil(commissionFeeIn) * 0.01;
        const finalCommissionFeeIn = commissionFeeInRoundUp < commissionFeeInMaxAmount ? commissionFeeInRoundUp : commissionFeeInMaxAmount;
        console.log(finalCommissionFeeIn.toFixed(2));

    } else if (operationType === 'cash_out'){
        // Default commission fee - 0.3% from cash out amount.
        // 1000.00 EUR per week (from monday to sunday) is free of charge.
        // If total cash out amount is exceeded - commission is calculated only from exceeded amount
        // (that is, for 1000.00 EUR there is still no commission fee).
        if (userType === 'natural'){
            const commissionFeeOutLegPercents = commissionFeesOptions.cash_out_legal.percents;
            const commissionFeeOutLegWeekAmount = commissionFeesOptions.cash_out_legal.week_limit.amount;
            
            const weekNo = getWeekNo( operationDate );

            console.log('nebaigta');
        };

        if (userType === 'juridical'){
            const commissionFeeOutJurPercents = commissionFeesOptions.cash_out_juridical.percents;
            const commissionFeeOutJurMinAmount = commissionFeesOptions.cash_out_juridical.min.amount;

            const commissionFeeOutJuridical = operationAmount * commissionFeeOutJurPercents;
            const commissionFeeOutJuridicalRoundUp = Math.ceil(commissionFeeOutJuridical) * 0.01;
            const finalCommissionFeeOutJuridical = commissionFeeOutJuridicalRoundUp < commissionFeeOutJurMinAmount ? commissionFeeOutJurMinAmount : commissionFeeOutJuridicalRoundUp;
            console.log(finalCommissionFeeOutJuridical.toFixed(2));
        };
    } else {
       console.log('Try again (01)', data);
    }
}

function getWeekNo( date ){
    const dateToNumber = date.split('-');
    const yyyy = parseInt(dateToNumber[0]);
    const mm = parseInt(dateToNumber[1]);
    const dd = parseInt(dateToNumber[2]);

    const weeknumber = require('weeknumber');
    const wk = weeknumber.weekNumber(new Date(yyyy, (mm-1), dd, 12));
    return wk;
}