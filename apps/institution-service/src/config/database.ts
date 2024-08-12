import "dotenv/config";
import { Sequelize } from "sequelize";
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

export default new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    dialect: config.dialect,
    host: config.host,
    port: config.port,
  }
);
