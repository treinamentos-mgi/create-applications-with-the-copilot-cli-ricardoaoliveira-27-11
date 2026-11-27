function addition(a, b) {
  return a + b;
}

function subtraction(a, b) {
  return a - b;
}

function multiplication(a, b) {
  return a * b;
}

function division(a, b) {
  if (b === 0) throw new RangeError('Divisão por zero');
  return a / b;
}

function modulo(a, b) {
  if (b === 0) throw new RangeError('Divisão por zero');
  return a % b;
}

function power(base, exponent) {
  return Math.pow(base, exponent);
}

function squareRoot(n) {
  if (n < 0) throw new RangeError('Raiz quadrada de número negativo');
  return Math.sqrt(n);
}

const operations = {
  addition,
  subtraction,
  multiplication,
  division,
  modulo,
  power,
  exponentiation: power,
  squareRoot,
  sqrt: squareRoot,
};

if (require.main === module) {
  const [operation, ...args] = process.argv.slice(2);
  const calculate = Object.hasOwn(operations, operation) && operations[operation];

  if (!calculate || args.length !== calculate.length ||
      args.some(arg => arg.trim() === '' || !Number.isFinite(Number(arg)))) {
    console.error('Uso: node src/calculator.js <operação> <número> [número]');
    process.exitCode = 1;
  } else {
    try {
      console.log(calculate(...args.map(Number)));
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}

module.exports = { addition, subtraction, multiplication, division, modulo, power, squareRoot };
