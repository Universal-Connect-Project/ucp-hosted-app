import "dotenv/config";
import path from "path";
import { Dialect, Sequelize } from "sequelize";

const env = process.env.NODE_ENV || "development";

// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-unsafe-assignment
const config: { [key: string]: string } = require(
  path.join(__dirname, "../config/config.json"),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
)[env];

export default new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    dialect: config.dialect as Dialect | undefined,
    host: config.host,
    port: config.port as unknown as number,
  },
);
