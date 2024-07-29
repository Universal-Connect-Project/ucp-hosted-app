### Server Setup

1. Install postgres

```shell
brew install postgresql
brew services start postgresql
```

2. Prep the database

```shell
npx sequelize db:create # creates the database defined in you .env
npx sequelize db:migrate # creates the database tables
npx sequelize db:seed:all # adds some institutions and providers to the database
```

3. Run it `npm run dev`
