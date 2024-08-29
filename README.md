# Universal Connect Project - Hosted Applications

This is a monorepo for the Universal Connect Project hosted applications and services. It uses [TurboRepo](https://turbo.build/repo)

These applications are hosted by the Universal Connect Project, and are not intended to be hosted by a customer. The [UCW-App](https://github.com/Universal-Connect-Project/ucw-app) application, which is a customer-hosted service, interacts with these UCP-hosted services, and has been built in such a way that it does not need to rely on these hosted services in order to function as expected. It can use them to update data, but does not require them.

This monorepo contains the following applications:

- **Authentication Service** - This service consists of user and client authentication for the Universal Connect Project. It uses Auth0 as a backend.
  - _This service is currently in development._
- **Institution Service** - This service manages all interaction with the Institution list, including retrieving an updated list of institutions, adding/editing/deleting institutions, etc.
  - _This service is currently in development._
- **UCP UI** - Dashboard web application for the Universal Connect Project. This is where a user can manage various aspects of their account.
  - _This application is currently in development._

## Contributing

### Getting Started

1. Clone the repo
1. Run `npm install`
1. Run: `npm run dev`

## Architecture decision records

We use [architecture decision records](https://adr.github.io/) to make, document, and enforce our decisions. They live in the [architectureDecisionRecords](https://github.com/Universal-Connect-Project/ucp-ui/tree/main/architectureDecisionRecords) folder.
