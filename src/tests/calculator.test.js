const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { addition, subtraction, multiplication, division, modulo, power, squareRoot } = require('../calculator');

const calculator = path.join(__dirname, '..', 'calculator.js');
const run = (...args) => spawnSync(process.execPath, [calculator, ...args], { encoding: 'utf8' });

test('operações básicas', () => {
  assert.equal(addition(2, 3), 5);
  assert.equal(subtraction(2, 3), -1);
  assert.equal(multiplication(2, 3), 6);
  assert.equal(division(6, 3), 2);
  assert.throws(() => division(1, 0), RangeError);
});

test('modulo calcula o resto e rejeita divisor zero', () => {
  assert.equal(modulo(10, 3), 1);
  assert.equal(modulo(-10, 3), -1);
  assert.equal(modulo(10, 2), 0);
  assert.throws(() => modulo(1, 0), RangeError);
});

test('power calcula expoentes positivos, negativos e zero', () => {
  assert.equal(power(2, 3), 8);
  assert.equal(power(2, -2), 0.25);
  assert.equal(power(0, 0), 1);
});

test('squareRoot calcula raízes e rejeita números negativos', () => {
  assert.equal(squareRoot(9), 3);
  assert.equal(squareRoot(0), 0);
  assert.equal(squareRoot(2), Math.sqrt(2));
  assert.throws(() => squareRoot(-1), RangeError);
});

test('CLI executa as operações com a quantidade correta de operandos', () => {
  for (const [args, expected] of [
    [['addition', '2', '3'], '5'],
    [['modulo', '-10', '3'], '-1'],
    [['power', '2', '-2'], '0.25'],
    [['exponentiation', '2', '3'], '8'],
    [['squareRoot', '9'], '3'],
    [['sqrt', '0'], '0'],
  ]) {
    const result = run(...args);
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), expected);
  }
});

test('CLI rejeita operações, operandos e cálculos inválidos', () => {
  for (const args of [
    [], ['toString', '1'], ['modulo', '1'], ['sqrt', '9', '2'],
    ['power', '2', ''], ['power', '2', 'abc'], ['power', 'Infinity', '2'],
    ['modulo', '1', '0'], ['division', '1', '0'], ['sqrt', '-1'],
  ]) {
    const result = run(...args);
    assert.equal(result.status, 1, args.join(' '));
    assert.notEqual(result.stderr.trim(), '');
    assert.equal(result.stdout, '');
  }
});
