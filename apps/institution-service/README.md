# Institution Service

This service manages the institution list that UCW provides connections to.

This repo is part of a monorepo. Please read the [README](../../README.md) at the root of the monorepo for more
information.

## Contributing

### Getting Started

1. Install postgres

```shell
brew install postgresql
brew services start postgresql
```

2. Prep the development and test databases

```shell
npm run db:setup --workspace apps/institution-service # creates the database defined in you .env
npm run test:db:setup --workspace apps/institution-service # creates the database defined in you .env
```

3. Run it `npm run dev --workspace apps/institution-service`
