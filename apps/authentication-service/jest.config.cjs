/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  coveragePathIgnorePatterns: ["<rootDir>/src/test"],
  setupFilesAfterEnv: ["<rootDir>/jestSetup.js"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
