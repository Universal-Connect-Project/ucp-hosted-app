import db from "./src/database";

beforeAll(async () => {});

afterAll(async () => {
  await db.close();
});
