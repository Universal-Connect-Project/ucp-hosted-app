/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  restoreMocks: true,
  testEnvironment: "node",
  setupFiles: ["./src/dotEnv.ts"],
  setupFilesAfterEnv: ["./jestSetup.ts"],
};
