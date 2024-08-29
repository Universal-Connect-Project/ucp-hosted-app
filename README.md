# Universal Connect Project - Hosted Applications

This is a monorepo for the UCP-hosted applications and services. It uses [TurboRepo](https://turbo.build/repo)

These applications are hosted by the Universal Connect Project, and are not intended to be hosted by a customer. The [UCW-App](https://github.com/Universal-Connect-Project/ucw-app) application, which is a customer-hosted service, interacts with these UCP-hosted services. UCP-App has been built in such a way that it does rely on these hosted services in order to function as expected. It can use them to update data, but does not require them.

This monorepo contains the following applications:

- **[Authentication Service](./apps/authentication-service/README.md)** - This service consists of client and server authentication for the Universal Connect Project. It uses Auth0 as a backend.
  - _This service is currently in development._
- **[Institution Service](./apps/institution-service/README.md)** - This service manages all interaction with the Institution list, including retrieving an updated list of institutions, adding/editing/deleting institutions, etc.
  - _This service is currently in development._
- **[UCP UI](./apps/ucp-ui/README.md)** - The dashboard web application for the Universal Connect Project. This is where a user can manage various aspects of their account, as well as interact with the UCP-hosted services.
  - _This application is currently in development._

## Contributing

### Getting Started

Once you have prepped each application, you can run them all from the root of the monorepo.

1. Clone the repo
1. Read the README.md files in each application under the `apps` folder, following the instructions for each app, such as getting env variables setup, etc.
1. Once you've finished, from the root of the monorepo, run `npm install`
1. Run: `npm run dev`

## Architecture decision records

We use [architecture decision records](https://adr.github.io/) to make, document, and enforce our decisions. They live in the [architectureDecisionRecords](./architectureDecisionRecords) folder.
