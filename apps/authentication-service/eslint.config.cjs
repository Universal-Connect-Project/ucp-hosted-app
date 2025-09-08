const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");
const jest = require("eslint-plugin-jest");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");
const cypress = require("eslint-plugin-cypress");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        project: true,
        // tsconfigRootDir: __dirname,
      },
    },

    extends: compat.extends(
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended-type-checked",
      "prettier",
    ),

    plugins: {
      prettier,
      cypress,
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
  },
  globalIgnores([
    "**/eslint.config.cjs",
    "**/cypress.config.ts",
    "**/jest.config.cjs",
    "**/jestSetup.js",
  ]),
  {
    files: ["tests/**/*"],

    plugins: {
      jest,
    },

    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
  },
]);
