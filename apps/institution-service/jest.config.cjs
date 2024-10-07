/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  restoreMocks: true,
  setupFilesAfterEnv: ["<rootDir>/jestSetup.ts"],
  testEnvironment: "node",
};
