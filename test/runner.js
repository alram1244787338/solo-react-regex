import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tests = [];
let currentSuite = '';

export function describe(name, fn) {
  currentSuite = name;
  fn();
  currentSuite = '';
}

export function it(name, fn) {
  tests.push({ suite: currentSuite, name, fn });
}

export const expect = (actual) => ({
  toBe(expected) {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toStrictEqual(expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(`Expected ${e} but got ${a}`);
    }
  },
  toBeNull() {
    if (actual !== null) {
      throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
    }
  },
  toBeTruthy() {
    if (!actual) {
      throw new Error(`Expected truthy but got ${JSON.stringify(actual)}`);
    }
  },
  toBeDefined() {
    if (actual === undefined) {
      throw new Error(`Expected defined but got undefined`);
    }
  },
  toContain(item) {
    if (!Array.isArray(actual) && typeof actual !== 'string') {
      throw new Error(`toContain called on non-array/string: ${typeof actual}`);
    }
    if (!actual.includes(item)) {
      throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(item)}`);
    }
  },
  toHaveLength(n) {
    if (actual.length !== n) {
      throw new Error(`Expected length ${n} but got ${actual.length}`);
    }
  },
});

async function run() {
  let passed = 0;
  let failed = 0;
  const failures = [];

  const testFiles = process.argv.length > 2
    ? process.argv.slice(2)
    : fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.test.mjs'))
        .map(f => path.join(__dirname, f));

  for (const file of testFiles) {
    const filePath = path.isAbsolute(file) ? file : path.join(__dirname, file);
    const fileUrl = path.resolve(filePath).replace(/\\/g, '/');
    await import(`file://${fileUrl}`);
  }

  for (const test of tests) {
    const fullName = test.suite ? `${test.suite} > ${test.name}` : test.name;
    try {
      await test.fn();
      passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${fullName}`);
    } catch (err) {
      failed++;
      failures.push({ name: fullName, error: err });
      console.log(`  \x1b[31m✗\x1b[0m ${fullName}`);
      console.log(`    \x1b[31m${err.message}\x1b[0m`);
    }
  }

  console.log('');
  if (failed > 0) {
    console.log(`\x1b[31m✗ ${failed} failed\x1b[0m, \x1b[32m${passed} passed\x1b[0m, ${passed + failed} total`);
    process.exitCode = 1;
  } else {
    console.log(`\x1b[32m✓ ${passed} passed\x1b[0m, ${passed + failed} total`);
    process.exitCode = 0;
  }
}

run();
