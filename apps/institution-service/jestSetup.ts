import db from "./config/database";

beforeAll(async () => {});

afterAll(async () => {
  await db.close();
});
