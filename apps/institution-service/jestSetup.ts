import db from "./src/config/database";

beforeAll(async () => {});

afterAll(async () => {
  await db.close();
});
