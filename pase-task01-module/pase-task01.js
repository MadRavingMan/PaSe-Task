let allPaymentsHistory = [];

function commissionFees( file ){

    const inputClientsOperations = require(`../${file}`);
    inputClientsOperations.forEach( clientOperation => commissionFeeCounter(clientOperation));

}

function commissionFeeCounter( data ){
    const operationDate = data.date;
    const operationUser = data.user_id;
    const userType = data.user_type.toLowerCase();
    const operationType = data.type.toLowerCase();
    const operationAmount = data.operation.amount;
    const commissionFeesOptions = require('./constants/commissionFees.json');
    const percentMultiplier = 0.01;


    if (operationType === 'cash_in'){
        const commissionFeeInPercents = commissionFeesOptions.cash_in.percents;
        const commissionFeeInMaxAmount = commissionFeesOptions.cash_in.max.amount;

        const commissionFeeIn = operationAmount * commissionFeeInPercents;
        const commissionFeeInRoundUp = Math.ceil(commissionFeeIn) * percentMultiplier;
        const finalCommissionFeeIn = commissionFeeInRoundUp < commissionFeeInMaxAmount ? commissionFeeInRoundUp : commissionFeeInMaxAmount;
        console.log(finalCommissionFeeIn.toFixed(2));

    } else if (operationType === 'cash_out'){

        if (userType === 'natural'){
            const commissionFeeOutLegPercents = commissionFeesOptions.cash_out_legal.percents;
            const commissionFeeOutLegWeekAmount = commissionFeesOptions.cash_out_legal.week_limit.amount;
            
            const weekNo = getWeekNo( operationDate );
            const paymentHistory = allPaymentsHistory.find( user => user.weekNo === weekNo && user.user_id === operationUser);
            
            if (!paymentHistory){
                data.weekNo = weekNo;
                data.operation.amount = operationAmount - commissionFeeOutLegWeekAmount;
                allPaymentsHistory.push(data);

                data.operation.amount > 0 ? commissionFeeOutLegal(data.operation.amount) : commissionFeeOutLegal(0);
            
            }else if (paymentHistory.operation.amount > 0){
                const paymentHistoryIndex = allPaymentsHistory.findIndex( user => user.weekNo === weekNo && user.user_id === operationUser);
                const sumPaymentHistory = allPaymentsHistory[paymentHistoryIndex].operation.amount + operationAmount;
                allPaymentsHistory[paymentHistoryIndex].operation.amount = sumPaymentHistory;

                commissionFeeOutLegal( operationAmount );
            
            }else if (paymentHistory.operation.amount < 0){
                const amountToTax = operationAmount + paymentHistory.operation.amount;

                amountToTax > 0 ? commissionFeeOutLegal(operationAmount) : commissionFeeOutLegal(0);
            }
        
            function commissionFeeOutLegal ( taxedOperationAmount ) {
                const commissionFeeOutLegal = taxedOperationAmount * commissionFeeOutLegPercents;
                const commissionFeeOutLegalRoundUp = Math.ceil(commissionFeeOutLegal) * percentMultiplier;
                console.log(commissionFeeOutLegalRoundUp.toFixed(2));
            }

        } else if (userType === 'juridical'){
            const commissionFeeOutJurPercents = commissionFeesOptions.cash_out_juridical.percents;
            const commissionFeeOutJurMinAmount = commissionFeesOptions.cash_out_juridical.min.amount;

            const commissionFeeOutJuridical = operationAmount * commissionFeeOutJurPercents;
            const commissionFeeOutJuridicalRoundUp = Math.ceil(commissionFeeOutJuridical) * percentMultiplier;
            const finalCommissionFeeOutJuridical = commissionFeeOutJuridicalRoundUp < commissionFeeOutJurMinAmount ? commissionFeeOutJurMinAmount : commissionFeeOutJuridicalRoundUp;
            console.log(finalCommissionFeeOutJuridical.toFixed(2));
        } else {
            console.log('Try again (01)', data);
        }
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

exports.commissionFees = commissionFees;