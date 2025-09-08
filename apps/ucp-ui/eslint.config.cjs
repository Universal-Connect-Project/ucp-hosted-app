const { defineConfig, globalIgnores } = require("eslint/config");

const globals = require("globals");

const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");

const jest = require("eslint-plugin-jest");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-plugin-prettier");
const react = require("eslint-plugin-react");
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
        tsconfigRootDir: __dirname,
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:react-hooks/recommended",
        // "plugin:react/jsx-runtime",
        "prettier",
      ),
    ),

    settings: {
      react: {
        version: "detect",
      },
    },

    plugins: {
      prettier,
      react: fixupPluginRules(react),
      cypress,
    },

    rules: {
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
    },
  },
  globalIgnores([
    "**/dist",
    "**/eslint.config.cjs",
    "**/webpack.config.js",
    "**/cypress.config.ts",
    "**/jest.config.cjs",
    "**/jestSetup.js",
    "**/jest.polyfills.js",
    "**/server.js",
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
