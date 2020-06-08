let legalPaymentsHistory = [];

function commissionFees( file ){

    try{
        const inputClientsOperations = require(`../${file}`);
        if (!inputClientsOperations || inputClientsOperations.length === 0){
            return console.log('try again (02)', inputClientsOperations);
        }
    
        inputClientsOperations.forEach( clientOperation => console.log(commissionFeeCounter(clientOperation)));

    }
    catch(err){
        console.log(err);
    }

}

function commissionFeeCounter( data ){
    const operationDate = data.date;
    const operationUser = data.user_id;
    const userType = data.user_type.toLowerCase();
    const operationType = data.type.toLowerCase();
    const operationAmount = data.operation.amount;
    const commissionFeesOptions = require('./constants/commissionFees.json');
    const percentMultiplier = 0.01;

    if (data.operation.currency.toUpperCase() != 'EUR') return 'not calculating in other currency, than EUR';


    if (operationType === 'cash_in'){
        const commissionFeeInPercents = commissionFeesOptions.cash_in.percents;
        const commissionFeeInMaxAmount = commissionFeesOptions.cash_in.max.amount;

        const commissionFeeIn = operationAmount * commissionFeeInPercents;
        const commissionFeeInRoundUp = Math.ceil(commissionFeeIn) * percentMultiplier;
        const finalCommissionFeeIn = commissionFeeInRoundUp < commissionFeeInMaxAmount ? commissionFeeInRoundUp : commissionFeeInMaxAmount;
        
        return finalCommissionFeeIn.toFixed(2);

    } else if (operationType === 'cash_out'){
        if (userType === 'natural'){
            
            const commissionFeeOutLegPercents = commissionFeesOptions.cash_out_legal.percents;
            const commissionFeeOutLegWeekAmount = commissionFeesOptions.cash_out_legal.week_limit.amount;
            
            const weekNo = getWeekNo( operationDate );
            const paymentHistory = legalPaymentsHistory.find( user => user.weekNo === weekNo && user.user_id === operationUser);
            
            if (!paymentHistory){

                data.weekNo = weekNo;
                data.operation.amount = operationAmount - commissionFeeOutLegWeekAmount;
                legalPaymentsHistory.push(data);

                return data.operation.amount > 0 ? commissionFeeOutLegal(data.operation.amount) : commissionFeeOutLegal(0);
            
            }else if (paymentHistory.operation.amount > 0){
                const paymentHistoryIndex = legalPaymentsHistory.findIndex( user => user.weekNo === weekNo && user.user_id === operationUser);
                legalPaymentsHistory[paymentHistoryIndex].operation.amount += operationAmount;

                return commissionFeeOutLegal( operationAmount );
            
            }else if (paymentHistory.operation.amount <= 0){
                const amountToTax = operationAmount + paymentHistory.operation.amount;

                return amountToTax > 0 ? commissionFeeOutLegal(operationAmount) : commissionFeeOutLegal(0);
            }else{
                console.log('wrong data: ', data);
            }
        
            function commissionFeeOutLegal ( taxedOperationAmount ) {
                const commissionFeeOutLegal = taxedOperationAmount * commissionFeeOutLegPercents;
                const commissionFeeOutLegalRoundUp = Math.ceil(commissionFeeOutLegal) * percentMultiplier;
                return commissionFeeOutLegalRoundUp.toFixed(2);
            }

        } else if (userType === 'juridical'){
            const commissionFeeOutJurPercents = commissionFeesOptions.cash_out_juridical.percents;
            const commissionFeeOutJurMinAmount = commissionFeesOptions.cash_out_juridical.min.amount;

            const commissionFeeOutJuridical = operationAmount * commissionFeeOutJurPercents;
            const commissionFeeOutJuridicalRoundUp = Math.ceil(commissionFeeOutJuridical) * percentMultiplier;
            const finalCommissionFeeOutJuridical = commissionFeeOutJuridicalRoundUp < commissionFeeOutJurMinAmount ? commissionFeeOutJurMinAmount : commissionFeeOutJuridicalRoundUp;
            return finalCommissionFeeOutJuridical.toFixed(2);

        } else {
            console.log('unable to resolve user type', data);
        }
        
    }else{
        console.log('unable to resolve operation type. ', data);
    }
}

function getWeekNo( date ){
    const dateToNumber = date.split('-');
    const yyyy = parseInt(dateToNumber[0]);
    const mm = parseInt(dateToNumber[1]);
    const dd = parseInt(dateToNumber[2]);

    const weekNumber = require('weeknumber');
    const weekNo = weekNumber.weekNumber(new Date(yyyy, mm-1, dd, 12));
    return weekNo;
}

exports.commissionFees = commissionFees;
exports.commissionFeeCounter = commissionFeeCounter;
exports.getWeekNo = getWeekNo;
