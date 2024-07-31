### Server Setup

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
