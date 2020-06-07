const inputVariable = process.argv.slice(2)[0];

if (!inputVariable) return console.log('wrong input');

const calcFees = require('./pase-task01-module/pase-task01');
calcFees.commissionFees(inputVariable);
