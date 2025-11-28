module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/packages/client/tests/', // E2E tests
    '/packages/app/',
    '/tests/', // E2E tests
    '\\.spec\\.ts$', // Playwright spec files
    '\\.spec\\.tsx$', // Playwright spec files
  ],
};
