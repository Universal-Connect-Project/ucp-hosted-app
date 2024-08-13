/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    "\\.(css)$": "identity-obj-proxy",
  },
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jestSetup.js"],
  testEnvironment: "jsdom",
};
