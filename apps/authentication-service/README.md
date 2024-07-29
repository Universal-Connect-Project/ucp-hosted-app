# UCP Authentication Service

This is the UCP Authentication Service. It provides the authentication and authorization
functionality for the UCP platform.

This repo is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more
information.

## Getting Started

From the root of the monorepo, do the following:

1. Run `cp ./apps/authentication-service/src/.env.example ./apps/authentication-service/src/.env` to copy the example
   .env file for this project
1. Set up your environment variables in the new .env file
1. Run `npm run dev --workspace apps/authentication-service` to start the server

## Auth0

We are using [Auth0](https://auth0.com/) as our authentication provider.

For more information about Auth0, please see the [Auth0 Docs](https://auth0.com/docs/)
