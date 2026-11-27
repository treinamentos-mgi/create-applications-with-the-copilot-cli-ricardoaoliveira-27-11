#!/usr/bin/env node

const usage = 'Uso: node src/calculator.js <número> <operação> <número>\n' +
  'Operações: + (adição), - (subtração), * (multiplicação), / (divisão)\n' +
  'Exemplo: node src/calculator.js 6 "*" 3';

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

function calculate(first, operation, second) {
  // Suporta adição (+), subtração (-), multiplicação (*) e divisão (/).
  switch (operation) {
    case '+':
      return first + second;
    case '-':
      return first - second;
    case '*':
      return first * second;
    case '/':
      if (second === 0) {
        throw new Error('Não é possível dividir por zero.');
      }
      return first / second;
    default:
      throw new Error('Operação inválida.');
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
    console.log(usage);
  } else if (args.length !== 3) {
    console.error(usage);
    process.exitCode = 1;
  } else {
    try {
      const result = calculate(parseNumber(args[0]), args[1], parseNumber(args[2]));
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

module.exports = { parseNumber, calculate };
