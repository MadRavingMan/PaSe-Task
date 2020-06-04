const inputVariable = process.argv.slice(2)[0];
const calcFees = require('./pase-task01-module/pase-task01');
calcFees.commissionFees(inputVariable);
