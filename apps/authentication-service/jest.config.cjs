/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/test",
    "<rootDir>/src/middleware",
  ],
  setupFilesAfterEnv: ["<rootDir>/jestSetup.js"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
