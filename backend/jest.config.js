/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@medikiosk/shared-types$': '<rootDir>/../packages/shared-types/src/index.ts',
    '^@medikiosk/clinical-schema$': '<rootDir>/../packages/clinical-schema/src/index.ts',
    '^@medikiosk/fhir-mapper$': '<rootDir>/../packages/fhir-mapper/src/index.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  verbose: true,
};
