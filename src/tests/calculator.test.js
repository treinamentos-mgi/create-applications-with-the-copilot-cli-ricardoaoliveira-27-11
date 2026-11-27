const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { calculate, parseNumber } = require('../calculator');

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
  ])('%s %s %s = %s', (first, operation, second, expected) => {
    expect(calculate(first, operation, second)).toBe(expected);
  });

  test.each([0, -0])('rejeita divisão por zero (%s)', (zero) => {
    expect(() => calculate(5, '/', zero)).toThrow('Não é possível dividir por zero.');
  });

  test('rejeita operações não suportadas', () => {
    expect(() => calculate(1, '%', 2)).toThrow('Operação inválida.');
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
  ])('exibe o resultado de %s %s %s', (first, operation, second, expected) => {
    const result = run(first, operation, second);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(expected);
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
    [['1', '%', '2'], 'Operação inválida.'],
    [['1e308', '*', '2'], 'O resultado está fora do intervalo permitido.'],
    [['1', '+'], 'Uso:'],
  ])('retorna erro para %j', (args, message) => {
    const result = run(...args);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
    expect(result.stdout).toBe('');
  });
});
