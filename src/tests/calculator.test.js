const { spawnSync } = require('node:child_process');
const path = require('node:path');
const {
  calculate, parseNumber, addition, subtraction, multiplication, division, modulo, power, squareRoot,
} = require('../calculator');

describe('funções de operações', () => {
  test.each([
    ['addition', addition, 2, 3, 5],
    ['subtraction', subtraction, 10, 4, 6],
    ['multiplication', multiplication, 45, 2, 90],
    ['division', division, 20, 5, 4],
    ['modulo', modulo, 10, 3, 1],
    ['power', power, 2, 3, 8],
  ])('%s calcula o resultado', (_name, operation, first, second, expected) => {
    expect(operation(first, second)).toBe(expected);
  });

  test.each([0, -0])('division rejeita divisor zero (%s)', (zero) => {
    expect(() => division(5, zero)).toThrow('Não é possível dividir por zero.');
  });

  test.each([0, -0])('modulo rejeita divisor zero (%s)', (zero) => {
    expect(() => modulo(5, zero)).toThrow('Não é possível calcular o resto da divisão por zero.');
  });

  test.each([
    [-10, 3, -1],
    [10, -3, 1],
    [0, 3, 0],
  ])('modulo(%s, %s) = %s', (a, b, expected) => {
    expect(modulo(a, b)).toBe(expected);
  });

  test.each([
    [2, 0, 1],
    [2, -2, 0.25],
    [-2, 3, -8],
  ])('power(%s, %s) = %s', (base, exponent, expected) => {
    expect(power(base, exponent)).toBe(expected);
  });

  test.each([[0, 0], [9, 3], [2, Math.sqrt(2)]])(
    'squareRoot(%s) = %s', (n, expected) => {
      expect(squareRoot(n)).toBe(expected);
    }
  );

  test('squareRoot rejeita números negativos', () => {
    expect(() => squareRoot(-1)).toThrow('Não é possível calcular a raiz quadrada de um número negativo.');
  });
});

describe('calculate', () => {
  test.each([
    [2, '+', 3, 5],
    [10, '-', 4, 6],
    [45, '*', 2, 90],
    [20, '/', 5, 4],
    [-2, '+', 3, 1],
    [0, '+', 0, 0],
    [3, '-', 10, -7],
    [-3, '-', -2, -1],
    [-2.5, '*', 4, -10],
    [9, '*', 0, 0],
    [9, '/', 2, 4.5],
    [-9, '/', 3, -3],
    [10, '%', 3, 1],
    [2, '^', 3, 8],
  ])('%s %s %s = %s', (first, operation, second, expected) => {
    expect(calculate(first, operation, second)).toBe(expected);
  });

  test.each([0, -0])('rejeita divisão por zero (%s)', (zero) => {
    expect(() => calculate(5, '/', zero)).toThrow('Não é possível dividir por zero.');
  });

  test('rejeita operações não suportadas', () => {
    expect(() => calculate(1, '?', 2)).toThrow('Operação inválida.');
  });
});

describe('parseNumber', () => {
  test.each([
    ['0', 0],
    ['-2.5', -2.5],
    ['+.5', 0.5],
    ['2.', 2],
    ['1e-2', 0.01],
  ])('converte %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  test.each(['', ' ', 'abc', '1abc', '0x10', 'Infinity', '1,5'])(
    'rejeita entrada inválida: %s',
    (input) => {
      expect(() => parseNumber(input)).toThrow('Os operandos devem ser números válidos.');
    }
  );

  test('rejeita números fora do intervalo finito', () => {
    expect(() => parseNumber('1e309')).toThrow('Os operandos devem ser números finitos.');
  });
});

describe('CLI', () => {
  const calculator = path.join(__dirname, '..', 'calculator.js');
  const run = (...args) => spawnSync(process.execPath, [calculator, ...args], { encoding: 'utf8' });

  test.each([
    ['2', '+', '3', '5'],
    ['10', '-', '4', '6'],
    ['45', '*', '2', '90'],
    ['20', '/', '5', '4'],
    ['10', '%', '3', '1'],
    ['2', '^', '3', '8'],
  ])('exibe o resultado de %s %s %s', (first, operation, second, expected) => {
    const result = run(first, operation, second);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(expected);
    expect(result.stderr).toBe('');
  });

  test('exibe o resultado da raiz quadrada', () => {
    const result = run('sqrt', '9');
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe('3');
    expect(result.stderr).toBe('');
  });

  test.each(['-h', '--help'])('exibe ajuda com %s', (option) => {
    const result = run(option);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Uso:');
  });

  test.each([
    [['1', '/', '0'], 'Não é possível dividir por zero.'],
    [['abc', '+', '2'], 'Os operandos devem ser números válidos.'],
    [['1', '?', '2'], 'Operação inválida.'],
    [['1', '%', '0'], 'Não é possível calcular o resto da divisão por zero.'],
    [['sqrt', '-1'], 'Não é possível calcular a raiz quadrada de um número negativo.'],
    [['sqrt', 'abc'], 'Os operandos devem ser números válidos.'],
    [['2', '^', '1024'], 'O resultado está fora do intervalo permitido.'],
    [['1e308', '*', '2'], 'O resultado está fora do intervalo permitido.'],
    [['1', '+'], 'Uso:'],
  ])('retorna erro para %j', (args, message) => {
    const result = run(...args);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
    expect(result.stdout).toBe('');
  });
});
