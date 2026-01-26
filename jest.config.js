/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '@domain/(.*)': '<rootDir>/src/domain/$1',
        '@application/(.*)': '<rootDir>/src/application/$1',
        '@infrastructure/(.*)': '<rootDir>/src/infrastructure/$1',
        '@cli/(.*)': '<rootDir>/src/cli/$1',
        '@reporting/(.*)': '<rootDir>/src/reporting/$1',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/index.ts',
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
