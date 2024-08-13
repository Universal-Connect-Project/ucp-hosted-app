# UCP UI

This is the UCP User Interface.

This repo is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more
information.

## Getting Started

From the root of the monorepo, do the following:

1. Run `cp ./apps/ucp-ui/cypress.example.env.json ./apps/ucp-ui/cypress.env.json` to copy the example
   cypress env file for this project
1. Set up your cypress environment variables in the new file
1. Run `npm run dev --workspace apps/ucp-ui` to start the server

## CSS modules with VSCode

Visual Studio Code needs (to use the workspace version of typescript)[https://www.npmjs.com/package/typescript-plugin-css-modules/v/1.1.1#visual-studio-code] to remove errors when importing a css module
