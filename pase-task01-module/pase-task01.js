let legalPaymentsHistory = [];

//Here we have iteration over users payments in given json file.
function commissionFees(file) {

    try {
        const inputClientsOperations = require(`../${file}`);

        if (!inputClientsOperations || inputClientsOperations.length === 0) {
            return console.log('try again (02)', inputClientsOperations);
        }

        inputClientsOperations.forEach(clientOperation => console.log(commissionFeeCounter(clientOperation)));

    }
    catch (err) {
        console.log(err);
    }

}

//Main function for counting fees.
function commissionFeeCounter(data) {
    const operationDate = data.date;
    const operationUser = data.user_id;
    const userType = data.user_type.toLowerCase();
    const operationType = data.type.toLowerCase();
    const operationAmount = data.operation.amount;
    const commissionFeesOptions = require('./constants/commissionFees.json');
    const percentMultiplier = 0.01;

    if (data.operation.currency.toUpperCase() != 'EUR') return 'not calculating in other currency, than EUR';

    //Logic for cash in operations.
    if (operationType === 'cash_in') {
        const commissionFeeInPercents = commissionFeesOptions.cash_in.percents;
        const commissionFeeInMaxAmount = commissionFeesOptions.cash_in.max.amount;

        const commissionFeeIn = operationAmount * commissionFeeInPercents;
        const commissionFeeInRoundUp = Math.ceil(commissionFeeIn) * percentMultiplier;

        //Ternery for not exceeding maximum commision fee.
        const finalCommissionFeeIn = commissionFeeInRoundUp < commissionFeeInMaxAmount ? commissionFeeInRoundUp : commissionFeeInMaxAmount;

        return finalCommissionFeeIn.toFixed(2);

        //Loggic for cash out operations.
    } else if (operationType === 'cash_out') {

        //When user type is natural.
        if (userType === 'natural') {

            const commissionFeeOutLegPercents = commissionFeesOptions.cash_out_legal.percents;
            const commissionFeeOutLegWeekAmount = commissionFeesOptions.cash_out_legal.week_limit.amount;

            //Getting week number from operation date.
            const weekNo = getWeekNo(operationDate);

            //Looking for any cash out done before with the same user and in the same week. 
            const paymentHistory = legalPaymentsHistory.find(user => user.weekNo === weekNo && user.user_id === operationUser);

            //If couldn't find any cash out done before.
            if (!paymentHistory) {

                //Creating new object inside array.
                data.weekNo = weekNo;
                data.operation.amount = operationAmount - commissionFeeOutLegWeekAmount;
                legalPaymentsHistory.push(data);

                //Returning commision fee.
                return data.operation.amount > 0 ? commissionFeeOutLegal(data.operation.amount) : commissionFeeOutLegal(0);

            //If couldn find cash out done before and cash out exceeds free of charge limit.
            } else if (paymentHistory.operation.amount > 0) {

                return commissionFeeOutLegal(operationAmount);

            //when cash out was done before and free of charge limit was not exceeded.
            } else if (paymentHistory.operation.amount <= 0) {

                //calculating total amount of the week.
                const amountToTax = operationAmount + paymentHistory.operation.amount;

                //updating cashed out amount of the week.
                const paymentHistoryIndex = legalPaymentsHistory.findIndex(user => user.weekNo === weekNo && user.user_id === operationUser);
                legalPaymentsHistory[paymentHistoryIndex].operation.amount += amountToTax;

                //ternary if week free of charge amount was reached.
                return amountToTax > 0 ? commissionFeeOutLegal(amountToTax) : commissionFeeOutLegal(0);
            } else {
                console.log('wrong data: ', data, paymentHistory);
            }

            //Calculating cash out fee for legal person.
            function commissionFeeOutLegal(taxedOperationAmount) {
                const commissionFeeOutLegal = taxedOperationAmount * commissionFeeOutLegPercents;
                const commissionFeeOutLegalRoundUp = Math.ceil(commissionFeeOutLegal) * percentMultiplier;
                return commissionFeeOutLegalRoundUp.toFixed(2);
            }

        //Cash out caculation for juridical person.
        } else if (userType === 'juridical') {
            const commissionFeeOutJurPercents = commissionFeesOptions.cash_out_juridical.percents;
            const commissionFeeOutJurMinAmount = commissionFeesOptions.cash_out_juridical.min.amount;

            const commissionFeeOutJuridical = operationAmount * commissionFeeOutJurPercents;
            const commissionFeeOutJuridicalRoundUp = Math.ceil(commissionFeeOutJuridical) * percentMultiplier;
            const finalCommissionFeeOutJuridical = commissionFeeOutJuridicalRoundUp < commissionFeeOutJurMinAmount ? commissionFeeOutJurMinAmount : commissionFeeOutJuridicalRoundUp;
            return finalCommissionFeeOutJuridical.toFixed(2);

        } else {
            console.log('unable to resolve user type', data);
        }

    } else {
        console.log('unable to resolve operation type. ', data);
    }
}

//Getting week number.
function getWeekNo(date) {
    const dateToNumber = date.split('-');
    const yyyy = parseInt(dateToNumber[0]);
    const mm = parseInt(dateToNumber[1]);
    const dd = parseInt(dateToNumber[2]);

    const weekNumber = require('weeknumber');
    const weekNo = weekNumber.weekNumber(new Date(yyyy, mm - 1, dd, 12));
    return weekNo;
}

exports.commissionFees = commissionFees;
exports.commissionFeeCounter = commissionFeeCounter;
exports.getWeekNo = getWeekNo;
