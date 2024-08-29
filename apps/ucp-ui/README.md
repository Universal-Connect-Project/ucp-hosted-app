# UCP UI

This is the UCP User Interface. It provides the UI for the UCP platform, and allows the user to manage various aspects of their account, as well as interact with the underlying services.

This project is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more information.

## Getting Started

If you want to run this project by itself, without running the other services in the monorepo, do the following:

All of these commands should be run from the root of the monorepo:

1. Run `cp ./apps/ucp-ui/cypress.example.env.json ./apps/ucp-ui/cypress.env.json` to copy the example
   cypress env file for this project
1. Set up your cypress environment variables in the new file
1. Run `npm run dev --workspace apps/ucp-ui` to start the server

## CSS modules with VSCode

Visual Studio Code needs (to use the workspace version of typescript)[https://www.npmjs.com/package/typescript-plugin-css-modules/v/1.1.1#visual-studio-code] to remove errors when importing a css module
