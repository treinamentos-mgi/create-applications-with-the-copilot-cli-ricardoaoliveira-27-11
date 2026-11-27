#!/usr/bin/env node

const usage = 'Uso: node src/calculator.js <número> <operação> <número>\n' +
  '     node src/calculator.js sqrt <número>\n' +
  'Operações: + (adição), - (subtração), * (multiplicação), / (divisão), ' +
  '% (resto), ^ (potenciação), sqrt (raiz quadrada)\n' +
  'Exemplos: node src/calculator.js 6 "*" 3; node src/calculator.js sqrt 9';

function parseNumber(value) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) {
    throw new Error('Os operandos devem ser números válidos.');
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error('Os operandos devem ser números finitos.');
  }
  return number;
}

// Suporta adição, subtração, multiplicação, divisão, resto, potência e raiz quadrada.
function addition(first, second) {
  return first + second;
}

function subtraction(first, second) {
  return first - second;
}

function multiplication(first, second) {
  return first * second;
}

function division(first, second) {
  if (second === 0) {
    throw new Error('Não é possível dividir por zero.');
  }
  return first / second;
}

function modulo(a, b) {
  if (b === 0) {
    throw new Error('Não é possível calcular o resto da divisão por zero.');
  }
  return a % b;
}

function power(base, exponent) {
  return base ** exponent;
}

function squareRoot(n) {
  if (n < 0) {
    throw new Error('Não é possível calcular a raiz quadrada de um número negativo.');
  }
  return Math.sqrt(n);
}

function calculate(first, operation, second) {
  switch (operation) {
    case '+':
      return addition(first, second);
    case '-':
      return subtraction(first, second);
    case '*':
      return multiplication(first, second);
    case '/':
      return division(first, second);
    case '%':
      return modulo(first, second);
    case '^':
      return power(first, second);
    default:
      throw new Error('Operação inválida.');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage);
  } else if (args.length !== 3 && !(args.length === 2 && args[0] === 'sqrt')) {
    console.error(usage);
    process.exitCode = 1;
  } else {
    try {
      const result = args.length === 2
        ? squareRoot(parseNumber(args[1]))
        : calculate(parseNumber(args[0]), args[1], parseNumber(args[2]));
      if (!Number.isFinite(result)) {
        throw new Error('O resultado está fora do intervalo permitido.');
      }
      console.log(result);
    } catch (error) {
      console.error(`Erro: ${error.message}`);
      process.exitCode = 1;
    }
  }
}

module.exports = {
  parseNumber, calculate, addition, subtraction, multiplication, division, modulo, power, squareRoot,
};
