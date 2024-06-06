module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react-hooks/recommended",
    "plugin:react/jsx-runtime",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  ignorePatterns: [
    "dist",
    ".eslintrc.cjs",
    "webpack.config.js",
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
  plugins: ["prettier", "react", "cypress"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: true,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "react/jsx-uses-vars": "error",
    "react/jsx-uses-react": "error",
  },
};
