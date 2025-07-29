/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/src/**/__tests__/**/*.+(ts|tsx)',
    '**/src/**/?(*.)+(spec|test).+(ts|tsx)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', {
      // ts-jest configuration goes here
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
