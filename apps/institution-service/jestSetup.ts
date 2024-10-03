import db from "./src/database";
import { defineAssociations } from "./src/models/associations";

beforeAll(async () => {
  defineAssociations();
});

afterAll(async () => {
  await db.close();
});
