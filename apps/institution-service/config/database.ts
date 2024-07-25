import { Sequelize } from "sequelize";

export default new Sequelize("institution_service_development", "postgres", undefined, {
  dialect: "postgres",
  host: "localhost",
  port: 5432,
});
