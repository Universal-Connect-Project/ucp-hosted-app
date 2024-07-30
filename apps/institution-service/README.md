### Server Setup

1. Install postgres

```shell
brew install postgresql
brew services start postgresql
```

2. Prep the development and test databases

```shell
npm run db:setup # creates the database defined in you .env
npm run test:db:setup # creates the database defined in you .env
```

3. Run it `npm run dev`
