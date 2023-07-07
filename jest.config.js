/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/test/fixtures/', '/test/tmp'],
  transformIgnorePatterns: ['/node_modules/'],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
};
