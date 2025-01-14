# Institution Service

This service manages the institution list that UCW provides connections to.

This repo is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more
information.

## Contributing

### Getting Started

If you want to run this project by itself, without running the other services in the monorepo, do the following:

All of these commands should be run from the root of the monorepo:

- Install postgres

```shell
brew install postgresql
brew services start postgresql
```

- Prep the development and test databases

```shell
npm run db:setup --workspace apps/institution-service # creates the database defined in you .env
npm run test:db:setup --workspace apps/institution-service # creates the database defined in you .env
```

- Run it:

```shell
npm run dev --workspace apps/institution-service
```
