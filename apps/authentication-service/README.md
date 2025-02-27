# UCP Authentication Service

This is the UCP Authentication Service. It provides the authentication and authorization
functionality for the UCP platform.

This repo is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more
information.

See [ARCHITECTURE](./ARCHITECTURE.md) for more information about the authentication architecture of this project.

## Contributing

### Getting Started

If you want to run this project by itself, without running the other services in the monorepo, do the following:

All of these commands should be run from the root of the monorepo:

1. Run `npm run copyAuthenticationEnv` to copy the secret .env files for this service
1. Set up your environment variables in the new .env files
1. Run `npm run dev --workspace apps/authentication-service` to start the server

## Auth0

We are using [Auth0](https://auth0.com/) as our authentication provider.

For more information about Auth0, please see the [Auth0 Docs](https://auth0.com/docs/)

## Testing with Cypress

We have a rate-limit test that needs to be run with the following command, prior to launching cypress:

`npm run dev:rate-limit`

For all other e2e tests, run `npm run dev` prior to launching cypress.

The rate-limiting tests don't need to be run locally, as they are run during our CI pipeline. Unless you are changing
some
code related to rate-limiting, don't worry about running them.
