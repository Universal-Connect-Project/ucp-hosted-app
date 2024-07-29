module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "prettier",
  ],
  ignorePatterns: [
    ".eslintrc.cjs",
    "cypress.config.ts",
    "jest.config.cjs",
    "jestSetup.js",
  ],
  overrides: [
    {
      files: ["tests/**/*"],
      plugins: ["jest"],
      env: {
        "jest/globals": true,
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["prettier", "cypress"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
  },
};
