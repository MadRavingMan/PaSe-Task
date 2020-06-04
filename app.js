// const paseTask01 = require('./pase-task01-module/pase-task01');

console.log('veikia');
console.log(process.argv);

const inputVariable = process.argv.slice(2)[0];

switch(inputVariable) {
  case 'input.json':
    const inputClientOperations = require('./input.json');
    console.log(inputClientOperations);
    break;

  default:
    console.log('bad input');
}
