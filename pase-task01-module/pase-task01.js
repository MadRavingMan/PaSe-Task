const pradinis = { 
    "date": "2016-01-05",
    "user_id": 1,
    "user_type": "natural",
    "type": "cash_in",
    "operation": { 
        "amount": 200.00,
        "currency": "EUR" 
    }
};

const juridinis = {
    "date": "2016-01-06",
    "user_id": 2,
    "user_type": "juridical",
    "type": "cash_out",
    "operation": {
        "amount": 300.00, 
        "currency": "EUR" 
    }
};

const operationType = pradinis.type.toLowerCase();
const userType = pradinis.user_type.toLowerCase();
const operationAmount = pradinis.operation.amount;
const commissionFeesOptions = require('./constants/commissionFees.json');

console.log('option', commissionFeesOptions);

function commissionFeeCounter(){
    if (operationType === 'cash_in'){
        const commissionFeeIn = operationAmount * commissionFeesOptions.cash_in.percents * 0.01;
        const finalCommissionFeeIn = commissionFeeIn < commissionFeesOptions.cash_in.max.amount ? commissionFeeIn : maxInFeeAmount;
        return finalCommissionFeeIn;
    }

    if (operationType === 'cash_out'){
        if (userType === 'natural'){

        }

    } else {
       return console.log('Try again (01)');
    }

}

module.exports.commissionFeeCounter = commissionFeeCounter;