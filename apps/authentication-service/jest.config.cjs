/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/jestSetup.js"],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
  },
};
